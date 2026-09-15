/**
 * 수동 인정 grant/cancel E2E — 프로덕션 RTDB 대상, 앱 실제 함수 사용
 * - 임시 리더 L (익명 + admin leaderClaims)
 * - 테스트 학생 S (이아인/roster 38 신규 UID)
 * - grant → grant(멱등) → cancel → cancel(멱등), 매 단계 claim/집계 검증
 * - 종료 후 S 참가/진행/manual 잔여물 + L leaderClaim 제거, 집계 원복 확인
 */
import { execSync } from "node:child_process";
import { auth, db } from "../client/src/lib/firebase";
import { signInAnonymously, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import {
  joinChallenge,
  setManualOverride,
  getAggregate,
  getRosterClaims,
  sgDateKey,
} from "../client/src/lib/challenge";

const ROOT = "challenges/jezaban2026";
const admin = (args: string) =>
  execSync(`npx firebase-tools database:${args} 2>/dev/null`, { encoding: "utf8" }).trim();
const dbget = (p: string) => admin(`get /${p}`);
const dbset = (p: string, v: string) =>
  execSync(`npx firebase-tools database:set --force /${p} 2>/dev/null`, { encoding: "utf8", input: v }).trim();
const dbremove = (p: string) => admin(`remove --force /${p}`);

const ROSTER38_UIDS = [
  "FKhV87kjr5Tfe3psUaCgsUiBMuE2",
  "zt31cejjQDOnJyl8wnpg12V5SWD3",
  "7RQHt5diZAMa4b6O5vV5zSdoi1r1",
];

async function readState(dateKey: string) {
  const agg = await getAggregate(dateKey);
  const claims = await getRosterClaims(dateKey);
  return { agg, claims: claims as Record<number, { uid: string; status: string }> };
}

function show(label: string, s: { agg: { doneCount: number; readingCount: number }; claims: Record<number, { uid: string; status: string }> }, L: string) {
  const c38 = s.claims[38];
  const owner = c38 ? (c38.uid === `manual:${L}` ? "manual:L" : c38.uid.slice(0, 8)) : "없음";
  console.log(
    `${label}: done ${s.agg.doneCount} / reading ${s.agg.readingCount} | claim38=${owner}(${c38?.status || "-"})`
  );
}

async function main() {
  const D = sgDateKey();
  console.log("date:", D);

  // 1) 테스트 학생 S 가입
  await signInAnonymously(auth);
  const S = auth.currentUser!.uid;
  await joinChallenge("student", "이아인");
  await signOut(auth);
  console.log("학생 S:", S.slice(0, 8));

  // 2) 임시 리더 L
  await signInAnonymously(auth);
  const L = auth.currentUser!.uid;
  const proof = dbget(`${ROOT}/config/codeHashLeader`).replace(/"/g, "");
  dbset(`${ROOT}/leaderClaims/${L}`, `{"proof":"${proof}","name":"E2E수동","joinedAt":${Date.now()}}`);
  console.log("리더 L:", L.slice(0, 8));

  const s0 = await readState(D);
  show("시작      ", s0, L);

  // 3) grant
  await setManualOverride(S, D, true, "E2E grant");
  const s1 = await readState(D);
  show("grant 후  ", s1, L);
  const g1ok = s1.agg.doneCount === s0.agg.doneCount + 1 && s1.claims[38]?.uid === `manual:${L}` && s1.claims[38]?.status === "done";
  console.log("grant 검증:", g1ok ? "OK" : "실패!");

  // 4) grant 멱등
  await setManualOverride(S, D, true, "E2E grant2");
  const s2 = await readState(D);
  show("grant2 후 ", s2, L);
  const g2ok = s2.agg.doneCount === s1.agg.doneCount && s2.agg.readingCount === s1.agg.readingCount;
  console.log("grant 멱등:", g2ok ? "OK" : "실패!");

  // 5) cancel
  await setManualOverride(S, D, false, "E2E cancel");
  const s3 = await readState(D);
  show("cancel 후 ", s3, L);
  const c1ok = s3.agg.doneCount === s0.agg.doneCount && !s3.claims[38];
  console.log("cancel 검증:", c1ok ? "OK" : "실패!");

  // 6) cancel 멱등
  await setManualOverride(S, D, false, "E2E cancel2");
  const s4 = await readState(D);
  show("cancel2 후", s4, L);
  const c2ok = s4.agg.doneCount === s3.agg.doneCount && s4.agg.readingCount === s3.agg.readingCount;
  console.log("cancel 멱등:", c2ok ? "OK" : "실패!");

  await signOut(auth);

  // 7) 정리: S 참가/진행 제거, roster38 전체의 오늘 manual 잔여물 제거, L 회수
  dbremove(`${ROOT}/participants/${S}`);
  dbremove(`${ROOT}/progress/${S}`);
  for (const u of [...ROSTER38_UIDS, S]) dbremove(`${ROOT}/manual/${u}/${D}`);
  dbremove(`${ROOT}/leaderClaims/${L}`);
  console.log("정리 완료");

  // 8) 최종 검증
  const fin = await readState(D);
  show("최종      ", fin, L);
  const claimsOk = Object.keys(fin.claims).sort().join(",") === "32,39";
  const aggOk = fin.agg.doneCount === 1 && fin.agg.readingCount === 1;
  const sGone = (await get(ref(db, `${ROOT}/participants/${S}`))).val() === null;
  const lGone = dbget(`${ROOT}/leaderClaims/${L}`) === "null";
  console.log("claims 복원:", claimsOk ? "OK" : "실패!", "| 집계 복원:", aggOk ? "OK" : "실패!", "| S 제거:", sGone ? "OK" : "실패!", "| L 회수:", lGone ? "OK" : "실패!");
  console.log("E2E 종합:", g1ok && g2ok && c1ok && c2ok && claimsOk && aggOk && sGone && lGone ? "PASS" : "FAIL");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
