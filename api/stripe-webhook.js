const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getRaw  = require('raw-body');
const admin   = require('./_lib/admin');

// Disable Vercel's default body parser — Stripe needs the raw body to verify the signature
module.exports.config = { api: { bodyParser: false } };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody;
  try {
    rawBody = await getRaw(req, { limit: '1mb' });
  } catch {
    return res.status(400).json({ error: 'No se pudo leer el body' });
  }

  // Verify Stripe signature — rejects any request that didn't come from Stripe
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).json({ error: 'Firma inválida' });
  }

  const db = admin.database();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { teamId, tier } = session.metadata;
      if (!teamId) break;
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      await db.ref(`teams/${teamId}/subscription`).update({
        tier,
        status:               'active',
        stripeCustomerId:     session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd:     new Date(sub.current_period_end * 1000).toISOString(),
        manualOverride:       false,
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const { teamId, tier } = sub.metadata;
      if (!teamId) break;
      await db.ref(`teams/${teamId}/subscription`).update({
        tier:            sub.status === 'active' ? (tier || 'free') : 'free',
        status:          sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const { teamId } = sub.metadata;
      if (!teamId) break;
      await db.ref(`teams/${teamId}/subscription`).update({
        tier:                 'free',
        status:               'cancelled',
        stripeSubscriptionId: null,
        currentPeriodEnd:     null,
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (!invoice.subscription) break;
      const sub = await stripe.subscriptions.retrieve(invoice.subscription);
      const { teamId } = sub.metadata;
      if (!teamId) break;
      await db.ref(`teams/${teamId}/subscription`).update({ status: 'past_due' });
      break;
    }
  }

  res.json({ received: true });
};
