const admin = require('./_lib/admin');

const LS_API = 'https://api.lemonsqueezy.com/v1';

const VARIANT_IDS = {
  pro:   process.env.LS_VARIANT_PRO,
  elite: process.env.LS_VARIANT_ELITE,
};

function lsHeaders() {
  return {
    'Authorization': `Bearer ${process.env.LS_API_KEY}`,
    'Accept':        'application/vnd.api+json',
    'Content-Type':  'application/vnd.api+json',
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { teamId, tier, idToken } = req.body;
  if (!VARIANT_IDS[tier]) return res.status(400).json({ error: 'Tier inválido' });

  // Verify Firebase Auth token
  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Verify requester is team owner
  const memberSnap = await admin.database()
    .ref(`users/${uid}/memberships/${teamId}`).get();
  if (!memberSnap.exists() || memberSnap.val()?.role !== 'owner') {
    return res.status(403).json({ error: 'Solo el owner puede cambiar la suscripción' });
  }

  // If already subscribed, redirect to customer portal
  const subSnap = await admin.database()
    .ref(`teams/${teamId}/subscription`).get();
  const lsSubId = subSnap.val()?.lsSubscriptionId;
  if (lsSubId) {
    const subRes = await fetch(`${LS_API}/subscriptions/${lsSubId}`, {
      headers: lsHeaders(),
    });
    const subData = await subRes.json();
    const portalUrl = subData.data?.attributes?.urls?.customer_portal;
    if (portalUrl) return res.json({ url: portalUrl });
  }

  // Create new checkout session
  const user = await admin.auth().getUser(uid);
  const checkoutRes = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: lsHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            custom: { teamId, uid, tier },
          },
          product_options: {
            redirect_url: `${process.env.APP_URL}?upgrade=success&tier=${tier}`,
          },
        },
        relationships: {
          store:   { data: { type: 'stores',   id: String(process.env.LS_STORE_ID) } },
          variant: { data: { type: 'variants', id: String(VARIANT_IDS[tier]) } },
        },
      },
    }),
  });

  const json = await checkoutRes.json();
  const url  = json.data?.attributes?.url;
  if (!url) return res.status(500).json({ error: 'No se pudo crear el checkout' });

  res.json({ url });
};
