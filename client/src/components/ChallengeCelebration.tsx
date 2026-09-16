// 제자반 챌린지 — 당일/보충 완료 축하 모달
// 같은 날 분량을 다 읽은 순간(15초 틱에서 done 전환 감지)에 한 번만 표시.
// 퀴즈는 선택 사항이라 완료를 막지 않음.

import { useMemo } from "react";

export interface CelebrationData {
  dateKey: string;
  labelKo: string;
  isToday: boolean;
  streak: number;
  doneDays: number;
  totalDays: number;
  encouragement: string;
}

const ENCOURAGEMENTS = [
  "하나님의 말씀과 함께한 하루, 정말 잘했어요!",
  "꾸준함이 실력이 돼요. 내일도 만나요!",
  "오늘의 한 장이 내일의 믿음을 키워요.",
  "멋져요! 말씀 읽기가 습관이 되고 있어요.",
  "지치지 말고 한 걸음씩, 하나님이 응원해요.",
];

/** 격려 메시지 중 하나를 무작위로 */
export function pickEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

export default function ChallengeCelebration({
  data,
  onQuiz,
  onClose,
  onBack,
}: {
  data: CelebrationData;
  onQuiz: () => void;
  onClose: () => void;
  onBack: () => void;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.8,
        size: 5 + Math.random() * 7,
        round: Math.random() > 0.5,
        color: ["#FFD700", "#e8c25a", "#FF6B9D", "#4DABF7", "#63E6BE", "#FFA94D"][i % 6],
      })),
    []
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={data.isToday ? "오늘의 챌린지 완료" : "보충 읽기 완료"}
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
        className="relative w-full max-w-sm rounded-3xl border border-[#8a6d2f]/70 bg-[#101014] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "celebrationPop 0.45s cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="text-6xl" style={{ animation: "celebrationBounce 1.2s ease-in-out infinite" }}>
          {data.isToday ? "🎉" : "📖"}
        </div>
        <h2 className="mt-3 text-2xl font-bold text-[#f5e9c8]">
          {data.isToday ? "오늘 다 읽었어요!" : "보충 읽기 완료!"}
        </h2>
        <p className="mt-1 text-sm text-white/60">
          {data.labelKo}
          {!data.isToday && " · 늦었지만 해냈어요"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xl font-bold text-[#e8c25a]">{data.streak}일</div>
            <div className="mt-0.5 text-[11px] text-white/50">연속 읽기</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xl font-bold text-[#e8c25a]">
              {data.doneDays}<span className="text-sm text-white/40">/{data.totalDays}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-white/50">전체 완료</div>
          </div>
        </div>

        <p className="mt-4 text-sm italic text-white/55">“{data.encouragement}”</p>

        <button
          type="button"
          onClick={onQuiz}
          className="mt-5 w-full rounded-2xl bg-gradient-to-br from-[#e8c25a] to-[#9a7426] py-3 font-bold text-[#1a1405] active:scale-[0.98] transition-transform"
        >
          퀴즈 풀기 <span className="font-normal text-[#1a1405]/70">(선택)</span>
        </button>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/15 bg-white/[0.04] py-2.5 text-sm font-bold text-white/75 active:scale-[0.98] transition-transform"
          >
            다시 읽기
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-2xl border border-white/15 bg-white/[0.04] py-2.5 text-sm font-bold text-white/75 active:scale-[0.98] transition-transform"
          >
            돌아가기
          </button>
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
        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
