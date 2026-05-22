const admin = require('./_lib/admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let callerUid;
  try { callerUid = (await admin.auth().verifyIdToken(token)).uid; }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { action, tid, uid } = req.body;
  if (!action || !tid || !uid) return res.status(400).json({ error: 'Missing params' });

  const db = admin.database();

  // Verify caller is owner or editor of the team
  const callerMembSnap = await db.ref(`users/${callerUid}/memberships/${tid}`).get();
  const callerRole = callerMembSnap.val()?.role;
  if (!callerMembSnap.exists() || (callerRole !== 'owner' && callerRole !== 'editor')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Load the join request
  const reqSnap = await db.ref(`teams/${tid}/joinRequests/${uid}`).get();
  if (!reqSnap.exists()) return res.status(404).json({ error: 'Request not found' });
  const joinReq = reqSnap.val();

  if (action === 'approve') {
    const today = new Date().toISOString().split('T')[0];
    const membershipData = { role: 'athlete', catId: joinReq.catId, pid: joinReq.pid, joinedAt: today, _jc: joinReq._jc };
    const memberPermData = { role: 'athlete', catId: joinReq.catId, pid: joinReq.pid };
    await db.ref().update({
      [`users/${uid}/memberships/${tid}`]: membershipData,
      [`teams/${tid}/memberIndex/${uid}`]: { email: joinReq.email, role: 'athlete', displayName: joinReq.displayName || '' },
      [`teams/${tid}/memberPermissions/${uid}`]: memberPermData,
      [`teams/${tid}/joinRequests/${uid}`]: null,
      [`users/${uid}/pendingJoinRequests/${tid}`]: null,
    });
    // Notify the athlete via push — best-effort
    try {
      const subSnap = await db.ref(`users/${uid}/pushSub`).get();
      if (subSnap.exists()) {
        const webpush = require('web-push');
        webpush.setVapidDetails(
          'mailto:santigofilippini@gmail.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        await webpush.sendNotification(subSnap.val(), JSON.stringify({
          title: '¡Solicitud aprobada!',
          body: `Ya podés acceder a ${joinReq.teamName} como ${joinReq.playerName}.`,
          url: '/'
        }));
      }
    } catch {}
    return res.json({ ok: true });
  }

  if (action === 'reject') {
    await db.ref().update({
      [`teams/${tid}/joinRequests/${uid}`]: null,
      [`users/${uid}/pendingJoinRequests/${tid}`]: { status: 'rejected', teamName: joinReq.teamName },
    });
    return res.json({ ok: true });
  }

  res.status(400).json({ error: 'Invalid action' });
};
