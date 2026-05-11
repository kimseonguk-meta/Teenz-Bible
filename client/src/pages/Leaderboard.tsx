import { useState, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";

const allPlayers = [
  { name: "Daniel", streak: 21, xp: 2450, avatar: "👦", className: "Class 1" },
  { name: "Esther", streak: 14, xp: 2100, avatar: "👧", className: "Class 1" },
  { name: "Joseph", streak: 10, xp: 1890, avatar: "🧑", className: "Class 2" },
  { name: "Moses", streak: 7, xp: 1650, avatar: "👦", className: "Class 2" },
  { name: "Ruth", streak: 6, xp: 1420, avatar: "👧", className: "Class 1" },
  { name: "Samuel", streak: 5, xp: 1250, avatar: "🧑", className: "Class 2" },
  { name: "Hannah", streak: 4, xp: 1110, avatar: "👧", className: "Class 1" },
  { name: "Paul", streak: 3, xp: 980, avatar: "👦", className: "Class 2" },
];

export default function Leaderboard() {
  const [tab, setTab] = useState<"all" | "class">("all");
  const game = useGame();

  // Merge current user into leaderboard
  const mergedPlayers = useMemo(() => {
    const players = allPlayers.map(p => {
      if (p.name === game.playerName || p.name === "Daniel") {
        return { ...p, name: game.playerName, xp: Math.max(p.xp, game.totalXP), streak: Math.max(p.streak, game.dayStreak), className: game.className };
      }
      return p;
    });
    return players.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
  }, [game.playerName, game.totalXP, game.dayStreak, game.className]);

  const filteredPlayers = tab === "class"
    ? mergedPlayers.filter(p => p.className === game.className).map((p, i) => ({ ...p, rank: i + 1 }))
    : mergedPlayers;

  const top3 = filteredPlayers.slice(0, 3);
  const rest = filteredPlayers.slice(3);

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white font-display neon-text-purple">🏆 Leaderboard</h1>
        <p className="text-purple-300 text-sm mt-1">
          {tab === "all" ? "👥 All Teens Ranking" : `👥 ${game.className} Ranking`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setTab("all")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            tab === "all"
              ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              : "bg-transparent border border-purple-500/30 text-gray-400"
          }`}
        >
          All Classes
        </button>
        <button
          onClick={() => setTab("class")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            tab === "class"
              ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              : "bg-transparent border border-purple-500/30 text-gray-400"
          }`}
        >
          My Class
        </button>
      </div>

      <p className="text-center text-gray-400 text-xs">📅 Updated weekly · Next update in 3 days</p>

      {/* Top 3 Podium */}
      {top3.length >= 3 ? (
        <div className="flex items-end justify-center gap-3 pt-4 pb-2">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center border-2 border-gray-300">2</div>
              <div className={`w-16 h-16 rounded-xl border-2 border-blue-400/50 bg-[rgba(15,5,40,0.8)] flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(96,165,250,0.3)] ${top3[1]?.name === game.playerName ? 'ring-2 ring-cyan-400' : ''}`}>
                {top3[1]?.avatar}
              </div>
            </div>
            <p className="text-white text-xs font-bold mt-2">{top3[1]?.name}</p>
            <p className="text-orange-400 text-[10px]">🔥 {top3[1]?.streak}-day streak</p>
            <p className="text-purple-300 font-bold text-sm">{top3[1]?.xp.toLocaleString()} XP</p>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center -mt-4">
            <div className="text-2xl mb-1">👑</div>
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center border-2 border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]">1</div>
              <div className={`w-20 h-20 rounded-xl border-2 border-yellow-500/70 bg-[rgba(15,5,40,0.8)] flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(234,179,8,0.3)] ${top3[0]?.name === game.playerName ? 'ring-2 ring-cyan-400' : ''}`}>
                {top3[0]?.avatar}
              </div>
            </div>
            <p className="text-white text-sm font-bold mt-2">{top3[0]?.name} {top3[0]?.rank === 1 ? '👑' : ''}</p>
            <p className="text-orange-400 text-[10px]">🔥 {top3[0]?.streak}-day streak</p>
            <p className="text-yellow-300 font-bold text-base">{top3[0]?.xp.toLocaleString()} XP</p>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center border-2 border-amber-600">3</div>
              <div className={`w-16 h-16 rounded-xl border-2 border-amber-600/50 bg-[rgba(15,5,40,0.8)] flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(180,83,9,0.3)] ${top3[2]?.name === game.playerName ? 'ring-2 ring-cyan-400' : ''}`}>
                {top3[2]?.avatar}
              </div>
            </div>
            <p className="text-white text-xs font-bold mt-2">{top3[2]?.name}</p>
            <p className="text-orange-400 text-[10px]">🔥 {top3[2]?.streak}-day streak</p>
            <p className="text-amber-400 font-bold text-sm">{top3[2]?.xp.toLocaleString()} XP</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <p className="text-lg">Not enough ranking data yet</p>
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((player) => (
          <div key={player.rank} className={`neon-card p-3 flex items-center gap-3 ${player.name === game.playerName ? 'border-cyan-400/50' : ''}`}>
            <span className="text-lg font-bold text-purple-300 w-7 text-center">{player.rank}</span>
            <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xl">
              {player.avatar}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{player.name} {player.name === game.playerName ? '(You)' : ''}</p>
              <p className="text-orange-400 text-[10px]">🔥 {player.streak}-day streak</p>
            </div>
            <span className="text-purple-300 font-bold text-sm">{player.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
