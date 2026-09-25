// 제자반 챌린지 — My Journey (70일 개인 대시보드)
// Home 금색 리본 아래 "My Journey" 행에서 진입. 당일 완료/늦음(보충)/읽는 중/미완료를 구분해 보여준다.

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getMyParticipation,
  getMyJourney,
  formatShortDateKey,
  sgDateKey,
  setSelfReport,
  type MyJourney,
  type JourneyDay,
  type Participation,
} from "@/lib/challenge";

function cellStyle(d: JourneyDay, isFuture: boolean): string {
  const base =
    "aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors relative ";
  if (isFuture) return base + "bg-white/[0.03] text-white/20";
  if (d.status === "done" && d.source === "self")
    return base + "bg-[#2a2111] border-2 border-dashed border-[#e8c25a] text-[#e8c25a]";
  if (d.status === "done" && !d.late)
    return base + "bg-gradient-to-br from-[#e8c25a] to-[#9a7426] text-[#1a1405] shadow-[0_2px_10px_rgba(212,169,78,0.35)]";
  if (d.status === "done" && d.late)
    return base + "bg-[#3a2410] border border-[#e08a2e] text-[#f0a952]";
  if (d.status === "reading") return base + "bg-[#12294d] border border-[#4d9fff] text-[#8fc2ff] animate-pulse";
  return base + "bg-white/[0.06] text-white/30";
}

function StatusChip({ d }: { d: JourneyDay }) {
  if (d.status === "done" && d.source === "self")
    return (
      <span className="shrink-0 rounded-full bg-[#2a2111] border border-dashed border-[#e8c25a] px-2 py-0.5 text-[11px] font-bold text-[#e8c25a]">
        📖 직접 기록{d.late ? " · 늦음" : ""}
      </span>
    );
  if (d.status === "done" && d.source === "leader")
    return (
      <span className="shrink-0 rounded-full bg-[#241a2e] border border-[#a78bfa] px-2 py-0.5 text-[11px] font-bold text-[#c4b5fd]">
        🔧 리더 인정
      </span>
    );
  if (d.status === "done" && d.late)
    return (
      <span className="shrink-0 rounded-full bg-[#3a2410] border border-[#e08a2e] px-2 py-0.5 text-[11px] font-bold text-[#f0a952]">
        늦음
      </span>
    );
  if (d.status === "done")
    return (
      <span className="shrink-0 rounded-full bg-[#2a2111] border border-[#d4a94e] px-2 py-0.5 text-[11px] font-bold text-[#e8c25a]">
        ✅ 완료
      </span>
    );
  return (
    <span className="shrink-0 rounded-full bg-[#12294d] border border-[#4d9fff] px-2 py-0.5 text-[11px] font-bold text-[#8fc2ff]">
      읽는 중
    </span>
  );
}

export default function ChallengeJourney() {
  const [, setLocation] = useLocation();
  const [authReady, setAuthReady] = useState(false);
  const [participation, setParticipation] = useState<Participation | null | undefined>(undefined);
  const [journey, setJourney] = useState<MyJourney | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<JourneyDay | null>(null);
  const [selfBusy, setSelfBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);
      if (!user) {
        setParticipation(null);
        return;
      }
      try {
        const p = await getMyParticipation();
        setParticipation(p);
        if (p) {
          const j = await getMyJourney();
          setJourney(j);
        }
      } catch {
        setError(true);
        setParticipation(null);
      }
    });
    return () => unsub();
  }, []);

  const todayKey = sgDateKey();

  const reloadJourney = async () => {
    try {
      const j = await getMyJourney();
      setJourney(j);
      setSelected((prev) => (prev ? j.days.find((d) => d.dateKey === prev.dateKey) || null : null));
    } catch {}
  };

  const handleSelectSelfReport = async () => {
    if (!selected || selfBusy) return;
    if (
      !window.confirm(
        `${selected.dayIndex}일차(${selected.labelKo})를 성경책이나 다른 앱으로 읽었음을 기록할까요?`
      )
    )
      return;
    setSelfBusy(true);
    try {
      await setSelfReport(selected.dateKey, true);
      await reloadJourney();
    } catch (e: any) {
      alert(e?.message || "기록 중 오류가 났어요");
    } finally {
      setSelfBusy(false);
    }
  };

  const handleCancelSelfReport = async () => {
    if (!selected || selfBusy) return;
    if (!window.confirm("직접 기록을 취소할까요?")) return;
    setSelfBusy(true);
    try {
      await setSelfReport(selected.dateKey, false);
      await reloadJourney();
    } catch (e: any) {
      alert(e?.message || "취소 중 오류가 났어요");
    } finally {
      setSelfBusy(false);
    }
  };

  const recent = journey
    ? [...journey.days]
        .filter((d) => d.dateKey <= todayKey && d.status !== "not-started")
        .slice(-5)
        .reverse()
    : [];

  return (
    <div className="min-h-screen bg-[#090a0d] text-white pb-28">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#090a0d]/95 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setLocation("/")}
            aria-label="홈으로 돌아가기"
            className="p-1 -ml-1 text-white/70 active:scale-95 transition-transform"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">My Journey</h1>
            <p className="text-xs text-white/50">70일 기록</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {!authReady || participation === undefined || (participation && !journey && !error) ? (
          <div className="py-20 text-center text-white/50">기록을 불러오는 중…</div>
        ) : error ? (
          <div className="py-20 text-center text-white/50">
            기록을 불러오지 못했어요. 다시 시도해 주세요.
          </div>
        ) : !participation ? (
          <div className="py-20 text-center">
            <p className="text-white/70 mb-4">챌린지에 참여하면 70일 기록이 여기에 보여요.</p>
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="rounded-full bg-gradient-to-br from-[#e8c25a] to-[#9a7426] px-6 py-2.5 font-bold text-[#1a1405]"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          journey && (
            <>
              <h2 className="text-2xl font-bold">나의 70일 여정</h2>
              <p className="mt-1 text-sm text-white/50">당일 완료와 보충 완료를 구분해 보여줘요.</p>

              {/* 핵심 통계 */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className="text-xl font-bold text-[#e8c25a]">{journey.streak}</div>
                  <div className="mt-0.5 text-[11px] text-white/50">연속 읽기</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className="text-xl font-bold text-[#e8c25a]">
                    {journey.doneDays}<span className="text-sm text-white/40">/{journey.elapsedDays}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/50">완료한 날</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className="text-xl font-bold text-[#e8c25a]">{journey.completionRate}%</div>
                  <div className="mt-0.5 text-[11px] text-white/50">완독률</div>
                </div>
              </div>
              {(journey.selfReportedDays > 0 || journey.leaderCreditedDays > 0) && (
                <p className="mt-2 text-center text-[11px] text-white/45">
                  ✅ 앱으로 읽음 {journey.appReadDays}일
                  {journey.selfReportedDays > 0 && ` · 📖 직접 기록 ${journey.selfReportedDays}일`}
                  {journey.leaderCreditedDays > 0 && ` · 리더 확인 ${journey.leaderCreditedDays}일`}
                </p>
              )}

              {/* 범례 */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-white/55">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-gradient-to-br from-[#e8c25a] to-[#9a7426]" /> 당일 완료
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#3a2410] border border-[#e08a2e]" /> 늦음
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#12294d] border border-[#4d9fff]" /> 읽는 중
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#2a2111] border border-dashed border-[#e8c25a]" /> 📖 직접 기록
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-white/[0.06]" /> 미완료
                </span>
              </div>

              {/* 70일 그리드 */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-2 text-[11px] leading-relaxed text-white/45">
                  💡 숫자는 몇 일차인지예요 (장 번호가 아니에요). 동그라미를 누르면 그날 읽을
                  분량(성경 몇 장)이 나와요.
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {journey.days.map((d) => {
                    const isFuture = d.dateKey > todayKey;
                    const clickable = !isFuture;
                    const cls = cellStyle(d, isFuture);
                    const label = `${d.dayIndex}일차 ${d.labelKo}, ${d.status === "done" ? (d.late ? "늦음" : "완료") : d.status === "reading" ? "읽는 중" : "미완료"}`;
                    const cellBody = (
                      <>
                        {d.dayIndex}
                        {d.status === "done" && d.source === "self" && (
                          <span className="absolute -top-1.5 -right-1.5 text-[9px] leading-none">
                            📖
                          </span>
                        )}
                      </>
                    );
                    return clickable ? (
                      <button
                        key={d.dateKey}
                        type="button"
                        onClick={() => setSelected(d)}
                        className={cls + " cursor-pointer active:scale-95"}
                        title={`${d.dayIndex}일차 · ${formatShortDateKey(d.dateKey)} · ${d.labelKo}`}
                        aria-label={label}
                      >
                        {cellBody}
                      </button>
                    ) : (
                      <div
                        key={d.dateKey}
                        className={cls}
                        title={`${d.dayIndex}일차 · ${formatShortDateKey(d.dateKey)} · ${d.labelKo}`}
                        aria-label={label}
                      >
                        {cellBody}
                      </div>
                    );
                  })}
                </div>
                {/* 선택한 날짜 액션 패널 */}
                {selected && (
                  <div className="mt-3 rounded-2xl border border-[#e8c25a]/30 bg-[#e8c25a]/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">
                        {selected.dayIndex}일차 · {selected.labelKo}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="px-2 text-lg font-bold text-white/40 active:text-white"
                        aria-label="닫기"
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-white/45">
                      {formatShortDateKey(selected.dateKey)} ·{" "}
                      {selected.status === "done"
                        ? selected.source === "self"
                          ? "📖 직접 기록으로 완료"
                          : selected.late
                            ? "늦음 (완료)"
                            : "완료"
                        : selected.status === "reading"
                          ? "읽는 중"
                          : "미완료"}
                    </p>
                    {selected.status !== "done" ? (
                      <>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setLocation(`/bible/${selected.book}/${selected.firstChapter}`)
                            }
                            className="tb-btn flex-1 rounded-xl py-2.5 text-[13px] font-black"
                          >
                            📖 읽으러 가기
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectSelfReport}
                            disabled={selfBusy}
                            className="flex-1 rounded-xl border border-[#e8c25a]/50 py-2.5 text-[13px] font-bold text-[#e8c25a] active:scale-95 disabled:opacity-50"
                          >
                            {selfBusy ? "기록 중..." : "✍️ 직접 기록하기"}
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
                          성경책이나 다른 앱으로 이미 읽었다면 '직접 기록하기'를 눌러주세요.
                          완료로 인정되지만 📖 직접 기록으로 구분 표시돼요.
                        </p>
                      </>
                    ) : selected.source === "self" ? (
                      <button
                        type="button"
                        onClick={handleCancelSelfReport}
                        disabled={selfBusy}
                        className="mt-3 w-full rounded-xl border border-white/20 py-2.5 text-[13px] font-bold text-white/60 active:scale-95 disabled:opacity-50"
                      >
                        {selfBusy ? "취소 중..." : "직접 기록 취소"}
                      </button>
                    ) : (
                      <p className="mt-2 text-xs text-white/45">완료된 날짜예요 🎉</p>
                    )}
                  </div>
                )}
                <p className="mt-2.5 text-[11px] leading-relaxed text-white/40">
                  지나간 날짜를 누르면 해당 분량을 읽거나 직접 읽음을 기록할 수 있어요. 늦은 날짜의
                  분량을 나중에 읽으면 전체 완료 수에는 들어가지만, 당일 완료로는 표시되지 않고
                  '늦음'으로 남아요.
                </p>
              </div>

              {/* 최근 기록 */}
              <h3 className="mt-6 text-base font-bold">최근 기록</h3>
              <div className="mt-2 space-y-2">
                {recent.length === 0 && (
                  <p className="text-sm text-white/40">아직 기록이 없어요. 오늘의 분량부터 읽어보세요!</p>
                )}
                {recent.map((d) => (
                  <div
                    key={d.dateKey}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{d.labelKo}</div>
                      <div className="text-xs text-white/45">
                        {formatShortDateKey(d.dateKey)} · {d.dayIndex}일차
                      </div>
                    </div>
                    <div className="ml-auto">
                      <StatusChip d={d} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
