// Challenge — today's reading complete celebration modal.
// Shown once per day when today's portion officially completes
// (official judgment: real reading time, the same bar as the leaderboard stamp).
// The reward is granted once when the modal shows (+10 XP, +3 Gems) —
// no double-counting with per-chapter/quiz rewards.

import { useMemo } from "react";

export interface DayCelebrationData {
  /** Day number */
  dayNum: number;
  /** Current day streak */
  streak: number;
}

const CONFETTI_COLORS = ["#FFD700", "#f4b934", "#FF6B9D", "#4DABF7", "#63E6BE", "#FFA94D"];

export default function ChallengeCelebration({
  data,
  onQuiz,
  onClose,
}: {
  data: DayCelebrationData;
  onQuiz: () => void;
  onClose: () => void;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.4 + Math.random() * 1.8,
        size: 5 + Math.random() * 7,
        round: Math.random() > 0.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Today's reading complete"
    >
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="challenge-celebration-confetti"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * (p.round ? 1 : 1.4),
              background: p.color,
              borderRadius: p.round ? "50%" : "2px",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-[340px] rounded-[20px] bg-[#1c1f26] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "celebrationPop 0.45s cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-b from-[#ffe9a8] to-[#d99420] text-[38px] shadow-[0_8px_28px_rgba(244,185,52,0.45)]">
          🏆
        </div>
        <div className="mt-3 text-[13px] font-extrabold text-[#f4b934]">Day {data.dayNum} complete</div>
        <h2 className="mt-1 text-[24px] font-extrabold text-white tracking-tight">Today&apos;s Reading Complete!</h2>

        <div className="mt-3 text-[13.5px] font-medium italic leading-relaxed text-white/75">
          &ldquo;Do not fear, for I am with you&rdquo;
          <br />
          <span className="text-[12px] font-bold not-italic text-white/40">Isaiah 41:10</span>
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-2.5">
            <span className="text-[20px]">⭐</span>
            <span className="text-[14px] font-extrabold text-white">+10 XP</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-2.5">
            <span className="text-[20px]">💎</span>
            <span className="text-[14px] font-extrabold text-white">+3 Gems</span>
          </div>
        </div>

        <div className="mt-3 text-[13px] font-bold text-white/60">
          🔥 {data.streak}-day streak! Keep it going tomorrow
        </div>

        <button
          type="button"
          onClick={onQuiz}
          className="mt-5 w-full rounded-2xl bg-gradient-to-b from-[#ffe9a8] to-[#f4b934] py-3.5 text-[15px] font-extrabold text-[#1a1206] shadow-[0_6px_20px_rgba(244,185,52,0.35)] active:scale-[0.98] transition-transform"
        >
          Take Quiz (Optional)
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-white/[0.06] py-3 text-[14px] font-extrabold text-white/60 active:scale-[0.98] transition-transform"
        >
          Close
        </button>
        <div className="mt-3 text-[11.5px] font-medium text-white/35">
          You earn XP whether your quiz answers are right or wrong
        </div>
      </div>

      <style>{`
        @keyframes challengeCelebrationFall {
          0% { transform: translate3d(0, -10px, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(20px, 105vh, 0) rotate(720deg); opacity: 0.6; }
        }
        .challenge-celebration-confetti {
          position: absolute;
          top: -12px;
          opacity: 0;
          animation-name: challengeCelebrationFall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
        @keyframes celebrationPop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
