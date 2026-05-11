import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const weeklyMissions = [
  { id: "read5", title: "Read 5 Chapters", desc: "Read any 5 chapters this week", reward: 50, rewardType: "xp", icon: "📖", target: 5, key: "weeklyRead" },
  { id: "quiz3", title: "Ace 3 Quizzes", desc: "Get 3 quiz questions correct", reward: 30, rewardType: "xp", icon: "🧠", target: 3, key: "weeklyQuiz" },
  { id: "streak5", title: "5-Day Streak", desc: "Read for 5 consecutive days", reward: 20, rewardType: "gems", icon: "🔥", target: 5, key: "weeklyStreak" },
  { id: "share1", title: "Share a Verse", desc: "Share a verse with a friend", reward: 10, rewardType: "gems", icon: "💬", target: 1, key: "weeklyShare" },
];

export default function Challenges() {
  const game = useGame();
  const [activeTab, setActiveTab] = useState<"weekly" | "stats" | "invite">("weekly");

  // Get weekly progress from localStorage
  const getWeeklyProgress = (key: string) => {
    const data = localStorage.getItem(`challenge_${key}`);
    if (!data) return 0;
    const parsed = JSON.parse(data);
    // Reset if not this week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    if (new Date(parsed.weekStart).getTime() !== weekStart.getTime()) return 0;
    return parsed.progress || 0;
  };

  const claimReward = (mission: typeof weeklyMissions[0]) => {
    const progress = getWeeklyProgress(mission.key);
    if (progress < mission.target) {
      toast.error("Not completed yet!");
      return;
    }
    const claimed = localStorage.getItem(`claimed_${mission.id}_${getWeekKey()}`);
    if (claimed) {
      toast.info("Already claimed this week!");
      return;
    }
    if (mission.rewardType === "xp") game.addXP(mission.reward);
    else game.addGems(mission.reward);
    localStorage.setItem(`claimed_${mission.id}_${getWeekKey()}`, "true");
    toast.success(`🎉 Claimed ${mission.reward} ${mission.rewardType === "xp" ? "XP" : "Gems"}!`);
  };

  const getWeekKey = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return weekStart.toISOString().split("T")[0];
  };

  // Quiz stats
  const totalQuizzes = parseInt(localStorage.getItem("totalQuizzes") || "0");
  const correctQuizzes = parseInt(localStorage.getItem("correctQuizzes") || "0");
  const accuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">🏆 CHALLENGES</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/40 rounded-xl p-1">
        {[
          { id: "weekly" as const, label: "Weekly", icon: "📅" },
          { id: "stats" as const, label: "Quiz Stats", icon: "📊" },
          { id: "invite" as const, label: "Invite", icon: "👥" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-400"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Weekly Challenges */}
      {activeTab === "weekly" && (
        <div className="space-y-3">
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-xs">Week resets in</p>
            <p className="text-white font-bold text-lg font-display">{getDaysUntilReset()} days</p>
          </div>

          {weeklyMissions.map(mission => {
            const progress = getWeeklyProgress(mission.key);
            const completed = progress >= mission.target;
            const claimed = !!localStorage.getItem(`claimed_${mission.id}_${getWeekKey()}`);
            const pct = Math.min(100, Math.round((progress / mission.target) * 100));

            return (
              <div key={mission.id} className={`neon-card p-4 ${completed ? "border-green-500/40" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
                    {mission.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm">{mission.title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{mission.desc}</p>
                    <div className="mt-2 h-2 bg-gray-800/80 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${completed ? "bg-green-500" : "bg-gradient-to-r from-purple-600 to-purple-400"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-gray-500 text-[10px] mt-1">{progress}/{mission.target} · {mission.reward} {mission.rewardType === "xp" ? "XP" : "💎"}</p>
                  </div>
                  {completed && !claimed && (
                    <button onClick={() => claimReward(mission)}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white text-xs font-bold active:scale-95 transition-transform">
                      Claim
                    </button>
                  )}
                  {claimed && <span className="text-green-400 text-xs">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Stats */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="neon-card p-3 text-center">
              <p className="text-2xl font-bold text-white">{totalQuizzes}</p>
              <p className="text-gray-400 text-[10px] mt-1">Total Quizzes</p>
            </div>
            <div className="neon-card p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{correctQuizzes}</p>
              <p className="text-gray-400 text-[10px] mt-1">Correct</p>
            </div>
            <div className="neon-card p-3 text-center">
              <p className="text-2xl font-bold text-purple-300">{accuracy}%</p>
              <p className="text-gray-400 text-[10px] mt-1">Accuracy</p>
            </div>
          </div>

          <div className="neon-card p-4">
            <h3 className="text-white font-bold text-sm mb-3">📈 Performance</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Best Streak</span>
                <span className="text-white text-sm font-bold">{localStorage.getItem("bestQuizStreak") || "0"} in a row</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Books Quizzed</span>
                <span className="text-white text-sm font-bold">{localStorage.getItem("booksQuizzed") || "0"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Fastest Answer</span>
                <span className="text-white text-sm font-bold">{localStorage.getItem("fastestQuiz") || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="neon-card p-4">
            <h3 className="text-white font-bold text-sm mb-2">🏅 Quiz Achievements</h3>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { emoji: "🌱", name: "First Quiz", req: 1 },
                { emoji: "📚", name: "10 Quizzes", req: 10 },
                { emoji: "🧠", name: "50 Quizzes", req: 50 },
                { emoji: "🎓", name: "100 Quizzes", req: 100 },
                { emoji: "🎯", name: "5 in a row", req: 5 },
                { emoji: "🔥", name: "10 in a row", req: 10 },
                { emoji: "💯", name: "90% accuracy", req: 90 },
                { emoji: "👑", name: "Quiz Master", req: 200 },
              ].map(ach => {
                const unlocked = totalQuizzes >= ach.req || accuracy >= ach.req;
                return (
                  <div key={ach.name} className={`text-center p-2 rounded-lg ${unlocked ? "bg-purple-900/30 border border-purple-500/30" : "bg-gray-800/30 opacity-50"}`}>
                    <span className="text-xl">{ach.emoji}</span>
                    <p className="text-[8px] text-gray-400 mt-1">{ach.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends */}
      {activeTab === "invite" && (
        <div className="space-y-4">
          <div className="neon-card-gold p-5 text-center">
            <span className="text-4xl">🎁</span>
            <h2 className="text-white font-bold text-lg mt-2 font-display">INVITE FRIENDS</h2>
            <p className="text-gray-300 text-sm mt-1">Both you and your friend get 50 gems!</p>
          </div>

          <div className="neon-card p-4">
            <h3 className="text-white font-bold text-sm mb-2">Your Invite Code</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-800/80 border border-purple-500/30 rounded-lg px-3 py-2">
                <span className="text-purple-300 font-mono text-sm">{game.playerName.toUpperCase().slice(0, 4)}2025</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`${game.playerName.toUpperCase().slice(0, 4)}2025`);
                  toast.success("📋 Code copied!");
                }}
                className="px-3 py-2 bg-purple-600 rounded-lg text-white text-xs font-bold active:scale-95 transition-transform"
              >
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Teenz Bible",
                  text: `Join me on Teenz Bible! Use my invite code: ${game.playerName.toUpperCase().slice(0, 4)}2025`,
                  url: "https://teens-bible-94271.web.app",
                });
              } else {
                navigator.clipboard?.writeText(`Join me on Teenz Bible! Use my invite code: ${game.playerName.toUpperCase().slice(0, 4)}2025\nhttps://teens-bible-94271.web.app`);
                toast.success("📋 Invite link copied!");
              }
            }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-purple-500/20"
          >
            📤 Share Invite Link
          </button>

          <div className="neon-card p-4">
            <h3 className="text-white font-bold text-sm mb-2">🎯 Redeem a Code</h3>
            <RedeemCode onRedeem={(code) => {
              if (code.length >= 4) {
                game.addGems(50);
                toast.success("🎉 Code redeemed! +50 Gems!");
              } else {
                toast.error("Invalid code");
              }
            }} />
          </div>

          <div className="neon-card p-4">
            <h3 className="text-white font-bold text-sm mb-3">👥 Friends Invited</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total invites accepted</span>
              <span className="text-white font-bold">{localStorage.getItem("invitesAccepted") || "0"}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400 text-sm">Gems earned from invites</span>
              <span className="text-purple-300 font-bold">{parseInt(localStorage.getItem("invitesAccepted") || "0") * 50} 💎</span>
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}

function RedeemCode({ onRedeem }: { onRedeem: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter code..."
        className="flex-1 px-3 py-2 bg-gray-800/80 border border-purple-500/30 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400"
      />
      <button
        onClick={() => { onRedeem(code); setCode(""); }}
        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white text-xs font-bold active:scale-95 transition-transform"
      >
        Redeem
      </button>
    </div>
  );
}

function getDaysUntilReset() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7;
  return daysUntilSunday === 0 ? 7 : daysUntilSunday;
}
