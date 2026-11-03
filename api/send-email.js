const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'HahaHub <info@hahahub.art>';


// Shared layout for the standard HahaHub notification emails (all inline styles, Gmail-safe)
const FOOT = 'HahaHub &mdash; The Laff Exchange · International Comedy Theatre Producers Platform | info@hahahub.art<br>Break a Laffing Leg. 🦵';
const card = (label, value, accent) => `<tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;border-left:4px solid ${accent};"><tr><td style="padding:16px 20px;"><div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#777777;padding-bottom:6px;">${label}</div><div style="font-size:18px;font-weight:900;color:#ffffff;line-height:1.4;">${value}</div></td></tr></table></td></tr>`;
const quote = (label, text, accent) => `<tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;border-left:4px solid ${accent};"><tr><td style="padding:16px 20px;"><div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#777777;padding-bottom:8px;">${label}</div><div style="font-size:15px;font-style:italic;color:#dddddd;line-height:1.6;">${String(text).replace(/\n/g, '<br>')}</div></td></tr></table></td></tr>`;
const rows = (list, accent) => `<tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;border-left:4px solid ${accent};">${list.filter(r => r[1]).map(r => `<tr><td style="padding:10px 20px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#777777;border-bottom:1px solid #1e1e1e;" width="40%">${r[0]}</td><td style="padding:10px 20px;font-size:15px;font-weight:700;color:#ffffff;border-bottom:1px solid #1e1e1e;">${r[1]}</td></tr>`).join('')}</table></td></tr>`;
function mail({ badge, badgeColor = '#FFC80E', badgeText = '#000000', title, intro, body = '', cta, note }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#050505;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background:#050505;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <tr><td style="padding-bottom:28px;"><img src="https://hahahub.art/logo-email.png" width="240" alt="HahaHub" style="display:block;border:0;height:auto;max-width:100%;"></td></tr>
  <tr><td style="padding-bottom:14px;"><span style="background:${badgeColor};color:${badgeText};font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:6px 12px;">${badge}</span></td></tr>
  <tr><td style="font-size:38px;line-height:1.05;font-weight:900;font-style:italic;text-transform:uppercase;color:#ffffff;padding-bottom:14px;">${title}</td></tr>
  <tr><td style="font-size:16px;font-style:italic;color:#bbbbbb;padding-bottom:28px;line-height:1.5;">${intro}</td></tr>
  ${body}
  ${cta ? `<tr><td style="padding:12px 0 ${note ? '12px' : '32px'};"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#FFC80E" style="background:#FFC80E;border:3px solid #000000;"><a href="${cta.href}" style="display:inline-block;padding:16px 28px;font-size:13px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:2px;color:#000000;text-decoration:none;">${cta.label} &rarr;</a></td></tr></table></td></tr>` : ''}
  ${note ? `<tr><td style="padding-bottom:32px;font-size:12px;color:#777777;line-height:1.5;">${note}</td></tr>` : ''}
  <tr><td style="border-top:1px solid #2a2a2a;padding-top:20px;font-size:11px;color:#777777;line-height:1.6;">${FOOT}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const templates = {
  inquiry: ({ producerName, buyerName, buyerEmail, showTitle, message, packageType }) => {
    const pkg = packageType ? String(packageType).replace(/_/g, ' ') : '';
    const mailto = `mailto:${buyerEmail || ''}?subject=${encodeURIComponent('Re: ' + (showTitle || 'your inquiry') + ' — HahaHub')}`;
    return {
    subject: `You've been tickled — a producer wants "${showTitle}"`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#050505;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background:#050505;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <tr><td style="padding-bottom:28px;"><img src="https://hahahub.art/logo-email.png" width="240" alt="HahaHub" style="display:block;border:0;height:auto;max-width:100%;"></td></tr>
  <tr><td style="padding-bottom:14px;"><span style="background:#FFC80E;color:#000000;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:6px 12px;">New inquiry</span></td></tr>
  <tr><td style="font-size:38px;line-height:1.05;font-weight:900;font-style:italic;text-transform:uppercase;color:#ffffff;padding-bottom:14px;">You've been<br>tickled${producerName ? ', ' + producerName : ''}.</td></tr>
  <tr><td style="font-size:16px;font-style:italic;color:#bbbbbb;padding-bottom:28px;line-height:1.5;">A fellow producer is interested in your show. Answer while the laugh is still warm.</td></tr>

  <tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;border-left:4px solid #FFC80E;"><tr><td style="padding:16px 20px;">
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#777777;padding-bottom:6px;">Show</div>
    <div style="font-size:22px;font-weight:900;font-style:italic;text-transform:uppercase;color:#FFC80E;">${showTitle}</div>
    ${pkg ? `<div style="font-size:12px;color:#aaaaaa;padding-top:6px;">Interested in: <strong style="color:#ffffff;text-transform:capitalize;">${pkg}</strong></div>` : ''}
  </td></tr></table></td></tr>

  <tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;border-left:4px solid #EF4986;"><tr><td style="padding:16px 20px;">
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#777777;padding-bottom:6px;">From</div>
    <div style="font-size:18px;font-weight:900;color:#ffffff;">${buyerName || 'A producer'}</div>
    <div style="font-size:13px;color:#19A596;padding-top:4px;">${buyerEmail || ''}</div>
  </td></tr></table></td></tr>

  ${message ? `<tr><td style="padding-bottom:28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;border-left:4px solid #19A596;"><tr><td style="padding:16px 20px;">
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#777777;padding-bottom:8px;">Their message</div>
    <div style="font-size:15px;font-style:italic;color:#dddddd;line-height:1.6;">${String(message).replace(/\n/g, '<br>')}</div>
  </td></tr></table></td></tr>` : '<tr><td style="padding-bottom:16px;"></td></tr>'}

  <tr><td style="padding-bottom:12px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td bgcolor="#FFC80E" style="background:#FFC80E;border:3px solid #000000;"><a href="${mailto}" style="display:inline-block;padding:16px 28px;font-size:13px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:2px;color:#000000;text-decoration:none;">Reply to ${buyerName ? String(buyerName).split(' ')[0] : 'them'} &rarr;</a></td>
    <td width="12"></td>
    <td style="border:3px solid #444444;"><a href="https://hahahub.art/#subscription" style="display:inline-block;padding:16px 28px;font-size:13px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:2px;color:#ffffff;text-decoration:none;">Open My Hub</a></td>
  </tr></table></td></tr>
  <tr><td style="padding-bottom:32px;font-size:12px;color:#777777;">You can also simply hit reply &mdash; your answer goes straight to them.</td></tr>

  <tr><td style="border-top:1px solid #2a2a2a;padding-top:20px;font-size:11px;color:#777777;line-height:1.6;">HahaHub &mdash; The Laff Exchange · International Comedy Theatre Producers Platform | info@hahahub.art<br>Break a Laffing Leg. 🦵</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
  };},

  welcome: ({ name, email }) => ({
    subject: `You're Set Up. Break a Laffing Leg. 🦵 — HahaHub`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#050505;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background:#050505;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
  <tr><td style="padding-bottom:28px;"><img src="https://hahahub.art/logo-email.png" width="240" alt="HahaHub" style="display:block;border:0;height:auto;max-width:100%;"></td></tr>
  <tr><td style="font-size:40px;line-height:1.05;font-weight:900;font-style:italic;text-transform:uppercase;color:#ffffff;padding-bottom:16px;">Welcome,<br>${name}.</td></tr>
  <tr><td style="font-size:16px;font-style:italic;color:#bbbbbb;padding-bottom:24px;line-height:1.5;">You're set up. Time to hunt. Or deploy. Or both.</td></tr>
  <tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;"><tr>
    <td width="56" style="padding:16px;font-size:30px;font-weight:900;font-style:italic;color:#555555;" valign="top">01</td>
    <td style="padding:16px 16px 16px 0;"><div style="font-size:16px;font-weight:900;font-style:italic;text-transform:uppercase;color:#FFC80E;">Tickle</div><div style="font-size:13px;color:#aaaaaa;line-height:1.5;padding-top:4px;">Browse international comedy productions. Tickle List what excites you.</div></td>
  </tr></table></td></tr>
  <tr><td style="padding-bottom:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;"><tr>
    <td width="56" style="padding:16px;font-size:30px;font-weight:900;font-style:italic;color:#555555;" valign="top">02</td>
    <td style="padding:16px 16px 16px 0;"><div style="font-size:16px;font-weight:900;font-style:italic;text-transform:uppercase;color:#EF4986;">Set Up</div><div style="font-size:13px;color:#aaaaaa;line-height:1.5;padding-top:4px;">Drop your show or contact rights holders directly. No agents.</div></td>
  </tr></table></td></tr>
  <tr><td style="padding-bottom:28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#111111" style="background:#111111;border:1px solid #2a2a2a;"><tr>
    <td width="56" style="padding:16px;font-size:30px;font-weight:900;font-style:italic;color:#555555;" valign="top">03</td>
    <td style="padding:16px 16px 16px 0;"><div style="font-size:16px;font-weight:900;font-style:italic;text-transform:uppercase;color:#19A596;">Punch</div><div style="font-size:13px;color:#aaaaaa;line-height:1.5;padding-top:4px;">Curtain up. Lights on. Your punchline lands.</div></td>
  </tr></table></td></tr>
  <tr><td style="padding-bottom:32px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#FFC80E" style="background:#FFC80E;border:3px solid #000000;"><a href="https://hahahub.art" style="display:inline-block;padding:16px 32px;font-size:14px;font-weight:900;font-style:italic;text-transform:uppercase;color:#000000;text-decoration:none;">Enter the Vault &rarr;</a></td></tr></table></td></tr>
  <tr><td style="border-top:1px solid #2a2a2a;padding-top:20px;font-size:11px;color:#777777;line-height:1.6;">HahaHub &mdash; The Laff Exchange · International Comedy Theatre Producers Platform | info@hahahub.art<br>Break a Laffing Leg. 🦵</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
  }),


  inquiry_reply: ({ producerName, buyerName, showTitle, message }) => ({
    subject: `Reply from ${producerName} — ${showTitle}`,
    html: mail({
      badge: 'Reply received', badgeColor: '#19A596',
      title: `${buyerName ? buyerName + ',<br>' : ''}you got a reply.`,
      intro: `${producerName} has responded to your inquiry.`,
      body: card('Show', showTitle, '#FFC80E') + (message ? quote('Their reply', message, '#19A596') : ''),
      cta: { label: 'Open My Hub', href: 'https://hahahub.art/#subscription' },
    }),
  }),

  feedback: ({ feedbackType, message, url, ts }) => {
    const kind = feedbackType === 'bug' ? 'Bug report' : feedbackType === 'idea' ? 'Idea' : feedbackType === 'verify' ? 'Verification request' : 'Feedback';
    const color = feedbackType === 'bug' ? '#EF4986' : feedbackType === 'idea' ? '#FFC80E' : '#19A596';
    return {
      subject: `[HahaHub] ${String(feedbackType || 'feedback').toUpperCase()} — ${new Date(ts).toLocaleDateString('en-GB')}`,
      html: mail({
        badge: kind, badgeColor: color, badgeText: feedbackType === 'bug' ? '#ffffff' : '#000000',
        title: kind + '.',
        intro: 'Sent from the feedback button on hahahub.art.',
        body: quote('Message', message || '', color) + rows([['Page', url], ['Time', new Date(ts).toLocaleString('en-GB')]], '#444444'),
      }),
    };
  },

  inquiry_confirmation: ({ buyerName, showTitle, producerName, message, hasAttachment }) => ({
    subject: `Your tickle has been sent — ${showTitle}`,
    html: mail({
      badge: 'Inquiry sent',
      title: `Tickle sent${buyerName ? ', ' + buyerName : ''}.`,
      intro: 'The rights holder has been notified. Now wait for the set up.',
      body: card('Show you tickled', showTitle, '#FFC80E')
        + card('Rights holder', producerName || 'Rights Holder', '#EF4986')
        + (message ? quote('Your message', message, '#19A596') : '')
        + (hasAttachment ? card('Attachment', 'Your file has been delivered.', '#444444') : ''),
      cta: { label: 'Open My Pipeline', href: 'https://hahahub.art/#subscription' },
      note: 'You can follow this inquiry in My Hub &rarr; Pipeline. We will let you know when they respond.',
    }),
  }),

  deal_closed: ({ showTitle, royalty, years, territory, performances, isseller }) => ({
    subject: `Deal closed — ${showTitle} · ${territory || 'All territories'}`,
    html: mail({
      badge: 'Deal closed', badgeColor: '#16A34A', badgeText: '#ffffff',
      title: isseller ? 'Your show<br>is going on.' : 'Curtain up.<br>Deal closed.',
      intro: isseller ? 'A buyer has confirmed the deal for your show.' : 'Your deal has been confirmed. Time to produce.',
      body: card('Show', showTitle, '#FFC80E') + rows([
        ['Royalty', royalty ? royalty + '%' : ''],
        ['Territory', territory],
        ['License period', years ? years + ' year(s)' : ''],
        ['Performances', performances],
      ], '#16A34A'),
      cta: { label: 'Open My Pipeline', href: 'https://hahahub.art/#subscription' },
    }),
  }),

  deal_signed_producer: ({ show_title, buyer, territory, signed_date }) => ({
    subject: `Deal signed — ${show_title}${territory ? ' · ' + territory : ''}`,
    html: mail({
      badge: 'Deal signed', badgeColor: '#16A34A', badgeText: '#ffffff',
      title: 'Punchline<br>landed.',
      intro: 'The contract is signed. Congratulations.',
      body: card('Show', show_title, '#FFC80E') + rows([['Buyer', buyer], ['Territory', territory], ['Signed', signed_date]], '#16A34A'),
      cta: { label: 'Open My Pipeline', href: 'https://hahahub.art/#subscription' },
    }),
  }),

  deal_signed_buyer: ({ show_title, producer, territory, signed_date }) => ({
    subject: `Contract confirmed — ${show_title}${territory ? ' · ' + territory : ''}`,
    html: mail({
      badge: 'Contract confirmed', badgeColor: '#16A34A', badgeText: '#ffffff',
      title: "You're in.<br>Curtain up.",
      intro: 'The rights holder has confirmed your contract.',
      body: card('Show', show_title, '#FFC80E') + rows([['Rights holder', producer], ['Territory', territory], ['Signed', signed_date]], '#16A34A'),
      cta: { label: 'Open My Hub', href: 'https://hahahub.art/#subscription' },
    }),
  }),

  founding_followup: ({ name }) => ({
    subject: `HahaHub.art. Your spot is waiting.`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:4px solid #FFC80E">

<tr><td style="padding:32px 40px 24px 40px;border-bottom:2px solid #222">
  <a href="https://www.hahahub.art" style="color:#FFC80E;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-1px;text-decoration:none">HAHAHUB.ART</a>
  <div style="color:#666;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:4px">The Laff Exchange</div>
</td></tr>

<tr><td style="padding:36px 40px">
  <p style="color:#fff;font-size:16px;line-height:1.7;margin:0 0 20px 0">Hi ${name},</p>

  <p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 20px 0">
    I sent you an invitation to <a href="https://www.hahahub.art" style="color:#FFC80E;text-decoration:none;font-weight:700">HahaHub.art</a>, a new marketplace for international comedy theatre rights. Inboxes get busy, so I wanted to follow up in case it slipped through.
  </p>

  <div style="background:#EF4986;padding:16px 20px;margin:0 0 28px 0">
    <p style="color:#fff;font-size:15px;font-weight:900;font-style:italic;margin:0">
      Your founding spot is still reserved. Free, for life. No credit card, no catch.
    </p>
  </div>

  <p style="color:#19A596;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0">Getting in takes a minute</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0">
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFC80E;font-weight:900;font-size:14px">01</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Go to www.hahahub.art and click TICKLE IN</span>
    </td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFC80E;font-weight:900;font-size:14px">02</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Choose JOIN, not Log In. You do not have an account yet.</span>
    </td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFC80E;font-weight:900;font-size:14px">03</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Enter your name, and <strong style="color:#fff">the exact email address this message was sent to</strong>. That is what your invite is tied to.</span>
    </td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#FFC80E;font-weight:900;font-size:14px">04</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">Pick any password you like. You choose it, not us.</span>
    </td></tr>
    <tr><td style="padding:10px 0">
      <span style="color:#FFC80E;font-weight:900;font-size:14px">05</span>
      <span style="color:#ccc;font-size:14px;margin-left:12px">That is it. You are in.</span>
    </td></tr>
  </table>


  <div style="text-align:center;margin:0 0 28px 0">
    <a href="https://www.hahahub.art/#signup" style="background:#FFC80E;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000;font-style:italic">Tickle In &rarr;</a>
  </div>

  <p style="color:#19A596;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px 0">Once you are inside</p>

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


  <div style="background:#111;border-left:4px solid #19A596;padding:16px 20px;margin:0 0 28px 0">
    <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0">
      If anything is unclear, or if you would rather I walk you through it, just reply to this email. I am also genuinely interested in what you think. Whether the platform is useful, what is missing, what would make it better for how you actually work.
    </p>
  </div>

  <p style="color:#666;font-size:14px;line-height:1.7;margin:0">
    Break a Laffing Leg. &#129482;<br/><br/>
    <span style="color:#fff;font-weight:700">Dejan Bato&#263;anin</span><br/>
    <span style="color:#666;font-size:12px">Founder, HahaHub.art</span><br/>
    <a href="https://www.hahahub.art" style="color:#19A596;font-size:12px;text-decoration:none">www.hahahub.art</a>
  </p>
</td></tr>

<tr><td style="padding:0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="33.33%" style="background:#FFC80E;padding:12px;text-align:center;color:#000;font-size:9px;font-weight:900;letter-spacing:2px;font-style:italic">TICKLE</td>
      <td width="33.33%" style="background:#EF4986;padding:12px;text-align:center;color:#fff;font-size:9px;font-weight:900;letter-spacing:2px;font-style:italic">SET UP</td>
      <td width="33.33%" style="background:#19A596;padding:12px;text-align:center;color:#000;font-size:9px;font-weight:900;letter-spacing:2px;font-style:italic">PUNCH</td>
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
<tr><td style="background:#050505;border-bottom:4px solid #FFC80E;padding:28px 36px;">
  <p style="margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><img src="https://hahahub.art/logo-email.png" width="240" alt="HahaHub" style="display:block;border:0;height:auto;max-width:100%"></p>
  <p style="margin:6px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:#FFC80E;font-style:italic">The Laff Exchange</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:36px;">
  <div style="background:#EF4986;color:#fff;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:3px;padding:5px 14px;display:inline-block;margin-bottom:20px;">Early Access · Private Beta</div>
  <h1 style="color:#fff;font-size:28px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 4px;letter-spacing:-1px;line-height:1.15">Your show.<br/>Their stage.<br/>Same laff.<br/><span style="color:#FFC80E">Different city.</span></h1>
  <p style="color:rgba(255,255,255,0.3);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:4px;font-style:italic;margin:0 0 20px">Theatre comedy travels.</p>
  <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0 0 8px">Hi ${name},</p>
  <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0 0 8px">I'm building HahaHub.art. It's the international professional network for theatre comedy producers. The Laff Exchange experience: producers buy and sell rights to comedy productions directly. No agents, no commission, producer to producer.</p>
  <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0 0 24px">It's in private beta and your account is already set up. Tickle in and have a look:</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td style="background:#111;border:2px solid #FFC80E;padding:24px;">
      <p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px">Your login</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr><td style="background:#050505;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">Email (use this exact address)</p>
          <p style="font-size:15px;font-weight:900;color:#fff;margin:0;font-family:monospace">${email}</p>
        </td></tr>
        <tr><td style="background:#050505;padding:12px 16px;">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">Suggested password (or pick your own)</p>
          <p style="font-size:15px;font-weight:900;color:#19A596;margin:0;font-family:monospace">${password}</p>
        </td></tr>
      </table>
      <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0 0 14px">
        Click below, choose JOIN, then enter your name, the email above, and a password. You can use the suggested one or set your own. Just make sure the email matches exactly.
      </p>
      <a href="https://www.hahahub.art/#signup" style="background:#FFC80E;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000;font-style:italic">Tickle In →</a>
      <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:14px 0 0">You can change your password later in My Hub → My Profile.</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr><td style="background:#111;border:2px solid rgba(255,255,255,0.1);padding:20px;">
      <p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 10px">What is HahaHub.art?</p>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;margin:0 0 12px">HahaHub.art is not just a marketplace. It is your entire comedy production infrastructure. From first tickle to final royalty, everything happens here. No spreadsheets. No email chains. No agents with hats.</p>
      <p style="color:#fff;font-size:13px;font-weight:900;font-style:italic;margin:0 0 8px">That's HahaHub.art. The Laff Exchange.</p>
      <p style="color:#EF4986;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:3px;font-style:italic;margin:0">Tickle. Set Up. Punch.</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr>
      <td style="padding:0 8px 0 0;width:33%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#111;border-top:3px solid #FFC80E;padding:14px;">
          <p style="color:#FFC80E;font-size:16px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 6px">Tickle.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0">Browse the catalog. Find a show that fits your stage. Or list yours, let producers worldwide find it.</p>
        </td></tr></table>
      </td>
      <td style="padding:0 8px;width:33%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#111;border-top:3px solid #19A596;padding:14px;">
          <p style="color:#19A596;font-size:16px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 6px">Set Up.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0">Agree on terms. License signed. No commission. No middlemen. Just two producers and a show.</p>
        </td></tr></table>
      </td>
      <td style="padding:0 0 0 8px;width:33%;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#111;border-top:3px solid #EF4986;padding:14px;">
          <p style="color:#EF4986;font-size:16px;font-weight:900;text-transform:uppercase;font-style:italic;margin:0 0 6px">Punch.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;margin:0">Curtain up. Their show, your audience. Your show, their city. Comedy travels.</p>
        </td></tr></table>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:2px solid rgba(255,255,255,0.1);margin-bottom:16px;">
    <tr><td style="padding:20px;">
      <p style="color:#19A596;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 14px">Your comedy business. In one place.</p>
      <table width="100%" cellpadding="4" cellspacing="4">
        <tr>
          <td style="background:#050505;padding:10px 12px;width:50%"><p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Catalog</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Browse international shows.</p></td>
          <td style="background:#050505;padding:10px 12px;width:50%"><p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Pipeline</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Manage deals end-to-end.</p></td>
        </tr>
        <tr>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Analytics</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Views, territories, royalties.</p></td>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Paperwork</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Contract templates.</p></td>
        </tr>
        <tr>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Royalty Tracker</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Log and calculate earnings.</p></td>
          <td style="background:#050505;padding:10px 12px;"><p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;margin:0 0 3px">Calculator</p><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">Know your numbers.</p></td>
        </tr>
      </table>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr><td style="background:#050505;border-left:4px solid #FFC80E;padding:16px 20px;">
      <p style="color:#FFC80E;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 10px">As an early member you get</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0">Full access to every feature. <strong style="color:#FFC80E">Free. Forever.</strong></p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0">A permanent place on the platform, from day one.</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0">Real influence on how this gets built.</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td style="background:#050505;border-left:4px solid #EF4986;padding:16px 20px;">
      <p style="color:#EF4986;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px">What we ask from you</p>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;margin:0">Upload your show. Browse what's there. Tell us what's missing, what's broken, what should be better. Your feedback builds this platform. We read everything.</p>
    </td></tr>
  </table>

  <p style="color:rgba(255,255,255,0.3);font-size:12px;font-style:italic;margin:0 0 24px">Private beta. A small group of producers worldwide. You're one of them.</p>
  <a href="https://www.hahahub.art/#signup" style="background:#FFC80E;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000;font-style:italic">Tickle In →</a>

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
<tr><td style="background:#050505;border-bottom:4px solid #FFC80E;padding:32px 40px;">
  <p style="margin:0;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><img src="https://hahahub.art/logo-email.png" width="240" alt="HahaHub" style="display:block;border:0;height:auto;max-width:100%"></p>
  <p style="margin:4px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#EF4986">Tickle. Set Up. Punch.</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:40px;">
  <div style="background:#FFC80E;color:#000;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:3px;padding:6px 14px;display:inline-block;margin-bottom:24px;">⭐ HAHAHUB CREW #${spotNumber}</div>
  <h1 style="color:#fff;font-size:32px;font-weight:900;text-transform:uppercase;margin:0 0 16px;letter-spacing:-1px">${name}.<br/>You're in the history books. 🥊</h1>
  <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 24px">You're one of the first 20 producers to join HahaHub. That means your <strong style="color:#FFC80E">CREW</strong> badge is permanent — it will be on your profile forever, long after we're running thousands of shows worldwide.</p>
  <div style="background:#050505;border-left:4px solid #FFC80E;padding:20px 24px;margin:24px 0;">
    <p style="color:#FFC80E;font-size:10px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px">What to do now</p>
    <p style="margin:6px 0;color:rgba(255,255,255,0.8);font-size:13px;">1. <strong>Upload your show</strong> — SHOWLOAD → fill all sections → publish</p>
    <p style="margin:6px 0;color:rgba(255,255,255,0.8);font-size:13px;">2. <strong>Browse the catalog</strong> — find shows you want to license</p>
    <p style="margin:6px 0;color:rgba(255,255,255,0.8);font-size:13px;">3. <strong>Send feedback</strong> — hit the Feedback button, we read everything</p>
  </div>
  <div style="margin:32px 0 20px">
    <a href="https://www.hahahub.art" style="background:#FFC80E;color:#000;padding:16px 32px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:13px;border:3px solid #000">Enter HahaHub →</a>
  </div>
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
<tr><td style="background:#050505;border-bottom:4px solid #EF4986;padding:32px 40px;">
  <p style="margin:0;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#fff"><img src="https://hahahub.art/logo-email.png" width="240" alt="HahaHub" style="display:block;border:0;height:auto;max-width:100%"></p>
  <p style="margin:4px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#EF4986">Platform Notice</p>
</td></tr>
<tr><td style="background:#0a0a0a;padding:40px;">
  <h1 style="color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;margin:0 0 24px;letter-spacing:-1px">Hi ${name},</h1>
  <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;margin:0 0 16px">We're writing to let you know that your listing <strong style="color:#fff">"${showTitle}"</strong> has been reviewed by the HahaHub team and has been removed from the marketplace.</p>
  <div style="background:#050505;border-left:4px solid #EF4986;padding:20px 24px;margin:24px 0;">
    <p style="color:#EF4986;font-size:10px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px">Reason for removal</p>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0">${reason || 'Your listing did not meet HahaHub platform standards. This may be due to: missing or incomplete rights documentation, content that does not qualify as comedy theatre, potential intellectual property concerns, or inaccurate production information.'}</p>
  </div>
  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin:0 0 16px">If you believe this decision was made in error, or if you would like to resubmit your listing with updated information, please contact us directly.</p>
  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin:0 0 32px">Your account remains active and you are welcome to upload other productions that meet our platform guidelines.</p>
  <a href="mailto:info@hahahub.art" style="background:#FFC80E;color:#000;padding:14px 28px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;display:inline-block;font-size:12px;border:3px solid #000">Contact Us →</a>
</td></tr>
<tr><td style="background:#050505;border-top:2px solid rgba(255,255,255,0.05);padding:24px 40px;">
  <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0">HahaHub · The Laff Exchange · International Comedy Theatre Producers Platform<br/><a href="https://www.hahahub.art" style="color:rgba(255,255,255,0.2)">hahahub.art</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
  }),
};

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jnilgukmyfukazwduuig.supabase.co';
// Public anon key (same one the website uses) is enough to verify a user's token
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQ2MDksImV4cCI6MjA5MTE5MDYwOX0.KbwZf30tJMdEb_3Zie3UoGA-zJO4Z7zIf9sKYOggSyU';
const ADMIN_EMAIL = 'bacinhos@gmail.com';
const ADMIN_ONLY = ['founding_followup', 'founding_invite', 'show_removed'];
const SELF_ONLY = ['welcome', 'founding_welcome', 'inquiry_confirmation', 'deal_signed_producer'];
const EMAIL_RE = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

// Best-effort per-instance rate limit (per user, per hour)
const hits = new Map();
const LIMIT = 40;
function limited(key) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < 3600000);
  if (arr.length >= LIMIT) { hits.set(key, arr); return true; }
  arr.push(now); hits.set(key, arr);
  return false;
}

// Neutralise HTML in any user-supplied value before it reaches a template
function clean(v) {
  if (typeof v === 'string') return v.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 5000);
  if (Array.isArray(v)) return v.slice(0, 50).map(clean);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
  return v;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (/^https:\/\/([a-z0-9-]+\.)?hahahub\.art$/.test(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Must be a signed-in HahaHub user
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  let user;
  try {
    const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data || !data.user) return res.status(401).json({ error: 'Unauthorized' });
    user = data.user;
  } catch (e) {
    console.error('Auth check failed:', e);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const isAdmin = (user.email || '').toLowerCase() === ADMIN_EMAIL;

  const { type, data } = req.body || {};
  let to = (req.body || {}).to;
  if (!type || !to) return res.status(400).json({ error: 'Missing type or to' });
  if (typeof to !== 'string' || !EMAIL_RE.test(to)) return res.status(400).json({ error: 'Invalid recipient' });

  const template = templates[type];
  if (!template) return res.status(400).json({ error: 'Unknown email type' });

  // 2. Who may send what, and to whom
  if (type === 'feedback') to = 'info@hahahub.art';
  else if (ADMIN_ONLY.includes(type) && !isAdmin) return res.status(403).json({ error: 'Forbidden' });
  else if (SELF_ONLY.includes(type) && !isAdmin && to.toLowerCase() !== (user.email || '').toLowerCase()) return res.status(403).json({ error: 'Forbidden' });

  // 3. Rate limit
  if (!isAdmin && limited(user.id)) return res.status(429).json({ error: 'Too many emails, try again later' });

  const built = template(clean(data || {}));
  const subject = built.subject;
  // Gmail drops <body> backgrounds: wrap content in a table with an inline bgcolor
  const html = built.html
    .replace(/<body([^>]*)>/i, '<body$1 bgcolor="#050505" style="margin:0;padding:0;background:#050505"><table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background:#050505"><tr><td>')
    .replace(/<\/body>/i, '</td></tr></table></body>');

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      ...(type === 'inquiry' && EMAIL_RE.test(String((data || {}).buyerEmail || '')) ? { reply_to: data.buyerEmail } : {}),
      ...(type !== 'inquiry' && type !== 'inquiry_confirmation' ? { bcc: 'info@hahahub.art' } : {}),
      subject,
      html,
    });
    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Email failed' });
  }
};
