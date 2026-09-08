// 제자반 챌린지 — 리더 대시보드 (리더만 접근)
// 학생별·날짜별 실명 현황 + 수동 인정/취소

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { queuedToast } from "@/lib/toastQueue";
import {
  getMyParticipation,
  listParticipants,
  listDayProgress,
  getDayProgress,
  setManualOverride,
  getManualOverride,
  getChallengeDay,
  sgDateKey,
  chapterKey,
  isChapterComplete,
  type Participation,
  type DayProgress,
  type DayStatus,
} from "@/lib/challenge";
import { CHALLENGE_ROSTER } from "@/data/challengeRoster";
import { sendEncouragement } from "@/lib/challenge";

interface RowState {
  no: number;
  name: string;
  grade: string;
  cls: string;
  uid: string | null; // 참가 등록한 uid
  progress: DayProgress | null;
  manual: { done: boolean; reason: string } | null;
}

function fmtDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const week = ["일", "월", "화", "수", "목", "금", "토"][dt.getDay()];
  return `${m}/${d}(${week})`;
}

function shiftDate(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

function StudentDetail({
  row,
  dateKey,
  onChanged,
}: {
  row: RowState;
  dateKey: string;
  onChanged: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [weekStatus, setWeekStatus] = useState<(DayStatus | null)[]>([null, null, null, null, null, null, null]);
  const [encMsg, setEncMsg] = useState("");
  const [encBusy, setEncBusy] = useState(false);
  const day = getChallengeDay(dateKey);

  // 이번 주 (월~일) 상태 조회
  useEffect(() => {
    if (!row.uid) return;
    const d = new Date(dateKey + "T12:00:00");
    const dow = (d.getDay() + 6) % 7; // 월=0
    const monday = new Date(d);
    monday.setDate(d.getDate() - dow);
    const keys: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      keys.push(dd.toISOString().slice(0, 10));
    }
    Promise.all(keys.map((k) => getDayProgress(k, row.uid!).catch(() => null))).then(
      (results) => setWeekStatus(results.map((r) => r?.status || null))
    );
  }, [row.uid, dateKey]);

  const handleEncourage = async () => {
    if (!row.uid || encBusy) return;
    setEncBusy(true);
    try {
      await sendEncouragement(row.uid, encMsg);
      queuedToast.success("격려 메시지를 보냈어요 🙏", { style: { bottom: "5rem" } });
      setEncMsg("");
    } catch (e: any) {
      queuedToast.error(e?.message || "전송 실패", { style: { bottom: "5rem" } });
    } finally {
      setEncBusy(false);
    }
  };

  const handleManual = async (done: boolean) => {
    if (!row.uid) return;
    if (done && !reason.trim()) {
      queuedToast.error("사유를 입력해 주세요", { style: { bottom: "5rem" } });
      return;
    }
    setBusy(true);
    try {
      await setManualOverride(row.uid, dateKey, done, reason);
      queuedToast.success(done ? "수동 인정 완료" : "수동 인정 취소", { style: { bottom: "5rem" } });
      setReason("");
      onChanged();
    } catch (e: any) {
      queuedToast.error(e?.message || "처리 중 오류", { style: { bottom: "5rem" } });
    } finally {
      setBusy(false);
    }
  };

  const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];
  return (
    <div className="mt-2 bg-black/40 border border-white/10 rounded-xl p-3">
      {/* 이번 주 — approved mockup t4 */}
      <p className="text-[#ffd957] text-[12px] font-black mb-2">이번 주</p>
      <div className="flex gap-1.5 mb-3">
        {weekStatus.map((st, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[13px] font-black ${
                st === "done"
                  ? "bg-green-500 text-white"
                  : st === "reading"
                    ? "bg-orange-400 text-white"
                    : "bg-white/5 text-white/30 border border-white/10"
              }`}
            >
              {st === "done" ? "✓" : st === "reading" ? "…" : "·"}
            </div>
            <p className="text-white/40 text-[10px] mt-1">{weekLabels[i]}</p>
          </div>
        ))}
      </div>
      {day ? (
        <div className="space-y-1.5 mb-3">
          {day.chapters.map((c) => {
            const id = chapterKey(day.book, c);
            const cp = row.progress?.chapters?.[id];
            const done = !!cp && isChapterComplete(cp, 400);
            return (
              <div key={c} className="flex items-center justify-between text-[12px]">
                <span className="text-white/80 font-bold">
                  {done ? "✅" : "⭕"} {day.bookKo} {c}장
                  {cp?.manual && <span className="ml-1 text-[#ffd957]">🔧</span>}
                </span>
                <span className="text-white/40 font-medium">
                  {cp
                    ? `노출 ${cp.exposurePct}% · ${cp.activeSec}초 · 퀴즈 ${cp.quizPass ? "통과" : "미통과"}`
                    : "기록 없음"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-white/40 text-[12px] mb-3">챌린지 일정이 없는 날짜예요</p>
      )}
      {row.manual?.done && (
        <p className="text-[#ffd957] text-[12px] font-bold mb-2">
          🔧 수동 인정됨 — 사유: {row.manual.reason}
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="사유 입력 (예: 앱 오류로 기록 누락)"
          className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] placeholder:text-white/25 focus:outline-none focus:border-[#ffd957]"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => handleManual(true)}
          disabled={busy || !row.uid}
          className="flex-1 tb-btn py-2 text-[12px] font-black rounded-lg disabled:opacity-40"
        >
          {busy ? "..." : "완료로 인정"}
        </button>
        <button
          onClick={() => handleManual(false)}
          disabled={busy || !row.uid}
          className="flex-1 tb-soft-button py-2 text-[12px] font-bold rounded-lg disabled:opacity-40"
        >
          인정 취소
        </button>
      </div>
      {!row.uid && (
        <p className="text-white/40 text-[11px] mt-2">아직 앱에 등록하지 않은 학생이에요</p>
      )}
      {row.uid && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={encMsg}
              onChange={(e) => setEncMsg(e.target.value)}
              placeholder="격려 메시지 (예: 오늘도 화이팅! 🙏)"
              className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] placeholder:text-white/25 focus:outline-none focus:border-[#ffd957]"
            />
          </div>
          <button
            onClick={handleEncourage}
            disabled={encBusy}
            className="mt-2 w-full tb-btn py-2.5 text-[13px] font-black rounded-xl disabled:opacity-40"
          >
            {encBusy ? "전송 중..." : "격려 푸시 보내기"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChallengeLeader() {
  const [, setLocation] = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [dateKey, setDateKey] = useState(() => sgDateKey());
  const [rows, setRows] = useState<RowState[]>([]);
  const [extras, setExtras] = useState<{ uid: string; p: Participation; progress: DayProgress | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [clsFilter, setClsFilter] = useState<string>("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        return;
      }
      try {
        const p = await getMyParticipation();
        setAllowed(p?.role === "leader");
      } catch {
        setAllowed(false);
      }
    });
    return () => unsub();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const parts = await listParticipants();
      const byRoster = new Map<number, { uid: string; p: Participation }>();
      const extraRaw: { uid: string; p: Participation }[] = [];
      for (const { uid, p } of parts) {
        if (p.role === "student" && p.rosterNo) byRoster.set(p.rosterNo, { uid, p });
        else if (p.role === "student" && (p.kind === "guest" || p.kind === "leader"))
          extraRaw.push({ uid, p });
      }
      const uids = [...byRoster.values()].map((v) => v.uid);
      const progMap = uids.length ? await listDayProgress(dateKey, uids) : {};
      const manualMap = new Map<number, { done: boolean; reason: string }>();
      await Promise.all(
        [...byRoster.entries()].map(async ([no, { uid }]) => {
          const m = await getManualOverride(uid, dateKey).catch(() => null);
          if (m) manualMap.set(no, { done: m.done, reason: m.reason });
        })
      );
      setRows(
        CHALLENGE_ROSTER.map((r) => {
          const hit = byRoster.get(r.no);
          return {
            no: r.no,
            name: hit?.p.name || "미등록",
            grade: r.grade,
            cls: r.cls,
            uid: hit?.uid || null,
            progress: hit ? progMap[hit.uid] || null : null,
            manual: manualMap.get(r.no) || null,
          };
        })
      );
      // 게스트/함께 읽는 선생님: 명단 집계와 분리된 별도 섹션용
      const extraUids = extraRaw.map((e) => e.uid);
      const extraProg = extraUids.length ? await listDayProgress(dateKey, extraUids) : {};
      setExtras(extraRaw.map((e) => ({ ...e, progress: extraProg[e.uid] || null })));
    } catch (e: any) {
      queuedToast.error(e?.message || "불러오기 실패", { style: { bottom: "5rem" } });
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  if (allowed === null) {
    return (
      <div className="teenz-page p-6 text-center text-white/50 text-sm">확인 중...</div>
    );
  }
  if (!allowed) {
    return (
      <div className="teenz-page p-6 text-center">
        <p className="text-white/70 text-sm font-bold mt-10">리더 권한이 필요합니다</p>
        <button onClick={() => setLocation("/")} className="mt-4 tb-btn px-6 py-2.5 text-sm font-black rounded-xl">
          홈으로
        </button>
      </div>
    );
  }

  const day = getChallengeDay(dateKey);
  const doneRows = rows.filter(
    (r) => r.progress?.status === "done" || r.manual?.done
  ).length;
  const readingRows = rows.filter(
    (r) => !r.manual?.done && r.progress?.status === "reading"
  ).length;

  return (
    <div className="teenz-page space-y-3 pb-24">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => setLocation("/")} className="tb-gold-text text-2xl">←</button>
        <h1 className="tb-title text-xl">리더 대시보드</h1>
      </div>

      {/* 날짜 선택 */}
      <div className="tb-panel p-3 flex items-center justify-between">
        <button
          onClick={() => setDateKey(shiftDate(dateKey, -1))}
          className="tb-soft-button w-9 h-9 rounded-full text-lg"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-white text-[15px] font-black">{fmtDate(dateKey)}</p>
          <p className="tb-gold-text text-[11px] font-bold">
            {day ? `Day ${day.day} · ${day.labelKo}` : "일정 없음"}
          </p>
        </div>
        <button
          onClick={() => setDateKey(shiftDate(dateKey, 1))}
          className="tb-soft-button w-9 h-9 rounded-full text-lg"
        >
          ›
        </button>
      </div>

      {/* 요약 */}
      <div className="tb-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-[12px] font-bold">39명 중</span>
          <span className="tb-gold-text text-[13px] font-black">
            ✅ {doneRows} · 📖 {readingRows} · ⚪ {39 - doneRows - readingRows}
          </span>
        </div>
        <div className="tb-progress">
          <div
            className="tb-progress-fill transition-all duration-500"
            style={{ width: `${Math.round((doneRows / 39) * 100)}%` }}
          />
        </div>
      </div>

      {/* 생년/반 필터 — approved mockup t3 */}
      <div className="tb-panel p-3 space-y-2">
        <div>
          <p className="text-white/45 text-[11px] font-bold mb-1.5">생년</p>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "10", "11", "12", "13"].map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  gradeFilter === g
                    ? "bg-[#c68a14] text-white"
                    : "bg-white/5 text-white/50 border border-white/10"
                }`}
              >
                {g === "all" ? "전체" : `${g}년생`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white/45 text-[11px] font-bold mb-1.5">반</p>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "A", "B", "C", "D", "E"].map((c) => (
              <button
                key={c}
                onClick={() => setClsFilter(c)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  clsFilter === c
                    ? "bg-[#c68a14] text-white"
                    : "bg-white/5 text-white/50 border border-white/10"
                }`}
              >
                {c === "all" ? "전체" : `${c}반`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 학생 목록 */}
      {loading ? (
        <p className="text-center text-white/40 text-sm py-8">불러오는 중...</p>
      ) : (
        <div className="space-y-2">
          {rows
            .filter((r) => gradeFilter === "all" || r.grade === gradeFilter)
            .filter((r) => clsFilter === "all" || r.cls === clsFilter)
            .map((r) => {
            const isDone = r.progress?.status === "done" || r.manual?.done;
            const isReading = !isDone && r.progress?.status === "reading";
            const isOpen = expanded === r.no;
            return (
              <div key={r.no} className="tb-panel px-3 py-2.5">
                <button
                  onClick={() => setExpanded(isOpen ? null : r.no)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <span className="text-lg flex-shrink-0">
                    {isDone ? "✅" : isReading ? "📖" : "⚪"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-bold">
                      {r.name}
                      <span className="ml-1.5 text-white/40 font-medium text-[11px]">
                        {r.grade}학년 {r.cls}반
                      </span>
                      {r.manual?.done && <span className="ml-1 text-[11px]">🔧</span>}
                    </p>
                    <p className="text-white/40 text-[11px]">
                      {isDone ? (r.manual?.done ? "수동 인정 완료" : "완료") : isReading ? "읽는 중" : r.uid ? "미시작" : "미등록"}
                    </p>
                  </div>
                  <span className="tb-gold-text text-lg flex-shrink-0">{isOpen ? "▴" : "▾"}</span>
                </button>
                {isOpen && (
                  <StudentDetail row={r} dateKey={dateKey} onChanged={load} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 게스트 · 함께 읽는 선생님 — 명단 39명 집계와 분리 */}
      {!loading && extras.length > 0 && (
        <div className="tb-panel p-4">
          <p className="text-white/60 text-[12px] font-bold mb-2">
            게스트 · 함께 읽는 선생님 <span className="text-white/35 font-medium">(공식 집계 제외)</span>
          </p>
          <div className="space-y-2">
            {extras.map((e) => {
              const isDone = e.progress?.status === "done";
              const isReading = !isDone && e.progress?.status === "reading";
              return (
                <div
                  key={e.uid}
                  className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5"
                >
                  <span className="text-lg flex-shrink-0">
                    {isDone ? "✅" : isReading ? "📖" : "⚪"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-bold">
                      {e.p.kind === "leader" ? `담임쌤 ${e.p.name}` : e.p.name}
                      <span className="ml-1.5 text-[10px] font-black text-[#ffd957] bg-[#ffd957]/15 px-1.5 py-0.5 rounded-full">
                        {e.p.kind === "leader" ? "선생님" : "게스트"}
                      </span>
                    </p>
                    <p className="text-white/40 text-[11px]">
                      {isDone ? "완료" : isReading ? "읽는 중" : "미시작"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
