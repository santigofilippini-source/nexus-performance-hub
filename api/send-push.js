const admin   = require('./_lib/admin');
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:santigofilippini@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { await admin.auth().verifyIdToken(token); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { uids, pid, tid, catId, notifyStaff, title, body, url } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });

  const db = admin.database();
  let targetUids = [];

  if (uids?.length) {
    targetUids = uids;
  } else if (pid && tid && catId) {
    // Find uid of athlete by pid via users memberships
    const usersSnap = await db.ref('users').get();
    const users = usersSnap.val() || {};
    for (const [uid, userData] of Object.entries(users)) {
      const m = userData.memberships?.[tid];
      if (m?.catId === catId && m?.pid === pid) { targetUids = [uid]; break; }
    }
  } else if (notifyStaff && tid) {
    // Notify all coaches/staff in team (role !== 'athlete')
    const indexSnap = await db.ref(`teams/${tid}/memberIndex`).get();
    if (indexSnap.exists()) {
      targetUids = Object.entries(indexSnap.val())
        .filter(([, m]) => m.role !== 'athlete')
        .map(([uid]) => uid);
    }
  }

  if (!targetUids.length) return res.json({ sent: 0 });

  const payload = JSON.stringify({ title, body: body || '', url: url || '/' });
  const results = await Promise.allSettled(
    targetUids.map(async uid => {
      const subSnap = await db.ref(`users/${uid}/pushSub`).get();
      if (!subSnap.exists()) return;
      await webpush.sendNotification(subSnap.val(), payload);
    })
  );

  res.json({ sent: results.filter(r => r.status === 'fulfilled').length });
};
