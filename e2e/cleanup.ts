/**
 * 프로덕션 E2E 정리 스크립트 (실제 앱 함수 사용)
 * - 임시 리더 세션으로 실제 deleteParticipantRecord 실행
 * - 게스트 가입/삭제, 리더 읽기참여 가입/삭제 테스트 포함
 * - 테스트 UID 5개 삭제 후 최종 상태 검증
 */
import { execSync } from "node:child_process";
import { auth, db } from "../client/src/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { ref, get } from "firebase/database";
import {
  joinAsGuest,
  joinAsLeaderReader,
  deleteParticipantRecord,
} from "../client/src/lib/challenge";

const ROOT = "challenges/jezaban2026";
const DATE = "2026-09-15";
const admin = (args: string) =>
  execSync(`npx firebase-tools database:${args} 2>/dev/null`, { encoding: "utf8" }).trim();
const dbget = (p: string) => admin(`get /${p}`);
const dbset = (p: string, v: string) =>
  execSync(`npx firebase-tools database:set --force /${p} 2>/dev/null`, { encoding: "utf8", input: v }).trim();
const dbupdate = (p: string, v: string) =>
  execSync(`npx firebase-tools database:update --force /${p} 2>/dev/null`, { encoding: "utf8", input: v }).trim();
const dbremove = (p: string) => admin(`remove --force /${p}`);

// 내 테스트 UID (claimtest.ts가 생성)
const TEST_UIDS = {
  A: "uEhl273alROo80kynJwh0h2NDt82", // 이아인 done (claim38 소유)
  B: "lEUKqj6BWIbHdCLzsdAMEqQ6lSm2", // 이아인 done (미집계)
  C: "zYFm42sfwEe6IhLNtPJUP4L1S0i2", // 이아인 reading (미집계)
  E1: "zSwv1mwVEoerh1K5HX0CuySm7lC2", // 김단아 reading (미집계)
  E2: "PrjsDIvUApZnkudIW5YKf3kVKTL2", // 김단아 reading (미집계, 실수 생성)
};
// 실제 학생 기기 (손대지 않음)
const REAL_KIMDANA = ["bcLb49pDWebVTRovOTYKfEKluAI3", "zQ9elql9DBMiqXGXWG97ixuZqoH2"];

async function readState(db: any) {
  const agg = (await get(ref(db, `${ROOT}/aggregate/${DATE}`))).val() || {};
  const claims = (await get(ref(db, `${ROOT}/rosterClaims/${DATE}`))).val() || {};
  return { agg, claims };
}

async function main() {
  const cred = await signInAnonymously(auth);
  const L = cred.user.uid;
  console.log("임시 리더 UID:", L.slice(0, 8));

  // 1) admin으로 leaderClaims 부여
  const proof = dbget(`${ROOT}/config/codeHashLeader`).replace(/"/g, "");
  dbset(`${ROOT}/leaderClaims/${L}`, `{"proof":"${proof}","name":"E2E정리","joinedAt":${Date.now()}}`);
  console.log("leaderClaims 부여 완료");

  // 2) 테스트 UID progress에 claimEra 마커 백필 (삭제 로직 검증용)
  for (const u of Object.values(TEST_UIDS)) {
    dbupdate(`${ROOT}/progress/${u}/${DATE}`, `{"claimEra":true}`);
  }
  console.log("claimEra 백필 완료");

  const before0 = await readState(db);
  console.log("시작 집계:", JSON.stringify(before0.agg), "claims:", Object.keys(before0.claims));

  // 3) 게스트 가입/삭제 테스트
  const g0 = (await readState(db)).agg;
  await joinAsGuest("게스트삭제예정");
  const gp = (await get(ref(db, `${ROOT}/participants/${L}`))).val();
  const g1 = (await readState(db)).agg;
  console.log("게스트 가입:", gp?.kind, "| 집계 변화:", JSON.stringify(g0), "->", JSON.stringify(g1));
  await deleteParticipantRecord(L);
  const gpAfter = (await get(ref(db, `${ROOT}/participants/${L}`))).val();
  const g2 = (await readState(db)).agg;
  console.log("게스트 삭제:", gpAfter === null ? "제거됨" : "남음!", "| 집계:", JSON.stringify(g2));

  // 4) 리더 읽기참여 가입/삭제 테스트
  await joinAsLeaderReader("리더삭제예정");
  const lp = (await get(ref(db, `${ROOT}/participants/${L}`))).val();
  const l1 = (await readState(db)).agg;
  console.log("리더읽기 가입:", lp?.kind, "| 집계 변화:", JSON.stringify(g2), "->", JSON.stringify(l1));
  await deleteParticipantRecord(L);
  const lpAfter = (await get(ref(db, `${ROOT}/participants/${L}`))).val();
  const l2 = (await readState(db)).agg;
  console.log("리더읽기 삭제:", lpAfter === null ? "제거됨" : "남음!", "| 집계:", JSON.stringify(l2));

  // 5) 테스트 UID 5개 삭제 (B, C, A, E1, E2 순)
  for (const key of ["B", "C", "A", "E1", "E2"] as const) {
    const u = TEST_UIDS[key];
    const b = await readState(db);
    await deleteParticipantRecord(u);
    const a = await readState(db);
    const gone = (await get(ref(db, `${ROOT}/participants/${u}`))).val() === null;
    console.log(`삭제 ${key}(${u.slice(0, 8)}): 제거=${gone} | done ${b.agg.doneCount}->${a.agg.doneCount}, reading ${b.agg.readingCount}->${a.agg.readingCount}`);
  }

  // 6) admin 마무리: 리더 회수 + 실제학생 manual 잔여물 제거
  dbremove(`${ROOT}/leaderClaims/${L}`);
  for (const u of REAL_KIMDANA) dbremove(`${ROOT}/manual/${u}/${DATE}`);
  console.log("leaderClaims 회수 + manual 잔여물 제거 완료");

  // 7) 최종 검증
  const fin = await readState(db);
  const parts = (await get(ref(db, `${ROOT}/participants`))).val() || {};
  const remaining = Object.keys(TEST_UIDS).filter((k) =>
    Object.keys(parts).includes((TEST_UIDS as any)[k])
  );
  const realKept = REAL_KIMDANA.every((u) => !!parts[u]);
  console.log("최종 집계:", JSON.stringify(fin.agg));
  console.log("최종 claims:", JSON.stringify(fin.claims));
  console.log("테스트 UID 잔류:", remaining.length === 0 ? "없음" : remaining);
  console.log("실제 김단아 기기 보존:", realKept ? "OK" : "문제!");
  console.log("전체 참가자 수:", Object.keys(parts).length);
}

main().catch((e) => {
  console.error("실패:", e);
  process.exit(1);
});
