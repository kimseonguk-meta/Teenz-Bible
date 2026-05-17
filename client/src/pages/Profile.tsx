import { useState, useCallback, useRef, useEffect } from "react";
import { getEquipped, getInventory, PETS, PROFILE_FRAMES, THEMES, READER_BACKGROUNDS } from "@/data/storeItems";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { getProfilePhotoUrl, setProfilePhoto, removeProfilePhoto } from "@/components/ProfilePhotoPrompt";
import { linkOrSignInWithGoogle, isLinkedToGoogle, getLinkedGoogleEmail, signOutGoogle } from "@/lib/googleAuth";
import { linkOrSignInWithApple, isLinkedToApple, getLinkedAppleEmail } from "@/lib/appleAuth";

function getPlayerName() {
  return localStorage.getItem("playerName") || "Player";
}

function getProfile() {
  try {
    const raw = localStorage.getItem("teensBibleProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getTotalXP() {
  return parseInt(localStorage.getItem("totalXP") || "0");
}

function getGems() {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
    return data.gems || 0;
  } catch { return 0; }
}

function getLevel(xp: number) {
  if (xp >= 5000) return { name: "Master", level: 10 };
  if (xp >= 3000) return { name: "Champion", level: 8 };
  if (xp >= 2000) return { name: "Scholar", level: 6 };
  if (xp >= 1000) return { name: "Explorer", level: 5 };
  if (xp >= 500) return { name: "Reader", level: 3 };
  if (xp >= 100) return { name: "Beginner", level: 2 };
  return { name: "Newbie", level: 1 };
}

function getChaptersRead() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const arr = JSON.parse(val);
          total += Array.isArray(arr) ? arr.length : 0;
        } catch { /* ignore */ }
      }
    }
  }
  return total;
}

function getLanguagePref(): "en" | "ko" {
  return (localStorage.getItem("readerLang") as "en" | "ko") || "en";
}

function getFontSize(): number {
  return parseInt(localStorage.getItem("readerFontSize") || "16");
}

const badges = [
  { name: "First Step", desc: "Started reading", icon: "📖", condition: (ch: number) => ch >= 1 },
  { name: "10 Chapters", desc: "Read 10 chapters", icon: "🏅", condition: (ch: number) => ch >= 10 },
  { name: "50 Chapters", desc: "Read 50 chapters", icon: "🏆", condition: (ch: number) => ch >= 50 },
  { name: "100 Chapters", desc: "Read 100 chapters", icon: "💯", condition: (ch: number) => ch >= 100 },
  { name: "Scholar", desc: "Reach Level 6", icon: "👑", condition: (_ch: number, xp: number) => xp >= 2000 },
  { name: "Collector", desc: "Own 5+ items", icon: "💎", condition: () => getInventory().ownedItems.length >= 5 },
];

export default function Profile() {
  const [playerName] = useState(getPlayerName);
  const [totalXP] = useState(getTotalXP);
  const [gems] = useState(getGems);
  const [chaptersRead] = useState(getChaptersRead);
  const level = getLevel(totalXP);
  const profile = getProfile();
  const equipped = getEquipped();
  const [, setLocation] = useLocation();

  const equippedPet = PETS.find(p => p.id === equipped.pet);
  const equippedFrame = PROFILE_FRAMES.find(f => f.id === equipped.frame);
  const equippedTheme = THEMES.find(t => t.id === equipped.theme);
  const equippedReader = READER_BACKGROUNDS.find(r => r.id === equipped.readerBg);

  const avatar = profile?.avatar || "👦";
  const groupCode = profile?.groupCode || "INDIVIDUAL";

  // Settings state
  const [language, setLanguage] = useState<"en" | "ko">(getLanguagePref);
  const [fontSize, setFontSize] = useState(getFontSize);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [profilePhoto, setProfilePhotoState] = useState(getProfilePhotoUrl);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemResult, setRedeemResult] = useState<{ msg: string; success: boolean } | null>(null);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [appleLinked, setAppleLinked] = useState(false);
  const [appleEmail, setAppleEmail] = useState<string | null>(null);
  const [linkingApple, setLinkingApple] = useState(false);
  const [linkMessage, setLinkMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Check Google & Apple link status on mount and auth changes
  useEffect(() => {
    const checkAuthStatus = () => {
      setGoogleLinked(isLinkedToGoogle());
      setGoogleEmail(getLinkedGoogleEmail());
      setAppleLinked(isLinkedToApple());
      setAppleEmail(getLinkedAppleEmail());
    };
    checkAuthStatus();
    window.addEventListener("auth-changed", checkAuthStatus);
    const timer = setTimeout(checkAuthStatus, 1500);
    return () => {
      window.removeEventListener("auth-changed", checkAuthStatus);
      clearTimeout(timer);
    };
  }, []);

  const handleLinkGoogle = useCallback(async () => {
    setLinkingGoogle(true);
    setLinkMessage(null);
    try {
      const result = await linkOrSignInWithGoogle();
      setLinkMessage({ text: result.message, success: result.success });
      if (result.success) {
        setGoogleLinked(true);
        setGoogleEmail(getLinkedGoogleEmail());
        if (result.type === "signed-in" && result.restored) {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err: any) {
      setLinkMessage({ text: err.message, success: false });
    } finally {
      setLinkingGoogle(false);
    }
  }, []);

  const handleUnlinkGoogle = useCallback(async () => {
    try {
      await signOutGoogle();
      setGoogleLinked(false);
      setGoogleEmail(null);
      setLinkMessage({ text: "Signed out from Google", success: true });
    } catch (err: any) {
      setLinkMessage({ text: err.message, success: false });
    }
  }, []);

  const handleLinkApple = useCallback(async () => {
    setLinkingApple(true);
    setLinkMessage(null);
    try {
      const result = await linkOrSignInWithApple();
      setLinkMessage({ text: result.message, success: result.success });
      if (result.success) {
        setAppleLinked(true);
        setAppleEmail(getLinkedAppleEmail());
        if (result.type === "signed-in" && result.restored) {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err: any) {
      setLinkMessage({ text: err.message, success: false });
    } finally {
      setLinkingApple(false);
    }
  }, []);

  const handleLanguageToggle = useCallback(() => {
    const next = language === "en" ? "ko" : "en";
    setLanguage(next);
    localStorage.setItem("readerLang", next);
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
  }, [language]);

  const handleFontSizeChange = useCallback((delta: number) => {
    setFontSize(prev => {
      const next = Math.max(12, Math.min(24, prev + delta));
      localStorage.setItem("readerFontSize", String(next));
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      return next;
    });
  }, []);

  const handleResetProgress = useCallback(() => {
    // Clear all game-related localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("chaptersRead_") ||
        key === "totalXP" ||
        key === "teensBible" ||
        key === "teensBibleInventory" ||
        key === "teensBibleEquipped" ||
        key === "teensBibleProfile" ||
        key === "playerName" ||
        key === "lastRead" ||
        key === "watchedVideos"
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setShowResetConfirm(false);
    window.location.reload();
  }, []);

  const handleRedeem = useCallback(() => {
    const code = redeemCode.trim().toUpperCase();
    if (!code) return;

    // Check some predefined codes
    const codes: Record<string, { gems: number; msg: string }> = {
      "TEENZ2024": { gems: 50, msg: "Welcome bonus! +50 Gems" },
      "BIBLELOVE": { gems: 30, msg: "Spread the love! +30 Gems" },
      "NASUM": { gems: 20, msg: "Nasum family! +20 Gems" },
    };

    const redeemed = JSON.parse(localStorage.getItem("redeemedCodes") || "[]");
    if (redeemed.includes(code)) {
      setRedeemResult({ msg: "Code already redeemed!", success: false });
      return;
    }

    const reward = codes[code];
    if (reward) {
      // Add gems
      try {
        const raw = localStorage.getItem("teensBible");
        const data = raw ? JSON.parse(raw) : {};
        data.gems = (data.gems || 0) + reward.gems;
        localStorage.setItem("teensBible", JSON.stringify(data));
      } catch { /* ignore */ }
      redeemed.push(code);
      localStorage.setItem("redeemedCodes", JSON.stringify(redeemed));
      setRedeemResult({ msg: reward.msg, success: true });
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    } else {
      setRedeemResult({ msg: "Invalid code. Try again!", success: false });
    }
    setRedeemCode("");
  }, [redeemCode]);

  const handleEditProfile = useCallback(() => {
    // Clear profile to trigger onboarding again
    localStorage.removeItem("teensBibleProfile");
    localStorage.removeItem("playerName");
    window.location.reload();
  }, []);

  return (
    <div className="px-4 pt-6 space-y-5 pb-8">

      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            onClick={() => setShowPhotoMenu(prev => !prev)}
            className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center bg-purple-900/30 cursor-pointer active:scale-95 transition-transform ${equippedFrame?.frameClass || 'border-[4px] border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)]'}`}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{avatar}</span>
            )}
            {/* Camera overlay hint */}
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-2xl">📷</span>
            </div>
          </div>
          {equippedPet && (
            <div className="absolute -top-1 -left-2 text-2xl">{equippedPet.petEmoji}</div>
          )}
        </div>

        {/* Photo menu popup */}
        {showPhotoMenu && (
          <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => { photoInputRef.current?.click(); setShowPhotoMenu(false); }}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all active:scale-95"
            >
              📷 {profilePhoto ? "Change Photo" : "Upload Photo"}
            </button>
            {profilePhoto && (
              <button
                onClick={() => { removeProfilePhoto(); setProfilePhotoState(null); setShowPhotoMenu(false); }}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-medium transition-all active:scale-95"
              >
                🗑 Remove
              </button>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            const canvas = document.createElement("canvas");
            const img = new Image();
            img.onload = () => {
              const size = Math.min(img.width, img.height);
              const sx = (img.width - size) / 2;
              const sy = (img.height - size) / 2;
              canvas.width = 200; canvas.height = 200;
              canvas.getContext("2d")!.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
              const base64 = canvas.toDataURL("image/jpeg", 0.8);
              setProfilePhoto(base64);
              setProfilePhotoState(base64);
            };
            img.src = URL.createObjectURL(file);
          }}
        />
        <h2 className="text-2xl font-bold text-white mt-3 font-display">{playerName}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium">
            ⭐ Lv. {level.level} {level.name}
          </span>
          <span className="px-2 py-1 rounded-full bg-teal-600/20 border border-teal-500/30 text-teal-300 text-xs font-medium">
            {groupCode === "INDIVIDUAL" || groupCode === "GLOBAL" ? "Independent" : groupCode}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-6 h-6 rounded-md bg-purple-600/40 flex items-center justify-center text-[10px] font-bold text-purple-200">XP</div>
          </div>
          <div className="text-lg font-bold text-white">{totalXP.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">Total XP</div>
        </div>
        <div className="neon-card p-3 text-center border-cyan-500/40">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">💎</span>
          </div>
          <div className="text-lg font-bold text-white">{gems}</div>
          <div className="text-[10px] text-gray-500">Gems</div>
        </div>
        <div className="neon-card p-3 text-center border-yellow-500/40">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">📖</span>
          </div>
          <div className="text-lg font-bold text-white">{chaptersRead}</div>
          <div className="text-[10px] text-gray-500">Chapters</div>
        </div>
      </div>

      {/* Quiz Stats Link */}
      <button 
        onClick={() => setLocation("/quiz-stats")}
        className="w-full neon-card p-4 flex items-center justify-between active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <p className="text-white font-bold text-sm">Quiz Statistics</p>
            <p className="text-purple-300 text-xs">View your accuracy, streaks & history</p>
          </div>
        </div>
        <span className="text-purple-300">→</span>
      </button>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">🏆 Badges</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {badges.map((badge) => {
            const earned = badge.condition(chaptersRead, totalXP);
            return (
              <div key={badge.name} className={`flex flex-col items-center min-w-[70px] ${!earned ? 'opacity-40' : ''}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  earned
                    ? 'bg-purple-600/30 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'bg-gray-800/50 border-2 border-gray-700/50'
                }`}>
                  {badge.icon}
                </div>
                <p className="text-white text-[10px] font-medium mt-1 text-center">{badge.name}</p>
                <p className="text-gray-500 text-[8px] text-center">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">📖 Reading Progress</h3>
        </div>
        <div className="neon-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">Overall Bible</span>
            <span className="text-white font-bold">{Math.round((chaptersRead / 1189) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-gray-800/80 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-400" style={{ width: `${Math.round((chaptersRead / 1189) * 100)}%` }} />
          </div>
          <p className="text-gray-500 text-[10px] mt-1">{chaptersRead} / 1,189 chapters</p>
        </div>
      </div>

      {/* Equipped Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">✨ Equipped Items</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Theme</p>
            <div className="text-2xl">{equippedTheme?.emoji || "🌙"}</div>
            <p className="text-white text-xs mt-1">{equippedTheme?.name || "Twilight"}</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Reader BG</p>
            <div className="text-2xl">{equippedReader?.emoji || "🌑"}</div>
            <p className="text-white text-xs mt-1">{equippedReader?.name || "Dark"}</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Frame</p>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center bg-purple-900/50 ${equippedFrame?.frameClass || ''}`}>
              <span className="text-sm">{avatar}</span>
            </div>
            <p className="text-white text-xs mt-1">{equippedFrame?.name || "None"}</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Pet</p>
            <div className="text-2xl">{equippedPet?.petEmoji || "—"}</div>
            <p className="text-white text-xs mt-1">{equippedPet?.name || "None"}</p>
          </div>
        </div>
      </div>

      {/* ============ SETTINGS SECTION ============ */}
      <div className="pt-4 border-t border-gray-800/60">
        <h3 className="text-lg font-bold text-purple-300 font-display mb-4">⚙️ Settings</h3>

        {/* Reading Settings */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">📖 Reading</p>

          {/* Language */}
          <div className="neon-card p-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Language</p>
              <p className="text-gray-500 text-[10px]">Bible text language</p>
            </div>
            <button
              onClick={handleLanguageToggle}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all active:scale-95"
            >
              {language === "en" ? "🇺🇸 English" : "🇰🇷 한국어"}
            </button>
          </div>

          {/* Font Size */}
          <div className="neon-card p-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Font Size</p>
              <p className="text-gray-500 text-[10px]">Reader text size</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFontSizeChange(-2)}
                className="w-8 h-8 rounded-lg bg-gray-800/80 border border-gray-700/50 text-white text-sm font-bold flex items-center justify-center active:scale-90"
              >
                −
              </button>
              <span className="text-white text-sm font-bold w-8 text-center">{fontSize}</span>
              <button
                onClick={() => handleFontSizeChange(2)}
                className="w-8 h-8 rounded-lg bg-gray-800/80 border border-gray-700/50 text-white text-sm font-bold flex items-center justify-center active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Social Settings */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">👥 Social</p>

          {/* Edit Profile */}
          <div
            onClick={handleEditProfile}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">😎</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Edit Profile</p>
              <p className="text-gray-500 text-[10px]">Change name, avatar, class</p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>

          {/* Leaderboard */}
          <div
            onClick={() => setLocation("/leaderboard")}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-xl">🏆</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Leaderboard</p>
              <p className="text-gray-500 text-[10px]">Compare rankings with friends</p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>

          {/* Invite Friends */}
          <div
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Teenz Bible",
                  text: "Join me on Teenz Bible! Read the Bible together and compete on the leaderboard 🏆",
                  url: window.location.origin,
                });
              } else {
                navigator.clipboard.writeText(window.location.origin);
                alert("Link copied to clipboard!");
              }
            }}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">📨</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Invite Friends</p>
              <p className="text-gray-500 text-[10px]">Share the app with your friends</p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>
        </div>

        {/* Account & Cloud Sync */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">☁️ Account & Sync</p>

          {/* Status banner */}
          {(googleLinked || appleLinked) ? (
            <div className="neon-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Account Protected</p>
                  <p className="text-green-400 text-[10px]">Your data is synced to the cloud</p>
                </div>
              </div>

              {/* Google linked status */}
              {googleLinked && (
                <div className="flex items-center justify-between py-2 border-t border-gray-700/40">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span className="text-gray-300 text-xs">{googleEmail}</span>
                  </div>
                  <button onClick={handleUnlinkGoogle} className="text-gray-500 text-[10px] hover:text-gray-300 transition-colors">Sign Out</button>
                </div>
              )}

              {/* Apple linked status */}
              {appleLinked && (
                <div className="flex items-center justify-between py-2 border-t border-gray-700/40">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    <span className="text-gray-300 text-xs">{appleEmail || "Apple ID"}</span>
                  </div>
                </div>
              )}

              {/* Show buttons for unlinked providers */}
              {!googleLinked && (
                <button
                  onClick={handleLinkGoogle}
                  disabled={linkingGoogle}
                  className="w-full mt-3 py-2 rounded-lg bg-white text-gray-800 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {linkingGoogle ? "Connecting..." : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Also link Google
                    </>
                  )}
                </button>
              )}
              {!appleLinked && (
                <button
                  onClick={handleLinkApple}
                  disabled={linkingApple}
                  className="w-full mt-2 py-2 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 border border-gray-700/50"
                >
                  {linkingApple ? "Connecting..." : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Also link Apple
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="neon-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Data Not Protected</p>
                  <p className="text-yellow-400 text-[10px]">Sign in to save your progress</p>
                </div>
              </div>
              <p className="text-gray-400 text-[10px] mb-3">If you clear your browser or switch devices, you'll lose all progress. Link an account to keep your data safe!</p>
              <button
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
                className="w-full py-2.5 rounded-lg bg-white text-gray-800 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {linkingGoogle ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </>
                )}
              </button>
              <button
                onClick={handleLinkApple}
                disabled={linkingApple}
                className="w-full mt-2 py-2.5 rounded-lg bg-black text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 border border-gray-600/50"
              >
                {linkingApple ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    Sign in with Apple
                  </>
                )}
              </button>
            </div>
          )}
          {linkMessage && (
            <p className={`text-xs text-center ${linkMessage.success ? 'text-green-400' : 'text-red-400'}`}>
              {linkMessage.text}
            </p>
          )}
        </div>

        {/* AI & Data */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">🤖 AI & Data</p>

          {/* Bible AI Status */}
          <div className="neon-card p-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Bible AI</p>
              <p className="text-green-400 text-[10px]">✅ Connected & Ready</p>
            </div>
          </div>

          {/* Redeem Code */}
          <div className="neon-card p-3">
            <div className="mb-2">
              <p className="text-white text-sm font-medium">🎁 Redeem Code</p>
              <p className="text-gray-500 text-[10px]">Enter a special code to get rewards</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="Enter code..."
                className="flex-1 bg-gray-900/80 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm uppercase placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleRedeem}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold active:scale-95 transition-all"
              >
                Redeem
              </button>
            </div>
            {redeemResult && (
              <p className={`text-xs mt-2 ${redeemResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {redeemResult.msg}
              </p>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-wider">⚠️ Danger Zone</p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-3 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 text-sm font-medium opacity-70 hover:opacity-100 transition-all"
            >
              🗑️ Reset All Progress
            </button>
          ) : (
            <div className="neon-card p-4 border-red-500/40">
              <p className="text-red-300 text-sm font-bold mb-2">Are you sure?</p>
              <p className="text-gray-400 text-xs mb-3">This will delete ALL your progress, items, and profile. This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetProgress}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold active:scale-95"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 text-white text-xs font-bold active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
