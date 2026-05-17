const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'HahaHub <info@hahahub.art>';

const templates = {
  inquiry: ({ producerName, buyerName, buyerEmail, showTitle, message }) => ({
    subject: `You've Been Tickled! 🎭 — ${showTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: 'Arial', sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #FFDE03; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; }
.show { background: #111; border: 2px solid #FFDE03; padding: 16px 20px; margin: 24px 0; }
.show-title { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #FFDE03; }
.buyer { background: #111; border: 2px solid rgba(255,255,255,0.1); padding: 16px 20px; margin: 16px 0; }
.message { background: #111; border-left: 4px solid #03DAC6; padding: 16px 20px; margin: 16px 0; font-style: italic; color: rgba(255,255,255,0.7); }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">🎭 You've Been Tickled!</div>
  <h1>New Inquiry<br/>Incoming.</h1>
  <p style="color:rgba(255,255,255,0.6);font-style:italic;">Someone wants your show. Don't leave them hanging.</p>
  
  <div class="show">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Show</div>
    <div class="show-title">${showTitle}</div>
  </div>

  <div class="buyer">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">From</div>
    <div style="font-weight:700;font-size:16px;">${buyerName}</div>
    <div style="color:#03DAC6;font-size:13px;margin-top:4px;">${buyerEmail}</div>
  </div>

  ${message ? `<div class="message">"${message}"</div>` : ''}

  <a href="https://hahahub.art" class="cta">Go to My Hub → Tickle Back</a>

  <div class="footer">
    <p>HahaHub — The Comedy Rights Marketplace</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
  }),

  welcome: ({ name, email }) => ({
    subject: `You're Set Up. Break a Laffing Leg. 🦵 — HahaHub`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
h1 { font-size: 40px; font-weight: 900; text-transform: uppercase; font-style: italic; line-height: 1; margin: 0 0 16px; }
.step { display: flex; gap: 16px; margin: 16px 0; padding: 16px; background: #111; border: 1px solid rgba(255,255,255,0.1); }
.step-num { font-size: 32px; font-weight: 900; font-style: italic; color: rgba(255,255,255,0.2); min-width: 40px; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <h1>Welcome,<br/>${name}.</h1>
  <p style="color:rgba(255,255,255,0.6);font-style:italic;font-size:16px;">You're set up. Time to hunt. Or deploy. Or both.</p>

  <div class="step">
    <div class="step-num">01</div>
    <div><strong style="text-transform:uppercase;font-style:italic;">Tickle</strong><br/><span style="color:rgba(255,255,255,0.5);font-size:13px;">Browse international comedy productions. Tickle List what excites you.</span></div>
  </div>
  <div class="step">
    <div class="step-num">02</div>
    <div><strong style="text-transform:uppercase;font-style:italic;">Set Up</strong><br/><span style="color:rgba(255,255,255,0.5);font-size:13px;">Drop your show or contact rights holders directly. No agents.</span></div>
  </div>
  <div class="step">
    <div class="step-num">03</div>
    <div><strong style="text-transform:uppercase;font-style:italic;">Punch</strong><br/><span style="color:rgba(255,255,255,0.5);font-size:13px;">Curtain up. Lights on. Your punchline lands.</span></div>
  </div>

  <a href="https://hahahub.art" class="cta">🥊 Enter the Vault →</a>

  <div class="footer">
    <p>HahaHub — The Comedy Rights Marketplace | info@hahahub.art</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
  }),

  payment_confirmation: ({ name, planName, amount, invoiceNum, expiry }) => ({
    subject: `Punchline Delivered. ✓ — HahaHub ${planName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.paid { background: #03DAC6; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; }
.invoice { background: #fff; color: #000; padding: 24px; margin: 24px 0; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="paid">✓ Payment Confirmed</div>
  <h1>Punchline<br/>Delivered.</h1>
  <p style="color:rgba(255,255,255,0.6);font-style:italic;">You're set up, ${name}. Go hunt. 🎭</p>

  <div class="invoice">
    <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">Invoice ${invoiceNum}</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>${planName}</strong></td><td style="text-align:right;padding:8px 0;border-bottom:1px solid #eee;font-size:20px;font-weight:900;">${amount}</td></tr>
      <tr><td style="padding:8px 0;color:#999;font-size:12px;">Valid until</td><td style="text-align:right;padding:8px 0;color:#999;font-size:12px;">${expiry}</td></tr>
    </table>
  </div>

  <a href="https://hahahub.art" class="cta">🥊 Enter the Vault →</a>

  <div class="footer">
    <p>HahaHub | info@hahahub.art | Ljubljana, Slovenia</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
  }),

  inquiry_reply: ({ producerName, buyerName, showTitle, message }) => ({
    subject: `Reply from ${producerName} — ${showTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #03DAC6; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 32px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; }
.show { background: #111; border: 2px solid #FFDE03; padding: 16px 20px; margin: 24px 0; }
.show-title { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #FFDE03; }
.reply { background: #111; border-left: 4px solid #03DAC6; padding: 20px 24px; margin: 16px 0; font-style: italic; color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.7; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">💬 Reply Received</div>
  <h1>${buyerName},<br/>You Got a Reply.</h1>
  <p style="color:rgba(255,255,255,0.5);font-style:italic;">${producerName} has responded to your inquiry.</p>
  <div class="show">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Show</div>
    <div class="show-title">${showTitle}</div>
  </div>
  <div class="reply">${message}</div>
  <a href="https://hahahub.art" class="cta">🥊 Go to My Hub →</a>
  <div class="footer">
    <p>HahaHub — Theatre Comedy Rights Marketplace</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>\`
  }),

  subscription_reminder: ({ name, expiry, daysLeft }) => ({
    subject: `Your HahaHub Pass expires in ${daysLeft} days — Renew Now`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.warning { background: #FF0266; color: #fff; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="warning">⚠ ${daysLeft} Days Left</div>
  <h1>Don't Leave<br/>Them Hanging.</h1>
  <p style="color:rgba(255,255,255,0.6);font-style:italic;">${name}, your Comedy Passport expires on <strong>${expiry}</strong>. Renew to keep access to the vault.</p>
  <a href="mailto:info@hahahub.art?subject=Renew Subscription" class="cta">Renew My Pass →</a>
  <div class="footer">
    <p>HahaHub | info@hahahub.art</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
  }),
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, to, data } = req.body;
  if (!type || !to) return res.status(400).json({ error: 'Missing type or to' });

  const template = templates[type];
  if (!template) return res.status(400).json({ error: 'Unknown email type' });

  const { subject, html } = template(data || {});

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      bcc: 'info@hahahub.art',
      subject,
      html,
    });
    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: err.message });
  }
};
