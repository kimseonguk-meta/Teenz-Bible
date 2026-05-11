import { useState, useEffect } from "react";
import { auth, db, ref, update, signInAnonymously, onAuthStateChanged, serverTimestamp } from "@/lib/firebase";
import { get } from "firebase/database";

const AVATARS = ['😎','🦊','🐱','🐶','🦁','🐻','🐼','🐨','🐯','🦄','🐸','🐵','🦋','🐝','🌟','⭐','🔥','💎','🎮','🎯','🏀','⚽','🎸','🎨','🌈','🍕','🍩','🧁','🎂','🍦'];

const DEFAULT_CLASS_CONFIG = [
  { label: '2010년생', classes: ['10A','10B','10C','10D'] },
  { label: '2011년생', classes: ['11A','11B','11C','11D','11E'] },
  { label: '2012년생', classes: ['12A','12B','12C','12D','12E','12G'] },
  { label: '2013년생', classes: ['13A','13B','13C','13D','13E','13G'] },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1); // 1: nickname, 2: member check, 3: class select, 4: celebration
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [classConfig, setClassConfig] = useState(DEFAULT_CLASS_CONFIG);
  const [selectedClass, setSelectedClass] = useState("");
  const [saving, setSaving] = useState(false);

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

  const saveProfile = async (groupCode: string, isNasumMember: boolean) => {
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
      setStep(4);
    } finally {
      setSaving(false);
    }
  };

  const handleIndividual = () => {
    saveProfile("INDIVIDUAL", false);
  };

  const handleClassSelect = () => {
    if (!selectedClass) return;
    saveProfile(selectedClass, true);
  };

  // Step 1: Nickname
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/85 backdrop-blur-md">
        <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-blue-400/20 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4 cursor-pointer hover:scale-110 transition-transform" onClick={randomizeAvatar}>
            {avatar}
          </div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-3">STEP 1 / 3</p>
          <h2 className="font-display text-purple-400 text-2xl mb-2">What's your name?</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Tap the emoji above to randomize your avatar!
          </p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname..."
            maxLength={20}
            className="w-full p-4 rounded-xl bg-black/30 border border-blue-400/20 text-white text-center text-lg placeholder:text-gray-500 focus:outline-none focus:border-purple-400/50 mb-4"
            autoFocus
          />
          <button
            onClick={() => nickname.trim() && setStep(2)}
            disabled={!nickname.trim()}
            className="w-full py-4 rounded-xl border-none bg-gradient-to-r from-purple-500 to-purple-600 text-white text-lg font-bold cursor-pointer shadow-[0_4px_20px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.97]"
          >
            NEXT →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Nasum member check
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/85 backdrop-blur-md">
        <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-blue-400/20 rounded-2xl p-8 max-w-[360px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-400">
          <div className="text-6xl mb-4">⛪</div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-3">STEP 2 / 3</p>
          <h2 className="font-display text-purple-400 text-2xl mb-2">
            Are you a Nasum Teenz member?
          </h2>
          <p className="text-gray-400 text-sm mb-2 leading-relaxed">
            If yes, you can join your class leaderboard and compete with friends!
          </p>
          <p className="text-teal-400 text-xs mb-6 leading-relaxed">
            📢 Teachers, please also tap YES and select your class!
          </p>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-4 px-4 rounded-xl border-none bg-gradient-to-r from-teal-500 to-teal-600 text-white text-lg font-bold cursor-pointer shadow-[0_4px_20px_rgba(78,205,196,0.3)] transition-transform active:scale-[0.97]"
            >
              YES! ✋
            </button>
            <button
              onClick={handleIndividual}
              disabled={saving}
              className="flex-1 py-4 px-4 rounded-xl border-none bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold cursor-pointer shadow-[0_4px_20px_rgba(255,107,107,0.3)] transition-transform active:scale-[0.97] disabled:opacity-60"
            >
              {saving ? "..." : "NOPE"}
            </button>
          </div>
          <button
            onClick={() => setStep(1)}
            className="py-3 px-5 rounded-xl border border-blue-400/20 bg-white/5 text-gray-400 text-sm cursor-pointer hover:bg-white/10 transition-colors"
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Class selection
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
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Your adventure begins now!<br />Read, earn XP, and level up! 🚀
        </p>
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
