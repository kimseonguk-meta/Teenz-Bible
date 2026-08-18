const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

if (!getApps().length) initializeApp();

const DATABASE_URL = 'https://teens-bible-94271-default-rtdb.firebaseio.com';
const RECENT_SIGN_IN_SECONDS = 10 * 60;

const asObject = (value) => (value && typeof value === 'object' ? value : {});

const readBearerToken = (request) => {
  const header = String(request.get('authorization') || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || '';
};

const respondError = (response, status, code, message) => {
  response.status(status).json({ ok: false, code, message });
};

const buildCleanupUpdates = async (database, uid) => {
  const updates = {
    [`users/${uid}`]: null,
    [`userData/${uid}`]: null,
    [`userGroups/${uid}`]: null,
    [`notifications/${uid}`]: null,
    [`blocks/${uid}`]: null,
  };

  const [userGroupsSnapshot, groupMetaSnapshot, notificationsSnapshot, blocksSnapshot, feedbackSnapshot, reportsSnapshot, safetyReportsSnapshot] = await Promise.all([
    database.ref(`userGroups/${uid}`).get(),
    database.ref('groupMeta').get(),
    database.ref('notifications').get(),
    database.ref('blocks').get(),
    database.ref('feedbacks').get(),
    database.ref('reports').get(),
    database.ref('safetyReports').get(),
  ]);

  // Remove the departing account from every Crew it joined. Crew records for
  // remaining members are preserved, but references to the departing account
  // are removed, including any ownership marker if present.
  for (const groupCode of Object.keys(asObject(userGroupsSnapshot.val()))) {
    updates[`groups/${groupCode}/members/${uid}`] = null;
  }
  for (const [groupCode, meta] of Object.entries(asObject(groupMetaSnapshot.val()))) {
    if (meta?.ownerUid === uid) updates[`groupMeta/${groupCode}/ownerUid`] = null;
    if (meta?.creatorUid === uid) updates[`groupMeta/${groupCode}/creatorUid`] = null;
  }

  // Remove encouragements received by the user and ones they sent to others.
  for (const [recipientUid, notification] of Object.entries(asObject(notificationsSnapshot.val()))) {
    const encouragements = asObject(notification?.encouragements);
    if (encouragements[uid]) updates[`notifications/${recipientUid}/encouragements/${uid}`] = null;
    for (const [eventId, event] of Object.entries(encouragements)) {
      if (event?.senderUid === uid || event?.recipientUid === uid) {
        updates[`notifications/${recipientUid}/encouragements/${eventId}`] = null;
      }
    }
  }

  // Delete both the user's own block list and all other users' block entries
  // targeting this account.
  for (const blockerUid of Object.keys(asObject(blocksSnapshot.val()))) {
    updates[`blocks/${blockerUid}/${uid}`] = null;
  }

  // Remove feedback and reports that either originate from or identify this
  // account, so the deleted profile cannot remain discoverable in moderation data.
  for (const [id, record] of Object.entries(asObject(feedbackSnapshot.val()))) {
    if (record?.uid === uid || record?.userUid === uid || record?.authorUid === uid) {
      updates[`feedbacks/${id}`] = null;
    }
  }
  for (const [id, record] of Object.entries(asObject(reportsSnapshot.val()))) {
    if (record?.reporterUid === uid || record?.reportedUid === uid || record?.uid === uid || record?.userUid === uid || record?.authorUid === uid) {
      updates[`reports/${id}`] = null;
    }
  }
  for (const [id, record] of Object.entries(asObject(safetyReportsSnapshot.val()))) {
    if (record?.reporterUid === uid || record?.reportedUid === uid) updates[`safetyReports/${id}`] = null;
  }

  return updates;
};

exports.deleteOwnAccount = onRequest({
  region: 'us-central1',
  timeoutSeconds: 60,
  cors: true,
  invoker: 'public',
}, async (request, response) => {
  if (request.method !== 'POST') {
    respondError(response, 405, 'method_not_allowed', 'Use POST to request account deletion.');
    return;
  }

  const confirmation = String(request.body?.confirmation || '').trim();
  if (confirmation !== 'DELETE MY ACCOUNT') {
    respondError(response, 400, 'confirmation_required', 'Type DELETE MY ACCOUNT to confirm permanent deletion.');
    return;
  }

  const token = readBearerToken(request);
  if (!token) {
    respondError(response, 401, 'authentication_required', 'Please sign in again before deleting your account.');
    return;
  }

  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token, true);
    const authTime = Number(decoded.auth_time || 0);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!authTime || nowSeconds - authTime > RECENT_SIGN_IN_SECONDS) {
      respondError(response, 401, 'recent_sign_in_required', 'For your protection, sign in again and retry within 10 minutes.');
      return;
    }

    const uid = decoded.uid;
    const database = getDatabase(getApps()[0], DATABASE_URL);

    // Verify that the Auth user still exists before deleting application data.
    await auth.getUser(uid);
    const updates = await buildCleanupUpdates(database, uid);
    await database.ref().update(updates);
    await auth.deleteUser(uid);

    logger.info('Account deletion completed', { uid });
    response.status(200).json({ ok: true, deletedAt: Date.now() });
  } catch (error) {
    logger.error('Account deletion failed', error);
    const message = error?.code === 'auth/id-token-revoked'
      ? 'Your session expired. Please sign in again before deleting your account.'
      : 'We could not complete account deletion. Your account has not been confirmed as deleted. Please try again or contact support.';
    respondError(response, 500, 'account_deletion_failed', message);
  }
});
