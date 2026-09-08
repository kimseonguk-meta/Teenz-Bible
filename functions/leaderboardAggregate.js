// functions/leaderboardAggregate.js
//
// Maintains /leaderboardGlobal — a small pre-aggregated node for the Global
// ranking tab. Replaces the ~565KB full /groups download with a ~24KB read.
//
// Design basis (measured 2026-09-05 from backups/groups-2026-09-04.json):
//   - 25 groups, 1,150 unique uids, member records = 93% of /groups payload
//   - Aggregate keeps the fields the ranking UI actually uses:
//     nickname, xp, streak, chaptersRead, quizCorrect, quizTotal,
//     lastActive, avatar (shown in list), joinedAt ("NEW" badge + join date),
//     equippedFrame (frame styling), profilePhotoUrl (Storage URL only,
//     never base64), groupCode (dedupe bookkeeping)
//   - Estimated size: 139 ranked members x ~200B ~= 27KB (21x smaller)
//
// Deploy target: Blaze re-upgrade (Oct 2026). NOT deployable on Spark.
// Region must match the RTDB instance: us-central1
// (databaseURL is https://teens-bible-94271-default-rtdb.firebaseio.com,
//  the default US instance).

const { onValueWritten } = require("firebase-functions/v2/database");
const { getDatabase } = require("firebase-admin/database");
const { logger } = require("firebase-functions");

// Same test-account filter as the client (client/src/lib/firebase.ts).
const TEST_PATTERNS = /^(test|admin|debug|demo|bot|fake|tmp)/i;

// Fields the ranking UI needs. equippedFrame drives the frame styling and
// profilePhotoUrl shows the photo; both are used by Leaderboard.tsx.
// profilePhotoUrl is only copied when it is a short Storage URL — legacy
// base64 blobs are never carried in the aggregate (migrated Oct 2026).
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
  "equippedFrame",
  "profilePhotoUrl",
];

function isValidMember(rec) {
  if (!rec || typeof rec !== "object") return false;
  const n = rec.nickname;
  if (!n || n.trim() === "" || n === "Anonymous") return false;
  if (TEST_PATTERNS.test(n)) return false;
  // NOTE: 0-activity users are KEPT (root-cause fix 2026-09-05: new users
  // like Xxcd have 0 XP / 0 chapters but must still appear).
  return true;
}

function toAggregate(uid, groupCode, rec) {
  const agg = { uid, groupCode };
  for (const f of AGG_FIELDS) {
    if (f === "profilePhotoUrl") {
      // Short Storage URL only; never carry base64 blobs in the aggregate.
      const v = rec[f];
      agg[f] = typeof v === "string" && v.startsWith("http") ? v : null;
    } else {
      agg[f] = rec[f] ?? null;
    }
  }
  return agg;
}

// Slow path: rescan every group for this uid and keep the highest-XP valid
// record. Only runs when XP was lowered or the record was removed/deleted,
// which is rare (XP normally only grows).
async function findBestRecord(db, uid) {
  const snap = await db.ref("groups").get();
  const groups = snap.val();
  if (!groups) return null;
  let best = null;
  for (const [gCode, gData] of Object.entries(groups)) {
    const rec = gData && gData.members && gData.members[uid];
    if (!isValidMember(rec)) continue;
    if (!best || (rec.xp || 0) > (best.rec.xp || 0)) {
      best = { groupCode: gCode, rec };
    }
  }
  return best;
}

exports.mirrorMemberToLeaderboard = onValueWritten(
  {
    ref: "/groups/{groupCode}/members/{uid}",
    region: "us-central1",
  },
  async (event) => {
    const { groupCode, uid } = event.params;
    const db = getDatabase();
    const aggRef = db.ref(`/leaderboardGlobal/${uid}`);
    const after = event.data.after.val();

    if (isValidMember(after)) {
      // Fast path: keep whichever valid record has higher XP.
      const cur = (await aggRef.get()).val();
      if (!cur || (after.xp || 0) >= (cur.xp || 0)) {
        await aggRef.set(toAggregate(uid, groupCode, after));
        return;
      }
      // The aggregate currently comes from another group with higher XP:
      // nothing to do.
      if (cur.groupCode !== groupCode) return;
      // Otherwise this write lowered the XP of the owning group -> rescan.
    }
    // Record deleted/invalid, or owning group's XP lowered: rescan.
    const best = await findBestRecord(db, uid);
    if (best) {
      await aggRef.set(toAggregate(uid, best.groupCode, best.rec));
    } else {
      await aggRef.remove();
    }
    logger.info(`leaderboardGlobal updated for ${uid}`);
  }
);
