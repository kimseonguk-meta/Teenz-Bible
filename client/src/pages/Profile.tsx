import { useState } from "react";
import { getEquipped, PETS, PROFILE_FRAMES, THEMES, READER_BACKGROUNDS } from "@/data/storeItems";

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

const badges = [
  { name: "First Step", desc: "Started reading", icon: "📖", condition: (ch: number) => ch >= 1 },
  { name: "10 Chapters", desc: "Read 10 chapters", icon: "🏅", condition: (ch: number) => ch >= 10 },
  { name: "50 Chapters", desc: "Read 50 chapters", icon: "🏆", condition: (ch: number) => ch >= 50 },
  { name: "100 Chapters", desc: "Read 100 chapters", icon: "💯", condition: (ch: number) => ch >= 100 },
  { name: "Scholar", desc: "Reach Level 6", icon: "👑", condition: (_ch: number, xp: number) => xp >= 2000 },
  { name: "Collector", desc: "Own 5+ items", icon: "💎", condition: () => false },
];

export default function Profile() {
  const [playerName] = useState(getPlayerName);
  const [totalXP] = useState(getTotalXP);
  const [gems] = useState(getGems);
  const [chaptersRead] = useState(getChaptersRead);
  const level = getLevel(totalXP);
  const profile = getProfile();
  const equipped = getEquipped();

  const equippedPet = PETS.find(p => p.id === equipped.pet);
  const equippedFrame = PROFILE_FRAMES.find(f => f.id === equipped.frame);
  const equippedTheme = THEMES.find(t => t.id === equipped.theme);
  const equippedReader = READER_BACKGROUNDS.find(r => r.id === equipped.readerBg);

  const avatar = profile?.avatar || "👦";
  const groupCode = profile?.groupCode || "INDIVIDUAL";

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Avatar with equipped frame */}
          <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-purple-900/30 ${equippedFrame?.frameClass || 'border-[4px] border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)]'}`}>
            <span className="text-5xl">{avatar}</span>
          </div>
          {equippedPet && (
            <div className="absolute -top-1 -left-2 text-2xl">{equippedPet.petEmoji}</div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mt-3 font-display">{playerName}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium">
            ⭐ Lv. {level.level} {level.name}
          </span>
          <span className="px-2 py-1 rounded-full bg-teal-600/20 border border-teal-500/30 text-teal-300 text-xs font-medium">
            {groupCode}
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
      <div className="h-4" />
    </div>
  );
}
