const admin = require('./_lib/admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { await admin.auth().verifyIdToken(token); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { to, teamName, inviteLink, role } = req.body;
  if (!to || !inviteLink) return res.status(400).json({ error: 'Missing to or inviteLink' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  const roleLabel = role === 'athlete' ? 'Atleta' : role === 'viewer' ? 'Observador' : 'Staff';

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
          <div style="font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:6px;">Invitación al equipo</div>
          <div style="font-size:15px;color:#94a3b8;margin-bottom:24px;">Te invitaron a unirte a <strong style="color:#f1f5f9;">${teamName}</strong> en Qoore</div>
        </td></tr>
        <tr><td style="padding:0 36px;">
          <div style="background:#0f172a;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Tu rol</div>
            <div style="font-size:16px;font-weight:600;color:#f97316;">${roleLabel}</div>
          </div>
        </td></tr>
        <tr><td style="padding:0 36px 32px;text-align:center;">
          <a href="${inviteLink}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:.01em;">Aceptar invitación</a>
          <div style="font-size:12px;color:#475569;margin-top:16px;">O copiá este link en tu navegador:<br>
            <span style="color:#94a3b8;word-break:break-all;">${inviteLink}</span>
          </div>
          <div style="font-size:11px;color:#334155;margin-top:24px;border-top:1px solid #1e293b;padding-top:16px;">
            Este link expira en 7 días · Qoore — Gestión deportiva
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
        to: [to],
        subject: `Te invitaron al equipo ${teamName} en Qoore`,
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
