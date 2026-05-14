import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Daily Bonus Streak System ───────────────────────────────
// Awards bonus gems for consecutive daily logins.
// Streak milestones: Day 3 = +5, Day 7 = +15, Day 14 = +30, Day 30 = +50
// Daily login (non-milestone) = +2 gems

const STREAK_KEY = "teensBibleDailyStreak";

export interface StreakData {
  currentStreak: number;
  lastClaimDate: string; // YYYY-MM-DD
  totalDaysClaimed: number;
  longestStreak: number;
}

const MILESTONES = [
  { day: 3, gems: 5, emoji: "🔥" },
  { day: 7, gems: 15, emoji: "⭐" },
  { day: 14, gems: 30, emoji: "💫" },
  { day: 30, gems: 50, emoji: "👑" },
];

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { currentStreak: 0, lastClaimDate: "", totalDaysClaimed: 0, longestStreak: 0 };
}

export function saveStreakData(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  // Also update teensBible.streak for leaderboard sync
  try {
    const raw = localStorage.getItem("teensBible");
    const teensBible = raw ? JSON.parse(raw) : {};
    teensBible.streak = data.currentStreak;
    localStorage.setItem("teensBible", JSON.stringify(teensBible));
  } catch {}
}

function addGemsDirectly(amount: number) {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
    data.gems = (data.gems || 0) + amount;
    localStorage.setItem("teensBible", JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("gems-changed", { detail: data.gems }));
  } catch {}
}

function canClaimToday(): boolean {
  const data = getStreakData();
  return data.lastClaimDate !== getToday();
}

function claimDailyBonus(): { streakData: StreakData; gemsEarned: number; isMilestone: boolean; milestoneDay?: number } {
  const data = getStreakData();
  const today = getToday();
  const yesterday = getYesterday();

  // Already claimed today
  if (data.lastClaimDate === today) {
    return { streakData: data, gemsEarned: 0, isMilestone: false };
  }

  // Continue streak if last claim was yesterday
  if (data.lastClaimDate === yesterday) {
    data.currentStreak += 1;
  } else {
    // Streak broken (or first time)
    data.currentStreak = 1;
  }

  data.lastClaimDate = today;
  data.totalDaysClaimed += 1;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

  // Check milestone
  const milestone = MILESTONES.find(m => m.day === data.currentStreak);
  const gemsEarned = milestone ? milestone.gems : 2;

  saveStreakData(data);
  addGemsDirectly(gemsEarned);

  return { streakData: data, gemsEarned, isMilestone: !!milestone, milestoneDay: milestone?.day };
}

// ─── DailyBonus Component ────────────────────────────────────
export default function DailyBonus() {
  const [showModal, setShowModal] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    streakData: StreakData;
    gemsEarned: number;
    isMilestone: boolean;
    milestoneDay?: number;
  } | null>(null);

  useEffect(() => {
    // Check if we can claim on app open (small delay to avoid blocking initial render)
    const timer = setTimeout(() => {
      if (canClaimToday()) {
        const result = claimDailyBonus();
        if (result.gemsEarned > 0) {
          setClaimResult(result);
          setShowModal(true);
          // Also trigger sync
          window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const streakData = claimResult?.streakData || getStreakData();
  const nextMilestone = MILESTONES.find(m => m.day > streakData.currentStreak);

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="bg-[#0f0f2e] border-purple-500/30 max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl font-bold">
            {claimResult?.isMilestone ? "🎉 Milestone Reached!" : "🔥 Daily Bonus!"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          {/* Streak Fire */}
          <div className="text-5xl">
            {claimResult?.isMilestone
              ? MILESTONES.find(m => m.day === claimResult.milestoneDay)?.emoji || "🔥"
              : "🔥"}
          </div>

          {/* Streak count */}
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{streakData.currentStreak} Day{streakData.currentStreak !== 1 ? "s" : ""}</p>
            <p className="text-gray-400 text-sm mt-1">Streak</p>
          </div>

          {/* Gems earned */}
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
            <p className="text-cyan-300 font-bold text-lg text-center">
              +{claimResult?.gemsEarned || 0} 💎
            </p>
          </div>

          {/* Milestone progress */}
          <div className="w-full space-y-2">
            <p className="text-gray-400 text-xs text-center">Upcoming Milestones</p>
            <div className="flex justify-between gap-1">
              {MILESTONES.map((m) => {
                const reached = streakData.currentStreak >= m.day;
                const current = streakData.currentStreak === m.day;
                return (
                  <div
                    key={m.day}
                    className={`flex-1 text-center p-2 rounded-lg border transition-all ${
                      current
                        ? "bg-yellow-500/20 border-yellow-500/50 scale-105"
                        : reached
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-white/[0.03] border-purple-500/20"
                    }`}
                  >
                    <p className="text-lg">{reached ? "✅" : m.emoji}</p>
                    <p className={`text-[10px] font-bold ${reached ? "text-green-400" : "text-gray-400"}`}>
                      Day {m.day}
                    </p>
                    <p className={`text-[9px] ${reached ? "text-green-300" : "text-gray-500"}`}>
                      +{m.gems}💎
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next milestone hint */}
          {nextMilestone && (
            <p className="text-gray-500 text-xs text-center">
              {nextMilestone.day - streakData.currentStreak} more day{nextMilestone.day - streakData.currentStreak !== 1 ? "s" : ""} until +{nextMilestone.gems}💎 bonus!
            </p>
          )}
        </div>

        <button
          onClick={() => setShowModal(false)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Awesome! 🎉
        </button>
      </DialogContent>
    </Dialog>
  );
}
