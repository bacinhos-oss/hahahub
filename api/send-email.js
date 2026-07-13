const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'HahaHub <info@hahahub.art>';

const templates = {
  inquiry: ({ producerName, buyerName, buyerEmail, showTitle, message }) => ({
    subject: `You've Been Tickled! — ${showTitle}`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#050505;border-bottom:4px solid #FFDE03;padding:32px 40px;">
  <p style="margin:0;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><span style="color:#FFDE03">HAHA</span>HUB</p>
  <p style="margin:4px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:4px;color:rgba(255,255,255,0.3)">Tickle. Set Up. Punch.</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:40px;">
  <div style="background:#FFDE03;color:#000;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;padding:6px 14px;display:inline-block;margin-bottom:24px;">🎭 You've Been Tickled!</div>
  <h1 style="color:#fff;font-size:36px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 8px;letter-spacing:-1px">New Inquiry<br/>Incoming.</h1>
  <p style="color:rgba(255,255,255,0.5);font-style:italic;font-size:14px;margin:0 0 32px">Someone wants your show. Don't leave them hanging.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
    <tr><td style="background:#111;border:2px solid #FFDE03;padding:16px 20px;">
      <p style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Show</p>
      <p style="font-size:20px;font-weight:900;text-transform:uppercase;color:#FFDE03;margin:0">${showTitle}</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:16px">
    <tr>
      <td width="50%" style="background:#111;border:2px solid rgba(255,255,255,0.1);padding:16px 20px;">
        <p style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Name</p>
        <p style="font-size:16px;font-weight:900;color:#fff;margin:0">${buyerName}</p>
      </td>
      <td width="8"></td>
      <td width="50%" style="background:#111;border:2px solid rgba(255,255,255,0.1);padding:16px 20px;">
        <p style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Email</p>
        <p style="font-size:13px;font-weight:700;color:#03DAC6;margin:0">${buyerEmail}</p>
      </td>
    </tr>
  </table>
  ${message ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px"><tr><td style="background:#111;border-left:4px solid #03DAC6;padding:16px 20px;"><p style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">Message</p><p style="color:rgba(255,255,255,0.7);font-style:italic;font-size:14px;line-height:1.6;margin:0">"${message}"</p></td></tr></table>` : ''}
  <a href="https://hahahub.art" style="background:#FFDE03;color:#000;padding:16px 32px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:13px;border:3px solid #000;font-style:italic">Go to Pipeline →</a>
</td></tr>
<tr><td style="background:#050505;border-top:2px solid rgba(255,255,255,0.05);padding:24px 40px;">
  <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0">Break a Laffing Leg. 🦵<br/><a href="https://www.hahahub.art" style="color:rgba(255,255,255,0.2)">hahahub.art</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
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
</html>`
  }),


  feedback: ({ feedbackType, message, url, ts }) => ({
    subject: `[HahaHub Beta] ${feedbackType.toUpperCase()} — ${new Date(ts).toLocaleDateString('en-GB')}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 24px; font-weight: 900; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.badge { padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; background: ${feedbackType === 'bug' ? '#FF0266' : feedbackType === 'idea' ? '#FFDE03; color: #000' : '#03DAC6; color: #000'}; }
.msg { background: #111; border-left: 4px solid ${feedbackType === 'bug' ? '#FF0266' : feedbackType === 'idea' ? '#FFDE03' : '#03DAC6'}; padding: 20px; margin: 16px 0; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.8); }
.meta { font-size: 10px; color: rgba(255,255,255,0.2); margin-top: 24px; }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="badge">${feedbackType === 'bug' ? '🐛 Bug Report' : feedbackType === 'idea' ? '💡 Idea' : '💬 Feedback'}</div>
  <div class="msg">${message.replace(/\n/g, '<br>')}</div>
  <div class="meta">
    <p>URL: ${url}</p>
    <p>Time: ${new Date(ts).toLocaleString('en-GB')}</p>
  </div>
</div>
</body>
</html>`
  }),

  inquiry_confirmation: ({ buyerName, showTitle, producerName, message, hasAttachment }) => ({
    subject: `Your Tickle Has Been Sent — ${showTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #FF0266; color: #fff; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; line-height: 1.1; }
.show { background: #111; border: 2px solid #FFDE03; padding: 16px 20px; margin: 24px 0; }
.show-title { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #FFDE03; }
.info { background: #111; border: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; margin: 12px 0; }
.message { background: #111; border-left: 4px solid #FF0266; padding: 16px 20px; margin: 16px 0; font-style: italic; color: rgba(255,255,255,0.7); }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">🎭 Tickle Sent!</div>
  <h1>Your Tickle<br/>Is Out There.</h1>
  <p style="color:rgba(255,255,255,0.6);font-style:italic;">The rights holder has been notified. Now wait for the Set Up.</p>

  <div class="show">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Show You Tickled</div>
    <div class="show-title">${showTitle}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:6px;">Rights holder: ${producerName}</div>
  </div>

  ${message ? `<div class="message">"${message}"</div>` : ''}
  ${hasAttachment ? `<div class="info"><span style="color:#03DAC6;font-weight:700;">📎 Attachment included</span> — your file has been delivered.</div>` : ''}

  <div class="info">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">What Happens Next</div>
    <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;">Track your inquiry in <strong style="color:#FFDE03;">My Hub → Pipeline → TICKLER</strong>. You'll get notified when they respond.</p>
  </div>

  <a href="https://hahahub.art" class="cta">🥊 Go to My Pipeline →</a>

  <div class="footer">
    <p>HahaHub — Theatre Comedy Rights Marketplace | info@hahahub.art</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
  }),

  deal_closed: ({ showTitle, royalty, years, territory, performances, isseller }) => ({
    subject: `Deal Closed — ${showTitle} · ${territory || 'All Territories'}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #4ade80; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; line-height: 1.1; }
.show { background: #111; border: 2px solid #4ade80; padding: 16px 20px; margin: 24px 0; }
.show-title { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #4ade80; }
.terms { background: #111; border: 1px solid rgba(255,255,255,0.1); padding: 20px; margin: 16px 0; display: grid; }
.term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.term-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
.term-value { font-weight: 700; color: #FFDE03; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">✓ Deal Closed</div>
  <h1>${isseller ? 'Your Show<br/>Is Going On.' : 'Curtain Up.<br/>Deal Is Closed.'}</h1>
  <p style="color:rgba(255,255,255,0.6);font-style:italic;">${isseller ? 'A buyer has confirmed the deal for your show.' : 'Your deal has been confirmed. Time to produce.'}</p>

  <div class="show">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Show</div>
    <div class="show-title">${showTitle}</div>
  </div>

  <div class="terms">
    ${royalty ? `<div class="term-row"><span class="term-label">Royalty</span><span class="term-value">${royalty}%</span></div>` : ''}
    ${territory ? `<div class="term-row"><span class="term-label">Territory</span><span class="term-value">${territory}</span></div>` : ''}
    ${years ? `<div class="term-row"><span class="term-label">License Period</span><span class="term-value">${years} year(s)</span></div>` : ''}
    ${performances ? `<div class="term-row"><span class="term-label">Performances</span><span class="term-value">${performances}</span></div>` : ''}
  </div>

  <a href="https://hahahub.art" class="cta">🥊 Go to My Pipeline →</a>

  <div class="footer">
    <p>HahaHub — Theatre Comedy Rights Marketplace | info@hahahub.art</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
  }),

  deal_signed_producer: ({ show_title, buyer, territory, signed_date }) => ({
    subject: `✓ Deal Signed — ${show_title} · ${territory}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #4ade80; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; }
.info { background: #111; border: 2px solid #4ade80; padding: 20px; margin: 24px 0; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">✓ Deal Signed!</div>
  <h1>Punchline<br/>Landed.</h1>
  <div class="info">
    <div style="margin-bottom:12px;"><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Show</span><br/><strong style="color:#FFDE03;font-size:18px;text-transform:uppercase;">${show_title}</strong></div>
    <div style="margin-bottom:12px;"><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Buyer</span><br/><strong>${buyer}</strong></div>
    <div style="margin-bottom:12px;"><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Territory</span><br/><strong>${territory}</strong></div>
    <div><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Signed</span><br/><strong>${signed_date}</strong></div>
  </div>
  <a href="https://hahahub.art" class="cta">Go to Pipeline →</a>
  <div class="footer"><p>HahaHub — Theatre Comedy Rights Marketplace</p><p>Break a Laffing Leg. 🦵</p></div>
</div>
</body>
</html>`
  }),

  deal_signed_buyer: ({ show_title, producer, territory, signed_date }) => ({
    subject: `✓ Contract Confirmed — ${show_title} · ${territory}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #4ade80; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px; }
.info { background: #111; border: 2px solid #4ade80; padding: 20px; margin: 24px 0; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">✓ Contract Confirmed!</div>
  <h1>You're In.<br/>Curtain Up.</h1>
  <div class="info">
    <div style="margin-bottom:12px;"><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Show</span><br/><strong style="color:#FFDE03;font-size:18px;text-transform:uppercase;">${show_title}</strong></div>
    <div style="margin-bottom:12px;"><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Rights Holder</span><br/><strong>${producer}</strong></div>
    <div style="margin-bottom:12px;"><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Territory</span><br/><strong>${territory}</strong></div>
    <div><span style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;">Signed</span><br/><strong>${signed_date}</strong></div>
  </div>
  <a href="https://hahahub.art" class="cta">Go to My Hub →</a>
  <div class="footer"><p>HahaHub — Theatre Comedy Rights Marketplace</p><p>Break a Laffing Leg. 🦵</p></div>
</div>
</body>
</html>`
  }),

  beta_checkin: ({ name }) => ({
    subject: `9 days in — how's HahaHub treating you? 🥊`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { font-family: Arial, sans-serif; background: #050505; color: #fff; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.logo { font-size: 28px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #FFDE03; text-shadow: 2px 2px 0 #FF0266; margin-bottom: 4px; }
.slogan { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
.badge { background: #03DAC6; color: #000; padding: 6px 16px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; margin-bottom: 24px; }
h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 16px; line-height: 1.1; }
.question { background: #111; border-left: 4px solid #FFDE03; padding: 20px 24px; margin: 16px 0; }
.question p { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.9); margin: 0; }
.cta { background: #FFDE03; color: #000; padding: 16px 32px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; text-decoration: none; display: inline-block; margin: 24px 0; border: 3px solid #000; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.3); }
</style></head>
<body>
<div class="container">
  <div class="logo">HAHAHUB</div>
  <div class="slogan">Tickle. Set Up. Punch.</div>
  <div class="badge">🎭 Beta Check-In</div>
  <h1>${name},<br/>9 days in.<br/>How's it going?</h1>
  <p style="color:rgba(255,255,255,0.5);font-style:italic;font-size:15px;">You're one of our first beta users. Your feedback shapes the platform.</p>

  <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-top:24px;">Just hit reply and tell us:</p>

  <div class="question">
    <p>01. What's working well so far?</p>
  </div>
  <div class="question">
    <p>02. What's missing or broken?</p>
  </div>

  <p style="color:rgba(255,255,255,0.4);font-style:italic;font-size:13px;margin-top:8px;">No forms, no links. Just reply to this email. We read everything.</p>

  <a href="https://hahahub.art" class="cta">🥊 Back to HahaHub →</a>

  <div class="footer">
    <p>HahaHub — Theatre Comedy Rights Marketplace | info@hahahub.art</p>
    <p>Break a Laffing Leg. 🦵</p>
  </div>
</div>
</body>
</html>`
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

  founding_followup: ({ name }) => ({
    subject: `HahaHub.art. Your spot is waiting.`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:4px solid #FFDE03">

<tr><td style="padding:32px 40px 24px 40px;border-bottom:2px solid #222">
  <a href="https://www.hahahub.art" style="color:#FFDE03;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-1px;text-decoration:none">HAHAHUB.ART</a>
  <div style="color:#666;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:4px">The Laff Exchange</div>
</td></tr>

<tr><td style="padding:36px 40px">
  <p style="color:#fff;font-size:16px;line-height:1.7;margin:0 0 20px 0">Hi ${name},</p>

  <p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 20px 0">
    I sent you an invitation to <a href="https://www.hahahub.art" style="color:#FFDE03;text-decoration:none;font-weight:700">HahaHub.art</a>, a new marketplace for international comedy theatre rights. Inboxes get busy, so I wanted to follow up in case it slipped through.
  </p>

  <div style="background:#FF0266;padding:16px 20px;margin:0 0 28px 0">
    <p style="color:#fff;font-size:15px;font-weight:900;font-style:italic;margin:0">
      Your founding spot is still reserved. Free, for life. No credit card, no catch.
    </p>
  </div>

  <p style="color:#03DAC6;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0">Getting in takes a minute</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0">
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFDE03;font-weight:900;font-size:14px">01</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Go to www.hahahub.art and click TICKLE IN</span>
    </td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFDE03;font-weight:900;font-size:14px">02</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Choose JOIN, not Log In. You do not have an account yet.</span>
    </td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFDE03;font-weight:900;font-size:14px">03</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Enter your name, and <strong style="color:#fff">the exact email address this message was sent to</strong>. That is what your invite is tied to.</span>
    </td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFDE03;font-weight:900;font-size:14px">04</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Pick any password you like. You choose it, not us.</span>
    </td></tr>
    <tr><td style="padding:10px 0">
      <span style="color:#FFDE03;font-weight:900;font-size:14px">05</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">That is it. You are in.</span>
    </td></tr>
  </table>


  <div style="text-align:center;margin:0 0 28px 0">
    <a href="https://www.hahahub.art/#signup" style="background:#FFDE03;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000;font-style:italic">Tickle In &rarr;</a>
  </div>

  <p style="color:#03DAC6;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px 0">Once you are inside</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0">
    <tr>
      <td width="50%" style="padding:12px;background:#111;border:1px solid #222" valign="top">
        <p style="color:#fff;font-size:12px;font-weight:900;font-style:italic;margin:0 0 4px 0">The Laff Exchange</p>
        <p style="color:#888;font-size:11px;line-height:1.5;margin:0">Browse the international catalogue of comedy productions.</p>
      </td>
      <td width="50%" style="padding:12px;background:#111;border:1px solid #222" valign="top">
        <p style="color:#fff;font-size:12px;font-weight:900;font-style:italic;margin:0 0 4px 0">Showload</p>
        <p style="color:#888;font-size:11px;line-height:1.5;margin:0">List your own productions and make them findable.</p>
      </td>
    </tr>
    <tr>
      <td width="50%" style="padding:12px;background:#111;border:1px solid #222" valign="top">
        <p style="color:#fff;font-size:12px;font-weight:900;font-style:italic;margin:0 0 4px 0">Rights Inquiries</p>
        <p style="color:#888;font-size:11px;line-height:1.5;margin:0">Contact other producers directly. No agents in between.</p>
      </td>
      <td width="50%" style="padding:12px;background:#111;border:1px solid #222" valign="top">
        <p style="color:#fff;font-size:12px;font-weight:900;font-style:italic;margin:0 0 4px 0">My Hub</p>
        <p style="color:#888;font-size:11px;line-height:1.5;margin:0">Track deals, contracts and royalties in one place.</p>
      </td>
    </tr>
  </table>

  <div style="text-align:center;margin:0 0 24px 0;padding:18px;background:#111;border:2px solid #03DAC6">
    <p style="color:#888;font-size:12px;margin:0 0 10px 0">Want the full walkthrough first?</p>
    <a href="https://www.hahahub.art/beta-guide.html" style="color:#03DAC6;font-size:14px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:1px;font-style:italic">Read the Beta Guide &rarr;</a>
    <p style="color:#555;font-size:10px;margin:8px 0 0 0">Everything the platform does, in one page.</p>
  </div>

  <div style="background:#111;border-left:4px solid #03DAC6;padding:16px 20px;margin:0 0 28px 0">
    <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0">
      If anything is unclear, or if you would rather I walk you through it, just reply to this email. I am also genuinely interested in what you think. Whether the platform is useful, what is missing, what would make it better for how you actually work.
    </p>
  </div>

  <p style="color:#666;font-size:14px;line-height:1.7;margin:0">
    Break a Laffing Leg. &#129482;<br/><br/>
    <span style="color:#fff;font-weight:700">Dejan Bato&#263;anin</span><br/>
    <span style="color:#666;font-size:12px">Founder, HahaHub.art</span><br/>
    <a href="https://www.hahahub.art" style="color:#03DAC6;font-size:12px;text-decoration:none">www.hahahub.art</a>
  </p>
</td></tr>

<tr><td style="padding:0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="33.33%" style="background:#FFDE03;padding:12px;text-align:center;color:#000;font-size:9px;font-weight:900;letter-spacing:2px;font-style:italic">TICKLE</td>
      <td width="33.33%" style="background:#FF0266;padding:12px;text-align:center;color:#fff;font-size:9px;font-weight:900;letter-spacing:2px;font-style:italic">SET UP</td>
      <td width="33.33%" style="background:#03DAC6;padding:12px;text-align:center;color:#000;font-size:9px;font-weight:900;letter-spacing:2px;font-style:italic">PUNCH</td>
    </tr>
  </table>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
  }),

  founding_invite: ({ name, email, password }) => ({
    subject: `Early access. A platform for international comedy theatre producers.`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#050505;border-bottom:4px solid #FFDE03;padding:28px 36px;">
  <p style="margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><span style="color:#FFDE03">HAHA</span>HUB</p>
  <p style="margin:6px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:#FFDE03;font-style:italic">The Laff Exchange</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:36px;">
  <div style="background:#FF0266;color:#fff;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:3px;padding:5px 14px;display:inline-block;margin-bottom:20px;">Early Access · Private Beta</div>
  <h1 style="color:#fff;font-size:28px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 4px;letter-spacing:-1px;line-height:1.15">Your show.<br/>Their stage.<br/>Same laff.<br/><span style="color:#FFDE03">Different city.</span></h1>
  <p style="color:rgba(255,255,255,0.3);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:4px;font-style:italic;margin:0 0 20px">Theatre comedy travels.</p>
  <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0 0 8px">Hi ${name},</p>
  <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0 0 8px">I'm building HahaHub.art. It's the international professional network for theatre comedy producers. The Laff Exchange experience: producers buy and sell rights to comedy productions directly. No agents, no commission, producer to producer.</p>
  <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0 0 24px">It's in private beta and your account is already set up. Tickle in and have a look:</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td style="background:#111;border:2px solid #FFDE03;padding:24px;">
      <p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px">Your login</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr><td style="background:#050505;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">Email (use this exact address)</p>
          <p style="font-size:15px;font-weight:900;color:#fff;margin:0;font-family:monospace">${email}</p>
        </td></tr>
        <tr><td style="background:#050505;padding:12px 16px;">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">Suggested password (or pick your own)</p>
          <p style="font-size:15px;font-weight:900;color:#03DAC6;margin:0;font-family:monospace">${password}</p>
        </td></tr>
      </table>
      <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0 0 14px">
        Click below, choose JOIN, then enter your name, the email above, and a password. You can use the suggested one or set your own. Just make sure the email matches exactly.
      </p>
      <p style="margin:0 0 18px">
        <a href="https://www.hahahub.art/beta-guide.html" style="color:#03DAC6;font-size:11px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:1px;font-style:italic">Read the Beta Guide first &rarr;</a>
      </p>
      <a href="https://www.hahahub.art/#signup" style="background:#FFDE03;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000;font-style:italic">Tickle In →</a>
      <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:14px 0 0">You can change your password later in My Hub → My Profile.</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr><td style="background:#111;border:2px solid rgba(255,255,255,0.1);padding:20px;">
      <p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 10px">What is HahaHub.art?</p>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;margin:0 0 12px">HahaHub.art is not just a marketplace. It is your entire comedy production infrastructure. From first tickle to final royalty, everything happens here. No spreadsheets. No email chains. No agents with hats.</p>
      <p style="color:#fff;font-size:13px;font-weight:900;font-style:italic;margin:0 0 8px">That's HahaHub.art. The Laff Exchange.</p>
      <p style="color:#FF0266;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:3px;font-style:italic;margin:0">Tickle. Set Up. Punch.</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr>
      <td style="padding:0 8px 0 0;width:33%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#111;border-top:3px solid #FFDE03;padding:14px;">
          <p style="color:#FFDE03;font-size:16px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 6px">Tickle.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0">Browse the catalog. Find a show that fits your stage. Or list yours, let producers worldwide find it.</p>
        </td></tr></table>
      </td>
      <td style="padding:0 8px;width:33%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#111;border-top:3px solid #03DAC6;padding:14px;">
          <p style="color:#03DAC6;font-size:16px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 6px">Set Up.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0">Agree on terms. License signed. No commission. No middlemen. Just two producers and a show.</p>
        </td></tr></table>
      </td>
      <td style="padding:0 0 0 8px;width:33%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#111;border-top:3px solid #FF0266;padding:14px;">
          <p style="color:#FF0266;font-size:16px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 6px">Punch.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0">Curtain up. Their show, your audience. Your show, their city. Comedy travels.</p>
        </td></tr></table>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:2px solid rgba(255,255,255,0.1);margin-bottom:16px;">
    <tr><td style="padding:20px;">
      <p style="color:#03DAC6;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 14px">Your comedy business. In one place.</p>
      <table width="100%" cellpadding="4" cellspacing="4">
        <tr>
          <td style="background:#050505;padding:10px 12px;width:50%"><p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Catalog</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Browse international shows.</p></td>
          <td style="background:#050505;padding:10px 12px;width:50%"><p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Pipeline</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Manage deals end-to-end.</p></td>
        </tr>
        <tr>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Analytics</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Views, territories, royalties.</p></td>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Paperwork</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Contract templates.</p></td>
        </tr>
        <tr>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Royalty Tracker</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Log and calculate earnings.</p></td>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Calculator</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Know your numbers.</p></td>
        </tr>
      </table>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr><td style="background:#050505;border-left:4px solid #FFDE03;padding:16px 20px;">
      <p style="color:#FFDE03;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 10px">As an early member you get</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0">Lifetime ROAR access. Normally €189 a year. <strong style="color:#FFDE03">Free. Forever.</strong></p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0">A permanent place on the platform, from day one.</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0">Real influence on how this gets built.</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td style="background:#050505;border-left:4px solid #FF0266;padding:16px 20px;">
      <p style="color:#FF0266;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px">What we ask from you</p>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;margin:0">Upload your show. Browse what's there. Tell us what's missing, what's broken, what should be better. Your feedback builds this platform. We read everything.</p>
    </td></tr>
  </table>

  <p style="color:rgba(255,255,255,0.3);font-size:12px;font-style:italic;margin:0 0 24px">Private beta. A small group of producers worldwide. You're one of them.</p>
  <a href="https://www.hahahub.art/#signup" style="background:#FFDE03;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000;font-style:italic">Tickle In →</a>

  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin:32px 0 0">Questions or feedback? Just reply. I read every email myself.</p>
  <p style="color:#fff;font-size:13px;font-weight:900;margin:14px 0 0">Dejan Batoćanin</p>
  <p style="color:rgba(255,255,255,0.3);font-size:11px;font-style:italic;margin:2px 0 0">Founder, HahaHub.art</p>
</td></tr>
<tr><td style="background:#050505;border-top:2px solid rgba(255,255,255,0.05);padding:20px 36px;">
  <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 4px;font-weight:700">Break a Laffing Leg. 🦵</p>
  <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0">HahaHub · <a href="https://www.hahahub.art" style="color:rgba(255,255,255,0.2)">hahahub.art</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
  }),
  founding_welcome: ({ name, spotNumber }) => ({
    subject: `You're HahaHub Crew #${spotNumber} — Welcome 🥊`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#050505;border-bottom:4px solid #FFDE03;padding:32px 40px;">
  <p style="margin:0;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><span style="color:#FFDE03">HAHA</span>HUB</p>
  <p style="margin:4px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#FF0266">Tickle. Set Up. Punch.</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:40px;">
  <div style="background:#FFDE03;color:#000;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;padding:6px 14px;display:inline-block;margin-bottom:24px;">⭐ HAHAHUB CREW #${spotNumber}</div>
  <h1 style="color:#fff;font-size:32px;font-weight:900;text-transform:uppercase;margin:0 0 16px;letter-spacing:-1px">${name}.<br/>You're in the history books. 🥊</h1>
  <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 24px">You're one of the first 20 producers to join HahaHub. That means your <strong style="color:#FFDE03">CREW</strong> badge is permanent — it will be on your profile forever, long after we're running thousands of shows worldwide.</p>
  <div style="background:#050505;border-left:4px solid #FFDE03;padding:20px 24px;margin:24px 0;">
    <p style="color:#FFDE03;font-size:10px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px">What to do now</p>
    <p style="margin:6px 0;color:rgba(255,255,255,0.8);font-size:13px;">1. <strong>Upload your show</strong> — SHOWLOAD → fill all sections → publish</p>
    <p style="margin:6px 0;color:rgba(255,255,255,0.8);font-size:13px;">2. <strong>Browse the catalog</strong> — find shows you want to license</p>
    <p style="margin:6px 0;color:rgba(255,255,255,0.8);font-size:13px;">3. <strong>Send feedback</strong> — hit the Feedback button, we read everything</p>
  </div>
  <div style="margin:32px 0 20px">
    <a href="https://www.hahahub.art" style="background:#FFDE03;color:#000;padding:16px 32px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:13px;border:3px solid #000">Enter HahaHub →</a>
  </div>
  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">New to HahaHub? <a href="https://hahahub.art/beta-guide.html" style="color:#03DAC6;text-decoration:none;font-weight:700;">Read the Beta Guide →</a></p>
</td></tr>
<tr><td style="background:#050505;border-top:2px solid rgba(255,255,255,0.05);padding:24px 40px;">
  <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0">Break a Laffing Leg. 🦵<br/><a href="https://www.hahahub.art" style="color:rgba(255,255,255,0.2)">hahahub.art</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
  }),

  show_removed: ({ name, showTitle, reason }) => ({
    subject: `Your listing "${showTitle}" has been removed from HahaHub`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#050505;border-bottom:4px solid #FF0266;padding:32px 40px;">
  <p style="margin:0;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><span style="color:#FFDE03">HAHA</span>HUB</p>
  <p style="margin:4px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#FF0266">Platform Notice</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:40px;">
  <h1 style="color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;margin:0 0 24px;letter-spacing:-1px">Hi ${name},</h1>
  <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;margin:0 0 16px">We're writing to let you know that your listing <strong style="color:#fff">"${showTitle}"</strong> has been reviewed by the HahaHub team and has been removed from the marketplace.</p>
  <div style="background:#050505;border-left:4px solid #FF0266;padding:20px 24px;margin:24px 0;">
    <p style="color:#FF0266;font-size:10px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px">Reason for removal</p>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0">${reason || 'Your listing did not meet HahaHub platform standards. This may be due to: missing or incomplete rights documentation, content that does not qualify as comedy theatre, potential intellectual property concerns, or inaccurate production information.'}</p>
  </div>
  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin:0 0 16px">If you believe this decision was made in error, or if you would like to resubmit your listing with updated information, please contact us directly.</p>
  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin:0 0 32px">Your account remains active and you are welcome to upload other productions that meet our platform guidelines.</p>
  <a href="mailto:info@hahahub.art" style="background:#FFDE03;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000">Contact Us →</a>
</td></tr>
<tr><td style="background:#050505;border-top:2px solid rgba(255,255,255,0.05);padding:24px 40px;">
  <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0">HahaHub · The Comedy Rights Marketplace<br/><a href="https://www.hahahub.art" style="color:rgba(255,255,255,0.2)">hahahub.art</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
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
      ...(type !== 'inquiry' && type !== 'inquiry_confirmation' ? { bcc: 'info@hahahub.art' } : {}),
      subject,
      html,
    });
    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: err.message });
  }
};
