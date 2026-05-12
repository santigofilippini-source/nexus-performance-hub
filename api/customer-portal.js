const admin = require('./_lib/admin');

const LS_API = 'https://api.lemonsqueezy.com/v1';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { teamId, idToken } = req.body;

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const memberSnap = await admin.database()
    .ref(`users/${uid}/memberships/${teamId}`).get();
  if (!memberSnap.exists() || memberSnap.val()?.role !== 'owner') {
    return res.status(403).json({ error: 'Solo el owner puede gestionar la suscripción' });
  }

  const subSnap = await admin.database()
    .ref(`teams/${teamId}/subscription`).get();
  const lsSubId = subSnap.val()?.lsSubscriptionId;
  if (!lsSubId) return res.status(404).json({ error: 'Sin suscripción activa' });

  // Fetch fresh customer portal URL from LemonSqueezy
  const subRes = await fetch(`${LS_API}/subscriptions/${lsSubId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.LS_API_KEY}`,
      'Accept':        'application/vnd.api+json',
    },
  });
  const subData = await subRes.json();
  const url = subData.data?.attributes?.urls?.customer_portal;
  if (!url) return res.status(500).json({ error: 'No se pudo obtener el portal' });

  res.json({ url });
};
