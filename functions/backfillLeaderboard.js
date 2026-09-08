// functions/backfillLeaderboard.js
//
// One-time backfill: populates /leaderboardGlobal from the existing /groups
// data. Run ONCE after deploying mirrorMemberToLeaderboard (Blaze, Oct 2026).
// The function keeps the node fresh afterwards; this script is only for the
// initial fill.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
//   FIREBASE_DATABASE_URL=https://teens-bible-94271-default-rtdb.firebaseio.com \
//   node backfillLeaderboard.js
//
// Self-contained on purpose (duplicates the small helpers from
// leaderboardAggregate.js) so it never depends on the deployed module.

const admin = require("firebase-admin");

const TEST_PATTERNS = /^(test|admin|debug|demo|bot|fake|tmp)/i;
const AGG_FIELDS = [
  "nickname",
  "xp",
  "streak",
  "chaptersRead",
  "quizCorrect",
  "quizTotal",
  "lastActive",
  "avatar",
  "joinedAt",
];

function isValidMember(rec) {
  if (!rec || typeof rec !== "object") return false;
  const n = rec.nickname;
  if (!n || n.trim() === "" || n === "Anonymous") return false;
  if (TEST_PATTERNS.test(n)) return false;
  return true;
}

function toAggregate(uid, groupCode, rec) {
  const agg = { uid, groupCode };
  for (const f of AGG_FIELDS) agg[f] = rec[f] ?? null;
  return agg;
}

async function main() {
  if (!process.env.FIREBASE_DATABASE_URL) {
    throw new Error("FIREBASE_DATABASE_URL env is required");
  }
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  const db = admin.database();

  const groups = (await db.ref("groups").get()).val() || {};
  const groupCodes = Object.keys(groups);
  console.log(`Groups: ${groupCodes.length}`);

  // Dedupe by uid: keep the highest-XP valid record (same rule as client).
  const memberMap = new Map();
  let raw = 0;
  for (const [gCode, gData] of Object.entries(groups)) {
    const members = (gData && gData.members) || {};
    for (const [uid, rec] of Object.entries(members)) {
      raw++;
      if (!isValidMember(rec)) continue;
      const existing = memberMap.get(uid);
      if (!existing || (rec.xp || 0) > (existing.rec.xp || 0)) {
        memberMap.set(uid, { groupCode: gCode, rec });
      }
    }
  }
  console.log(`Raw rows: ${raw}, unique valid members: ${memberMap.size}`);

  const updates = {};
  for (const [uid, { groupCode, rec }] of memberMap) {
    updates[`leaderboardGlobal/${uid}`] = toAggregate(uid, groupCode, rec);
  }
  await db.ref().update(updates);
  console.log(`Backfilled leaderboardGlobal with ${memberMap.size} members.`);

  // Sanity check: read back the node size.
  const check = (await db.ref("leaderboardGlobal").get()).val() || {};
  console.log(`Verify: leaderboardGlobal now has ${Object.keys(check).length} entries.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Backfill failed:", e);
  process.exit(1);
});
