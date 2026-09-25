// 제자반 챌린지 — My Journey (70일 개인 대시보드)
// Home 금색 리본 아래 "My Journey" 행에서 진입. 당일 완료/늦음(보충)/읽는 중/미완료를 구분해 보여준다.
// 한/영 토글: readerLang(localStorage)과 공유.

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

type Lang = "ko" | "en";

const STR = {
  ko: {
    subtitle: "70일 기록",
    title: "나의 70일 여정",
    titleDesc: "당일 완료와 보충 완료를 구분해 보여줘요.",
    streak: "연속 읽기",
    doneDays: "완료한 날",
    completionRate: "완독률",
    appRead: (n: number) => `✅ 앱으로 읽음 ${n}일`,
    selfLogged: (n: number) => `📖 직접 기록 ${n}일`,
    leaderConfirmed: (n: number) => `🔧 리더 확인 ${n}일`,
    legendDone: "당일 완료",
    legendLate: "늦음",
    legendReading: "읽는 중",
    legendSelf: "📖 직접 기록",
    legendTodo: "미완료",
    hint: "💡 숫자는 몇 일차인지예요 (장 번호가 아니에요). 동그라미를 누르면 그날 읽을 분량(성경 몇 장)이 나와요.",
    loading: "기록을 불러오는 중…",
    loadError: "기록을 불러오지 못했어요. 다시 시도해 주세요.",
    noPart: "챌린지에 참여하면 70일 기록이 여기에 보여요.",
    backHome: "홈으로 돌아가기",
    dayN: (n: number) => `${n}일차`,
    dayLabel: (d: JourneyDay) => `${d.dayIndex}일차 ${d.labelKo}`,
    statusDone: "완료",
    statusLate: "늦음",
    statusReading: "읽는 중",
    statusTodo: "미완료",
    chipSelf: "📖 직접 기록",
    chipLeader: "🔧 리더 인정",
    chipDone: "✅ 완료",
    panelSelfDone: "📖 직접 기록으로 완료",
    panelLateDone: "늦음 (완료)",
    panelDone: "완료",
    panelReading: "읽는 중",
    panelTodo: "미완료",
    goRead: "📖 읽으러 가기",
    logSelf: "✍️ 직접 기록하기",
    saving: "기록 중...",
    logSelfHint:
      "성경책이나 다른 앱으로 이미 읽었다면 '직접 기록하기'를 눌러주세요. 완료로 인정되지만 📖 직접 기록으로 구분 표시돼요.",
    undoSelfLog: "직접 기록 취소",
    undoing: "취소 중...",
    dayDoneParty: "완료된 날짜예요 🎉",
    bottomHelp:
      "지나간 날짜를 누르면 해당 분량을 읽거나 직접 읽음을 기록할 수 있어요. 늦은 날짜의 분량을 나중에 읽으면 전체 완료 수에는 들어가지만, 당일 완료로는 표시되지 않고 '늦음'으로 남아요.",
    recent: "최근 기록",
    recentEmpty: "아직 기록이 없어요. 오늘의 분량부터 읽어보세요!",
    confirmLog: (d: JourneyDay) =>
      `${d.dayIndex}일차(${d.labelKo})를 성경책이나 다른 앱으로 읽었음을 기록할까요?`,
    confirmUndo: "직접 기록을 취소할까요?",
    errSave: "기록 중 오류가 났어요",
    errUndo: "취소 중 오류가 났어요",
    close: "닫기",
    backToHome: "홈으로 돌아가기",
  },
  en: {
    subtitle: "70-day record",
    title: "My 70-Day Journey",
    titleDesc: "Same-day and makeup completions, shown separately.",
    streak: "Day streak",
    doneDays: "Days done",
    completionRate: "Completion",
    appRead: (n: number) => `✅ ${n} day${n === 1 ? "" : "s"} read in app`,
    selfLogged: (n: number) => `📖 ${n} day${n === 1 ? "" : "s"} self-logged`,
    leaderConfirmed: (n: number) => `🔧 ${n} day${n === 1 ? "" : "s"} leader-approved`,
    legendDone: "Done on time",
    legendLate: "Late",
    legendReading: "Reading",
    legendSelf: "📖 Self-logged",
    legendTodo: "Not done",
    hint: "💡 Numbers are day counts (not chapter numbers). Tap a circle to see that day's reading (which chapters).",
    loading: "Loading your journey…",
    loadError: "Couldn't load your journey. Please try again.",
    noPart: "Your 70-day record will appear here once you join the challenge.",
    backHome: "Back to Home",
    dayN: (n: number) => `Day ${n}`,
    dayLabel: (d: JourneyDay) => `Day ${d.dayIndex} · ${d.labelEn}`,
    statusDone: "Done",
    statusLate: "Late",
    statusReading: "Reading",
    statusTodo: "Not done",
    chipSelf: "📖 Self-logged",
    chipLeader: "🔧 Leader approved",
    chipDone: "✅ Done",
    panelSelfDone: "Done via self-log",
    panelLateDone: "Late (done)",
    panelDone: "Done",
    panelReading: "Reading",
    panelTodo: "Not done",
    goRead: "📖 Go read",
    logSelf: "✍️ Log it myself",
    saving: "Saving…",
    logSelfHint:
      "Already read it in a print Bible or another app? Tap “Log it myself”. It counts as done, marked 📖 self-logged.",
    undoSelfLog: "Undo self-log",
    undoing: "Undoing…",
    dayDoneParty: "All done for this day 🎉",
    bottomHelp:
      "Tap a past date to read its portion or log it yourself. Finishing a late date later counts toward your total, but it stays marked “Late” instead of done on time.",
    recent: "Recent activity",
    recentEmpty: "Nothing yet — start with today's reading!",
    confirmLog: (d: JourneyDay) =>
      `Log Day ${d.dayIndex} (${d.labelEn}) as read in a print Bible or another app?`,
    confirmUndo: "Undo this self-log?",
    errSave: "Something went wrong while saving.",
    errUndo: "Something went wrong while undoing.",
    close: "Close",
    backToHome: "Back to Home",
  },
} as const;

function cellStyle(d: JourneyDay, isFuture: boolean): string {
  const base =
    "aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors relative ";
  if (isFuture) return base + "bg-white/[0.03] text-white/30";
  if (d.status === "done" && d.source === "self")
    return base + "bg-[#2a2111] border-2 border-dashed border-[#e8c25a] text-[#e8c25a]";
  if (d.status === "done" && !d.late)
    return base + "bg-gradient-to-br from-[#e8c25a] to-[#9a7426] text-[#1a1405] shadow-[0_2px_10px_rgba(212,169,78,0.35)]";
  if (d.status === "done" && d.late)
    return base + "bg-[#3a2410] border border-[#e08a2e] text-[#f0a952]";
  if (d.status === "reading") return base + "bg-[#12294d] border border-[#4d9fff] text-[#8fc2ff] animate-pulse";
  return base + "bg-white/[0.06] text-white/40";
}

function StatusChip({ d, lang }: { d: JourneyDay; lang: Lang }) {
  const t = STR[lang];
  if (d.status === "done" && d.source === "self")
    return (
      <span className="shrink-0 rounded-full bg-[#2a2111] border border-dashed border-[#e8c25a] px-2 py-0.5 text-xs font-bold text-[#e8c25a]">
        {t.chipSelf}
        {d.late ? ` · ${t.statusLate}` : ""}
      </span>
    );
  if (d.status === "done" && d.source === "leader")
    return (
      <span className="shrink-0 rounded-full bg-[#241a2e] border border-[#a78bfa] px-2 py-0.5 text-xs font-bold text-[#c4b5fd]">
        {t.chipLeader}
      </span>
    );
  if (d.status === "done" && d.late)
    return (
      <span className="shrink-0 rounded-full bg-[#3a2410] border border-[#e08a2e] px-2 py-0.5 text-xs font-bold text-[#f0a952]">
        {t.statusLate}
      </span>
    );
  if (d.status === "done")
    return (
      <span className="shrink-0 rounded-full bg-[#2a2111] border border-[#d4a94e] px-2 py-0.5 text-xs font-bold text-[#e8c25a]">
        {t.chipDone}
      </span>
    );
  return (
    <span className="shrink-0 rounded-full bg-[#12294d] border border-[#4d9fff] px-2 py-0.5 text-xs font-bold text-[#8fc2ff]">
      {t.statusReading}
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
  const [lang, setLang] = useState<Lang>(
    (localStorage.getItem("readerLang") as Lang) || "en",
  );
  const t = STR[lang];

  useEffect(() => {
    localStorage.setItem("readerLang", lang);
  }, [lang]);

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
    if (!window.confirm(t.confirmLog(selected))) return;
    setSelfBusy(true);
    try {
      await setSelfReport(selected.dateKey, true);
      await reloadJourney();
    } catch (e: any) {
      alert(e?.message || t.errSave);
    } finally {
      setSelfBusy(false);
    }
  };

  const handleCancelSelfReport = async () => {
    if (!selected || selfBusy) return;
    if (!window.confirm(t.confirmUndo)) return;
    setSelfBusy(true);
    try {
      await setSelfReport(selected.dateKey, false);
      await reloadJourney();
    } catch (e: any) {
      alert(e?.message || t.errUndo);
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

  const statusWord = (d: JourneyDay) =>
    d.status === "done"
      ? d.late
        ? t.statusLate
        : t.statusDone
      : d.status === "reading"
        ? t.statusReading
        : t.statusTodo;

  const panelStatusWord = (d: JourneyDay) =>
    d.status === "done"
      ? d.source === "self"
        ? t.panelSelfDone
        : d.late
          ? t.panelLateDone
          : t.panelDone
      : d.status === "reading"
        ? t.panelReading
        : t.panelTodo;

  return (
    <div className="min-h-screen bg-[#090a0d] text-white pb-28">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#090a0d]/95 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setLocation("/")}
            aria-label={t.backToHome}
            className="p-1 -ml-1 text-white/70 active:scale-95 transition-transform"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">My Journey</h1>
            <p className="text-xs text-white/65">{t.subtitle}</p>
          </div>
          {/* 한/영 토글 */}
          <div className="ml-auto flex rounded-full border border-white/15 bg-white/[0.04] p-0.5 text-xs font-bold">
            {(["ko", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-3 py-1 transition-colors ${
                  lang === l ? "bg-[#e8c25a] text-[#1a1405]" : "text-white/60 active:text-white"
                }`}
              >
                {l === "ko" ? "한국어" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {!authReady || participation === undefined || (participation && !journey && !error) ? (
          <div className="py-20 text-center text-white/60">{t.loading}</div>
        ) : error ? (
          <div className="py-20 text-center text-white/60">{t.loadError}</div>
        ) : !participation ? (
          <div className="py-20 text-center">
            <p className="text-white/70 mb-4">{t.noPart}</p>
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="rounded-full bg-gradient-to-br from-[#e8c25a] to-[#9a7426] px-6 py-2.5 font-bold text-[#1a1405]"
            >
              {t.backHome}
            </button>
          </div>
        ) : (
          journey && (
            <>
              <h2 className="text-2xl font-bold">{t.title}</h2>
              <p className="mt-1 text-sm text-white/65">{t.titleDesc}</p>

              {/* 핵심 통계 */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className="text-xl font-bold text-[#e8c25a]">{journey.streak}</div>
                  <div className="mt-0.5 text-xs text-white/65">{t.streak}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className="text-xl font-bold text-[#e8c25a]">
                    {journey.doneDays}<span className="text-sm text-white/50">/{journey.elapsedDays}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-white/65">{t.doneDays}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <div className="text-xl font-bold text-[#e8c25a]">{journey.completionRate}%</div>
                  <div className="mt-0.5 text-xs text-white/65">{t.completionRate}</div>
                </div>
              </div>
              {(journey.selfReportedDays > 0 || journey.leaderCreditedDays > 0) && (
                <p className="mt-2 text-center text-xs text-white/60">
                  {t.appRead(journey.appReadDays)}
                  {journey.selfReportedDays > 0 && ` · ${t.selfLogged(journey.selfReportedDays)}`}
                  {journey.leaderCreditedDays > 0 && ` · ${t.leaderConfirmed(journey.leaderCreditedDays)}`}
                </p>
              )}

              {/* 범례 */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-gradient-to-br from-[#e8c25a] to-[#9a7426]" /> {t.legendDone}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#3a2410] border border-[#e08a2e]" /> {t.legendLate}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#12294d] border border-[#4d9fff]" /> {t.legendReading}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#2a2111] border border-dashed border-[#e8c25a]" /> {t.legendSelf}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-white/[0.06]" /> {t.legendTodo}
                </span>
              </div>

              {/* 70일 그리드 */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-2 text-xs leading-relaxed text-white/60">{t.hint}</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {journey.days.map((d) => {
                    const isFuture = d.dateKey > todayKey;
                    const clickable = !isFuture;
                    const cls = cellStyle(d, isFuture);
                    const label = `${t.dayLabel(d)}, ${statusWord(d)}`;
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
                        title={`${t.dayN(d.dayIndex)} · ${formatShortDateKey(d.dateKey)} · ${
                          lang === "ko" ? d.labelKo : d.labelEn
                        }`}
                        aria-label={label}
                      >
                        {cellBody}
                      </button>
                    ) : (
                      <div
                        key={d.dateKey}
                        className={cls}
                        title={`${t.dayN(d.dayIndex)} · ${formatShortDateKey(d.dateKey)} · ${
                          lang === "ko" ? d.labelKo : d.labelEn
                        }`}
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
                      <p className="text-sm font-bold">{t.dayLabel(selected)}</p>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="px-2 text-lg font-bold text-white/50 active:text-white"
                        aria-label={t.close}
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-white/60">
                      {formatShortDateKey(selected.dateKey)} · {panelStatusWord(selected)}
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
                            {t.goRead}
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectSelfReport}
                            disabled={selfBusy}
                            className="flex-1 rounded-xl border border-[#e8c25a]/50 py-2.5 text-[13px] font-bold text-[#e8c25a] active:scale-95 disabled:opacity-50"
                          >
                            {selfBusy ? t.saving : t.logSelf}
                          </button>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-white/60">{t.logSelfHint}</p>
                      </>
                    ) : selected.source === "self" ? (
                      <button
                        type="button"
                        onClick={handleCancelSelfReport}
                        disabled={selfBusy}
                        className="mt-3 w-full rounded-xl border border-white/20 py-2.5 text-[13px] font-bold text-white/70 active:scale-95 disabled:opacity-50"
                      >
                        {selfBusy ? t.undoing : t.undoSelfLog}
                      </button>
                    ) : (
                      <p className="mt-2 text-xs text-white/60">{t.dayDoneParty}</p>
                    )}
                  </div>
                )}
                <p className="mt-2.5 text-xs leading-relaxed text-white/60">{t.bottomHelp}</p>
              </div>

              {/* 최근 기록 */}
              <h3 className="mt-6 text-base font-bold">{t.recent}</h3>
              <div className="mt-2 space-y-2">
                {recent.length === 0 && (
                  <p className="text-sm text-white/60">{t.recentEmpty}</p>
                )}
                {recent.map((d) => (
                  <div
                    key={d.dateKey}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">
                        {lang === "ko" ? d.labelKo : d.labelEn}
                      </div>
                      <div className="text-xs text-white/60">
                        {formatShortDateKey(d.dateKey)} · {t.dayN(d.dayIndex)}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <StatusChip d={d} lang={lang} />
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
