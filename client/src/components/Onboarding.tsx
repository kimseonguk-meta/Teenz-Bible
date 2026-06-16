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
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-[#F7F7F7]">
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-lg animate-in slide-in-from-bottom-4 duration-400 relative">
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none p-1 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          )}
          {/* TB Logo */}
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-[#58CC02] flex items-center justify-center text-white text-3xl font-black shadow-md">TB</div>
          <div className="text-5xl mb-3 cursor-pointer hover:scale-110 transition-transform" onClick={randomizeAvatar}>
            {avatar}
          </div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">STEP 1 / 3</p>
          <h2 className="text-gray-800 text-2xl font-black mb-2">Choose a Nickname</h2>
          <p className="text-gray-500 text-sm mb-1 leading-relaxed">
            This will be shown on the leaderboard.
          </p>
          <p className="text-gray-400 text-xs mb-5 leading-relaxed">
            Tap the emoji above to change your avatar!
          </p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. BibleNinja, Grace99..."
            maxLength={20}
            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-800 text-center text-lg placeholder:text-gray-400 focus:outline-none focus:border-[#58CC02] mb-4 font-bold"
            autoFocus
          />
          <button
            onClick={() => nickname.trim() && setStep(2)}
            disabled={!nickname.trim()}
            className="w-full py-4 rounded-xl border-none bg-[#58CC02] border-b-4 border-[#4CAD02] text-white text-lg font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.97] active:border-b-2 active:translate-y-[2px]"
          >
            NEXT →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Join a group (3 options)
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-[#F7F7F7]">
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-lg animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">STEP 2 / 3</p>
          <h2 className="text-gray-800 text-2xl font-black mb-2">
            Join a Group
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Groups let you compete with friends on a shared leaderboard!
          </p>

          {/* Option A: Nasum Teenz */}
          <button
            onClick={() => setStep(3)}
            className="w-full py-4 px-4 rounded-xl bg-[#CE82FF] border-b-4 border-[#A855F7] text-white text-base font-bold cursor-pointer transition-transform active:scale-[0.97] active:border-b-2 active:translate-y-[2px] mb-3 flex items-center justify-center gap-2"
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
                setAvailableGroups(groups.filter(g => !g.isPrebuilt));
              } catch (e) { console.warn(e); }
              finally { setLoadingGroups(false); }
            }}
            className="w-full py-4 px-4 rounded-xl bg-[#1CB0F6] border-b-4 border-[#1899D6] text-white text-base font-bold cursor-pointer transition-transform active:scale-[0.97] active:border-b-2 active:translate-y-[2px] mb-3 flex items-center justify-center gap-2"
          >
            <span>👥</span> Join another group
          </button>

          {/* Option C: Skip */}
          <button
            onClick={handleIndividual}
            disabled={saving}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-gray-200 border-b-4 bg-white text-gray-500 text-base font-bold cursor-pointer transition-all active:scale-[0.97] active:border-b-2 active:translate-y-[2px] mb-4 disabled:opacity-60"
          >
            {saving ? "Setting up..." : "Skip — I'll join later"}
          </button>

          <p className="text-gray-400 text-xs leading-relaxed">
            You can always create or join groups later from your Profile.
          </p>

          <button
            onClick={() => setStep(1)}
            className="mt-4 py-3 px-5 rounded-xl border-2 border-gray-200 bg-white text-gray-500 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors"
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
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-[#F7F7F7]">
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-lg animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">STEP 3 / 3</p>
          <h2 className="text-gray-800 text-2xl font-black mb-2">
            Select your class
          </h2>
          <p className="text-gray-500 text-sm mb-2 leading-relaxed">
            Choose the class you belong to for the leaderboard!
          </p>
          <p className="text-[#CE82FF] text-xs mb-5 leading-relaxed font-bold">
            🧑‍🏫 Teachers, please select the class you are in charge of.
          </p>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-800 text-base mb-4 focus:outline-none focus:border-[#58CC02] appearance-none cursor-pointer font-bold"
          >
            <option value="" className="text-gray-400">-- Select Class --</option>
            {classConfig.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {duplicateWarning && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 text-xs text-left leading-relaxed">
              ⚠️ {duplicateWarning}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => { setDuplicateWarning(null); setStep(1); }}
                  className="flex-1 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold"
                >
                  Change Name
                </button>
                <button
                  onClick={() => pendingGroupCode && saveProfile(pendingGroupCode, pendingIsNasum)}
                  className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          )}
          <button
            onClick={handleClassSelect}
            disabled={!selectedClass || saving}
            className="w-full py-4 rounded-xl bg-[#58CC02] border-b-4 border-[#4CAD02] text-white text-lg font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.97] active:border-b-2 active:translate-y-[2px] mb-3"
          >
            {saving ? "Saving..." : "JOIN! 🚀"}
          </button>
          <button
            onClick={() => setStep(2)}
            className="py-3 px-5 rounded-xl border-2 border-gray-200 bg-white text-gray-500 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors"
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
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-[#F7F7F7]">
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-lg animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">STEP 3 / 3</p>
          <h2 className="text-gray-800 text-2xl font-black mb-2">
            Select a Group
          </h2>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            Choose a group to join and compete with friends!
          </p>

          {loadingGroups ? (
            <div className="py-8">
              <p className="text-gray-500 text-sm animate-pulse">Loading groups...</p>
            </div>
          ) : availableGroups.length === 0 ? (
            <div className="py-6">
              <p className="text-gray-500 text-sm mb-2">No groups available yet.</p>
              <p className="text-gray-400 text-xs">You can create one later from your Profile!</p>
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
                  className="w-full p-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-[#1CB0F6] flex items-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">
                    👥
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-bold truncate">{g.name}</p>
                    <p className="text-gray-400 text-[10px]">{g.memberCount || 0} members</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {groupCodeError && (
            <p className="text-red-500 text-xs mb-3 text-left px-1 font-bold">{groupCodeError}</p>
          )}
          <button
            onClick={() => setStep(2)}
            className="py-3 px-5 rounded-xl border-2 border-gray-200 bg-white text-gray-500 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Celebration
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-[#58CC02] overflow-hidden">
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
      <div className="bg-white border-2 border-gray-200 border-b-4 rounded-3xl p-10 max-w-[340px] w-[90%] text-center shadow-xl animate-in zoom-in-95 duration-500">
        <div className="text-7xl mb-3">🎉</div>
        <h2 className="text-gray-800 text-3xl font-black mb-2">
          WELCOME!
        </h2>
        <p className="text-[#58CC02] text-lg font-black mb-1">{nickname}</p>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          Your adventure begins now!<br />Read, earn XP, and level up! 🚀
        </p>
        <div className="mb-4 p-3 rounded-xl bg-[#FFF3E0] border-2 border-[#FF9800]">
          <p className="text-[#E65100] text-sm font-bold mb-1">🎁 Welcome Gift!</p>
          <p className="text-[#FF6D00] text-xs font-bold">💎 50 Gems + 🐱 Faithy Pet</p>
        </div>
        <button
          onClick={onComplete}
          className="py-4 px-10 rounded-xl bg-[#FFC800] border-b-4 border-[#E5A800] text-gray-800 text-lg font-black cursor-pointer transition-transform active:scale-[0.97] active:border-b-2 active:translate-y-[2px]"
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
