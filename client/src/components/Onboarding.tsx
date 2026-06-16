import { useState, useEffect } from "react";
import { auth, db, ref, update, set, signInAnonymously, onAuthStateChanged, serverTimestamp } from "@/lib/firebase";
import { get } from "firebase/database";
import { getInventory, saveInventory, getEquipped, saveEquipped } from "@/data/storeItems";
import { joinGroup, getLocalGroups, fetchAllAvailableGroups } from "@/lib/groups";
import type { GroupMembership, GroupMeta } from "@/lib/groups";

const AVATARS = ['😎','🦊','🐱','🐶','🦁','🐻','🐼','🐨','🐯','🦄','🐸','🐵','🦋','🐝','🌟','⭐','🔥','💎','🎮','🎯','🏀','⚽','🎸','🎨','🌈','🍕','🍩','🧁','🎂','🍦'];

const DEFAULT_CLASS_CONFIG = [
  { label: 'Year 2010', classes: ['10A','10B','10C','10D'] },
  { label: 'Year 2011', classes: ['11A','11B','11C','11D','11E'] },
  { label: 'Year 2012', classes: ['12A','12B','12C','12D','12E','12G'] },
  { label: 'Year 2013', classes: ['13A','13B','13C','13D','13E','13G'] },
];

interface OnboardingProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export default function Onboarding({ onComplete, onCancel }: OnboardingProps) {
  const [step, setStep] = useState(1); // 1: nickname, 2: member check, 3: class select, 3b: group code, 4: celebration
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [classConfig, setClassConfig] = useState(DEFAULT_CLASS_CONFIG);
  const [selectedClass, setSelectedClass] = useState("");
  const [saving, setSaving] = useState(false);
  const [groupCodeInput, setGroupCodeInput] = useState("");
  const [groupCodeError, setGroupCodeError] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<GroupMeta[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Load class config from Firebase
  useEffect(() => {
    get(ref(db, "classConfig")).then((snap) => {
      const val = snap.val();
      if (val && Array.isArray(val) && val.length > 0) {
        setClassConfig(val);
      }
    }).catch(() => {});
  }, []);

  const randomizeAvatar = () => {
    setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  };

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [pendingGroupCode, setPendingGroupCode] = useState<string | null>(null);
  const [pendingIsNasum, setPendingIsNasum] = useState(false);

  const checkDuplicateAndSave = async (groupCode: string, isNasumMember: boolean) => {
    // Check if same nickname already exists in this group
    try {
      const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
      const members = membersSnap.val();
      if (members) {
        const currentUid = auth.currentUser?.uid;
        const duplicate = Object.entries(members).find(
          ([uid, m]: [string, any]) => 
            m.nickname?.toLowerCase() === nickname.trim().toLowerCase() && uid !== currentUid
        );
        if (duplicate) {
          setDuplicateWarning(`"${nickname}" is already in ${groupCode}. If this is you on another device, please log in with Google/Apple instead. Otherwise, choose a different nickname.`);
          setPendingGroupCode(groupCode);
          setPendingIsNasum(isNasumMember);
          return;
        }
      }
    } catch (e) {
      // If check fails, proceed anyway
    }
    saveProfile(groupCode, isNasumMember);
  };

  const saveProfile = async (groupCode: string, isNasumMember: boolean) => {
    setDuplicateWarning(null);
    setSaving(true);
    try {
      // Ensure user is signed in
      let uid = auth.currentUser?.uid;
      if (!uid) {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
      }

      const profile = {
        nickname,
        groupCode,
        joinedAt: Date.now(),
        avatar,
        isNasumMember,
      };

      localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
      localStorage.setItem("playerName", nickname);

      // Sync to Firebase
      const userData = {
        nickname,
        avatar,
        groupCode,
        xp: 0,
        streak: 0,
        chaptersRead: 0,
        quizTotal: 0,
        quizCorrect: 0,
        isNasumMember,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await update(ref(db, `users/${uid}`), userData);
      await update(ref(db, `groups/${groupCode}/members/${uid}`), userData);

      // Also register in userGroups for multi-group support
      await set(ref(db, `userGroups/${uid}/${groupCode}`), {
        joinedAt: Date.now(),
        role: "member",
      });

      // Update local groups storage
      const groups = getLocalGroups();
      if (!groups.find(g => g.groupCode === groupCode)) {
        const updatedGroups: GroupMembership[] = [...groups, { groupCode, joinedAt: Date.now(), role: "member" }];
        localStorage.setItem("teensBibleGroups", JSON.stringify(updatedGroups));
      }

      // ─── Welcome Bonus: 50 gems + free starter pet ───
      try {
        const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
        teensBible.gems = (teensBible.gems || 0) + 50;
        localStorage.setItem("teensBible", JSON.stringify(teensBible));
        window.dispatchEvent(new CustomEvent("gems-changed", { detail: teensBible.gems }));
        // Give free starter pet (Faithy Pet - pet_cat)
        const inv = getInventory();
        if (!inv.ownedItems.includes("pet_cat")) {
          inv.ownedItems.push("pet_cat");
          saveInventory(inv);
        }
        // Auto-equip the starter pet
        const eq = getEquipped();
        if (!eq.pet) {
          eq.pet = "pet_cat";
          saveEquipped(eq);
        }
      } catch (e) {
        console.error("Welcome bonus error:", e);
      }

      // Trigger full data backup to userData/{uid}
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));

      setStep(4); // Show celebration
    } catch (err) {
      console.error("Save profile error:", err);
      // Still save locally
      const profile = {
        nickname,
        groupCode,
        joinedAt: Date.now(),
        avatar,
        isNasumMember,
      };
      localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
      localStorage.setItem("playerName", nickname);
      // Welcome bonus even on error
      try {
        const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
        teensBible.gems = (teensBible.gems || 0) + 50;
        localStorage.setItem("teensBible", JSON.stringify(teensBible));
        window.dispatchEvent(new CustomEvent("gems-changed", { detail: teensBible.gems }));
        const inv = getInventory();
        if (!inv.ownedItems.includes("pet_cat")) {
          inv.ownedItems.push("pet_cat");
          saveInventory(inv);
        }
        const eq = getEquipped();
        if (!eq.pet) {
          eq.pet = "pet_cat";
          saveEquipped(eq);
        }
      } catch (e) { console.error("Welcome bonus error:", e); }
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      setStep(4);
    } finally {
      setSaving(false);
    }
  };

  const handleIndividual = () => {
    setSaving(true);
    // Safety timeout: if Firebase takes too long (>5s), save locally and proceed
    const timeout = setTimeout(() => {
      setSaving(false);
      const profile = { nickname, groupCode: "INDIVIDUAL", joinedAt: Date.now(), avatar, isNasumMember: false };
      localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
      localStorage.setItem("playerName", nickname);
      // Welcome bonus
      try {
        const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
        teensBible.gems = (teensBible.gems || 0) + 50;
        localStorage.setItem("teensBible", JSON.stringify(teensBible));
        window.dispatchEvent(new CustomEvent("gems-changed", { detail: teensBible.gems }));
        const inv = getInventory();
        if (!inv.ownedItems.includes("pet_cat")) { inv.ownedItems.push("pet_cat"); saveInventory(inv); }
        const eq = getEquipped();
        if (!eq.pet) { eq.pet = "pet_cat"; saveEquipped(eq); }
      } catch (e) { /* ignore */ }
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      setStep(4);
    }, 5000);
    checkDuplicateAndSave("INDIVIDUAL", false).finally(() => clearTimeout(timeout));
  };

  const handleClassSelect = () => {
    if (!selectedClass) return;
    checkDuplicateAndSave(selectedClass, true);
  };

  const handleGroupCodeJoin = async () => {
    const code = groupCodeInput.trim().toUpperCase();
    if (!code) return;
    
    setGroupCodeError(null);
    setSaving(true);
    
    try {
      // Ensure user is signed in first
      let uid = auth.currentUser?.uid;
      if (!uid) {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
      }

      // Save profile first with the group code as primary
      const profile = {
        nickname,
        groupCode: code,
        joinedAt: Date.now(),
        avatar,
        isNasumMember: false,
      };
      localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
      localStorage.setItem("playerName", nickname);

      // Try to join the group
      await joinGroup(code);

      // Sync to Firebase
      const userData = {
        nickname,
        avatar,
        groupCode: code,
        xp: 0,
        streak: 0,
        chaptersRead: 0,
        quizTotal: 0,
        quizCorrect: 0,
        isNasumMember: false,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await update(ref(db, `users/${uid}`), userData);

      // Welcome bonus
      try {
        const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
        teensBible.gems = (teensBible.gems || 0) + 50;
        localStorage.setItem("teensBible", JSON.stringify(teensBible));
        window.dispatchEvent(new CustomEvent("gems-changed", { detail: teensBible.gems }));
        const inv = getInventory();
        if (!inv.ownedItems.includes("pet_cat")) { inv.ownedItems.push("pet_cat"); saveInventory(inv); }
        const eq = getEquipped();
        if (!eq.pet) { eq.pet = "pet_cat"; saveEquipped(eq); }
      } catch (e) { /* ignore */ }

      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      setStep(4);
    } catch (err: any) {
      setGroupCodeError(err.message || "Failed to join group. Please check the code and try again.");
    } finally {
      setSaving(false);
    }
  };

  // Step 1: Nickname + Avatar
  if (step === 1) {
    return (
      <div className="cosmic-bg fixed inset-0 z-[10000] flex items-center justify-center p-5">
        <div className="w-full max-w-[390px] text-center animate-in slide-in-from-bottom-4 duration-400 relative">
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 text-gray-500 hover:text-white text-xl leading-none p-1 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          )}
          <img
            src="/art-assets/mockup/onboarding-logo.webp"
            alt="Teenz Bible - Level Up Your Faith"
            className="mx-auto mb-4 w-[360px] drop-shadow-[0_12px_18px_rgba(0,0,0,0.65)] cursor-pointer hover:scale-105 transition-transform"
            onClick={randomizeAvatar}
          />
          <div className="neon-card mt-6 p-5">
            <h2 className="tb-gold-text text-2xl font-black">Welcome, Adventurer!</h2>
            <p className="text-white/80 text-sm font-bold mt-1 mb-4 leading-relaxed">
              Enter your nickname to begin your journey
            </p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname..."
            maxLength={20}
            className="tb-input w-full p-4 text-white text-center text-lg placeholder:text-gray-500 focus:outline-none mb-2"
            autoFocus
          />
            <p className="text-right text-xs font-bold text-white/55">{nickname.length}/20</p>
          </div>
          <button
            onClick={() => nickname.trim() && setStep(2)}
            disabled={!nickname.trim()}
            aria-label="Start Adventure"
            className="mt-5 h-[78px] w-full bg-[url('/art-assets/mockup/button-start-adventure.webp')] bg-contain bg-center bg-no-repeat cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.97]"
          >
            <span className="sr-only">START ADVENTURE</span>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Join a group (3 options)
  if (step === 2) {
    return (
      <div className="cosmic-bg fixed inset-0 z-[10000] flex items-center justify-center p-5">
        <div className="neon-card p-6 max-w-[390px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-400">
          <div className="tb-ribbon mb-5 text-2xl">TEENZ BIBLE</div>
          <h2 className="tb-gold-text text-2xl font-black mb-2">
            Join a Group
          </h2>
          <p className="text-white/65 text-sm mb-6 leading-relaxed">
            Groups let you compete with friends on a shared leaderboard!
          </p>

          {/* Option A: Nasum Teenz */}
          <button
            onClick={() => setStep(3)}
            className="tb-btn w-full py-4 px-4 text-white text-base font-bold cursor-pointer transition-transform active:scale-[0.97] mb-3 flex items-center justify-center gap-2"
          >
            <span>⛪</span> I'm a Nasum Teenz member
          </button>

          {/* Option B: Join Other Group (dropdown list) */}
          <button
            onClick={async () => {
              setStep(5);
              setGroupCodeError(null);
              setLoadingGroups(true);
              try {
                const groups = await fetchAllAvailableGroups();
                // Filter out Nasum classes (they have their own step)
                setAvailableGroups(groups.filter(g => !g.isPrebuilt));
              } catch (e) { console.warn(e); }
              finally { setLoadingGroups(false); }
            }}
            className="tb-soft-button w-full py-4 px-4 text-white text-base font-bold cursor-pointer transition-transform active:scale-[0.97] mb-3 flex items-center justify-center gap-2"
          >
            <span>👥</span> Join another group
          </button>

          {/* Option C: Skip */}
          <button
            onClick={handleIndividual}
            disabled={saving}
            className="tb-soft-button w-full py-3.5 px-4 text-gray-300 text-base font-medium cursor-pointer transition-all active:scale-[0.97] mb-4 disabled:opacity-60"
          >
            {saving ? "Setting up..." : "Skip — I'll join later"}
          </button>

          <p className="text-gray-500 text-xs leading-relaxed">
            You can always create or join groups later from your Profile.
          </p>

          <button
            onClick={() => setStep(1)}
            className="tb-soft-button mt-4 py-3 px-5 text-gray-300 text-sm cursor-pointer transition-colors"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Nasum Teenz class selection
  if (step === 3) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/85 backdrop-blur-md">
        <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-blue-400/20 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-3">STEP 3 / 3</p>
          <h2 className="font-display text-purple-400 text-2xl mb-2">
            Select your class
          </h2>
          <p className="text-gray-400 text-sm mb-2 leading-relaxed">
            Choose the class you belong to for the leaderboard!
          </p>
          <p className="text-teal-400 text-xs mb-5 leading-relaxed">
            🧑‍🏫 Teachers, please select the class you are in charge of.
          </p>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/30 border border-blue-400/20 text-white text-base mb-4 focus:outline-none focus:border-purple-400/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a2848] text-gray-400">-- Select Class --</option>
            {classConfig.map((group) => (
              <optgroup key={group.label} label={group.label} className="bg-[#1a2848] text-gray-400">
                {group.classes.map((cls) => (
                  <option key={cls} value={cls} className="bg-[#1a2848] text-white">
                    {cls}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {duplicateWarning && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs text-left leading-relaxed">
              ⚠️ {duplicateWarning}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => { setDuplicateWarning(null); setStep(1); }}
                  className="flex-1 py-2 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-bold"
                >
                  Change Name
                </button>
                <button
                  onClick={() => pendingGroupCode && saveProfile(pendingGroupCode, pendingIsNasum)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-gray-300 text-xs"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          )}
          <button
            onClick={handleClassSelect}
            disabled={!selectedClass || saving}
            className="w-full py-4 rounded-xl border-none bg-gradient-to-r from-teal-500 to-teal-600 text-white text-lg font-bold cursor-pointer shadow-[0_4px_20px_rgba(78,205,196,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.97] mb-3"
          >
            {saving ? "Saving..." : "JOIN! 🚀"}
          </button>
          <button
            onClick={() => setStep(2)}
            className="py-3 px-5 rounded-xl border border-blue-400/20 bg-white/5 text-gray-400 text-sm cursor-pointer hover:bg-white/10 transition-colors"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Select from available groups
  if (step === 5) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/85 backdrop-blur-md">
        <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-blue-400/20 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-3">STEP 3 / 3</p>
          <h2 className="font-display text-purple-400 text-2xl mb-2">
            Select a Group
          </h2>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            Choose a group to join and compete with friends!
          </p>

          {loadingGroups ? (
            <div className="py-8">
              <p className="text-gray-400 text-sm animate-pulse">Loading groups...</p>
            </div>
          ) : availableGroups.length === 0 ? (
            <div className="py-6">
              <p className="text-gray-400 text-sm mb-2">No groups available yet.</p>
              <p className="text-gray-500 text-xs">You can create one later from your Profile!</p>
            </div>
          ) : (
            <div className="max-h-[250px] overflow-y-auto space-y-2 mb-4 text-left">
              {availableGroups.map((g) => (
                <button
                  key={g.groupCode}
                  onClick={async () => {
                    setSaving(true);
                    setGroupCodeError(null);
                    try {
                      let uid = auth.currentUser?.uid;
                      if (!uid) {
                        const cred = await signInAnonymously(auth);
                        uid = cred.user.uid;
                      }
                      const profile = {
                        nickname,
                        groupCode: g.groupCode,
                        joinedAt: Date.now(),
                        avatar,
                        isNasumMember: false,
                      };
                      localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
                      localStorage.setItem("playerName", nickname);
                      await joinGroup(g.groupCode);
                      const userData = {
                        nickname, avatar, groupCode: g.groupCode,
                        xp: 0, streak: 0, chaptersRead: 0, quizTotal: 0, quizCorrect: 0,
                        isNasumMember: false, lastActive: serverTimestamp(), updatedAt: serverTimestamp(),
                      };
                      await update(ref(db, `users/${uid}`), userData);
                      // Welcome bonus
                      try {
                        const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
                        teensBible.gems = (teensBible.gems || 0) + 50;
                        localStorage.setItem("teensBible", JSON.stringify(teensBible));
                        window.dispatchEvent(new CustomEvent("gems-changed", { detail: teensBible.gems }));
                        const inv = getInventory();
                        if (!inv.ownedItems.includes("pet_cat")) { inv.ownedItems.push("pet_cat"); saveInventory(inv); }
                        const eq = getEquipped();
                        if (!eq.pet) { eq.pet = "pet_cat"; saveEquipped(eq); }
                      } catch (e) { /* ignore */ }
                      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
                      setStep(4);
                    } catch (err: any) {
                      setGroupCodeError(err.message || "Failed to join group.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full p-3.5 rounded-xl bg-black/30 border border-blue-400/20 hover:border-blue-400/50 flex items-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xl">
                    👥
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{g.name}</p>
                    <p className="text-gray-500 text-[10px]">{g.memberCount || 0} members</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {groupCodeError && (
            <p className="text-red-400 text-xs mb-3 text-left px-1">{groupCodeError}</p>
          )}
          <button
            onClick={() => setStep(2)}
            className="py-3 px-5 rounded-xl border border-blue-400/20 bg-white/5 text-gray-400 text-sm cursor-pointer hover:bg-white/10 transition-colors"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Celebration
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/90 overflow-hidden">
      {/* Confetti particles */}
      {Array.from({ length: 40 }).map((_, i) => {
        const emojis = ['🎉','🎊','⭐','🔥','💎','🏆','⚡','🌟','🥳','🚀'];
        const isEmoji = Math.random() > 0.5;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = Math.random() * 1.5 + 2;
        return (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${left}%`,
              top: '-30px',
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: 0,
              animation: `confettiFall ${duration}s ease-out ${delay}s forwards`,
            }}
          >
            {isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : '✦'}
          </div>
        );
      })}

      {/* Welcome card */}
      <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border-2 border-yellow-500 rounded-3xl p-10 max-w-[340px] w-[90%] text-center shadow-[0_0_60px_rgba(255,215,0,0.3),0_20px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
        <div className="text-7xl mb-3">🎉</div>
        <h2 className="font-display text-yellow-400 text-3xl mb-2 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          WELCOME!
        </h2>
        <p className="text-teal-400 text-lg font-bold mb-1">{nickname}</p>
        <p className="text-gray-400 text-sm mb-2 leading-relaxed">
          Your adventure begins now!<br />Read, earn XP, and level up! 🚀
        </p>
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30">
          <p className="text-yellow-300 text-sm font-bold mb-1">🎁 Welcome Gift!</p>
          <p className="text-purple-200 text-xs">💎 50 Gems + 🐱 Faithy Pet</p>
        </div>
        <button
          onClick={onComplete}
          className="py-4 px-10 rounded-xl border-none bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1a2848] text-lg font-bold cursor-pointer shadow-[0_4px_20px_rgba(255,215,0,0.3)] transition-transform active:scale-[0.97]"
        >
          LET'S GO! ⚡
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) scale(0); opacity: 1; }
          10% { opacity: 1; transform: translateY(10vh) scale(1); }
          100% { transform: translateY(100vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
