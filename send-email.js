const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'HahaHub <info@hahahub.art>';

// ─── SHARED STYLES ───────────────────────────────────────────────
const css = `
  body{margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;}
  .wrap{max-width:600px;margin:0 auto;background:#050505;}
  .header{background:#050505;padding:40px 40px 0;text-align:center;}
  .logo{font-size:32px;font-weight:900;letter-spacing:-2px;text-transform:uppercase;color:#FFDE03;text-shadow:3px 3px 0 #FF0266;font-family:Arial Black,Arial,sans-serif;}
  .slogan{font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(255,255,255,0.2);margin-top:4px;}
  .stripe-y{height:6px;background:#FFDE03;}
  .stripe-c{height:4px;background:#03DAC6;}
  .stripe-p{height:4px;background:#FF0266;}
  .hero{background:#000;padding:48px 40px 40px;text-align:center;}
  .badge{display:inline-block;background:#FFDE03;color:#000;padding:6px 20px;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:4px;margin-bottom:20px;}
  .badge-cyan{background:#03DAC6;}
  .badge-pink{background:#FF0266;color:#fff;}
  .badge-green{background:#4ade80;}
  .h1{font-size:52px;font-weight:900;text-transform:uppercase;font-style:italic;color:#fff;line-height:0.9;letter-spacing:-2px;margin:0 0 16px;font-family:Arial Black,Arial,sans-serif;}
  .h1 span{color:#FFDE03;}
  .sub{font-size:13px;color:rgba(255,255,255,0.4);font-style:italic;}
  .body{background:#0a0a0a;padding:32px 40px;}
  .card{background:#000;border-left:4px solid #FFDE03;padding:20px 24px;margin:16px 0;}
  .card-cyan{border-left-color:#03DAC6;}
  .card-pink{border-left-color:#FF0266;}
  .card-green{border-left-color:#4ade80;}
  .label{font-size:8px;font-weight:900;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:4px;margin-bottom:6px;}
  .value{font-size:22px;font-weight:900;text-transform:uppercase;color:#fff;font-family:Arial Black,Arial,sans-serif;}
  .value-y{color:#FFDE03;}
  .value-c{color:#03DAC6;}
  .msg{background:#000;border-left:4px solid #03DAC6;padding:20px 24px;margin:16px 0;font-style:italic;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;}
  .grid{display:table;width:100%;border-spacing:8px;}
  .grid-cell{display:table-cell;width:50%;background:#000;padding:20px;vertical-align:top;}
  .cta-wrap{text-align:center;padding:32px 40px;}
  .cta{display:inline-block;background:#FFDE03;color:#000;padding:18px 48px;font-weight:900;font-size:14px;text-transform:uppercase;font-style:italic;letter-spacing:3px;text-decoration:none;border:3px solid #000;}
  .cta-cyan{background:#03DAC6;}
  .cta-green{background:#4ade80;}
  .footer{background:#FFDE03;padding:16px 40px;text-align:center;}
  .footer p{margin:0;font-size:9px;font-weight:900;color:#000;text-transform:uppercase;letter-spacing:3px;}
`;

function layout(badge, badgeClass, h1, h1accent, sub, bodyHtml, ctaText, ctaHref, ctaClass = '') {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo">HAHAHUB</div>
    <div class="slogan">Tickle. Set Up. Punch.</div>
  </div>
  <div class="stripe-y"></div>
  <div class="hero">
    <div class="badge ${badgeClass}">${badge}</div>
    <div class="h1">${h1}<br><span>${h1accent}</span></div>
    <div class="sub">${sub}</div>
  </div>
  <div class="stripe-c"></div>
  <div class="body">${bodyHtml}</div>
  <div class="stripe-p"></div>
  <div class="cta-wrap">
    <a href="${ctaHref}" class="cta ${ctaClass}">${ctaText}</a>
  </div>
  <div class="footer"><p>HahaHub · The Comedy Rights Marketplace · hahahub.art</p></div>
</div></body></html>`;
}

// ─── TEMPLATES ───────────────────────────────────────────────────
const templates = {

  inquiry: ({ producerName, buyerName, buyerEmail, showTitle, message }) => ({
    subject: `🎭 You've Been Tickled! — ${showTitle}`,
    html: layout(
      '🎭 You\'ve Been Tickled!', '',
      'Someone Wants', 'Your Show.',
      `${buyerName} is interested in licensing rights.`,
      `<div class="card">
        <div class="label">Show</div>
        <div class="value value-y">${showTitle}</div>
      </div>
      <div style="display:table;width:100%;margin:16px 0;">
        <div style="display:table-cell;width:48%;background:#000;padding:20px;border-left:4px solid #03DAC6;">
          <div class="label">From</div>
          <div class="value" style="font-size:18px;">${buyerName}</div>
        </div>
        <div style="display:table-cell;width:4%;"></div>
        <div style="display:table-cell;width:48%;background:#000;padding:20px;border-left:4px solid #FF0266;">
          <div class="label">Email</div>
          <div style="font-size:13px;font-weight:900;color:#fff;">${buyerEmail}</div>
        </div>
      </div>
      ${message ? `<div class="msg">"${message}"</div>` : ''}`,
      'Reply to Inquiry →', `mailto:${buyerEmail}`, ''
    )
  }),

  welcome: ({ name }) => ({
    subject: `Welcome to HahaHub, ${name}. Break a Laffing Leg. 🦵`,
    html: layout(
      '🥊 You\'re In!', '',
      'Welcome,', `${name}.`,
      'Time to hunt. Or deploy. Or both.',
      `<div class="card">
        <div class="label">01 — Tickle</div>
        <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px;">Browse international comedy productions. Save what excites you.</div>
      </div>
      <div class="card card-cyan">
        <div class="label">02 — Set Up</div>
        <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px;">List your show or contact rights holders directly. No agents.</div>
      </div>
      <div class="card card-pink">
        <div class="label">03 — Punch</div>
        <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px;">Curtain up. Lights on. Your punchline lands.</div>
      </div>`,
      'Enter the Vault →', 'https://hahahub.art', ''
    )
  }),

  payment_confirmation: ({ name, planName, amount, invoiceNum, expiry }) => ({
    subject: `✓ Punchline Delivered — HahaHub ${planName}`,
    html: layout(
      '✓ Payment Confirmed', 'badge-cyan',
      'Punchline', 'Delivered.',
      `You\'re set up, ${name}. Go hunt. 🎭`,
      `<div class="card card-cyan">
        <div class="label">Invoice ${invoiceNum}</div>
        <div class="value value-y" style="margin:8px 0;">${planName}</div>
        <div style="display:table;width:100%;margin-top:12px;">
          <div style="display:table-cell;"><span style="font-size:28px;font-weight:900;color:#fff;font-family:Arial Black,Arial,sans-serif;">${amount}</span></div>
          <div style="display:table-cell;text-align:right;color:rgba(255,255,255,0.4);font-size:12px;vertical-align:middle;">Valid until<br><strong style="color:#fff;">${expiry}</strong></div>
        </div>
      </div>`,
      'Enter the Vault →', 'https://hahahub.art', ''
    )
  }),

  inquiry_reply: ({ producerName, buyerName, showTitle, message }) => ({
    subject: `💬 Reply from ${producerName} — ${showTitle}`,
    html: layout(
      '💬 Reply Received', 'badge-cyan',
      'You Got', 'A Reply.',
      `${producerName} has responded to your inquiry.`,
      `<div class="card">
        <div class="label">Show</div>
        <div class="value value-y">${showTitle}</div>
      </div>
      <div class="msg">${message}</div>
      <div class="card card-cyan">
        <div class="label">From</div>
        <div class="value" style="font-size:18px;">${producerName}</div>
      </div>`,
      'Go to My Hub →', 'https://hahahub.art', 'cta-cyan'
    )
  }),

  deal_signed_producer: ({ show_title, buyer, territory, signed_date }) => ({
    subject: `✓ Deal Signed — ${show_title} · ${territory}`,
    html: layout(
      '✓ Deal Signed!', 'badge-green',
      'Punchline', 'Landed.',
      `${show_title} is going to ${territory}.`,
      `<div class="card card-green">
        <div class="label">Show</div>
        <div class="value value-y" style="margin-bottom:16px;">${show_title}</div>
        <div style="display:table;width:100%;">
          <div style="display:table-cell;width:50%;">
            <div class="label">Buyer</div>
            <div style="font-size:16px;font-weight:900;color:#fff;">${buyer}</div>
          </div>
          <div style="display:table-cell;width:50%;">
            <div class="label">Territory</div>
            <div style="font-size:16px;font-weight:900;color:#03DAC6;">${territory}</div>
          </div>
        </div>
        <div style="margin-top:12px;">
          <div class="label">Signed</div>
          <div style="font-size:14px;font-weight:900;color:#fff;">${signed_date}</div>
        </div>
      </div>`,
      'Go to Pipeline →', 'https://hahahub.art', 'cta-green'
    )
  }),

  deal_signed_buyer: ({ show_title, producer, territory, signed_date }) => ({
    subject: `✓ Contract Confirmed — ${show_title} · ${territory}`,
    html: layout(
      '✓ Contract Confirmed!', 'badge-green',
      "You're In.", 'Curtain Up.',
      `Your license for ${show_title} is confirmed.`,
      `<div class="card card-green">
        <div class="label">Show</div>
        <div class="value value-y" style="margin-bottom:16px;">${show_title}</div>
        <div style="display:table;width:100%;">
          <div style="display:table-cell;width:50%;">
            <div class="label">Rights Holder</div>
            <div style="font-size:16px;font-weight:900;color:#fff;">${producer}</div>
          </div>
          <div style="display:table-cell;width:50%;">
            <div class="label">Territory</div>
            <div style="font-size:16px;font-weight:900;color:#03DAC6;">${territory}</div>
          </div>
        </div>
        <div style="margin-top:12px;">
          <div class="label">Signed</div>
          <div style="font-size:14px;font-weight:900;color:#fff;">${signed_date}</div>
        </div>
      </div>`,
      'Go to My Hub →', 'https://hahahub.art', 'cta-green'
    )
  }),

  subscription_reminder: ({ name, expiry, daysLeft }) => ({
    subject: `⚠ Your HahaHub Pass expires in ${daysLeft} days`,
    html: layout(
      `⚠ ${daysLeft} Days Left`, 'badge-pink',
      "Don't Leave", 'Them Hanging.',
      `${name}, your Comedy Passport expires on ${expiry}.`,
      `<div class="card card-pink">
        <div class="label">Expiry Date</div>
        <div class="value" style="font-size:28px;">${expiry}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:8px;">Renew to keep access to the vault and all active deals.</div>
      </div>`,
      'Renew My Pass →', 'mailto:info@hahahub.art?subject=Renew Subscription', 'cta-cyan'
    )
  }),

  inquiry_confirmation: ({ buyerName, showTitle, producerName, message, hasAttachment }) => ({
    subject: `📨 Inquiry Sent — ${showTitle}`,
    html: layout(
      '📨 Inquiry Sent!', 'badge-cyan',
      'Tickle', 'Delivered.',
      `Your inquiry for ${showTitle} is on its way.`,
      `<div class="card card-cyan">
        <div class="label">Show</div>
        <div class="value value-y">${showTitle}</div>
      </div>
      <div class="card">
        <div class="label">Rights Holder</div>
        <div class="value" style="font-size:18px;">${producerName}</div>
      </div>
      ${message ? `<div class="msg">"${message}"</div>` : ''}
      ${hasAttachment ? `<div style="color:#03DAC6;font-size:12px;font-weight:900;text-transform:uppercase;margin-top:12px;">📎 Attachment included</div>` : ''}
      <div style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:16px;font-style:italic;">The rights holder will respond to your inquiry shortly. Check your Hub for updates.</div>`,
      'Go to My Hub →', 'https://hahahub.art', 'cta-cyan'
    )
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
  if (!template) return res.status(400).json({ error: 'Unknown email type: ' + type });

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
