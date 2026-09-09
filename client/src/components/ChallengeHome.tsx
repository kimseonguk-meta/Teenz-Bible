// 제자반 챌린지 — Home 내 참여 흐름 + 학생 오늘 카드 + 리더 카드
// 실제 앱 디자인 클래스(tb-panel, tb-btn 등)만 사용

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { safeParseJSON } from "@/lib/safeStorage";
import { queuedToast } from "@/lib/toastQueue";
import {
  verifyInviteCode,
  getMyParticipation,
  getCachedParticipation,
  joinChallenge,
  joinAsGuest,
  joinAsLeaderReader,
  claimLeader,
  leaveChallenge,
  leaveReading,
  getDayProgress,
  getAggregate,
  getMySummary,
  getTodayChallengeDay,
  startChallengeChapter,
  sgDateKey,
  chapterKey,
  isChapterComplete,
  getMyEncouragements,
  markEncouragementRead,
  type Participation,
  type DayProgress,
  type ChallengeRole,
} from "@/lib/challenge";
import {
  CHALLENGE_DAYS,
  type ChallengeDay,
} from "@/data/challengeSchedule";


function bookToSlug(book: string): string {
  return book.toLowerCase().replace(/\s+/g, "-");
}

function wasReadBefore(book: string, chapter: number): boolean {
  try {
    return (safeParseJSON<number[]>(`chaptersRead_${book}`, []) || []).includes(chapter);
  } catch {
    return false;
  }
}

// ─── 참여 코드 입력 → 실명 확인 → 등록 ─────────────────────

function JoinFlow({ onJoined }: { onJoined: (p: Participation) => void }) {
  const [step, setStep] = useState<"code" | "name">("code");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<ChallengeRole | null>(null);
  const [name, setName] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const handleVerifyCode = async () => {
    setError("");
    if (!code.trim()) {
      setError("Please enter the invite code");
      return;
    }
    setBusy(true);
    try {
      const r = await verifyInviteCode(code);
      if (!r) {
        setError("Incorrect code. Please check again.");
        return;
      }
      if (r === "leader") {
        // Leaders: code only, auto-register, straight to leaderboard
        const p = await claimLeader(code, "리더");
        queuedToast.success("리더로 등록됐어요!", { style: { bottom: "5rem" } });
        onJoined(p);
        return;
      }
      setRole(r);
      setStep("name");
    } catch (e: any) {
      setError(e?.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleNameChange = (v: string) => {
    setName(v);
    setError("");
    setNotFound(false);
  };

  const handleJoinGuest = async () => {
    const finalName = name.replace(/\s+/g, "");
    setError("");
    if (!finalName) {
      setError("이름을 입력해 주세요");
      return;
    }
    // 실명 확인: 게스트 이름은 선생님들에게 그대로 보인다
    if (!window.confirm(`"${finalName}" 실명으로 게스트 참여합니다.\n이 이름이 선생님들에게 보여요.`)) return;
    setBusy(true);
    try {
      const p = await joinAsGuest(finalName);
      queuedToast.success(`${p.name}님, 게스트로 참여했어요!`, { style: { bottom: "5rem" } });
      onJoined(p);
    } catch (e: any) {
      setError(e?.message || "등록 중 오류가 발생했어요");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (chosenName?: string) => {
    const finalName = (chosenName ?? name).replace(/\s+/g, "");
    setError("");
    setNotFound(false);
    if (role === "student" && !finalName) {
      setError("이름을 입력해 주세요");
      return;
    }
    setBusy(true);
    try {
      const p =
        role === "leader"
          ? await claimLeader(code, finalName || "리더")
          : await joinChallenge("student", finalName);
      queuedToast.success(
        role === "leader" ? "리더로 등록됐어요!" : `${p.name}님, 챌린지 시작!`,
        { style: { bottom: "5rem" } }
      );
      onJoined(p);
    } catch (e: any) {
      const msg = e?.message || "등록 중 오류가 발생했어요";
      setError(msg);
      if (msg === "명단에서 이름을 찾지 못했습니다") setNotFound(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tb-panel w-full max-w-[430px] mx-auto p-5 relative overflow-hidden">
      <div className="flex items-center gap-4 mb-1">
        <div className="tb-gold-panel flex h-12 w-12 items-center justify-center rounded-full text-[22px] flex-shrink-0">
          📖
        </div>
        <div className="min-w-0">
          <h3 className="tb-title text-[18px] leading-tight">제자반 성경읽기 챌린지</h3>
        </div>
      </div>

      {step === "code" && (
        <div className="mt-4">
          <h3 className="text-white text-[17px] font-black mb-1">Join the Challenge</h3>
          <p className="text-white/55 text-[12px] mb-3">
            Enter the invite code shared by your teacher
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Invite code"
            autoCapitalize="characters"
            autoCorrect="off"
            className="mt-1 w-full bg-black/40 border border-[#c9a86a]/40 rounded-xl px-4 py-3 text-white text-[15px] font-bold tracking-wider placeholder:text-white/25 placeholder:font-medium focus:outline-none focus:border-[#ffd957]"
          />
          {error && <p className="mt-2 text-red-300 text-[12px] font-bold">{error}</p>}
          <button
            onClick={handleVerifyCode}
            disabled={busy}
            className="mt-3 w-full tb-btn py-3 text-sm font-black rounded-[12px] active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Checking..." : "Continue"}
          </button>
        </div>
      )}

      {step === "name" && (
        <div className="mt-4">
          <button
            onClick={() => { setStep("code"); setError(""); }}
            className="text-white/40 text-[12px] font-bold mb-2"
          >
            ← 코드 다시 입력
          </button>
          {role === "student" ? (
            <>
              <h3 className="text-white text-[17px] font-black mb-1">한글 실명 입력</h3>
              <p className="text-white/55 text-[12px] mb-3">
                선생님께 등록된 한글 실명을 정확히 입력하세요
              </p>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="한글 실명"
                className="mt-1 w-full bg-black/40 border border-[#c9a86a]/40 rounded-xl px-4 py-3 text-white text-[15px] font-bold placeholder:text-white/25 focus:outline-none focus:border-[#ffd957]"
              />
              <div className="mt-2.5 rounded-xl border border-red-500/40 bg-red-900/20 px-3.5 py-2.5">
                <p className="text-red-300 text-[12px] font-bold leading-relaxed">
                  다른 사람의 이름이나 장난으로 입력한 이름은 챌린지 기록으로 인정되지 않습니다.
                </p>
              </div>
              {error && <p className="mt-2 text-red-300 text-[12px] font-bold">{error}</p>}
              <button
                onClick={() => handleJoin()}
                disabled={busy}
                className="mt-3 w-full tb-btn py-3 text-sm font-black rounded-[12px] active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "확인 중..." : "확인"}
              </button>
              {notFound && (
                <>
                  <div className="flex items-center gap-3 mt-4 mb-1">
                    <div className="flex-1 h-px bg-[#c9a86a]/25" />
                    <span className="text-[#c9a86a]/80 text-[12px] font-bold">또는</span>
                    <div className="flex-1 h-px bg-[#c9a86a]/25" />
                  </div>
                  <button
                    onClick={handleJoinGuest}
                    disabled={busy}
                    className="w-full tb-btn py-3 text-sm font-black rounded-[12px] active:scale-[0.98] disabled:opacity-50"
                  >
                    {busy ? "등록 중..." : "게스트로 참여하기"}
                  </button>
                  <p className="mt-1.5 text-center text-white/40 text-[11px] font-semibold">
                    입력한 실명으로 기록돼요 · 공식 집계 제외
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              {error && <p className="mt-2 text-red-300 text-[12px] font-bold">{error}</p>}
              <button
                onClick={() => handleJoin()}
                disabled={busy}
                className="mt-3 w-full tb-btn py-3 text-sm font-black rounded-[12px] active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "등록 중..." : "리더로 등록하기 →"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 학생: 오늘의 읽기 카드 ────────────────────────────────

function StudentCard({ participation, onLeave, leaveFn }: { participation: Participation; onLeave: () => void; leaveFn?: () => Promise<void> }) {
  const [, setLocation] = useLocation();
  const [today, setToday] = useState<ChallengeDay | null>(() => getTodayChallengeDay());
  const [progress, setProgress] = useState<DayProgress | null>(null);
  const [agg, setAgg] = useState({ doneCount: 0, readingCount: 0 });
  const [doneDays, setDoneDays] = useState(0);
  const [encouragements, setEncouragements] = useState<{ id: string; message: string }[]>([]);

  const load = useCallback(async () => {
    const t = getTodayChallengeDay();
    setToday(t);
    if (!t) return;
    try {
      const [p, a, s] = await Promise.all([
        getDayProgress(t.date),
        getAggregate(t.date),
        getMySummary(),
      ]);
      setProgress(p);
      setAgg(a);
      setDoneDays(s.doneDays);
      try {
        const enc = await getMyEncouragements();
        setEncouragements(enc.map((e) => ({ id: e.id, message: e.message })));
      } catch {}
      // 저녁 알림용 로컬 미러 (리더 수동 인정 포함)
      try {
        if (p?.status === "done") localStorage.setItem(`challengeDayDone_${t.date}`, "1");
        else localStorage.removeItem(`challengeDayDone_${t.date}`);
      } catch {}
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    const onFocus = () => load();
    const onEvt = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("challenge-progress", onEvt as any);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("challenge-progress", onEvt as any);
    };
  }, [load]);

  const openChapter = (book: string, chapter: number, quiz: boolean) => {
    startChallengeChapter(book, chapter);
    setLocation(`/bible/${bookToSlug(book)}/${chapter}${quiz ? "?view=quiz" : ""}`);
  };

  if (!today) {
    return (
      <div className="tb-panel w-full max-w-[430px] mx-auto p-5">
        <div className="flex items-center gap-3">
          <div className="tb-gold-panel flex h-11 w-11 items-center justify-center rounded-full text-xl">📖</div>
          <div>
            <h3 className="tb-title text-[16px]">제자반 성경읽기 챌린지</h3>
            <p className="text-white/50 text-[12px] font-bold mt-0.5">
              {participation.name}님 · {doneDays}/{CHALLENGE_DAYS}일 완료
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="tb-progress">
            <div className="tb-progress-fill" style={{ width: `${Math.round((doneDays / CHALLENGE_DAYS) * 100)}%` }} />
          </div>
        </div>
      </div>
    );
  }

  const chapters = today.chapters;
  const doneCount = chapters.filter((c) => {
    const cp = progress?.chapters?.[chapterKey(today.book, c)];
    return cp && (cp.manual || cp.exposurePct >= 80);
  }).length;
  const allDone = progress?.status === "done";

  // Done for Today! — approved mockup s8
  if (allDone) {
    return (
      <div className="tb-panel w-full max-w-[430px] mx-auto p-6 text-center relative overflow-hidden">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="tb-title text-2xl">Done for Today!</h3>
        <p className="text-white/60 text-[13px] font-bold mt-1">
          {today.book} {chapters.join(", ")} completed · Day {today.day} of {CHALLENGE_DAYS}
        </p>
        <div className="mt-4 space-y-2 text-left">
          <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="text-white/60 text-[13px] font-bold">Reading</span>
            <span className="text-lime-300 text-[13px] font-black">✅ Done</span>
          </div>
          <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="text-white/60 text-[13px] font-bold">Reading time</span>
            <span className="text-lime-300 text-[13px] font-black">✅ Done</span>
          </div>
          <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="text-white/60 text-[13px] font-bold">Quiz</span>
            <span className="text-lime-300 text-[13px] font-black">✅ Passed</span>
          </div>
        </div>
        <p className="mt-4 text-white/45 text-[12px] font-semibold">See you tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="tb-panel w-full max-w-[430px] mx-auto p-5 relative overflow-hidden">
      {encouragements.length > 0 && (
        <div className="mb-3 space-y-2">
          {encouragements.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-[#ffd957]/50 bg-[#ffd957]/10 px-4 py-2.5 flex items-start gap-2"
            >
              <span className="text-lg flex-shrink-0">💌</span>
              <p className="flex-1 text-white text-[13px] font-bold leading-relaxed">{e.message}</p>
              <button
                onClick={async () => {
                  try { await markEncouragementRead(e.id); } catch {}
                  setEncouragements((prev) => prev.filter((x) => x.id !== e.id));
                }}
                className="text-white/40 text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="tb-gold-panel flex h-11 w-11 items-center justify-center rounded-full text-xl flex-shrink-0">📖</div>
          <div className="min-w-0">
            <p className="tb-gold-text text-[10px] font-black tracking-[0.16em] uppercase">
              Reading Challenge · Day {today.day} of {CHALLENGE_DAYS}
            </p>
            <h3 className="tb-title text-[16px] truncate">Today's Reading: {today.book} {chapters.join(", ")}</h3>
          </div>
        </div>
        {allDone && <span className="text-2xl flex-shrink-0">✅</span>}
      </div>

      <div className="space-y-2">
        {chapters.map((c) => {
          const id = chapterKey(today.book, c);
          const cp = progress?.chapters?.[id];
          const done = !!cp && (cp.manual || cp.exposurePct >= 80);
          const reading = !!cp && !done;
          const reread = wasReadBefore(today.book, c);
          return (
            <div key={c} className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5">
              <span className="text-lg flex-shrink-0">{done ? "✅" : reading ? "📖" : "⭕"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-bold">
                  {today.book} {c}
                  {reread && <span className="ml-1.5 text-[10px] font-black text-[#ffd957] bg-[#ffd957]/15 px-1.5 py-0.5 rounded-full">Re-read</span>}
                </p>
                <p className="text-white/40 text-[11px] font-medium">
                  {done ? "Done today!" : reading ? "Reading..." : "Not started"}
                </p>
              </div>
              {!done && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openChapter(today.book, c, false)}
                    className="tb-btn px-3 py-1.5 text-[12px] font-black rounded-lg active:scale-95"
                  >
                    {done ? "Review" : "Start Reading →"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 px-1">
        <p className="text-white/70 text-[12px] font-black mb-1.5">My Progress</p>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/55 text-[11px] font-bold">Today: {doneCount}/{chapters.length} chapters</span>
          <span className="tb-gold-text text-[11px] font-black">{doneDays}/{CHALLENGE_DAYS} days</span>
        </div>
        <div className="tb-progress">
          <div className="tb-progress-fill transition-all duration-700" style={{ width: `${Math.round((doneCount / chapters.length) * 100)}%` }} />
        </div>
        <p className="text-white/70 text-[12px] font-black mt-3 mb-1">Everyone Today</p>
        <p className="mt-1 text-[11px] text-white/45 font-semibold">
          {!participation.kind && `${agg.doneCount} of 39 completed · Names are not shown`}
          {participation.kind === "guest" && `${agg.doneCount}명 완료 · 게스트 참여 중 (공식 집계 제외)`}
          {participation.kind === "leader" && `${agg.doneCount}명 완료 · 함께 읽는 중 (공식 집계 제외)`}
          {allDone ? " · I'm done ✅" : ""}
        </p>
        <button
          onClick={async () => {
            if (!window.confirm(leaveFn ? "읽기 참여에서 나가시겠어요? 읽기 기록이 삭제됩니다. (리더 자격은 유지돼요)" : "챌린지에서 나가시겠어요? 내 기록이 삭제됩니다.")) return;
            try {
              await (leaveFn || leaveChallenge)();
              onLeave();
            } catch (e: any) {
              queuedToast.error(e?.message || "나가기 중 오류", { style: { bottom: "5rem" } });
            }
          }}
          className="mt-2 text-white/25 text-[10px] font-medium underline underline-offset-2"
        >
          Leave challenge
        </button>
      </div>
    </div>
  );
}

// ─── 리더 카드 ─────────────────────────────────────────────

function LeaderCard({ participation, onUpdate }: { participation: Participation; onUpdate: (p: Participation) => void }) {
  const [, setLocation] = useLocation();
  const [agg, setAgg] = useState({ doneCount: 0, readingCount: 0 });
  const [today, setToday] = useState<ChallengeDay | null>(() => getTodayChallengeDay());
  const [joining, setJoining] = useState(false);
  const [askName, setAskName] = useState(false);
  const [realName, setRealName] = useState(
    participation.name && participation.name !== "리더" ? participation.name : ""
  );

  useEffect(() => {
    const t = getTodayChallengeDay();
    setToday(t);
    if (!t) return;
    getAggregate(t.date).then(setAgg).catch(() => {});
    const iv = setInterval(() => getAggregate(t.date).then(setAgg).catch(() => {}), 15000);
    return () => clearInterval(iv);
  }, []);

  const handleJoinReading = async () => {
    const clean = realName.replace(/\s+/g, "");
    if (!clean) {
      queuedToast.error("실명을 입력해 주세요", { style: { bottom: "5rem" } });
      return;
    }
    setJoining(true);
    try {
      const p = await joinAsLeaderReader(clean);
      queuedToast.success("읽기 참여 시작! 오늘 분량부터 기록돼요", { style: { bottom: "5rem" } });
      onUpdate(p);
    } catch (e: any) {
      queuedToast.error(e?.message || "등록 중 오류가 발생했어요", { style: { bottom: "5rem" } });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="tb-panel w-full max-w-[430px] mx-auto p-5 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <div className="tb-gold-panel flex h-11 w-11 items-center justify-center rounded-full text-xl flex-shrink-0">🧭</div>
        <div className="min-w-0">
          <p className="tb-gold-text text-[10px] font-black tracking-[0.16em] uppercase">리더</p>
          <h3 className="tb-title text-[16px]">제자반 챌린지 현황</h3>
        </div>
      </div>
      {today ? (
        <p className="text-white/60 text-[12px] font-bold mb-3">
          오늘(Day {today.day}) {today.labelKo} · 완료 {agg.doneCount}명 · 읽는 중 {agg.readingCount}명
        </p>
      ) : (
        <p className="text-white/60 text-[12px] font-bold mb-3">챌린지 기간이 아니에요</p>
      )}
      <button
        onClick={() => setLocation("/challenge/leader")}
        className="w-full tb-btn py-3 text-sm font-black rounded-[12px] active:scale-[0.98]"
      >
        리더 대시보드 열기 →
      </button>
      {participation.reading ? (
        <p className="mt-2 text-center text-[#ffd957]/80 text-[12px] font-bold">📖 함께 읽는 중</p>
      ) : askName ? (
        <div className="mt-2">
          <input
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="실명을 입력해 주세요"
            maxLength={20}
            className="w-full bg-black/40 border border-[#c9a86a]/40 rounded-xl px-4 py-3 text-white text-[15px] font-bold placeholder:text-white/25 focus:outline-none focus:border-[#ffd957]"
          />
          <button
            onClick={handleJoinReading}
            disabled={joining}
            className="mt-2 w-full py-3 text-sm font-black rounded-[12px] border border-[#c9a86a]/60 text-[#ffd957] bg-black/30 active:scale-[0.98] disabled:opacity-50"
          >
            {joining ? "등록 중..." : "읽기 시작"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAskName(true)}
          className="mt-2 w-full py-3 text-sm font-black rounded-[12px] border border-[#c9a86a]/60 text-[#ffd957] bg-black/30 active:scale-[0.98]"
        >
          나도 함께 읽기
        </button>
      )}
    </div>
  );
}

// ─── Home에 삽입되는 섹션 ──────────────────────────────────

export default function ChallengeSection() {
  const [authReady, setAuthReady] = useState(false);
  const [participation, setParticipation] = useState<Participation | null | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);
      if (!user) {
        setParticipation(null);
        return;
      }
      const cached = getCachedParticipation();
      if (cached) {
        const { uid: _u, ...rest } = cached;
        setParticipation(rest);
      }
      try {
        // 서버를 기준으로 최종 확정 (오래된 캐시는 getMyParticipation이 무효화)
        setParticipation(await getMyParticipation());
      } catch {
        if (!cached) setParticipation(null);
      }
    });
    return () => unsub();
  }, []);

  // Deep link (?challenge=1): open the challenge join flow directly on entry
  useEffect(() => {
    if (!authReady) return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("challenge") === "1") {
        setOpen(true);
        params.delete("challenge");
        const qs = params.toString();
        window.history.replaceState(
          null,
          "",
          window.location.pathname + (qs ? "?" + qs : "") + window.location.hash
        );
      }
    } catch {}
  }, [authReady]);

  if (!authReady || participation === undefined) return null;

  return (
    <div className="px-4">
      {/* Gold ribbon entry point — approved mockup s1 */}
      <div className="relative" style={{ animation: "challengeFloat 3s ease-in-out infinite" }}>
        {/* Flashy continuous confetti around the ribbon */}
        {[
          { left: "2%",  delay: "0s",   dur: "2.6s", color: "#FFD700", size: 9,  round: false },
          { left: "8%",  delay: "0.9s", dur: "3.1s", color: "#FF6B9D", size: 7,  round: true  },
          { left: "14%", delay: "0.4s", dur: "2.8s", color: "#4DABF7", size: 8,  round: false },
          { left: "21%", delay: "1.3s", dur: "3.3s", color: "#FFE45C", size: 10, round: false },
          { left: "28%", delay: "0.2s", dur: "2.5s", color: "#B197FC", size: 7,  round: true  },
          { left: "36%", delay: "1.7s", dur: "3.0s", color: "#FF8787", size: 8,  round: false },
          { left: "44%", delay: "0.6s", dur: "2.7s", color: "#63E6BE", size: 9,  round: true  },
          { left: "52%", delay: "1.1s", dur: "3.2s", color: "#FFD700", size: 7,  round: false },
          { left: "60%", delay: "0.1s", dur: "2.9s", color: "#FFA94D", size: 10, round: true  },
          { left: "67%", delay: "1.5s", dur: "2.6s", color: "#4DABF7", size: 8,  round: false },
          { left: "74%", delay: "0.7s", dur: "3.1s", color: "#F783AC", size: 9,  round: true  },
          { left: "81%", delay: "1.9s", dur: "2.8s", color: "#FFE45C", size: 7,  round: false },
          { left: "88%", delay: "0.3s", dur: "3.0s", color: "#99E9F2", size: 8,  round: true  },
          { left: "94%", delay: "1.2s", dur: "2.7s", color: "#FFD700", size: 10, round: false },
          { left: "11%", delay: "2.1s", dur: "3.4s", color: "#E599F7", size: 6,  round: true  },
          { left: "57%", delay: "2.4s", dur: "2.5s", color: "#FFC078", size: 6,  round: false },
          { left: "77%", delay: "2.7s", dur: "3.3s", color: "#8CE99A", size: 7,  round: true  },
          { left: "33%", delay: "2.9s", dur: "2.6s", color: "#FFD43B", size: 8,  round: false },
        ].map((c, i) => (
          <span
            key={i}
            className="challenge-confetti"
            style={{
              left: c.left,
              width: c.size,
              height: c.size * (c.round ? 1 : 1.4),
              background: c.color,
              borderRadius: c.round ? "50%" : "2px",
              animationDuration: c.dur,
              animationDelay: c.delay,
            }}
          />
        ))}
        <button
          onClick={() => setOpen(true)}
          className="tb-ribbon-royal w-full active:scale-[0.98] transition-transform"
          style={{ animation: "challengePulse 2.4s ease-in-out infinite" }}
        >
          <span className="text-xl leading-tight">제자반 성경읽기 챌린지</span>
        </button>
      </div>
      <style>{`
        @keyframes challengePulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.18); } }
        @keyframes challengeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes challengePoint { 0%,100% { transform: translateY(2px); } 50% { transform: translateY(-3px); } }
        @keyframes challengeTwinkle { 0%,100% { opacity: 0; transform: scale(0.4) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(20deg); } }
        @keyframes confettiFall {
          0% { transform: translate3d(0, -12px, 0) rotate(0deg); opacity: 0; }
          12% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate3d(14px, 96px, 0) rotate(540deg); opacity: 0; }
        }
        .challenge-confetti {
          position: absolute;
          top: -4px;
          pointer-events: none;
          z-index: 2;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.55);
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .challenge-sparkle {
          position: absolute;
          color: #FFE45C;
          font-size: 14px;
          line-height: 1;
          pointer-events: none;
          z-index: 1;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.9);
          animation: challengeTwinkle 2.2s ease-in-out infinite;
        }
      `}</style>
      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/85 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white/80 text-[14px] font-black flex items-center justify-center active:scale-95"
            >
              ✕
            </button>
            {participation === null && <JoinFlow onJoined={setParticipation} />}
            {participation?.role === "leader" && (
              <LeaderCard participation={participation} onUpdate={setParticipation} />
            )}
            {(participation?.role === "student" ||
              (participation?.role === "leader" && participation.reading)) && (
              <StudentCard
                participation={participation}
                onLeave={async () => {
                  if (participation?.role === "leader") {
                    // 읽기만 나감 → 리더 자격 유지, 최신 상태 다시 로드
                    try {
                      setParticipation(await getMyParticipation());
                    } catch {
                      setParticipation({ ...participation, reading: false });
                    }
                  } else {
                    setParticipation(null);
                  }
                }}
                leaveFn={participation?.role === "leader" ? leaveReading : undefined}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
