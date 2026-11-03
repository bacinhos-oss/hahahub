// Serves the app shell with show-specific link-preview tags (WhatsApp, LinkedIn, Facebook, Google)
const SUPABASE_URL = 'https://jnilgukmyfukazwduuig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQ2MDksImV4cCI6MjA5MTE5MDYwOX0.KbwZf30tJMdEb_3Zie3UoGA-zJO4Z7zIf9sKYOggSyU';

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async function handler(req, res) {
  const id = String(req.query.id || '');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'hahahub.art';
  let html;
  try {
    const shell = await fetch(`https://${host}/index.html`);
    html = await shell.text();
  } catch (e) {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }

  let show = null;
  if (/^[A-Za-z0-9-]{8,64}$/.test(id)) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/shows?id=eq.${encodeURIComponent(id)}&select=id,title,english_title,synopsis,synopsis_en,image_url,location,genre,producer_name&limit=1`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const rows = await r.json();
      show = Array.isArray(rows) && rows[0] ? rows[0] : null;
    } catch (e) { /* fall through to the plain shell */ }
  }

  if (show) {
    const title = `${show.english_title || show.title} — HahaHub`;
    const synopsis = (show.synopsis_en || show.synopsis || '').replace(/\s+/g, ' ').trim();
    const meta = [show.genre, show.location].filter(Boolean).join(' · ');
    const desc = (synopsis ? synopsis.slice(0, 200) + (synopsis.length > 200 ? '…' : '') : 'A comedy theatre production listed on HahaHub, The Laff Exchange.') + (meta ? ` (${meta})` : '');
    const image = show.image_url || 'https://hahahub.art/og-image.png';
    const url = `https://hahahub.art/show/${encodeURIComponent(show.id)}`;
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(image)}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${esc(image)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
};
