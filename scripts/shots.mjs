import { chromium } from 'playwright';
const out = process.argv[2] || 'shots';
const pages = ['/', '/service/', '/support/', '/guide/', '/faq/', '/contact/', '/access/', '/news/', '/news/tvk-news-link/', '/works/'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(async () => chromium.launch());
for (const vp of [{ w: 1440, h: 900, tag: 'pc' }, { w: 390, h: 844, tag: 'sp' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto('http://localhost:4321' + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    const name = (p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_|_$/g, '')) + '-' + vp.tag + '.png';
    await page.screenshot({ path: `${out}/${name}`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log('done');
