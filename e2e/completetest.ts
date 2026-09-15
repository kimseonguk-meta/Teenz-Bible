/**
 * 챌린지 하루 완독 E2E — 프로덕션 RTDB 대상, 앱 실제 함수 사용
 * Bible.tsx 읽기 틱의 실제 호출 순서 그대로:
 *   saveChapterProgress → evaluateAndFinalizeDay → (status==="done"이면 앱에서 "🎉 오늘의 챌린지 완료!" 토스트)
 * - 마태 14장만: status "reading" (하루 미완료)
 * - 마태 15장까지: status "done" (하루 완료 = 토스트 조건)
 * - claim 38 / 집계(2/1) / progress 상태 검증 후 테스트 기록 삭제·원복
 */
import { execSync } from "node:child_process";
import { auth, db } from "../client/src/lib/firebase";
import { signInAnonymously, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import {
  joinChallenge,
  saveChapterProgress,
  evaluateAndFinalizeDay,
  getAggregate,
  getRosterClaims,
  getDayProgress,
  sgDateKey,
} from "../client/src/lib/challenge";

const ROOT = "challenges/jezaban2026";
const admin = (args: string) =>
  execSync(`npx firebase-tools database:${args} 2>/dev/null`, { encoding: "utf8" }).trim();
const dbremove = (p: string) => admin(`remove --force /${p}`);

const WORDS = 600; // requiredActiveSec = max(45, 57) = 57s
const seen14 = Array.from({ length: 28 }, (_, i) => i);
const seen15 = Array.from({ length: 32 }, (_, i) => i);

async function main() {
  const D = sgDateKey();
  await signInAnonymously(auth);
  const S = auth.currentUser!.uid;
  await joinChallenge("student", "이아인");
  console.log("학생 S:", S.slice(0, 8), "| date:", D);

  // 1) 마태 14장 완독 (노출 100%, 활성 65s ≥ 57s)
  await saveChapterProgress(D, "Matthew_14", {
    exposurePct: 100, activeSec: 65, quizPass: false, seen: seen14, words: WORDS,
  });
  const s1 = await evaluateAndFinalizeDay(D, { Matthew_14: WORDS });
  const p1 = await getDayProgress(D);
  console.log(`14장 후: status=${s1} (기대 reading) | progress.status=${p1?.status} reported=${p1?.reportedStatus}`);
  const step1ok = s1 === "reading";

  // 2) 마태 15장 완독 → 하루 완료
  await saveChapterProgress(D, "Matthew_15", {
    exposurePct: 100, activeSec: 70, quizPass: false, seen: seen15, words: WORDS,
  });
  const s2 = await evaluateAndFinalizeDay(D, { Matthew_15: WORDS });
  const p2 = await getDayProgress(D);
  console.log(`15장 후: status=${s2} (기대 done → 앱은 여기서 "🎉 오늘의 챌린지 완료!" 토스트)`);
  console.log(`progress: status=${p2?.status} reported=${p2?.reportedStatus} claimEra=${(p2 as any)?.claimEra}`);
  const step2ok = s2 === "done" && p2?.status === "done" && p2?.reportedStatus === "done";

  // 3) claim/집계 검증
  const agg = await getAggregate(D);
  const claims = (await getRosterClaims(D)) as Record<number, { uid: string; status: string }>;
  const c38 = claims[38];
  console.log(`집계: done ${agg.doneCount} / reading ${agg.readingCount} (기대 2/1)`);
  console.log(`claim38: uid=${c38?.uid.slice(0, 8)} status=${c38?.status} (기대 S/done)`);
  const step3ok = agg.doneCount === 2 && agg.readingCount === 1 && c38?.uid === S && c38?.status === "done";

  await signOut(auth);

  // 4) 정리 + 원복 확인 (admin)
  dbremove(`${ROOT}/participants/${S}`);
  dbremove(`${ROOT}/progress/${S}`);
  const aggF = await getAggregate(D).catch(() => null);
  // 집계는 finalize의 claim 트랜잭션으로 자동 회수되어야 함 — admin으로 재확인
  const claimsF = admin(`get /${ROOT}/rosterClaims/${D}`);
  const aggRaw = admin(`get /${ROOT}/aggregate/${D}`);
  const sGone = (await get(ref(db, `${ROOT}/participants/${S}`)).catch(() => ({ val: () => null }))).val() === null;
  console.log("정리 후 claims:", claimsF);
  console.log("정리 후 aggregate:", aggRaw, "| S 제거:", sGone ? "OK" : "확인필요(로그아웃 상태)");
  const restored = claimsF.includes('"32"') && claimsF.includes('"39"') && !claimsF.includes('"38"');
  console.log("E2E 종합:", step1ok && step2ok && step3ok && restored ? "PASS" : "FAIL",
    `| 1장:${step1ok ? "OK" : "실패"} 2장:${step2ok ? "OK" : "실패"} claim/집계:${step3ok ? "OK" : "실패"} 원복:${restored ? "OK" : "실패"}`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
