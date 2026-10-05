import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useGame } from "../contexts/GameContext";
import { allBibleData } from "@/data/allBibleData";
import { queuedToast } from "@/lib/toastQueue";
import {
  CHALLENGE_END,
  CHALLENGE_START,
  getCachedParticipation,
  getMyJourney,
  getTodayChallengeDay,
  sgDateKey,
  startChallengeChapter,
  withTimeout,
  type ChallengeDay,
  type MyJourney,
} from "../lib/challenge";

// ─── helpers ────────────────────────────────────────────────────

function bookToSlug(book: string): string {
  return book.toLowerCase().replace(/\s+/g, "-");
}

function parseKey(k: string): Date {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function fmtKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDaysKey(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return fmtKey(d);
}
function diffDays(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86400000);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function weekdayEn(key: string): string {
  return WEEKDAYS[parseKey(key).getDay()];
}

function localDone(key: string): boolean {
  try {
    return localStorage.getItem(`challengeDayDone_${key}`) === "1";
  } catch {
    return false;
  }
}

type DayState = "done" | "missed" | "today" | "future";

function resolveStatus(
  dateKey: string,
  journey: MyJourney | null,
  todayKey: string,
): DayState {
  let done = false;
  if (journey) {
    done = journey.days.some((d) => d.dateKey === dateKey && d.status === "done");
  } else {
    done = localDone(dateKey);
  }
  if (done) return "done";
  if (dateKey === todayKey) return "today";
  return dateKey < todayKey ? "missed" : "future";
}

function isDoneKey(key: string, journey: MyJourney | null): boolean {
  if (journey) return journey.days.some((d) => d.dateKey === key && d.status === "done");
  return localDone(key);
}

/** Reading streak: even if today isn't done yet, count the streak through yesterday (Duolingo-style). */
function computeStreak(journey: MyJourney | null, todayKey: string): number {
  let key = todayKey;
  if (!isDoneKey(key, journey)) key = addDaysKey(key, -1);
  let s = 0;
  while (key >= CHALLENGE_START && isDoneKey(key, journey) && s < 100) {
    s++;
    key = addDaysKey(key, -1);
  }
  return s;
}

function computeLongestStreak(journey: MyJourney | null, uptoKey: string): number {
  let best = 0;
  let cur = 0;
  let key = CHALLENGE_START;
  let guard = 0;
  while (key <= uptoKey && guard < 100) {
    if (isDoneKey(key, journey)) {
      cur++;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
    key = addDaysKey(key, 1);
    guard++;
  }
  return best;
}

function countLocalDone(uptoKey: string): number {
  let n = 0;
  let key = CHALLENGE_START;
  let guard = 0;
  while (key <= uptoKey && guard < 100) {
    if (localDone(key)) n++;
    key = addDaysKey(key, 1);
    guard++;
  }
  return n;
}

function estimateMinutes(day: ChallengeDay): number {
  try {
    const chapters = allBibleData[day.book] ?? [];
    let words = 0;
    for (const num of day.chapters) {
      const ch = chapters.find((c) => c.num === num);
      const text = (ch?.paragraphs ?? []).join(" ");
      words += text.split(/\s+/).filter(Boolean).length;
    }
    if (words > 0) return Math.max(1, Math.round(words / 220));
  } catch {
    /* fall through */
  }
  return Math.max(1, day.chapters.length * 6);
}

function readChapters(book: string): number[] {
  try {
    const raw = localStorage.getItem(`chaptersRead_${book}`);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function quizStats(): { total: number; correct: number } {
  try {
    const raw = localStorage.getItem("teensBible");
    const j = raw ? JSON.parse(raw) : {};
    return {
      total: Number(j.quizTotal) || 0,
      correct: Number(j.quizCorrect) || 0,
    };
  } catch {
    return { total: 0, correct: 0 };
  }
}

// ─── small pieces ───────────────────────────────────────────────

function FlameIcon({ size = 20, color = "#f87171" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 2c1 4-3 5-3 9a3 3 0 006 0c0-1.5-.5-2.5-1-3.5C16 9 18 10 18 13a6 6 0 01-12 0c0-5 5-7 6-11z" />
    </svg>
  );
}

function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}

// ─── card styles (match the approved mockup: clean dark cards, no gold frame) ─

const CARD =
  "rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-[#1d1f26] to-[#14161c]";
const HERO_CARD =
  "relative overflow-hidden rounded-[20px] border-[1.5px] border-[rgba(244,185,52,0.55)] bg-gradient-to-b from-[#1d1f26] to-[#14161c]";

/** Gold radial glow at the top of the hero card (mockup .hero::before). */
function HeroGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, rgba(244,185,52,0.14), transparent 60%)",
      }}
    />
  );
}

// ─── main tab ───────────────────────────────────────────────────

export default function ChallengeTab() {
  const [, setLocation] = useLocation();
  const [journey, setJourney] = useState<MyJourney | null>(null);
  const [ready, setReady] = useState(false);

  const todayKey = useMemo(() => sgDateKey(), []);
  const today = useMemo<ChallengeDay | undefined>(() => getTodayChallengeDay(), [todayKey]);
  const participation = useMemo(() => getCachedParticipation(), []);
  const isAfterEnd = todayKey > CHALLENGE_END;

  const load = useCallback(async () => {
    try {
      const j = await withTimeout(getMyJourney(), 8000);
      setJourney(j);
    } catch {
      setJourney(null);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("challenge-progress", onFocus as any);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("challenge-progress", onFocus as any);
    };
  }, [load]);

  // After the challenge ends, show the finish screen
  if (isAfterEnd) {
    return <ChallengeFinishScreen journey={journey} />;
  }

  const dday = diffDays(todayKey, CHALLENGE_END);
  const streak = computeStreak(journey, todayKey);
  const doneDays = journey ? journey.doneDays : countLocalDone(todayKey);
  const elapsedDays = journey
    ? journey.elapsedDays
    : Math.max(1, diffDays(CHALLENGE_START, todayKey) + 1);
  const completionRate = elapsedDays > 0 ? Math.round((doneDays / elapsedDays) * 100) : 0;

  const weekKeys = useMemo(() => {
    const t = parseKey(todayKey);
    const mondayOffset = (t.getDay() + 6) % 7;
    const monday = addDaysKey(fmtKey(t), -mondayOffset);
    return Array.from({ length: 7 }, (_, i) => addDaysKey(monday, i));
  }, [todayKey]);

  const missedKeys = useMemo(() => {
    const out: string[] = [];
    let k = CHALLENGE_START;
    let guard = 0;
    while (k < todayKey && guard < 100) {
      if (resolveStatus(k, journey, todayKey) === "missed") out.push(k);
      k = addDaysKey(k, 1);
      guard++;
    }
    return out;
  }, [journey, todayKey]);

  const openChapter = (quiz: boolean) => {
    if (!today) return;
    const read = readChapters(today.book);
    const ch = today.chapters.find((c) => !read.includes(c)) ?? today.chapters[0];
    startChallengeChapter(today.book, ch);
    setLocation(`/bible/${bookToSlug(today.book)}/${ch}${quiz ? "?view=quiz" : ""}`);
  };

  return (
    <div className="px-4 pt-5 pb-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold text-white tracking-tight">Challenge</h1>
        <div className="rounded-full bg-[#f4b934] px-3 py-1 text-[13px] font-extrabold text-[#1a1206]">
          {dday <= 0 ? "D-day" : `D-${dday}`}
        </div>
      </div>
      <p className="mt-1 text-[12.5px] font-semibold text-white/45">
        Bible Reading Challenge · Sep 7 – Nov 15
      </p>

      {!participation ? (
        <div className={`${CARD} mt-4 p-5 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4b934]/15">
            <FlameIcon size={28} color="#f4b934" />
          </div>
          <h3 className="mt-3 text-[17px] font-extrabold text-white">You haven&apos;t joined the challenge yet</h3>
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/55">
            Read the Bible every day for 70 days, Sep 7 – Nov 15.
            <br />
            Join to track today&apos;s reading and appear on the leaderboard.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="mt-4 w-full rounded-2xl bg-gradient-to-b from-[#ffe9a8] to-[#f4b934] py-3.5 text-[15px] font-extrabold text-[#1a1206] shadow-[0_6px_20px_rgba(244,185,52,0.35)] active:scale-[0.98] transition-transform"
          >
            Join Now
          </button>
        </div>
      ) : !ready ? (
        <div className={`${CARD} mt-4 p-8 text-center text-white/40 text-[13px] font-semibold`}>
          Loading…
        </div>
      ) : today ? (
        <>
          {/* hero */}
          <div className={`${HERO_CARD} mt-4 p-5`}>
            <HeroGlow />
            <div className="text-[12.5px] font-bold text-[#f4b934]">Day {today.day} · Today&apos;s Reading</div>
            <div className="mt-1 text-[21px] font-extrabold text-white tracking-tight">{today.labelEn}</div>
            <div className="mt-1 text-[12.5px] font-medium text-white/50">
              About {estimateMinutes(today)} min · Finish to earn today&apos;s stamp
            </div>
            <button
              onClick={() => openChapter(false)}
              className="mt-4 w-full rounded-2xl bg-gradient-to-b from-[#ffe9a8] to-[#f4b934] py-3.5 text-[15px] font-extrabold text-[#1a1206] shadow-[0_6px_20px_rgba(244,185,52,0.35)] active:scale-[0.98] transition-transform"
            >
              Start Reading
            </button>
          </div>

          {/* stats */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className={`${CARD} flex items-center gap-3 p-4`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f87171]/15">
                <FlameIcon />
              </div>
              <div>
                <div className="text-[17px] font-extrabold text-white">{streak}</div>
                <div className="text-[11.5px] font-semibold text-white/45">Reading streak</div>
              </div>
            </div>
            <div className={`${CARD} flex items-center gap-3 p-4`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4ade80]/15">
                <CheckCircleIcon />
              </div>
              <div>
                <div className="text-[17px] font-extrabold text-white">
                  {doneDays}/{elapsedDays}
                </div>
                <div className="text-[11.5px] font-semibold text-white/45">Days read</div>
              </div>
            </div>
          </div>

          {/* week */}
          <div className="mt-5 text-[13.5px] font-extrabold text-white/85">This week</div>
          <div className={`${CARD} mt-2 px-2 py-4`}>
            <div className="flex">
              {weekKeys.map((k) => {
                const st = resolveStatus(k, journey, todayKey);
                return (
                  <div key={k} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className={`text-[11.5px] font-bold ${st === "future" ? "text-white/30" : "text-white/55"}`}>
                      {weekdayEn(k)}
                    </div>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-extrabold ${
                        st === "done"
                          ? "bg-[#4ade80]/20 text-[#4ade80]"
                          : st === "missed"
                            ? "bg-[#f87171]/20 text-[#f87171]"
                            : st === "today"
                              ? "border-2 border-[#f4b934] text-[#f4b934]"
                              : "bg-white/5 text-white/25"
                      }`}
                    >
                      {st === "done" ? "✓" : st === "missed" ? "!" : st === "today" ? "" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* catch-up guide */}
          <div className={`${CARD} mt-3 p-5`}>
            <h3 className="text-[15px] font-extrabold text-white">Catch-up Guide</h3>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/60">
              {missedKeys.length === 0 ? (
                <>You&apos;re all caught up! Keep the rhythm going tomorrow! 🎉</>
              ) : (
                <>
                  {missedKeys
                    .slice(-3)
                    .map((k) => weekdayEn(k))
                    .join(", ")}{" "}
                  readings are behind. Read <b className="text-white">2 days&apos; worth</b> a day
                  and you&apos;ll be fully caught up by{" "}
                  {weekdayEn(addDaysKey(todayKey, missedKeys.length))}. You can do it!
                </>
              )}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ffe9a8] to-[#f4b934] transition-all"
                style={{ width: `${Math.min(100, completionRate)}%` }}
              />
            </div>
          </div>

          {/* quiz */}
          <div className={`${CARD} mt-3 flex items-center justify-between gap-3 p-5`}>
            <div>
              <h3 className="text-[15px] font-extrabold text-white">Today&apos;s Quiz</h3>
              <p className="mt-0.5 text-[12.5px] font-medium text-white/50">
                {today.labelEn} · {today.chapters.length} questions
              </p>
            </div>
            <button
              onClick={() => openChapter(true)}
              className="shrink-0 rounded-xl bg-[#f4b934]/15 px-4 py-2.5 text-[13.5px] font-extrabold text-[#f4b934] ring-1 ring-[#f4b934]/40 active:scale-95 transition-transform"
            >
              Take Quiz
            </button>
          </div>
        </>
      ) : (
        <div className={`${CARD} mt-4 p-8 text-center`}>
          <h3 className="text-[16px] font-extrabold text-white">The challenge starts soon</h3>
          <p className="mt-1.5 text-[13px] font-medium text-white/55">
            The 70-day journey begins Sep 7.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── finish screen (after Nov 15) ─────────────────────────────────

function ChallengeFinishScreen({ journey }: { journey: MyJourney | null }) {
  const game = useGame();
  const [, setLocation] = useLocation();
  const [notified, setNotified] = useState<boolean>(() => {
    try {
      return localStorage.getItem("nextChallengeNotify") === "1";
    } catch {
      return false;
    }
  });

  const doneDays = journey ? journey.doneDays : countLocalDone(CHALLENGE_END);
  const best = computeLongestStreak(journey, CHALLENGE_END);
  const chapters = game.getTotalChaptersRead();
  const qs = quizStats();
  const rate = qs.total > 0 ? Math.round((qs.correct / qs.total) * 100) : 0;

  // Award the 70-Day Finisher badge (once)
  useEffect(() => {
    if (doneDays <= 0) return;
    try {
      const raw = localStorage.getItem("badges");
      const arr: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && !arr.includes("70-Day Finisher")) {
        arr.push("70-Day Finisher");
        localStorage.setItem("badges", JSON.stringify(arr));
        game.refreshState();
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneDays]);

  const requestNotify = () => {
    try {
      localStorage.setItem("nextChallengeNotify", "1");
    } catch {
      /* ignore */
    }
    setNotified(true);
    queuedToast.success("We'll let you know when the next challenge opens!", { style: { bottom: "5rem" } });
  };

  const stats = [
    { value: `${doneDays}/70`, label: "Days read" },
    { value: `${best}`, label: "Longest reading streak" },
    { value: `${chapters}`, label: "Chapters read" },
    { value: `${rate}%`, label: "Quiz accuracy" },
  ];

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold text-white tracking-tight">Challenge</h1>
        <div className="rounded-full bg-[#f4b934] px-3 py-1 text-[13px] font-extrabold text-[#1a1206]">
          Complete
        </div>
      </div>

      {/* hero */}
      <div className={`${HERO_CARD} mt-4 p-6 text-center`}>
        <HeroGlow />
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe9a8] to-[#d99420] shadow-[0_8px_28px_rgba(244,185,52,0.45)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5b3a08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="6" />
            <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
            <path d="M12 6.5l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2L8.8 8.8 11 8.5z" fill="#5b3a08" stroke="none" />
          </svg>
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold text-white tracking-tight">70 Days Complete!</h2>
        <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-white/60">
          70 days with God&apos;s Word,
          <br />
          from Sep 7 —
          <br />
          truly well done.
        </p>
      </div>

      {/* records */}
      <div className="mt-5 text-[13.5px] font-extrabold text-white/85">My 70-Day Record</div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${CARD} p-4 text-center`}>
            <div className="text-[20px] font-extrabold text-[#f4b934]">{s.value}</div>
            <div className="mt-0.5 text-[11.5px] font-semibold text-white/45">{s.label}</div>
          </div>
        ))}
      </div>

      {/* badge */}
      <div className={`${CARD} mt-3 flex items-center gap-4 p-5`}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe9a8] to-[#d99420]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b3a08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="6" />
            <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-extrabold text-white">70-Day Finisher badge earned</div>
          <div className="mt-0.5 text-[12.5px] font-medium text-white/50">
            Shown permanently on your profile · Shared with your leader
          </div>
        </div>
      </div>

      {/* actions */}
      <button
        onClick={requestNotify}
        disabled={notified}
        className={`mt-4 w-full rounded-2xl py-3.5 text-[15px] font-extrabold transition-transform active:scale-[0.98] ${
          notified
            ? "bg-white/10 text-white/50"
            : "bg-gradient-to-b from-[#ffe9a8] to-[#f4b934] text-[#1a1206] shadow-[0_6px_20px_rgba(244,185,52,0.35)]"
        }`}
      >
        {notified ? "Notifications on ✓" : "Notify me of the next challenge"}
      </button>
      <button
        onClick={() => setLocation("/bible")}
        className="mt-2.5 w-full rounded-2xl bg-white/5 py-3.5 text-[15px] font-extrabold text-white/70 ring-1 ring-white/10 active:scale-[0.98] transition-transform"
      >
        Keep reading the Bible freely
      </button>
    </div>
  );
}
