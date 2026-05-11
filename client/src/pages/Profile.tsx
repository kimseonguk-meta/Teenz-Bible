import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const ALL_BADGES = [
  { id: "첫 시작", name: "첫 시작", desc: "성경 읽기 시작", emoji: "📖" },
  { id: "7일 독서", name: "7일 독서", desc: "7일 연속 달성", emoji: "🏆" },
  { id: "백 장 독파", name: "백 장 독파", desc: "100장 읽기", emoji: "💯" },
  { id: "복음 전도자", name: "복음 전도자", desc: "친구 3명 초대", emoji: "⭐" },
  { id: "마태복음 완독", name: "마태복음 완독", desc: "마태복음 전체 읽기", emoji: "📕" },
];

export default function Profile() {
  const game = useGame();
  const level = game.getLevel();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newName, setNewName] = useState(game.playerName);
  const [newClass, setNewClass] = useState(game.className);

  const handleSaveName = () => {
    if (newName.trim()) {
      game.setPlayerName(newName.trim());
      game.setClassName(newClass.trim());
      setShowEditName(false);
    }
  };

  const matthewRead = game.getChaptersRead("Matthew").length;
  const matthewTotal = 28;

  return (
    <div className="px-4 pt-6 space-y-5 relative">
      {/* Header icons */}
      <div className="flex items-center justify-between">
        <button onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-gray-300 active:scale-95 transition-transform">
          ⚙️
        </button>
        <button onClick={() => setShowNotifications(true)}
          className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-gray-300 relative active:scale-95 transition-transform">
          🔔
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 rounded-full border border-purple-900" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-[4px] border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] bg-purple-900/50 flex items-center justify-center"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
            <span className="text-6xl">👦</span>
          </div>
          <button onClick={() => { setNewName(game.playerName); setNewClass(game.className); setShowEditName(true); }}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-400 flex items-center justify-center text-sm active:scale-95 transition-transform">
            ✏️
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white mt-3 font-display">{game.playerName}</h2>
        <div className="mt-1 px-4 py-1 bg-purple-600/30 border border-purple-500/40 rounded-full flex items-center gap-2">
          <span className="text-yellow-400">⭐</span>
          <span className="text-purple-200 text-sm font-bold">Lv. {level.level} {level.name}</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">{game.className}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">XP</span>
            <span className="text-gray-400 text-xs">총 XP</span>
          </div>
          <div className="text-2xl font-bold text-white">{game.totalXP}</div>
          <div className="text-[10px] text-gray-500">XP</div>
        </div>
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">💎</span>
            <span className="text-gray-400 text-xs">보유 젬</span>
          </div>
          <div className="text-2xl font-bold text-white">{game.gems}</div>
          <div className="text-[10px] text-gray-500">Gems</div>
        </div>
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">🔥</span>
            <span className="text-gray-400 text-xs">연속 읽기</span>
          </div>
          <div className="text-2xl font-bold text-white">{game.dayStreak}</div>
          <div className="text-[10px] text-gray-500">일</div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm">🏆 업적</h3>
          <span className="text-gray-400 text-xs">더보기 &gt;</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {ALL_BADGES.map((badge) => {
            const earned = game.badges.includes(badge.id);
            return (
              <div key={badge.id}
                className={`flex-shrink-0 w-20 flex flex-col items-center text-center cursor-pointer ${!earned ? 'opacity-40' : ''}`}
                onClick={() => earned ? toast.success(`🏆 ${badge.name}: ${badge.desc}`) : toast.info("아직 달성하지 못한 업적입니다")}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  earned ? 'bg-purple-600/30 border-2 border-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'bg-gray-800/50 border border-gray-700/30'
                }`}>
                  {badge.emoji}
                </div>
                <p className="text-white text-[10px] font-medium mt-1">{badge.name}</p>
                <p className="text-gray-500 text-[8px]">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading Progress */}
      <div className="neon-card p-4">
        <h3 className="text-white font-bold text-sm mb-3">📖 읽기 진행도</h3>
        <div className="flex items-center gap-3">
          <div className="text-3xl">📕</div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Matthew (마태복음)</p>
            <p className="text-gray-400 text-xs">{matthewRead} / {matthewTotal} chapters</p>
            <div className="mt-1.5 h-2 bg-gray-800/80 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${(matthewRead / matthewTotal) * 100}%` }} />
            </div>
          </div>
          <span className="text-purple-300 text-sm font-bold">{Math.round((matthewRead / matthewTotal) * 100)}%</span>
        </div>
      </div>

      {/* Equipped Items */}
      <div>
        <h3 className="text-white font-bold text-sm mb-3">✨ 장착 아이템</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="neon-card p-3 text-center">
            <div className="text-2xl mb-1">
              {game.equippedPet === "Faithy Cat" ? "🐱" :
               game.equippedPet === "Hope Puppy" ? "🐶" :
               game.equippedPet === "Joy Lamb" ? "🐑" :
               game.equippedPet === "Grace Bunny" ? "🐰" :
               game.equippedPet === "Peace Dove" ? "🕊️" :
               game.equippedPet === "Love Bear" ? "🐻" : "🐱"}
            </div>
            <p className="text-white text-[10px] font-medium">{game.equippedPet}</p>
            <p className="text-gray-500 text-[8px]">Pet</p>
          </div>
          <div className="neon-card p-3 text-center">
            <div className="w-8 h-8 mx-auto rounded-full" style={{
              background: game.equippedTheme === "Twilight Glow" ? "linear-gradient(135deg, #4c1d95, #7c3aed)" :
                game.equippedTheme === "Sea Breeze" ? "linear-gradient(135deg, #0e7490, #22d3ee)" :
                game.equippedTheme === "Forest Calm" ? "linear-gradient(135deg, #166534, #4ade80)" :
                game.equippedTheme === "Sunset Blaze" ? "linear-gradient(135deg, #9a3412, #fb923c)" :
                game.equippedTheme === "Cherry Blossom" ? "linear-gradient(135deg, #831843, #f472b6)" :
                "linear-gradient(135deg, #4c1d95, #7c3aed)"
            }} />
            <p className="text-white text-[10px] font-medium mt-1">{game.equippedTheme}</p>
            <p className="text-gray-500 text-[8px]">Theme</p>
          </div>
          <div className="neon-card p-3 text-center">
            <div className="text-2xl mb-1">
              {game.equippedFrame === "Gold Crown" ? "👑" :
               game.equippedFrame === "Diamond" ? "💎" :
               game.equippedFrame === "Fire Ring" ? "🔥" : "⬜"}
            </div>
            <p className="text-white text-[10px] font-medium">{game.equippedFrame}</p>
            <p className="text-gray-500 text-[8px]">Frame</p>
          </div>
        </div>
      </div>

      <div className="h-4" />

      {/* ─── Settings Modal ─── */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-[480px] bg-[#0a0020] border-t border-purple-500/30 rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white font-display">⚙️ 설정</h2>

            <button onClick={() => { setShowSettings(false); setNewName(game.playerName); setNewClass(game.className); setShowEditName(true); }}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">✏️</span>
              <span className="text-white text-sm">이름/반 변경</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => toast.info("🔔 알림 설정은 앱 출시 후 지원됩니다")}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">🔔</span>
              <span className="text-white text-sm">알림 설정</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => toast.info("🌐 언어 설정: 현재 한국어/영어 지원")}
              className="w-full p-3 neon-card flex items-center gap-3 active:scale-[0.98] transition-transform">
              <span className="text-lg">🌐</span>
              <span className="text-white text-sm">언어 설정</span>
              <span className="ml-auto text-gray-500">→</span>
            </button>

            <button onClick={() => {
              if (confirm("정말 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
              className="w-full p-3 neon-card flex items-center gap-3 border-red-500/30 active:scale-[0.98] transition-transform">
              <span className="text-lg">🗑️</span>
              <span className="text-red-400 text-sm">데이터 초기화</span>
            </button>

            <button onClick={() => setShowSettings(false)}
              className="w-full py-3 bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-200 text-sm font-bold">
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ─── Edit Name Modal ─── */}
      {showEditName && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6" onClick={() => setShowEditName(false)}>
          <div className="w-full max-w-[400px] bg-[#0a0020] border border-purple-500/30 rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white font-display">✏️ 프로필 수정</h2>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">이름</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                placeholder="이름을 입력하세요" />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">반</label>
              <input type="text" value={newClass} onChange={(e) => setNewClass(e.target.value)}
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                placeholder="반을 입력하세요" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowEditName(false)}
                className="flex-1 py-2.5 bg-gray-800/50 border border-gray-700/30 rounded-xl text-gray-300 text-sm">
                취소
              </button>
              <button onClick={handleSaveName}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform">
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notifications Modal ─── */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-end justify-center" onClick={() => setShowNotifications(false)}>
          <div className="w-full max-w-[480px] bg-[#0a0020] border-t border-purple-500/30 rounded-t-3xl p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white font-display">🔔 알림</h2>

            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">📖</span>
              <div className="flex-1">
                <p className="text-white text-sm">오늘의 성경 읽기를 시작하세요!</p>
                <p className="text-gray-500 text-xs">방금</p>
              </div>
            </div>

            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">🎁</span>
              <div className="flex-1">
                <p className="text-white text-sm">일일 보상을 받아가세요!</p>
                <p className="text-gray-500 text-xs">오늘</p>
              </div>
            </div>

            <div className="neon-card p-3 flex items-center gap-3">
              <span className="text-lg">🔥</span>
              <div className="flex-1">
                <p className="text-white text-sm">스트릭을 유지하세요! 연속 {game.dayStreak}일째</p>
                <p className="text-gray-500 text-xs">오늘</p>
              </div>
            </div>

            <button onClick={() => setShowNotifications(false)}
              className="w-full py-3 bg-purple-600/30 border border-purple-500/40 rounded-xl text-purple-200 text-sm font-bold">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
