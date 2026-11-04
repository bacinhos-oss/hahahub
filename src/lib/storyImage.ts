// Builds a 1080x1920 Instagram Story image for a show: black background, poster, title, logo and link.
const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('image failed: ' + src));
  img.src = src;
});

export async function downloadShowStory(show: { id: string; title: string; imageUrl?: string; location?: string }) {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Logo on top
  try {
    const logo = await load('/logo-email.png');
    const lw = 640, lh = Math.round(lw * logo.height / logo.width);
    ctx.drawImage(logo, (W - lw) / 2, 110, lw, lh);
  } catch { /* logo is optional */ }

  // Poster, whole (never cropped)
  if (show.imageUrl) {
    const poster = await load(show.imageUrl);
    const maxW = 860, maxH = 1100;
    const r = Math.min(maxW / poster.width, maxH / poster.height);
    const pw = Math.round(poster.width * r), ph = Math.round(poster.height * r);
    const px = (W - pw) / 2, py = 330;
    ctx.fillStyle = '#FFDE03';
    ctx.fillRect(px - 8, py - 8, pw + 16, ph + 16);
    ctx.drawImage(poster, px, py, pw, ph);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFDE03';
  ctx.font = 'italic 900 64px "Space Grotesk", Arial, sans-serif';
  const title = show.title.toUpperCase();
  const words = title.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > 900 && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 1560 + i * 74));

  if (show.location) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'italic 600 34px "Space Grotesk", Arial, sans-serif';
    ctx.fillText(show.location, W / 2, 1720);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 800 38px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('hahahub.art', W / 2, 1830);

  const blob: Blob = await new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/png'));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hahahub-${show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-story.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
