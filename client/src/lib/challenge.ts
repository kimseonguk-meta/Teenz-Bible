// 제자반 성경읽기 챌린지 코어 로직
// RTDB 경로: challenges/jezaban2026/{config,participants,progress,aggregate,manual}
// 최소 쓰기 원칙: 본인 uid 경로 + 작은 집계에만 기록

import {
  ref,
  get,
  set,
  update,
  remove,
  runTransaction,
  serverTimestamp,
} from "firebase/database";
import { db, auth } from "./firebase";
import {
  CHALLENGE_ID,
  CHALLENGE_SCHEDULE,
  getChallengeDay,
  sgDateKey,
  chapterKey,
} from "../data/challengeSchedule";
import { findRosterByName } from "../data/challengeRoster";

const ROOT = `challenges/${CHALLENGE_ID}`;

// 스케줄 헬퍼 재노출 (UI에서 사용)
export { CHALLENGE_ID, CHALLENGE_SCHEDULE, getChallengeDay, sgDateKey, chapterKey };

export type ChallengeRole = "student" | "leader";
export type DayStatus = "done" | "reading" | "not-started";

export interface Participation {
  role: ChallengeRole;
  name?: string;
  rosterNo?: number;
  grade?: string;
  cls?: string;
  /** 읽기 참여 종류: "guest"(명단 외 게스트), "leader"(리더의 읽기 참여). 없으면 명단 학생 */
  kind?: "guest" | "leader";
  /** 리더+읽기 이중 역할 (getMyParticipation이 leaderClaims+participants 동시 보유 시 합성) */
  reading?: boolean;
  joinedAt: number;
}

export interface ChapterProgress {
  exposurePct: number; // 0-100, 본문 절/블록 노출률 (누적)
  activeSec: number; // 활성 읽기 초 (누적)
  quizPass: boolean; // 퀴즈 통과 여부
  seen?: number[]; // 노출된 블록 인덱스 (세션 간 누적용)
  completedAt?: number; // 완료 시각
  manual?: boolean; // 리더 수동 인정 여부
}

export interface DayProgress {
  status: DayStatus;
  chapters: Record<string, ChapterProgress>;
  reportedStatus?: DayStatus; // 집계에 반영된 마지막 상태
  updatedAt?: number;
}

export interface ChallengeConfig {
  name: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  codeHashStudent: string;
  codeHashLeader: string;
  rosterCount: number;
}

// ─── 유틸 ────────────────────────────────────────────────

function uid(): string {
  const u = auth.currentUser?.uid;
  if (!u) throw new Error("로그인이 필요합니다");
  return u;
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

let configCache: ChallengeConfig | null = null;
export async function getChallengeConfig(): Promise<ChallengeConfig> {
  if (configCache) return configCache;
  const snap = await get(ref(db, `${ROOT}/config`));
  if (!snap.exists()) throw new Error("챌린지 설정을 불러오지 못했습니다");
  configCache = snap.val() as ChallengeConfig;
  return configCache;
}

/** 예상 읽기 시간 기반 활성 시간 요구치 (초): max(45, 예상의 35%), 최대 8분 */
export function requiredActiveSec(totalWords: number): number {
  const expected = (totalWords / 220) * 60;
  return Math.min(480, Math.max(45, Math.round(expected * 0.35)));
}

/** 장 완료 판정: 노출 80% + 활성 시간 (또는 리더 수동 인정) */
export function isChapterComplete(cp: ChapterProgress, totalWords: number): boolean {
  if (cp.manual) return true;
  return cp.exposurePct >= 80 && cp.activeSec >= requiredActiveSec(totalWords);
}

/** 코드 정규화: 대문자, 공백/대시 제거 */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

// ─── 참여 코드 검증 ──────────────────────────────────────

/** 코드 검증 → 역할 반환. 코드 원문은 서버/번들에 저장하지 않고 해시만 비교 */
export async function verifyInviteCode(input: string): Promise<ChallengeRole | null> {
  const norm = normalizeCode(input);
  if (!norm) return null;
  const config = await getChallengeConfig();
  // 저장된 코드 형식(NMW-XXXX-XXXX-XXXX)과 비교하기 위해 대시 포함 형태로도 해시
  const dashed = norm.replace(/^([A-Z]+)(\w{4})(\w{4})(\w{4})$/, "$1-$2-$3-$4");
  const candidates = [norm, dashed, input.trim().toUpperCase()];
  for (const c of candidates) {
    const h = await sha256Hex(c);
    if (h === config.codeHashStudent) return "student";
    if (h === config.codeHashLeader) return "leader";
  }
  return null;
}

// ─── 참여 상태 ───────────────────────────────────────────

const LS_KEY = "teensChallengeParticipation";

export function getCachedParticipation(): (Participation & { uid: string }) | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p.uid && p.uid === auth.currentUser?.uid) return p;
    return null;
  } catch {
    return null;
  }
}

function cacheParticipation(p: Participation) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...p, uid: auth.currentUser?.uid }));
  } catch {}
}

export async function getMyParticipation(): Promise<Participation | null> {
  const cached = getCachedParticipation();
  const me = uid();
  let claimSnap;
  let partSnap;
  try {
    [claimSnap, partSnap] = await Promise.all([
      get(ref(db, `${ROOT}/leaderClaims/${me}`)),
      get(ref(db, `${ROOT}/participants/${me}`)),
    ]);
  } catch {
    // 오프라인: 캐시로 폴백 (서버 확인 불가)
    if (cached) {
      const { uid: _u, ...rest } = cached;
      return rest;
    }
    return null;
  }
  if (claimSnap.exists() && partSnap.exists()) {
    // 리더 + 읽기 이중 역할: 리더 카드는 유지하고 읽기 카드도 함께 표시
    const c = claimSnap.val() as { name: string; joinedAt: number };
    const p = partSnap.val() as Participation;
    const dual: Participation = {
      ...p,
      role: "leader",
      reading: true,
      name: c.name || p.name || "리더",
      joinedAt: c.joinedAt || Date.now(),
    };
    cacheParticipation(dual);
    return dual;
  }
  if (claimSnap.exists()) {
    const c = claimSnap.val() as { name: string; joinedAt: number };
    const p: Participation = { role: "leader", name: c.name || "리더", joinedAt: c.joinedAt || Date.now() };
    cacheParticipation(p);
    return p;
  }
  const snap = partSnap;
  if (!snap.exists()) {
    // 서버에 기록이 없는데 캐시가 남아있으면 오래된 캐시 무효화
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
    return null;
  }
  const p = snap.val() as Participation;
  cacheParticipation(p);
  return p;
}

/** 챌린지 참가 등록 (학생: 실명+명단 매칭 필수) */
export async function joinChallenge(
  role: ChallengeRole,
  name?: string
): Promise<Participation> {
  if (role === "leader") {
    throw new Error("리더는 claimLeader로 등록합니다");
  }
  const cleanName = (name || "").replace(/\s+/g, "");
  const roster = await findRosterByName(cleanName);
  if (!roster) throw new Error("명단에서 이름을 찾지 못했습니다");
  const entry: Participation = {
    role: "student",
    name: cleanName,
    rosterNo: roster.no,
    grade: roster.grade,
    cls: roster.cls,
    joinedAt: Date.now(),
  };
  await set(ref(db, `${ROOT}/participants/${uid()}`), entry);
  cacheParticipation(entry);
  return entry;
}

/** 게스트 참가 등록 (명단 외: 학생 코드로 입장, 명단 매칭 없이 개인 기록만 저장) */
export async function joinAsGuest(name: string): Promise<Participation> {
  const cleanName = (name || "").replace(/\s+/g, "").slice(0, 20);
  if (!cleanName) throw new Error("이름을 입력해 주세요");
  const entry: Participation = {
    role: "student",
    name: cleanName,
    kind: "guest",
    joinedAt: Date.now(),
  };
  await set(ref(db, `${ROOT}/participants/${uid()}`), entry);
  cacheParticipation(entry);
  return entry;
}

/** 리더의 읽기 참여 등록 (leaderClaims 보유자만, 실명 입력, 명단 매칭 없이) */
export async function joinAsLeaderReader(realName: string): Promise<Participation> {
  const me = uid();
  const claimSnap = await get(ref(db, `${ROOT}/leaderClaims/${me}`));
  if (!claimSnap.exists()) throw new Error("리더 권한이 필요합니다");
  const cleanName = (realName || "").replace(/\s+/g, "").slice(0, 20);
  if (!cleanName) throw new Error("실명을 입력해 주세요");
  const entry: Participation = {
    role: "student",
    name: cleanName,
    kind: "leader",
    joinedAt: Date.now(),
  };
  await set(ref(db, `${ROOT}/participants/${me}`), entry);
  // 이중 역할로 캐시 갱신 (리더 카드 + 읽기 카드 동시 표시)
  const dual: Participation = { ...entry, role: "leader", reading: true };
  cacheParticipation(dual);
  return dual;
}

/** 읽기 참여만 나가기 (리더 자격은 유지, 읽기 기록 삭제) */
export async function leaveReading(): Promise<void> {
  const me = uid();
  // 삭제 실패는 삼키지 않고 호출자에게 전달 → 토스트로 표시
  await remove(ref(db, `${ROOT}/participants/${me}`));
  await remove(ref(db, `${ROOT}/progress/${me}`));
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

/**
 * 리더 등록: 초대 코드의 해시가 config의 리더 해시와 일치할 때만
 * leaderClaims에 증명을 기록. 규칙이 해시를 강제하므로 REST 직접 쓰기로
 * 리더 권한을 위조할 수 없음 (코드를 모르면 해시를 만들 수 없음).
 */
export async function claimLeader(code: string, name: string): Promise<Participation> {
  const norm = normalizeCode(code);
  const dashed = norm.replace(/^([A-Z]+)(\w{4})(\w{4})(\w{4})$/, "$1-$2-$3-$4");
  const candidates = [norm, dashed, code.trim().toUpperCase()];
  const config = await getChallengeConfig();
  let proof: string | null = null;
  for (const c of candidates) {
    const h = await sha256Hex(c);
    if (h === config.codeHashLeader) {
      proof = h;
      break;
    }
  }
  if (!proof) throw new Error("리더 초대 코드가 올바르지 않습니다");
  const cleanName = (name || "").replace(/\s+/g, "").slice(0, 20) || "리더";
  const entry: Participation = { role: "leader", name: cleanName, joinedAt: Date.now() };
  // 규칙(.validate)이 proof 해시를 강제 — 틀리면 여기서 거부됨
  await set(ref(db, `${ROOT}/leaderClaims/${uid()}`), {
    proof,
    name: cleanName,
    joinedAt: entry.joinedAt,
  });
  cacheParticipation(entry);
  return entry;
}

// ─── 진행 기록 ───────────────────────────────────────────

export async function getDayProgress(dateKey: string, targetUid?: string): Promise<DayProgress | null> {
  const snap = await get(ref(db, `${ROOT}/progress/${targetUid || uid()}/${dateKey}`));
  const prog = snap.exists() ? (snap.val() as DayProgress) : null;
  // 리더 수동 인정 병합 (본인 조회 시): 리더는 타인의 progress에 쓸 수 없으므로(규칙상 본인만 쓰기 가능),
  // 수동 인정은 manual/ 에만 기록된다. 본인이 읽을 때는 이를 합성해 완료로 취급한다.
  const me = uid();
  if (!targetUid || targetUid === me) {
    try {
      const m = await get(ref(db, `${ROOT}/manual/${me}/${dateKey}`));
      const mv = m.val() as { done?: boolean } | null;
      if (mv?.done) {
        const day = getChallengeDay(dateKey);
        const base: DayProgress = prog || ({ chapters: {} } as DayProgress);
        const chapters: Record<string, ChapterProgress> = { ...(base.chapters || {}) };
        if (day) {
          for (const c of day.chapters) {
            const id = chapterKey(day.book, c);
            const prevCp = chapters[id] as ChapterProgress | undefined;
            chapters[id] = { ...(prevCp || {}), manual: true, completedAt: prevCp?.completedAt || Date.now() } as ChapterProgress;
          }
        }
        return { ...base, chapters, status: "done" } as DayProgress;
      }
    } catch { /* 수동 기록 읽기 실패 시 기존 진도 그대로 */ }
  }
  return prog;
}

/** 장 진행 상황 저장 (읽기 중 수시 호출 — 호출 측에서 스로틀).
 *  누적은 클라이언트가 담당 (마운트 시 로드 → 로컬 누적 → 스냅샷 저장). */
export async function saveChapterProgress(
  dateKey: string,
  chapterId: string,
  cp: ChapterProgress
): Promise<void> {
  const base = `${ROOT}/progress/${uid()}/${dateKey}`;
  await update(ref(db, base), {
    [`chapters/${chapterId}/exposurePct`]: Math.round(cp.exposurePct),
    [`chapters/${chapterId}/activeSec`]: Math.round(cp.activeSec),
    [`chapters/${chapterId}/quizPass`]: !!cp.quizPass,
    [`chapters/${chapterId}/seen`]: (cp.seen || []).slice(0, 400),
    ...(cp.completedAt ? { [`chapters/${chapterId}/completedAt`]: cp.completedAt } : {}),
    status: "reading",
    updatedAt: serverTimestamp(),
  });
}

/** 하루 전체 완료 여부 판정 (해당 일차의 모든 장) */
export function isDayComplete(
  day: { book: string; chapters: number[] },
  prog: DayProgress | null,
  wordsPerChapter: Record<string, number>
): boolean {
  if (!prog) return false;
  return day.chapters.every((c) => {
    const id = chapterKey(day.book, c);
    const cp = prog.chapters?.[id];
    if (!cp) return false;
    return isChapterComplete(cp, wordsPerChapter[id] || 400);
  });
}

/**
 * 하루 상태 확정 + 집계 트랜잭션.
 * status가 바뀔 때만 doneCount/readingCount를 증감 (중복 방지).
 */
export async function finalizeDayStatus(dateKey: string, status: DayStatus): Promise<void> {
  const me = uid();
  const base = `${ROOT}/progress/${me}/${dateKey}`;
  const snap = await get(ref(db, base));
  const prev = (snap.val() as DayProgress | null)?.reportedStatus || "not-started";
  // 게스트/리더 읽기는 공식 집계에서 제외 (개인 기록만 저장)
  let kind = getCachedParticipation()?.kind;
  if (kind === undefined) {
    const ks = await get(ref(db, `${ROOT}/participants/${me}/kind`)).catch(() => null);
    kind = (ks?.val() as "guest" | "leader" | undefined) ?? undefined;
  }
  const counted = kind !== "guest" && kind !== "leader";
  if (prev === status) {
    // 집계는 그대로, 상태 필드만 최신화
    await update(ref(db, base), { status, updatedAt: serverTimestamp() });
    return;
  }
  // 리더 수동 인정분은 리더가 이미 aggregate에 반영했으므로 중복 가산 방지
  let manualCredited = false;
  if (counted && status === "done" && prev !== "done") {
    try {
      const m = await get(ref(db, `${ROOT}/manual/${me}/${dateKey}/done`));
      manualCredited = m.val() === true;
    } catch { /* 읽기 실패 시 기존 로직대로 집계 */ }
  }
  if (counted && !manualCredited) {
    const aggRef = ref(db, `${ROOT}/aggregate/${dateKey}`);
    await runTransaction(aggRef, (cur: any) => {
      const c = cur || { doneCount: 0, readingCount: 0 };
      if (prev === "done") c.doneCount = Math.max(0, (c.doneCount || 0) - 1);
      else if (prev === "reading") c.readingCount = Math.max(0, (c.readingCount || 0) - 1);
      if (status === "done") c.doneCount = (c.doneCount || 0) + 1;
      else if (status === "reading") c.readingCount = (c.readingCount || 0) + 1;
      return c;
    });
  }
  await update(ref(db, base), {
    status,
    reportedStatus: status,
    updatedAt: serverTimestamp(),
  });
  // 완료 일수 요약 (학생 홈 진행률용) — 상태가 바뀔 때만 조정
  if (prev !== status) {
    const delta = status === "done" ? 1 : prev === "done" ? -1 : 0;
    if (delta !== 0) {
      await runTransaction(ref(db, `${ROOT}/progress/${me}/_summary/doneDays`), (cur: any) => {
        return Math.max(0, (cur || 0) + delta);
      });
    }
  }
}

/** 챌린지 읽기 시작: Bible 화면에서 추적할 수 있도록 세션에 기록 */
export function startChallengeChapter(book: string, chapter: number): void {
  try {
    sessionStorage.setItem(
      "challengeActive",
      JSON.stringify({ book, chapter, dateKey: sgDateKey() })
    );
  } catch {}
}

/** Bible 화면용: 현재 장이 챌린지 추적 대상인지 확인 */
export function getChallengeCtx(
  book: string,
  chapter: number
): { book: string; chapter: number; dateKey: string } | null {
  try {
    const raw = sessionStorage.getItem("challengeActive");
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c.dateKey) return null;
    if (c.book === book && c.chapter === chapter) return c;
    // 장 사이를 직접 이동해도 추적되도록: 오늘 읽기 목록에 있으면 추적 대상
    const day = getChallengeDay(c.dateKey);
    if (day && day.book === book && day.chapters.includes(chapter)) {
      return { book, chapter, dateKey: c.dateKey };
    }
    return null;
  } catch {
    return null;
  }
}

/** 챌린지 추적 종료 */
export function clearChallengeCtx(): void {
  try {
    sessionStorage.removeItem("challengeActive");
  } catch {}
}

/** 하루 완료 여부 재평가 + 상태 확정 (퀴즈 통과/읽기 틱에서 호출) */
export async function evaluateAndFinalizeDay(
  dateKey: string,
  wordsPerChapter: Record<string, number> = {}
): Promise<DayStatus> {
  const day = getChallengeDay(dateKey);
  if (!day) return "not-started";
  const prog = await getDayProgress(dateKey);
  const done = isDayComplete(day, prog, wordsPerChapter);
  const status: DayStatus = done ? "done" : prog ? "reading" : "not-started";
  if (prog) {
    await finalizeDayStatus(dateKey, status);
  }
  // 로컬 미러: 저녁 알림(isTodayReadingDone)이 챌린지 완료를 보게 함
  try {
    if (done) localStorage.setItem(`challengeDayDone_${dateKey}`, "1");
    else localStorage.removeItem(`challengeDayDone_${dateKey}`);
  } catch {}
  return status;
}

/** 챌린지 나가기: 본인 참가 기록 + 진행 기록 삭제 */
export async function leaveChallenge(): Promise<void> {
  const me = uid();
  // 삭제 실패는 삼키지 않고 호출자에게 전달 → 토스트로 표시
  await remove(ref(db, `${ROOT}/participants/${me}`));
  await remove(ref(db, `${ROOT}/leaderClaims/${me}`)).catch(() => {});
  await remove(ref(db, `${ROOT}/progress/${me}`));
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

/** 내 완료 일수 요약 */
export async function getMySummary(): Promise<{ doneDays: number }> {
  const snap = await get(ref(db, `${ROOT}/progress/${uid()}/_summary`));
  const v = snap.val() || {};
  return { doneDays: v.doneDays || 0 };
}

/** 익명 집계 조회 (학생도 볼 수 있음) */
export async function getAggregate(dateKey: string): Promise<{ doneCount: number; readingCount: number }> {
  const snap = await get(ref(db, `${ROOT}/aggregate/${dateKey}`));
  const v = snap.val() || {};
  return { doneCount: v.doneCount || 0, readingCount: v.readingCount || 0 };
}

// ─── 리더 전용 ───────────────────────────────────────────

async function assertLeader(): Promise<void> {
  const p = await getMyParticipation();
  if (p?.role !== "leader") throw new Error("리더 권한이 필요합니다");
}

/** 전체 참가자 목록 (리더만) */
export async function listParticipants(): Promise<{ uid: string; p: Participation }[]> {
  await assertLeader();
  const snap = await get(ref(db, `${ROOT}/participants`));
  if (!snap.exists()) return [];
  const v = snap.val() as Record<string, Participation>;
  return Object.entries(v).map(([uid, p]) => ({ uid, p }));
}

/** 특정 날짜 전체 학생 진행 상황 (리더만) — 1회성 읽기 */
export async function listDayProgress(
  dateKey: string,
  uids: string[]
): Promise<Record<string, DayProgress | null>> {
  await assertLeader();
  const results = await Promise.all(
    uids.map(async (u) => {
      const s = await get(ref(db, `${ROOT}/progress/${u}/${dateKey}`));
      return [u, s.exists() ? (s.val() as DayProgress) : null] as const;
    })
  );
  return Object.fromEntries(results);
}

/** 리더 수동 인정/취소 (사유 필수).
 *  멀티 디바이스 대응: 같은 학번(rosterNo)의 모든 참가 기록에 일괄 적용한다.
 *  리더 화면은 학번당 1행만 보여주므로, 뒤에 숨은 기기별 기록에도 인정이 보여야 한다.
 *  집계(doneCount)는 학생당 1번만 반영한다. */
export async function setManualOverride(
  targetUid: string,
  dateKey: string,
  done: boolean,
  reason: string
): Promise<void> {
  await assertLeader();
  const me = auth.currentUser!;
  // 같은 학번의 모든 기기 entry 찾기
  const targetSnap = await get(ref(db, `${ROOT}/participants/${targetUid}`)).catch(() => null);
  const targetVal = targetSnap?.val() as { rosterNo?: number; kind?: string } | null;
  const rosterNo = targetVal?.rosterNo;
  let targetUids = [targetUid];
  if (rosterNo) {
    const all = await listParticipants().catch(() => [] as { uid: string; p: Participation }[]);
    const matched = all.filter(({ p }) => p.rosterNo === rosterNo).map(({ uid }) => uid);
    if (matched.length) targetUids = matched;
  }
  if (done) {
    if (!reason.trim()) throw new Error("사유를 입력해 주세요");
    const record = {
      done: true,
      reason: reason.trim(),
      byUid: me.uid,
      at: serverTimestamp(),
    };
    for (const u of targetUids) {
      await set(ref(db, `${ROOT}/manual/${u}/${dateKey}`), record);
    }
    // 집계: 리더가 인정한 완료도 doneCount에 반영 (리더 쓰기 가능 경로)
    // 단, 게스트/리더 읽기는 공식 집계에서 제외. 학생당 1번만 가산:
    // 같은 학번의 어느 기기 기록이라도 이미 done이면 가산하지 않음.
    // 학생 본인의 finalizeDayStatus는 manual 기록을 보고 집계를 건너뛰므로 중복 없음.
    let alreadyDone = false;
    for (const u of targetUids) {
      const ps = await get(ref(db, `${ROOT}/progress/${u}/${dateKey}/reportedStatus`)).catch(() => null);
      if (ps?.val() === "done") {
        alreadyDone = true;
        break;
      }
    }
    if (!alreadyDone && targetVal?.kind !== "guest" && targetVal?.kind !== "leader") {
      const aggSnap = await get(ref(db, `${ROOT}/aggregate/${dateKey}`));
      const prev = (aggSnap.val() as any)?.doneCount || 0;
      await update(ref(db, `${ROOT}/aggregate/${dateKey}`), { doneCount: prev + 1 });
    }
    // 해당 일차 전 장을 수동 완료로 표시 — 규칙상 본인 progress만 쓰기 가능하므로 본인에게만 시도.
    // 타인에 대해서는 manual/ 기록을 학생 본인의 getDayProgress가 합성한다.
    const day = getChallengeDay(dateKey);
    if (day && targetUids.includes(me.uid)) {
      const updates: Record<string, any> = {
        status: "done",
        updatedAt: serverTimestamp(),
      };
      for (const c of day.chapters) {
        updates[`chapters/${chapterKey(day.book, c)}/manual`] = true;
        updates[`chapters/${chapterKey(day.book, c)}/completedAt`] = serverTimestamp();
      }
      await update(ref(db, `${ROOT}/progress/${me.uid}/${dateKey}`), updates);
    }
  } else {
    for (const u of targetUids) {
      await update(ref(db, `${ROOT}/manual/${u}/${dateKey}`), {
        done: false,
        reason: reason.trim(),
        byUid: me.uid,
        at: serverTimestamp(),
      });
    }
  }
}

/** 수동 인정 기록 조회 */
export async function getManualOverride(
  targetUid: string,
  dateKey: string
): Promise<{ done: boolean; reason: string; byUid: string; at: number } | null> {
  const snap = await get(ref(db, `${ROOT}/manual/${targetUid}/${dateKey}`));
  return snap.exists() ? snap.val() : null;
}

// ─── 챌린지 날짜 헬퍼 ─────────────────────────────────────

/** 오늘 일차 (챌린지 기간 밖이면 null) */
export function getTodayChallengeDay() {
  return getChallengeDay(sgDateKey());
}

/** 챌린지 전체 진행률 계산용: 일정 전체 챕터 수 */
export function totalChallengeChapters(): number {
  return CHALLENGE_SCHEDULE.reduce((n, d) => n + d.chapters.length, 0);
}

// ─── 격려 메시지 ───────────────────────────────────────────

/** 리더가 학생에게 격려 메시지 발송 (RTDB에 저장, 학생 앱에서 확인) */
export async function sendEncouragement(targetUid: string, message: string): Promise<void> {
  const me = auth.currentUser;
  if (!me) throw new Error("로그인이 필요합니다");
  const id = `${Date.now()}`;
  await set(ref(db, `${ROOT}/encouragements/${targetUid}/${id}`), {
    message: message.trim().slice(0, 200) || "화이팅! 오늘도 성경 읽기 응원해요 🙏",
    byUid: me.uid,
    at: serverTimestamp(),
    read: false,
  });
}

/** 내 격려 메시지 조회 (읽지 않은 것만) */
export async function getMyEncouragements(): Promise<{ id: string; message: string; at: number }[]> {
  const snap = await get(ref(db, `${ROOT}/encouragements/${uid()}`));
  if (!snap.exists()) return [];
  const val = snap.val() as Record<string, any>;
  return Object.entries(val)
    .filter(([, v]) => v && !v.read)
    .map(([id, v]) => ({ id, message: v.message || "", at: v.at || 0 }))
    .sort((a, b) => b.at - a.at);
}

/** 격려 메시지 읽음 처리 */
export async function markEncouragementRead(id: string): Promise<void> {
  await update(ref(db, `${ROOT}/encouragements/${uid()}/${id}`), { read: true });
}
