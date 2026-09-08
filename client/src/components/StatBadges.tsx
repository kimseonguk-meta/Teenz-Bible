import { useEffect, useState, type ReactNode } from "react";
import { useGame } from "@/contexts/GameContext";
import { getStreakData } from "@/components/DailyBonus";

/**
 * Live stat badges – gold-framed badges that show REAL user data.
 * Replaces the old static mockup images (home-stats-row.webp, store-header-full.webp)
 * which displayed hardcoded fake numbers (7 streak, 4,200 XP, 2,450 gems, 800 coins).
 */

function GoldBadge({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      aria-label={label}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] border-2 border-[#c9a227] bg-[#0d0d33] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.35),0_4px_10px_rgba(0,0,0,0.5)]"
    >
      {children}
    </div>
  );
}

function useLiveStreak(): number {
  const [streak, setStreak] = useState(() => {
    try {
      return getStreakData().currentStreak;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setStreak(getStreakData().currentStreak);
      } catch {
        /* keep last value */
      }
    };
    window.addEventListener("streak-changed", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("streak-changed", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return streak;
}

/** Home top stats row: streak | XP | gems — all live. */
export function LiveStatsRow() {
  const { gems, totalXP } = useGame();
  const streak = useLiveStreak();

  return (
    <div className="flex justify-center items-stretch gap-2">
      <GoldBadge label={`${streak} day streak`}>
        <span className="text-2xl leading-none">🔥</span>
        <span className="text-xl font-black text-white leading-none">{streak}</span>
      </GoldBadge>
      <GoldBadge label={`${totalXP.toLocaleString()} XP`}>
        <span className="text-2xl leading-none">💠</span>
        <span className="text-xl font-black text-white leading-none">
          {totalXP.toLocaleString()}
          <span className="text-xs font-bold text-white/60 ml-1">XP</span>
        </span>
      </GoldBadge>
      <GoldBadge label={`${gems.toLocaleString()} gems`}>
        <span className="text-2xl leading-none">💎</span>
        <span className="text-xl font-black text-white leading-none">{gems.toLocaleString()}</span>
      </GoldBadge>
    </div>
  );
}

/** Store header balance: live gems only (there is no coin system — the old image's "800 coins" was fake). */
export function GemsBadge() {
  const { gems } = useGame();

  return (
    <GoldBadge label={`${gems.toLocaleString()} gems`}>
      <span className="text-2xl leading-none">💎</span>
      <span className="text-xl font-black text-white leading-none">
        {gems.toLocaleString()}
        <span className="text-xs font-bold text-white/60 ml-1">gems</span>
      </span>
    </GoldBadge>
  );
}
