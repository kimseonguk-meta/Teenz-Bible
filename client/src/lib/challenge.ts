// 제자반 성경읽기 챌린지 코어 로직
// RTDB 경로: challenges/jezaban2026/{config,participants,progress,aggregate,manual}
// 최소 쓰기 원칙: 본인 uid 경로 + 작은 집계에만 기록

import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  runTransaction,
  serverTimestamp,
} from "firebase/database";
import { db, auth } from "./firebase";
import {
  CHALLENGE_ID,
  CHALLENGE_START,
  CHALLENGE_END,
  CHALLENGE_SCHEDULE,
  getChallengeDay,
  sgDateKey,
  chapterKey,
} from "../data/challengeSchedule";
import { findRosterByName } from "../data/challengeRoster";

const ROOT = `challenges/${CHALLENGE_ID}`;

// 스케줄 헬퍼 재노출 (UI에서 사용)
export { CHALLENGE_ID, CHALLENGE_START, CHALLENGE_END, CHALLENGE_SCHEDULE, getChallengeDay, sgDateKey, chapterKey };

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
  words?: number; // 저장 시점 언어의 해당 장 단어 수 (필요 읽기 시간 계산용, 없으면 400 fallback)
}

export interface DayProgress {
  status: DayStatus;
  chapters: Record<string, ChapterProgress>;
  reportedStatus?: DayStatus; // 집계에 반영된 마지막 상태
  /** 마지막으로 집계에 반영될 당시의 참가 종류("official"/"guest"/"leader"). 종류가 바뀌면 reportedStatus를 "not-started"로 간주 */
  reportedKind?: string | null;
  /** true면 마지막 reportedStatus가 리더 수동 인정 grant에 의해 집계된 것 (취소 시 학생 finalize가 집계를 건드리지 않음) */
  manualCredited?: boolean;
  /** true면 claim 시대(학번당 1명 집계) 이후에 쓰인 기록 — 삭제 시 legacy per-UID 회수 대상이 아님 */
  claimEra?: boolean;
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
      name: p.name || c.name || "리더",
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
  if (!/[가-힣]/.test(cleanName)) throw new Error("한글 실명을 입력해 주세요");
  // 명단에 있는 이름은 게스트로 가입할 수 없다 — 학생 참가(실명 입력)로 진행해야 공식 집계에 포함된다
  const rosterHit = await findRosterByName(cleanName).catch(() => undefined);
  if (rosterHit) {
    throw new Error(
      "명단에 있는 이름입니다. 게스트가 아니라 '제자반 학생 참가'의 실명 입력으로 다시 진행해 주세요."
    );
  }
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
  // 같은 이름의 리더 읽기 참여가 이미 있으면 중복 등록 차단.
  // 익명 UID는 기기마다 달라서, 같은 사람이 다른 기기에서 "나도 함께 읽기"를 누르면
  // 대시보드에 같은 이름이 2개 보이는 문제가 있었음 (2026-09-15 김성욱 중복).
  const existing = await listParticipants().catch(
    () => [] as { uid: string; p: Participation }[]
  );
  const dupe = existing.find(
    ({ uid, p }) =>
      uid !== me &&
      p.kind === "leader" &&
      (p.name || "").replace(/\s+/g, "") === cleanName
  );
  if (dupe) {
    throw new Error(
      `이미 '${cleanName}' 이름으로 함께 읽기 참여 중이에요. 다른 기기에서 등록하셨다면 리더 대시보드의 🗑️로 이전 기록을 지우고 다시 시도해 주세요.`
    );
  }
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
  await withdrawMyAggregate();
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
  // NOTE: 하루 상태(status/reportedStatus)는 finalizeDayStatus가 전담한다.
  // 여기서 status를 쓰면 완료된 날이 다시 "reading"으로 덮어씌워지는 버그가 생긴다.
  await update(ref(db, base), {
    [`chapters/${chapterId}/exposurePct`]: Math.round(cp.exposurePct),
    [`chapters/${chapterId}/activeSec`]: Math.round(cp.activeSec),
    [`chapters/${chapterId}/quizPass`]: !!cp.quizPass,
    [`chapters/${chapterId}/seen`]: (cp.seen || []).slice(0, 400),
    ...(cp.completedAt ? { [`chapters/${chapterId}/completedAt`]: cp.completedAt } : {}),
    ...(cp.words && cp.words > 0 ? { [`chapters/${chapterId}/words`]: Math.round(cp.words) } : {}),
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
    // 저장된 실제 단어 수를 우선 사용 (퀴즈만 풀고 나간 경우의 400 fallback 관대 판정 방지)
    return isChapterComplete(cp, wordsPerChapter[id] || cp.words || 400);
  });
}

/**
 * 수동 인정을 제외한 순수 읽기 상태 (리더 대시보드·수동 취소·집계 재계산의 단일 기준).
 * finalize가 쓰는 병합 status와 달리, 실제 노출/읽기 시간만 본다.
 */
export function realReadingStatus(
  day: { book: string; chapters: number[] },
  prog: DayProgress | null
): DayStatus {
  if (!prog || !prog.chapters) return "not-started";
  const complete = day.chapters.every((c) => {
    const cp = prog.chapters[chapterKey(day.book, c)];
    if (!cp) return false;
    return (
      cp.exposurePct >= 80 &&
      cp.activeSec >= requiredActiveSec(cp.words || 400)
    );
  });
  return complete ? "done" : "reading";
}

/** 집계 doneCount/readingCount 증감 (트랜잭션, from===to면 no-op) */
async function adjustAggregate(dateKey: string, from: DayStatus, to: DayStatus): Promise<void> {
  const f = from === "done" || from === "reading" ? from : null;
  const t = to === "done" || to === "reading" ? to : null;
  if (f === t) return;
  await runTransaction(ref(db, `${ROOT}/aggregate/${dateKey}`), (cur: unknown) => {
    const c = (cur as { doneCount?: number; readingCount?: number } | null) || {
      doneCount: 0,
      readingCount: 0,
    };
    if (f === "done") c.doneCount = Math.max(0, (c.doneCount || 0) - 1);
    else if (f === "reading") c.readingCount = Math.max(0, (c.readingCount || 0) - 1);
    if (t === "done") c.doneCount = (c.doneCount || 0) + 1;
    else if (t === "reading") c.readingCount = (c.readingCount || 0) + 1;
    return c;
  });
}

/** 개인 누적 완료 일수(_summary/doneDays) 증감 — reportedStatus 전이를 그대로 반영 */
async function adjustSummary(me: string, from: DayStatus, to: DayStatus): Promise<void> {
  const d = to === "done" ? (from === "done" ? 0 : 1) : from === "done" ? -1 : 0;
  if (d === 0) return;
  await runTransaction(ref(db, `${ROOT}/progress/${me}/_summary/doneDays`), (cur: unknown) =>
    Math.max(0, ((cur as number) || 0) + d)
  );
}

// ─── 학번 단위 집계 소유권 (rosterClaims) ─────────────────────────────
// 문제: 익명 로그인은 기기마다 UID가 달라, 같은 학생이 2개 기기에서 읽으면
// aggregate가 2명으로 카운트됐다. 집계의 진짜 단위는 UID가 아니라 학번(rosterNo)이므로,
// 날짜×학번당 하나의 claim {uid, status}만 집계를 소유한다.
// - 학생 finalize: 내 UID로 claim을 잡거나(없을 때), 내가 잡은 것을 갱신하거나,
//   done이 reading을 덮어쓴다(max-wins). 수동 인정("manual:…")이 잡고 있으면 건드리지 않는다.
// - 리더 수동 인정 grant/cancel: "manual:<리더UID>"로 claim을 소유/해제한다.
// - 대시보드는 claim을 집계의 정본으로 읽으므로, 행·요약·aggregate가 항상 일치한다.
export interface RosterClaim {
  uid: string;
  status: "reading" | "done";
  at: number;
}
type CountedStatus = "reading" | "done";

function claimRef(dateKey: string, rosterNo: number) {
  return ref(db, `${ROOT}/rosterClaims/${dateKey}/${rosterNo}`);
}

/** 특정 날짜의 학번별 claim 일괄 조회 (리더 대시보드용) */
export async function getRosterClaims(dateKey: string): Promise<Record<number, RosterClaim>> {
  const snap = await get(ref(db, `${ROOT}/rosterClaims/${dateKey}`)).catch(() => null);
  if (!snap?.exists()) return {};
  const v = snap.val() as Record<string, RosterClaim>;
  const out: Record<number, RosterClaim> = {};
  for (const [k, c] of Object.entries(v || {})) {
    if (c && (c.status === "reading" || c.status === "done") && typeof c.uid === "string") {
      out[Number(k)] = c;
    }
  }
  return out;
}

/**
 * claim 트랜잭션 + 집계 델타 반영.
 * decide(cur) → 새 claim | null(해제) | undefined(중단).
 * 커밋된 경우에만 (이전 상태 → 새 상태) 델타를 aggregate에 반영한다.
 * 같은 노드의 트랜잭션은 RTDB가 직렬화하므로, prev는 항상 최신 커밋 기준이라 정확하다.
 */
async function transactClaim(
  dateKey: string,
  rosterNo: number,
  decide: (cur: RosterClaim | null) => RosterClaim | null | undefined
): Promise<void> {
  // get()은 일회성 서버 읽기라 로컬 동기화 캐시를 채우지 않는다. 그래서 runTransaction의
  // 첫 로컬 실행이 cur=null을 보고 decide가 undefined를 반환하면, 서버에 닿기도 전에
  // 중단되어 조용히 no-op이 된다. 서버 값을 미리 읽어두고, 로컬이 null이면 그 값으로
  // decide를 실행해 서버 라운드트립을 강제한다. 서버가 실제 값으로 update 함수를
  // 재실행하므로(값이 바뀌었으면 prev/next도 갱신됨) 안전하다.
  const warmSnap = await get(claimRef(dateKey, rosterNo)).catch(() => null);
  const warmVal = (warmSnap?.val() as RosterClaim | null) ?? null;
  let prev: CountedStatus | null = null;
  let next: CountedStatus | null = null;
  let decided = false;
  const res = await runTransaction(claimRef(dateKey, rosterNo), (raw: unknown) => {
    const localCur = (raw as RosterClaim | null) ?? null;
    const cur = localCur ?? warmVal; // 로컬 null이면 워밍업 값으로 폴백
    const out = decide(cur);
    if (out === undefined) return undefined; // 중단
    if (out === null && cur === null) return undefined; // 해제할 게 없음
    prev = cur?.status ?? null;
    next = out?.status ?? null;
    decided = true;
    return out;
  });
  if (res.committed && decided && prev !== next) {
    await adjustAggregate(dateKey, prev ?? "not-started", next ?? "not-started");
  }
}

/** 학생용 claim 결정 로직: 내 UID/상태로 소유권 획득·갱신·해제 */
function studentClaimDecision(
  me: string,
  status: DayStatus
): (cur: RosterClaim | null) => RosterClaim | null | undefined {
  return (cur) => {
    if (status === "not-started") {
      return cur && cur.uid === me ? null : undefined; // 내가 잡은 것만 해제
    }
    const mine: RosterClaim = { uid: me, status, at: Date.now() };
    if (!cur) return mine;
    if (cur.uid === me) return cur.status === status ? undefined : mine;
    if (cur.uid.startsWith("manual:")) return undefined; // 수동 인정이 소유 중
    // max-wins: done이 reading을 덮어쓴다 (구 기기의 reading이 신 기기의 done을 막지 못하게)
    if (status === "done" && cur.status !== "done") return mine;
    return undefined;
  };
}

/**
 * 하루 상태 확정 + 집계 트랜잭션.
 *
 * 불변식: aggregate는 각 학번(rosterNo)의 claim 전이를 정확히 한 번씩 반영한다.
 * - status/reportedStatus/reportedKind/manualCredited의 유일한 쓰기 주체 (saveChapterProgress는 장 스냅샷만 쓴다)
 * - 집계 소유권은 rosterClaims/{date}/{rosterNo} 트랜잭션으로만 이동 (중복 UID 이중 카운트 원천 차단)
 * - 리더 수동 인정 grant/cancel 동안에는 리더가 claim을 소유하므로 학생 finalize는 건드리지 않는다
 * - 수동 인정이 취소된 뒤에는 progress.manualCredited 플래그로 "이미 되돌려진 grant"를 구분해 중복 가감산 방지
 * - 게스트/리더 읽기는 집계 제외. 공식↔게스트 전환 시 내가 잡은 claim을 해제한다
 */
export async function finalizeDayStatus(dateKey: string, status: DayStatus): Promise<void> {
  const me = uid();
  const base = `${ROOT}/progress/${me}/${dateKey}`;
  const snap = await get(ref(db, base)).catch(() => null);
  const cur = (snap?.val() as DayProgress | null) || null;
  const prevRep = cur?.reportedStatus || "not-started";
  const prevKind = cur?.reportedKind; // undefined = 아직 보고한 적 없음
  const prevMC = cur?.manualCredited === true;

  let part = getCachedParticipation();
  if (!part) {
    const ps = await get(ref(db, `${ROOT}/participants/${me}`)).catch(() => null);
    const v = ps?.val() as { kind?: string; rosterNo?: number } | null;
    part = v ? ({ kind: v.kind, rosterNo: v.rosterNo } as Participation) : null;
  }
  const kind: string | null = part?.kind ?? null;
  const rosterNo: number | null = part?.rosterNo ?? null;
  const counted = kind !== "guest" && kind !== "leader";
  // reportedKind는 문자열로 저장 ("official" 포함) — update()에서 null은 삭제로 처리되므로 null 사용 금지
  const kindNorm = kind ?? "official";
  // 참가 종류가 바뀌었으면 이전 보고는 무효 (게스트 done → 공식 참가 등)
  const kindChanged = prevKind !== undefined && prevKind !== kindNorm;
  const effPrev: DayStatus = kindChanged ? "not-started" : prevRep;
  const effMC = kindChanged ? false : prevMC;

  const manualSnap = await get(ref(db, `${ROOT}/manual/${me}/${dateKey}`)).catch(() => null);
  const manualRec = manualSnap?.val() as { done?: boolean; reversed?: boolean } | null;
  const manualDone = manualRec?.done === true;

  if (!counted) {
    // 게스트/리더 읽기: 집계 제외. 공식→게스트(리더) 전환 시 내가 잡은 claim 해제
    if (rosterNo != null) {
      await transactClaim(dateKey, rosterNo, (c) => (c && c.uid === me ? null : undefined));
    } else {
      const wasCounted = prevKind !== undefined && prevKind !== "guest" && prevKind !== "leader";
      if (wasCounted && !effMC && (effPrev === "done" || effPrev === "reading")) {
        await adjustAggregate(dateKey, effPrev, "not-started");
      }
    }
    await update(ref(db, base), {
      status,
      reportedStatus: status,
      reportedKind: kindNorm,
      manualCredited: false,
      ...(rosterNo != null ? { claimEra: true } : {}),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (manualDone) {
    // 리더 수동 인정이 유효한 동안은 grant/cancel이 claim을 소유 — 학생 finalize는 플래그만 기록
    await update(ref(db, base), {
      status,
      reportedStatus: status,
      reportedKind: kindNorm,
      manualCredited: true,
      ...(rosterNo != null ? { claimEra: true } : {}),
      updatedAt: serverTimestamp(),
    });
    await adjustSummary(me, prevRep, status);
    return;
  }

  if (effMC) {
    // 수동 인정이 취소된 뒤: 리더의 cancel이 claim을 이미 정리했으므로 플래그만 리셋하고
    // 아래 일반 경로의 claim 트랜잭션으로 현재 실상태를 다시 소유한다
    // (reading이던 학생의 +1이 다음 틱까지 비는 일을 없앰)
  }

  // 일반 경로 (effMC 포함): claim 트랜잭션으로 집계 반영
  if (rosterNo != null) {
    await transactClaim(dateKey, rosterNo, studentClaimDecision(me, status));
  } else if (effPrev !== status) {
    // rosterNo 없는 공식 참가자 (예외) — 기존처럼 직접 집계
    await adjustAggregate(dateKey, effPrev, status);
  }
  await update(ref(db, base), {
    status,
    reportedStatus: status,
    reportedKind: kindNorm,
    manualCredited: false,
    ...(rosterNo != null ? { claimEra: true } : {}),
    updatedAt: serverTimestamp(),
  });
  await adjustSummary(me, prevRep, status);
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
    // 챌린지 기간 밖에서는 읽기를 추적하지 않는다 (종료 후 읽기, 기간 전 테스트 읽기 등)
    const today = sgDateKey();
    if (today < CHALLENGE_START || today > CHALLENGE_END) return null;
    const raw = sessionStorage.getItem("challengeActive");
    if (raw) {
      try {
        const c = JSON.parse(raw);
        // 세션 컨텍스트도 스케줄 기준으로 검증 (어제 탭이 오늘 직접 열기를 막지 않도록)
        const day = c?.dateKey ? getChallengeDay(c.dateKey) : undefined;
        if (day && day.book === book && day.chapters.includes(chapter)) {
          return { book, chapter, dateKey: day.date };
        }
      } catch {}
      // 세션 정보가 맞지 않으면 스케줄 폴백으로 계속 (return null 금지 — 추적 끊김 방지)
    }
    // 폴백: 챌린지 참가자가 성경 탭에서 직접 장을 열었을 때.
    // 해당 장이 챌린지 일정(오늘 이전 날짜)에 있으면 그 날짜로 추적한다.
    // (챌린지 카드의 "읽으러 가기"를 거치지 않아도 기록이 남도록)
    const part = getCachedParticipation();
    if (!part) return null;
    const schedDay = CHALLENGE_SCHEDULE.find(
      (d) => d.book === book && d.chapters.includes(chapter) && d.date <= today
    );
    if (!schedDay) return null;
    return { book, chapter, dateKey: schedDay.date };
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
  await withdrawMyAggregate();
  // 삭제 실패는 삼키지 않고 호출자에게 전달 → 토스트로 표시
  await remove(ref(db, `${ROOT}/participants/${me}`));
  await remove(ref(db, `${ROOT}/leaderClaims/${me}`)).catch(() => {});
  await remove(ref(db, `${ROOT}/progress/${me}`));
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

/**
 * 탈퇴/역할 전환 전: 내가 집계에 반영해 둔 카운트 회수.
 * - claim을 내가 잡고 있으면 해제 (집계 델타는 트랜잭션에서 자동 반영)
 * - 리더 수동 인정으로 집계된 날짜(manualCredited)는 리더의 cancel이 소유하므로 건드리지 않음
 * - 게스트/리더 읽기로 보고된 날짜는 집계에 포함된 적 없으므로 건드리지 않음
 * - claim 이전(legacy) 데이터: reportedStatus 기준 직접 회수
 */
async function withdrawMyAggregate(): Promise<void> {
  const me = uid();
  const part = getCachedParticipation() ?? (await getMyParticipation().catch(() => null));
  const rosterNo: number | null = part?.rosterNo ?? null;
  const snap = await get(ref(db, `${ROOT}/progress/${me}`)).catch(() => null);
  if (!snap?.exists()) return;
  const val = snap.val() as Record<string, DayProgress>;
  for (const [dateKey, dp] of Object.entries(val || {})) {
    if (dateKey === "_summary" || !dp || typeof dp !== "object") continue;
    const st = dp.reportedStatus;
    const kind = dp.reportedKind;
    if (kind === "guest" || kind === "leader") continue; // 집계에 포함된 적 없음
    if (dp.manualCredited) continue; // 리더 grant/cancel이 소유
    if (st !== "done" && st !== "reading") continue;
    if (rosterNo != null) {
      await transactClaim(dateKey, rosterNo, (c) =>
        c && c.uid === me ? null : undefined
      ).catch(() => {});
    } else {
      await adjustAggregate(dateKey, st, "not-started").catch(() => {});
    }
  }
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

/**
 * 집계 재계산 (리더 전용 복구 도구).
 * 실제 기록(progress + manual)을 학번 기준으로 집계해 aggregate를 통째로 다시 쓰고,
 * rosterClaims도 같은 기준으로 재기록한다 — 이후 대시보드·학생카드·리더카드가 완전히 일치한다.
 * - 대시보드 행 선택과 동일한 last-wins 규칙으로 학번당 1개 UID 선택
 * - 수동 인정(manual.done)은 완료로 간주, 그 외는 realReadingStatus(실제 노출/읽기 시간)로 판정
 * - 수동 인정 중인 학번의 claim은 "manual:…" 로 기록해 학생 finalize가 덮어쓰지 못하게 한다
 * - 학생 개인의 reportedStatus/_summary는 건드리지 않음 (본인 기기에서 다음 읽기 틱에 수렴)
 */
export async function reconcileAggregate(
  dateKey: string
): Promise<{ doneCount: number; readingCount: number }> {
  await assertLeader();
  const me = auth.currentUser!.uid;
  const day = getChallengeDay(dateKey);
  const parts = await listParticipants();
  const byRoster = pickRosterPrimary(parts);
  const uids = [...byRoster.values()].map(({ uid }) => uid);
  const progMap = uids.length ? await listDayProgress(dateKey, uids) : {};
  let doneCount = 0;
  let readingCount = 0;
  const claimWrites: { rosterNo: number; claim: RosterClaim }[] = [];
  const claimClears: number[] = [];
  for (const [rosterNo, { uid: u }] of byRoster) {
    const prog = progMap[u] || null;
    const m = await getManualOverride(u, dateKey).catch(() => null);
    const manual = m?.done === true;
    const real: DayStatus = day
      ? realReadingStatus(day, prog)
      : prog?.status || "not-started";
    const st: DayStatus = manual ? "done" : real;
    if (st === "done") {
      doneCount++;
      claimWrites.push({
        rosterNo,
        claim: {
          uid: manual && real !== "done" ? `manual:reconcile:${me}` : u,
          status: "done",
          at: Date.now(),
        },
      });
    } else if (st === "reading") {
      readingCount++;
      claimWrites.push({ rosterNo, claim: { uid: u, status: "reading", at: Date.now() } });
    } else {
      claimClears.push(rosterNo);
    }
  }
  // claim을 학번별로 개별 기록 (규칙: 리더는 모든 claim 쓰기 가능)
  await Promise.all(
    claimWrites.map(({ rosterNo, claim }) => set(claimRef(dateKey, rosterNo), claim))
  );
  await Promise.all(claimClears.map((rosterNo) => remove(claimRef(dateKey, rosterNo))));
  await runTransaction(ref(db, `${ROOT}/aggregate/${dateKey}`), () => ({
    doneCount,
    readingCount,
  }));
  return { doneCount, readingCount };
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

/**
 * 학번당 대표 UID 선택: 가장 최근에 가입한 기기가 이긴다 (last-wins).
 * listParticipants()는 UID 사전순으로 반환되므로, 정렬 없이 last-wins를 쓰면
 * 사전순으로 큰 UID가 뽑히는 버그가 있었음 (2026-09-15 김단아: 구 기기 zQ9…가
 * 현 기기 bcLb…를 덮어써 claim 39가 통째로 사라지고 대시보드 행도 구 기기를 가리킴).
 */
export function pickRosterPrimary(
  parts: { uid: string; p: Participation }[]
): Map<number, { uid: string; p: Participation }> {
  const sorted = [...parts].sort((a, b) => {
    const ja = a.p.joinedAt || 0;
    const jb = b.p.joinedAt || 0;
    if (ja !== jb) return ja - jb;
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  });
  const byRoster = new Map<number, { uid: string; p: Participation }>();
  for (const { uid, p } of sorted) {
    if (p.role === "student" && p.rosterNo != null && p.kind !== "guest" && p.kind !== "leader") {
      byRoster.set(p.rosterNo, { uid, p });
    }
  }
  return byRoster;
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
  const countable = targetVal?.kind !== "guest" && targetVal?.kind !== "leader";
  const primaryUid = targetUids[0];
  if (done) {
    if (!reason.trim()) throw new Error("사유를 입력해 주세요");
    const baseRecord = {
      reason: reason.trim(),
      byUid: me.uid,
      at: serverTimestamp(),
      ...(rosterNo != null ? { claimEra: true } : {}),
    };
    // 이미 실제로 완료된 학생이면 집계 건드리지 않음 (표시용 manual 기록만)
    let alreadyDone = false;
    for (const u of targetUids) {
      const ps = await get(ref(db, `${ROOT}/progress/${u}/${dateKey}/reportedStatus`)).catch(() => null);
      if (ps?.val() === "done") {
        alreadyDone = true;
        break;
      }
    }
    if (!countable || alreadyDone) {
      for (const u of targetUids) {
        await set(ref(db, `${ROOT}/manual/${u}/${dateKey}`), { ...baseRecord, done: true, credited: false });
      }
      return;
    }
    // 집계 +1은 정확히 한 번만: 학번 claim을 "manual:<리더UID>"로 선점 (리더 동시 클릭 멱등).
    // claim 트랜잭션이 이전 상태(reading/done)를 보고 델타를 계산하므로,
    // reading 중이던 학생을 인정해도 reading 카운트가 그대로 남는 이중 카운트가 없다.
    // NOTE: wonCredit은 트랜잭션 update 함수 안에서 정하지 않는다 — update 함수는
    // 로컬/서버 값으로 여러 번 실행될 수 있어 플래그가 오염된다. 트랜잭션 후 실제 claim으로 판정.
    let wonCredit = false;
    if (rosterNo != null) {
      await transactClaim(dateKey, rosterNo, (cur) => {
        if (cur && cur.uid.startsWith("manual:")) return undefined; // 이미 인정됨
        return { uid: `manual:${me.uid}`, status: "done", at: Date.now() };
      });
      const afterSnap = await get(claimRef(dateKey, rosterNo)).catch(() => null);
      const after = (afterSnap?.val() as RosterClaim | null) || null;
      wonCredit = after?.uid === `manual:${me.uid}` && after?.status === "done";
    } else if (countable) {
      // rosterNo 없는 예외 케이스 — 기존처럼 manual 레코드 트랜잭션으로 크레딧 선점
      const claimRes = await runTransaction(ref(db, `${ROOT}/manual/${primaryUid}/${dateKey}`), (cur: unknown) => {
        const c = cur as { credited?: boolean } | null;
        if (c?.credited) return; // abort — 이미 크레딧됨
        wonCredit = true;
        return { ...(c || {}), ...baseRecord, done: true, credited: true };
      });
      if (claimRes.committed && wonCredit) {
        await adjustAggregate(dateKey, "not-started", "done");
      }
    }
    // 모든 기기 entry에 표시용 기록 (크레딧은 primary만)
    for (const u of targetUids) {
      if (u === primaryUid) {
        const upd: Record<string, unknown> = { ...baseRecord, done: true };
        if (wonCredit) upd.credited = true;
        await update(ref(db, `${ROOT}/manual/${u}/${dateKey}`), upd);
      } else {
        await set(ref(db, `${ROOT}/manual/${u}/${dateKey}`), { ...baseRecord, done: true, credited: false });
      }
    }
    // NOTE: 학생 본인의 finalizeDayStatus는 manual.done을 보고 claim을 건드리지 않으며
    // manualCredited 플래그를 기록하므로 중복 가산 없음.
  } else {
    // 취소: grant 때 잡은 claim을 해제한다.
    // 단, 학생이 실제로 다 읽은 상태라면(real done) 그 +1은 실적으로 유지한다.
    const day = getChallengeDay(dateKey);
    const rawSnap = await get(ref(db, `${ROOT}/progress/${targetUid}/${dateKey}`)).catch(() => null);
    const raw = rawSnap?.val() as DayProgress | null;
    const realStatus: DayStatus = day
      ? realReadingStatus(day, raw)
      : raw?.reportedStatus === "reading"
        ? "reading"
        : "not-started";
    // 같은 학번의 다른 기기가 실제로 done이면 그 UID로 claim을 복원
    let realDoneUid: string | null = realStatus === "done" ? targetUid : null;
    if (!realDoneUid) {
      for (const u of targetUids) {
        if (u === targetUid) continue;
        const ps = await get(ref(db, `${ROOT}/progress/${u}/${dateKey}`)).catch(() => null);
        const pr = ps?.val() as DayProgress | null;
        const rs: DayStatus = day
          ? realReadingStatus(day, pr)
          : pr?.reportedStatus === "reading"
            ? "reading"
            : "not-started";
        if (rs === "done") {
          realDoneUid = u;
          break;
        }
      }
    }
    let reversed = false;
    if (countable && rosterNo != null) {
      let sawManualClaim = false;
      await transactClaim(dateKey, rosterNo, (cur) => {
        if (!cur || !cur.uid.startsWith("manual:")) return undefined; // 취소할 인정 없음 (멱등)
        sawManualClaim = true;
        if (realDoneUid) return { uid: realDoneUid, status: "done", at: Date.now() };
        reversed = true;
        return null; // 해제
      });
      if (!sawManualClaim) {
        // claim 이전(legacy)에 grant된 경우: manual 레코드의 credited 기준 회수
        const mSnap = await get(ref(db, `${ROOT}/manual/${primaryUid}/${dateKey}`)).catch(() => null);
        const mc = mSnap?.val() as { credited?: boolean } | null;
        if (mc?.credited && !realDoneUid) {
          await adjustAggregate(dateKey, "done", "not-started");
          reversed = true;
        }
      }
      if (sawManualClaim || reversed) {
        // grant 때 세운 primary 표시 레코드도 취소 상태로 변경
        // (안 하면 대시보드에 ✅가 계속 뜨고 학생 finalize가 manualDone으로 오인한다)
        await update(ref(db, `${ROOT}/manual/${primaryUid}/${dateKey}`), {
          done: false,
          credited: false,
          reversed,
          reason: reason.trim(),
          byUid: me.uid,
          at: serverTimestamp(),
        });
      }
    } else if (countable) {
      // legacy: rosterNo 없음
      const res = await runTransaction(ref(db, `${ROOT}/manual/${primaryUid}/${dateKey}`), (cur: unknown) => {
        const c = cur as { done?: boolean; credited?: boolean } | null;
        if (!c?.done) return; // abort — 취소할 인정이 없음 (멱등)
        if (c.credited && realStatus !== "done") reversed = true;
        return {
          ...c,
          done: false,
          credited: false,
          reversed,
          reason: reason.trim(),
          byUid: me.uid,
          at: serverTimestamp(),
        };
      });
      if (res.committed && reversed) {
        await adjustAggregate(dateKey, "done", "not-started");
      }
    } else {
      await update(ref(db, `${ROOT}/manual/${primaryUid}/${dateKey}`), {
        done: false,
        reason: reason.trim(),
        byUid: me.uid,
        at: serverTimestamp(),
      });
    }
    for (const u of targetUids) {
      if (u === primaryUid) continue;
      await update(ref(db, `${ROOT}/manual/${u}/${dateKey}`), {
        done: false,
        credited: false,
        reversed: false,
        reason: reason.trim(),
        byUid: me.uid,
        at: serverTimestamp(),
      });
    }
    // 학생의 다음 finalize가 manualCredited 플래그를 보고 집계를 건드리지 않고 reportedStatus만 동기화한다.
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

/**
 * 리더 전용: 참가 기록 삭제 (고아/중복 UID 정리).
 * - participants/progress/manual/encouragements 노드를 삭제한다
 * - 명단 학생이면: 삭제 UID가 잡고 있던 학번 claim을 같은 학번의 남은 UID 기준으로 재계산하고,
 *   claim 이전(legacy)에 집계된 reportedStatus가 있으면 직접 회수한다
 * - 게스트/리더 읽기는 집계에 포함된 적 없으므로 기록만 삭제한다
 */
export async function deleteParticipantRecord(targetUid: string): Promise<void> {
  await assertLeader();
  const me = auth.currentUser!.uid;
  const pSnap = await get(ref(db, `${ROOT}/participants/${targetUid}`)).catch(() => null);
  const p = pSnap?.val() as Participation | null;
  if (!p) throw new Error("참가 기록을 찾을 수 없습니다");
  const rosterNo: number | null = p.rosterNo ?? null;
  const countable = p.role === "student" && p.kind !== "guest" && p.kind !== "leader";

  if (countable && rosterNo != null) {
    const today = sgDateKey();
    const dates = CHALLENGE_SCHEDULE.filter((d) => d.date <= today).map((d) => d.date);
    const all = await listParticipants().catch(() => [] as { uid: string; p: Participation }[]);
    const others = all
      .filter(
        ({ uid, p: q }) =>
          uid !== targetUid &&
          q.role === "student" &&
          q.rosterNo === rosterNo &&
          q.kind !== "guest" &&
          q.kind !== "leader"
      )
      .map(({ uid }) => uid);
    const progSnap = await get(ref(db, `${ROOT}/progress/${targetUid}`)).catch(() => null);
    const progAll = (progSnap?.val() as Record<string, DayProgress>) || {};

    for (const dateKey of dates) {
      const day = getChallengeDay(dateKey);
      const dp = progAll[dateKey];
      const st = dp?.reportedStatus;
      const isClaimEra = dp?.claimEra === true;
      // 남은 UID 중 최고 실상태 계산
      let best: CountedStatus | null = null;
      let bestUid: string | null = null;
      let manualHold = false;
      let manualHoldUid: string | null = null;
      for (const ou of others) {
        const m = await getManualOverride(ou, dateKey).catch(() => null);
        if (m?.done) {
          manualHold = true;
          manualHoldUid = ou;
          break;
        }
        const ps = await get(ref(db, `${ROOT}/progress/${ou}/${dateKey}`)).catch(() => null);
        const pr = (ps?.val() as DayProgress | null) || null;
        const rs: DayStatus = day ? realReadingStatus(day, pr) : pr?.status || "not-started";
        if (rs === "done") {
          best = "done";
          bestUid = ou;
          break;
        }
        if (rs === "reading" && !best) {
          best = "reading";
          bestUid = ou;
        }
      }
      // claim 정리: 삭제 대상이 소유한 claim만 재선거/해제한다.
      // - 다른 기기가 소유한 claim은 그 기기의 기여이므로 유지 (삭제 대상은 기여 0)
      // - 수동 인정 claim은 남은 기기에 유효한 인정이 있으면 유지, 아니면 해제
      let releasedByMe = false;
      await transactClaim(dateKey, rosterNo, (cur) => {
        if (!cur) return undefined;
        const ownsClaim = cur.uid === targetUid;
        const isManualClaim = cur.uid.startsWith("manual:");
        if (!ownsClaim && !isManualClaim) return undefined; // 다른 기기 소유 — 유지
        if (isManualClaim && manualHold) return undefined; // 남은 기기의 수동 인정 유지
        releasedByMe = true;
        if (!isManualClaim && manualHoldUid) {
          // 남은 기기에 유효한 수동 인정이 있으면 claim을 수동 인정으로 전환
          return { uid: `manual:${me}`, status: "done", at: Date.now() };
        }
        if (best && bestUid) return { uid: bestUid, status: best, at: Date.now() };
        return null; // 해제 (transactClaim이 집계 델타 처리)
      }); // 실패하면 throw — 조용히 삼키면 claim/집계가 어긋난다
      // legacy 회수: claim 시대 이전 기록만, claim 트랜잭션이 처리하지 않은 경우에만 직접 회수
      // (claim 시대 기록은 claim 소유자만 집계에 기여하므로, 소유자가 아니면 회수 금지)
      if (!isClaimEra && !releasedByMe && (st === "done" || st === "reading")) {
        const mSnap = await get(ref(db, `${ROOT}/manual/${targetUid}/${dateKey}`)).catch(() => null);
        const mc = (mSnap?.val() as { done?: boolean; credited?: boolean; claimEra?: boolean } | null) || null;
        if (mc?.done && mc?.credited && !mc?.claimEra) {
          await adjustAggregate(dateKey, "done", "not-started").catch(() => {});
        } else if (!dp?.manualCredited && dp?.reportedKind !== "guest" && dp?.reportedKind !== "leader") {
          await adjustAggregate(dateKey, st, "not-started").catch(() => {});
        }
      }
    }
  }

  await remove(ref(db, `${ROOT}/participants/${targetUid}`));
  await remove(ref(db, `${ROOT}/progress/${targetUid}`)).catch(() => {});
  // manual/encouragements는 RTDB 규칙이 {uid}/{date} (또는 {uid}/{msgId}) 단위 쓰기만 허용하므로
  // 날짜별로 제거한다. (노드 통째 remove는 permission_denied로 조용히 실패했다)
  for (const d of CHALLENGE_SCHEDULE) {
    await remove(ref(db, `${ROOT}/manual/${targetUid}/${d.date}`)).catch(() => {});
  }
  try {
    const encSnap = await get(ref(db, `${ROOT}/encouragements/${targetUid}`));
    const enc = (encSnap.val() as Record<string, unknown> | null) || {};
    for (const msgId of Object.keys(enc)) {
      await remove(ref(db, `${ROOT}/encouragements/${targetUid}/${msgId}`)).catch(() => {});
    }
  } catch {}
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
  // push() 키 사용 — Date.now() 키는 같은 밀리초에 덮어쓸 수 있음
  const msgRef = push(ref(db, `${ROOT}/encouragements/${targetUid}`));
  await set(msgRef, {
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
