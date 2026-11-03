// Dynamic sitemap: home page + one URL per show
const SUPABASE_URL = 'https://jnilgukmyfukazwduuig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQ2MDksImV4cCI6MjA5MTE5MDYwOX0.KbwZf30tJMdEb_3Zie3UoGA-zJO4Z7zIf9sKYOggSyU';

module.exports = async function handler(req, res) {
  let shows = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/shows?select=id,created_at&order=created_at.desc&limit=1000`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    const rows = await r.json();
    if (Array.isArray(rows)) shows = rows;
  } catch (e) { /* home page only */ }

  const urls = [
    '  <url><loc>https://hahahub.art/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>',
    ...shows.filter(s => s.id).map(s =>
      `  <url><loc>https://hahahub.art/show/${encodeURIComponent(s.id)}</loc>${s.created_at ? `<lastmod>${String(s.created_at).slice(0, 10)}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.7</priority></url>`),
  ];
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
};
