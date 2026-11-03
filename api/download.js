// api/download.js - Proxy for file downloads (Supabase Storage only)
const ALLOWED_HOST = 'jnilgukmyfukazwduuig.supabase.co';

export default async function handler(req, res) {
  const { url, name } = req.query;

  let parsed;
  try { parsed = new URL(url); } catch (e) { return res.status(400).json({ error: 'Invalid URL' }); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== ALLOWED_HOST || !parsed.pathname.startsWith('/storage/v1/')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(parsed.toString(), { redirect: 'error' });
    if (!response.ok) return res.status(404).json({ error: 'File not found' });

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const safeName = String(name || 'file').replace(/[^\w.\- ]+/g, '_').slice(0, 120);

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    return res.send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: 'Download failed' });
  }
}
