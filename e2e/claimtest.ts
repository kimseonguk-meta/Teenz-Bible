// 제자반 챌린지 E2E 테스트 — 프로덕션 RTDB 대상, 앱 실제 함수 사용
// 사용법:
//   npx tsx e2e/claimtest.ts read                       # 오늘 집계+claim 조회
//   npx tsx e2e/claimtest.ts run <실명> <done|reading>   # 익명 가입→finalize→전후 집계 출력
// 각 실행은 별도 프로세스 = 별도 익명 UID (중복 기기 시뮬레이션)

import { getDatabase, ref, get } from "firebase/database";
import { auth, db, signInAnonymously } from "../client/src/lib/firebase";
import {
  joinChallenge,
  finalizeDayStatus,
  sgDateKey,
  getAggregate,
  getRosterClaims,
  type DayStatus,
} from "../client/src/lib/challenge";

async function readState(dateKey: string) {
  const agg = await getAggregate(dateKey).catch((e) => ({ error: String(e) }));
  const claims = await getRosterClaims(dateKey).catch((e) => ({ error: String(e) }));
  return { agg, claims };
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const dateKey = sgDateKey();
  await signInAnonymously(auth);
  const me = auth.currentUser!.uid;

  if (cmd === "read") {
    console.log(JSON.stringify({ dateKey, me, ...(await readState(dateKey)) }, null, 1));
    process.exit(0);
  }

  if (cmd === "run") {
    const [name, status] = args as [string, DayStatus];
    const before = await readState(dateKey);
    const part = await joinChallenge("student", name);
    await finalizeDayStatus(dateKey, status);
    const after = await readState(dateKey);
    console.log(
      JSON.stringify(
        { dateKey, me, name, rosterNo: part.rosterNo, status, before, after },
        null,
        1
      )
    );
    process.exit(0);
  }

  console.error("unknown cmd");
  process.exit(1);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
