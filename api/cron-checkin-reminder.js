const admin   = require('./_lib/admin');
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:santigofilippini@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const db = admin.database();
  const today = new Date().toISOString().split('T')[0];

  const usersSnap = await db.ref('users').get();
  if (!usersSnap.exists()) return res.json({ sent: 0 });

  const users = usersSnap.val();
  let sent = 0;

  await Promise.allSettled(Object.entries(users).map(async ([uid, userData]) => {
    if (!userData.pushSub) return;
    const memberships = userData.memberships || {};
    const athleteEntries = Object.entries(memberships).filter(([, m]) => m.role === 'athlete');
    if (!athleteEntries.length) return;

    for (const [tid, m] of athleteEntries) {
      const { catId, pid } = m;
      if (!catId || !pid) continue;
      const wellSnap = await db.ref(`teams/${tid}/categories/${catId}/sessions/${today}/wellness/${pid}`).get();
      if (wellSnap.exists()) return; // already checked in today
    }

    await webpush.sendNotification(
      userData.pushSub,
      JSON.stringify({
        title: 'Check-in de wellness',
        body: '¿Cómo te sentís hoy? Completá tu check-in diario.',
        url: '/',
      })
    );
    sent++;
  }));

  res.json({ sent });
};
