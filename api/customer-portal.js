const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin  = require('./_lib/admin');

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
  const customerId = subSnap.val()?.stripeCustomerId;
  if (!customerId) return res.status(404).json({ error: 'Sin suscripción activa' });

  const session = await stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: process.env.APP_URL,
  });

  res.json({ url: session.url });
};
