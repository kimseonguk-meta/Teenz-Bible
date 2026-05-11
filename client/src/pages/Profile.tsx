import { useState } from "react";

function getPlayerName() {
  return localStorage.getItem("playerName") || "다니엘";
}

function getTotalXP() {
  return parseInt(localStorage.getItem("totalXP") || "0");
}

function getDayStreak() {
  return parseInt(localStorage.getItem("dayStreak") || "0");
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
  { name: "첫 시작", desc: "성경 읽기 시작", icon: "📖", earned: true },
  { name: "7일 독서", desc: "7일 연속 달성", icon: "🏆", earned: true },
  { name: "백 장 독파", desc: "100장 읽기", icon: "💯", earned: false },
  { name: "복음 전도자", desc: "친구 3명 초대", icon: "⭐", earned: false },
  { name: "마스터 리더", desc: "레벨 10 달성", icon: "👑", earned: false },
  { name: "성경 마스터", desc: "전체 50% 읽기", icon: "💎", earned: false },
];

export default function Profile() {
  const [playerName] = useState(getPlayerName);
  const [totalXP] = useState(getTotalXP);
  const [dayStreak] = useState(getDayStreak);
  const [gems] = useState(getGems);
  const [chaptersRead] = useState(getChaptersRead);
  const level = getLevel(totalXP);

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header icons */}
      <div className="flex items-center justify-between">
        <button className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-sm">⚙️</button>
        <button className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-sm relative">
          🔔
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-500" />
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Neon ring */}
          <div className="w-28 h-28 rounded-full border-[4px] border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5),0_0_50px_rgba(139,92,246,0.2)] flex items-center justify-center bg-purple-900/30" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
            <span className="text-5xl">👦</span>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-400 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.4)]">
            ✏️
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white mt-3 font-display">{playerName}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium">
            ⭐ Lv. {level.level} {level.name}
          </span>
        </div>
        <span className="text-gray-400 text-xs mt-1">중등1반</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-6 h-6 rounded-md bg-purple-600/40 flex items-center justify-center text-[10px] font-bold text-purple-200">XP</div>
            <span className="text-gray-400 text-[10px]">총 XP</span>
          </div>
          <div className="text-lg font-bold text-white">{totalXP.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">XP</div>
        </div>
        <div className="neon-card p-3 text-center border-cyan-500/40">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">💎</span>
            <span className="text-gray-400 text-[10px]">보유 젬</span>
          </div>
          <div className="text-lg font-bold text-white">{gems}</div>
          <div className="text-[10px] text-gray-500">Gems</div>
        </div>
        <div className="neon-card p-3 text-center border-yellow-500/40">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">🔥</span>
            <span className="text-gray-400 text-[10px]">연속 읽기</span>
          </div>
          <div className="text-lg font-bold text-white">{dayStreak}</div>
          <div className="text-[10px] text-gray-500">일</div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">🏆 업적</h3>
          <button className="text-gray-400 text-xs">더보기 &gt;</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {badges.map((badge) => (
            <div key={badge.name} className={`flex flex-col items-center min-w-[70px] ${!badge.earned ? 'opacity-40' : ''}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                badge.earned
                  ? 'bg-purple-600/30 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : 'bg-gray-800/50 border-2 border-gray-700/50'
              }`}>
                {badge.icon}
              </div>
              <p className="text-white text-[10px] font-medium mt-1 text-center">{badge.name}</p>
              <p className="text-gray-500 text-[8px] text-center">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reading Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">📖 읽기 진행률</h3>
          <button className="text-gray-400 text-xs">더보기 &gt;</button>
        </div>
        <div className="neon-card p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-3xl">
            ✝️
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-sm">마태복음</h4>
                <p className="text-gray-400 text-xs">Matthew</p>
              </div>
              <span className="text-white font-bold text-lg">{chaptersRead > 0 ? Math.round((chaptersRead / 28) * 100) : 0}%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-800/80 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${chaptersRead > 0 ? Math.round((chaptersRead / 28) * 100) : 0}%` }} />
            </div>
            <p className="text-gray-500 text-[10px] mt-1">{chaptersRead} / 28장</p>
          </div>
        </div>
      </div>

      {/* Equipped Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">✨ 장착 중인 아이템</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">펫</p>
            <div className="text-3xl">🐑</div>
            <p className="text-white text-xs mt-1">믿음이</p>
            <p className="text-purple-400 text-[9px]">Lv.3</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">테마</p>
            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-purple-700 to-purple-900" />
            <p className="text-white text-xs mt-1">퍼플 갤럭시</p>
            <p className="text-purple-400 text-[9px]">사용 중</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">프레임</p>
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
            <p className="text-white text-xs mt-1">빛나는 프레임</p>
            <p className="text-purple-400 text-[9px]">사용 중</p>
          </div>
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}
