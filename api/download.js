// api/download.js - Proxy for file downloads
export default async function handler(req, res) {
  const { url, name } = req.query;
  
  if (!url || !url.includes('supabase.co')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(404).json({ error: 'File not found' });
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${name || 'file'}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
