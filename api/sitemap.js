const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jnilgukmyfukazwduuig.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const STATIC_PAGES = [
  { loc: 'https://hahahub.art/', changefreq: 'weekly', priority: '1.0' },
  { loc: 'https://hahahub.art/discovery', changefreq: 'daily', priority: '0.9' },
  { loc: 'https://hahahub.art/pricing', changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://hahahub.art/faq', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://hahahub.art/about', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://hahahub.art/login', changefreq: 'yearly', priority: '0.5' },
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetchamo vse javne showe
    const { data: shows } = await supabase
      .from('shows')
      .select('id, title, created_at, updated_at')
      .order('created_at', { ascending: false });

    const showUrls = (shows || []).map(show => ({
      // Ker je SPA, show se odpre prek discovery?show=ID — Google bo to indeksiral
      // Ko/če dodaš pravo routing, zamenjaj z: https://hahahub.art/shows/${show.id}
      loc: `https://hahahub.art/discovery?show=${show.id}`,
      lastmod: (show.updated_at || show.created_at || '').split('T')[0],
      changefreq: 'weekly',
      priority: '0.6',
    }));

    const allUrls = [...STATIC_PAGES, ...showUrls];

    const urlElements = allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>\n    ` : ''}<changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // 1h cache na CDN
    return res.status(200).send(xml);

  } catch (err) {
    console.error('Sitemap error:', err);
    // Fallback na statičen sitemap če Supabase ne odgovori
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(fallback);
  }
};
