const admin = require('./_lib/admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  let resetLink;
  try {
    resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: 'https://qoore.app/app.html',
    });
  } catch {
    // User doesn't exist — return ok silently to prevent email enumeration
    return res.json({ ok: true });
  }

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
          <div style="font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:6px;">Restablecer contraseña</div>
          <div style="font-size:15px;color:#94a3b8;margin-bottom:28px;">Hacé clic en el botón para elegir una nueva contraseña para tu cuenta en Qoore.</div>
        </td></tr>
        <tr><td style="padding:0 36px 32px;text-align:center;">
          <a href="${resetLink}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:.01em;">Restablecer contraseña</a>
          <div style="font-size:12px;color:#475569;margin-top:20px;">O copiá este link en tu navegador:<br>
            <span style="color:#64748b;word-break:break-all;font-size:11px;">${resetLink}</span>
          </div>
          <div style="font-size:12px;color:#475569;margin-top:20px;padding:12px 16px;background:#0f172a;border-radius:8px;text-align:left;">
            Si no pediste restablecer tu contraseña, ignorá este mensaje. Tu cuenta está segura.
          </div>
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
        subject: 'Restablecer tu contraseña en Qoore',
        html,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Resend error' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
