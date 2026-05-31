const admin = require('./_lib/admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { await admin.auth().verifyIdToken(token); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  const displayName = name || email.split('@')[0];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0f172a;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="padding:32px 36px 0;text-align:center;">
          <img src="https://qoore.app/public/brand/logo.png" width="52" height="52" style="border-radius:12px;margin-bottom:16px;" alt="Qoore">
          <div style="font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:6px;">¡Bienvenido a Qoore, ${displayName}!</div>
          <div style="font-size:15px;color:#94a3b8;margin-bottom:28px;">Tu cuenta está lista. Ya podés gestionar tu equipo de forma profesional.</div>
        </td></tr>
        <tr><td style="padding:0 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="33%" style="text-align:center;padding:16px 8px;background:#0f172a;border-radius:10px;">
                <div style="font-size:22px;margin-bottom:6px;">📋</div>
                <div style="font-size:12px;font-weight:600;color:#f1f5f9;margin-bottom:2px;">Sesiones</div>
                <div style="font-size:11px;color:#64748b;">Registrá entrenamientos y asistencia</div>
              </td>
              <td width="4%"></td>
              <td width="33%" style="text-align:center;padding:16px 8px;background:#0f172a;border-radius:10px;">
                <div style="font-size:22px;margin-bottom:6px;">📊</div>
                <div style="font-size:12px;font-weight:600;color:#f1f5f9;margin-bottom:2px;">Métricas</div>
                <div style="font-size:11px;color:#64748b;">ACWR, monotonía y carga del plantel</div>
              </td>
              <td width="4%"></td>
              <td width="33%" style="text-align:center;padding:16px 8px;background:#0f172a;border-radius:10px;">
                <div style="font-size:22px;margin-bottom:6px;">🏃</div>
                <div style="font-size:12px;font-weight:600;color:#f1f5f9;margin-bottom:2px;">Atletas</div>
                <div style="font-size:11px;color:#64748b;">Fichas, evaluaciones y progreso</div>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 36px 32px;text-align:center;">
          <a href="https://qoore.app/app.html" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:.01em;">Ir a la app</a>
          <div style="font-size:11px;color:#334155;margin-top:24px;border-top:1px solid #263148;padding-top:16px;">
            Qoore — Gestión deportiva profesional · <a href="https://qoore.app" style="color:#475569;text-decoration:none;">qoore.app</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Qoore <noreply@qoore.app>',
        to: [email],
        subject: `¡Bienvenido a Qoore, ${displayName}!`,
        html,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Resend error' });
    res.json({ ok: true, id: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
