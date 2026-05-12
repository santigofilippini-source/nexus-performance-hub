const crypto  = require('crypto');
const getRaw  = require('raw-body');
const admin   = require('./_lib/admin');

module.exports.config = { api: { bodyParser: false } };

const VARIANT_TO_TIER = () => ({
  [process.env.LS_VARIANT_PRO]:   'pro',
  [process.env.LS_VARIANT_ELITE]: 'elite',
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody;
  try { rawBody = await getRaw(req, { limit: '1mb' }); }
  catch { return res.status(400).json({ error: 'No se pudo leer el body' }); }

  // Verify LemonSqueezy signature
  const hash = crypto
    .createHmac('sha256', process.env.LS_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  if (hash !== req.headers['x-signature']) {
    return res.status(400).json({ error: 'Firma inválida' });
  }

  const payload     = JSON.parse(rawBody.toString());
  const eventName   = payload.meta?.event_name;
  const customData  = payload.meta?.custom_data || {};
  const subAttrs    = payload.data?.attributes || {};
  const teamId      = customData.teamId;

  if (!teamId) return res.json({ received: true });

  const db = admin.database();

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated': {
      const tier = VARIANT_TO_TIER()[String(subAttrs.variant_id)]
        || customData.tier
        || 'pro';
      const isActive = ['active', 'on_trial'].includes(subAttrs.status);
      await db.ref(`teams/${teamId}/subscription`).update({
        tier:             isActive ? tier : 'free',
        status:           subAttrs.status,
        lsSubscriptionId: String(payload.data.id),
        lsCustomerId:     String(subAttrs.customer_id),
        currentPeriodEnd: subAttrs.renews_at || null,
        manualOverride:   false,
      });
      break;
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      await db.ref(`teams/${teamId}/subscription`).update({
        tier:             'free',
        status:           'cancelled',
        lsSubscriptionId: null,
        currentPeriodEnd: null,
      });
      break;
    }

    case 'subscription_payment_failed': {
      await db.ref(`teams/${teamId}/subscription`).update({ status: 'past_due' });
      break;
    }
  }

  res.json({ received: true });
};
