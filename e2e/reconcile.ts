/**
 * reconcileAggregate로 9/15 집계/claim 원장을 실제 기록 기준으로 복원.
 * - 임시 리더 L2 (익명 + admin leaderClaim)
 * - reconcileAggregate(D) → 실제 progress/manual 기준 재계산 (고아 claim 38 제거됨)
 * - 결과 검증 후 L2 회수
 * 로그는 파일에 기록 (kill돼도 남음).
 */
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import { auth } from "../client/src/lib/firebase";
import { signInAnonymously, signOut } from "firebase/auth";
import {
  reconcileAggregate,
  getAggregate,
  getRosterClaims,
  sgDateKey,
} from "../client/src/lib/challenge";

const ROOT = "challenges/jezaban2026";
const LOG = "/tmp/reconcile.log";
const log = (m: string) => {
  fs.appendFileSync(LOG, m + "\n");
  console.log(m);
};
const admin = (args: string) =>
  execSync(`npx firebase-tools database:${args} 2>/dev/null`, { encoding: "utf8" }).trim();
const dbset = (p: string, v: string) =>
  execSync(`npx firebase-tools database:set --force /${p} 2>/dev/null`, { encoding: "utf8", input: v }).trim();

async function main() {
  fs.writeFileSync(LOG, "");
  const D = sgDateKey();
  await signInAnonymously(auth);
  const L = auth.currentUser!.uid;
  const proof = admin(`get /${ROOT}/config/codeHashLeader`).replace(/"/g, "");
  dbset(`${ROOT}/leaderClaims/${L}`, `{"proof":"${proof}","name":"E2E-reconcile","joinedAt":${Date.now()}}`);
  log(`L2=${L.slice(0, 8)} date=${D}`);

  const before = await getAggregate(D);
  log(`before: done ${before.doneCount} / reading ${before.readingCount}`);
  log(`claims before: ${JSON.stringify(await getRosterClaims(D))}`);

  const res = await reconcileAggregate(D);
  log(`reconcile → done ${res.doneCount} / reading ${res.readingCount}`);

  const agg = await getAggregate(D);
  const claims = (await getRosterClaims(D)) as Record<number, { uid: string; status: string }>;
  log(`after: done ${agg.doneCount} / reading ${agg.readingCount}`);
  log(`claims after: ${JSON.stringify(claims)}`);
  const keys = Object.keys(claims).sort().join(",");
  const ok =
    agg.doneCount === 1 && agg.readingCount === 1 &&
    keys === "32,39" &&
    claims[32]?.status === "done" && claims[32]?.uid.startsWith("oiBX1Aht") &&
    claims[39]?.status === "reading" && claims[39]?.uid.startsWith("bcLb49pD");
  log(`복원 검증: ${ok ? "OK" : "실패!"}`);

  await signOut(auth);
  admin(`remove --force /${ROOT}/leaderClaims/${L}`);
  log(`L2 회수: ${admin(`get /${ROOT}/leaderClaims/${L}`) === "null" ? "OK" : "실패"}`);
  log(`종합: ${ok ? "PASS" : "FAIL"}`);
}

main().catch((e) => {
  log("FATAL: " + (e as Error).message);
  process.exit(1);
});
