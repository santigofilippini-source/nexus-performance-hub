const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin  = require('./_lib/admin');

const PRICE_IDS = {
  pro:   process.env.STRIPE_PRICE_PRO,
  elite: process.env.STRIPE_PRICE_ELITE,
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { teamId, tier, idToken } = req.body;

  if (!PRICE_IDS[tier]) return res.status(400).json({ error: 'Tier inválido' });

  // Verify Firebase Auth token
  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Verify requester is the team owner
  const memberSnap = await admin.database()
    .ref(`users/${uid}/memberships/${teamId}`).get();
  if (!memberSnap.exists() || memberSnap.val()?.role !== 'owner') {
    return res.status(403).json({ error: 'Solo el owner puede cambiar la suscripción' });
  }

  // If team already has a Stripe subscription, send to Customer Portal instead
  const subSnap = await admin.database()
    .ref(`teams/${teamId}/subscription`).get();
  const existingCustomerId = subSnap.val()?.stripeCustomerId;
  const existingSubId      = subSnap.val()?.stripeSubscriptionId;

  if (existingSubId) {
    const portal = await stripe.billingPortal.sessions.create({
      customer:   existingCustomerId,
      return_url: process.env.APP_URL,
    });
    return res.json({ url: portal.url });
  }

  // Create new Checkout Session
  const user    = await admin.auth().getUser(uid);
  const session = await stripe.checkout.sessions.create({
    mode:           'subscription',
    customer_email: user.email,
    line_items:     [{ price: PRICE_IDS[tier], quantity: 1 }],
    metadata:       { teamId, uid, tier },
    subscription_data: { metadata: { teamId, uid, tier } },
    success_url: `${process.env.APP_URL}?upgrade=success&tier=${tier}`,
    cancel_url:  `${process.env.APP_URL}?upgrade=cancelled`,
  });

  res.json({ url: session.url });
};
