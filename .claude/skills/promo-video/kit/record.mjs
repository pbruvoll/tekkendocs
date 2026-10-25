// Recording helpers for promo videos. Import from your shots.mjs:
//   import { openBrowser } from './record.mjs';
//   const r = await openBrowser({ width: 400, height: 711, scale: 2.7, mobile: true });
//   await r.page.goto(...); await r.rec('search', async () => { await r.tap(...); await r.type('df+2'); });
//   await r.still('guide-en', '/kazuya/guide'); await r.close();
// Live shots → shots/<name>/NNNN.jpg + frames.json ({frames:[{t,file}], events:[{type,t,...}]}).
// Times are seconds from the shot's first frame; event coordinates are in recorded-frame pixels.
import { chromium } from 'playwright';
import fs from 'node:fs';

export const BASE = 'https://tekkendocs.com';

export async function openBrowser({ width = 400, height = 711, scale = 2.7, mobile = true } = {}) {
  // Edge plays the site's H.264 move videos; the bundled Chromium cannot.
  // --force-device-scale-factor makes the screencast deliver full-resolution frames;
  // the emulated deviceScaleFactor alone gives CSS-pixel-sized (blurry) frames.
  const browser = await chromium.launch({ channel: 'msedge', args: [`--force-device-scale-factor=${scale}`] });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  fs.mkdirSync('stills', { recursive: true });

  let cur = null;
  cdp.on('Page.screencastFrame', (f) => {
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    if (!cur) return;
    const file = `${String(cur.frames.length).padStart(4, '0')}.jpg`;
    fs.writeFileSync(`${cur.dir}/${file}`, Buffer.from(f.data, 'base64'));
    cur.frames.push({ t: f.metadata.timestamp, file });
  });

  const mark = (type, data = {}) => cur && cur.events.push({ type, t: Date.now() / 1000, ...data });
  const toFrame = (b) => ({ x: b.x * scale, y: b.y * scale, w: b.width * scale, h: b.height * scale });

  const r = {
    page, ctx, scale, mark,
    /** Record a live shot while fn runs. */
    async rec(name, fn) {
      const dir = `shots/${name}`;
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      cur = { dir, frames: [], events: [], t0: Date.now() / 1000 };
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: Math.round(width * scale), maxHeight: Math.round(height * scale) });
      await page.waitForTimeout(150);
      await fn();
      await cdp.send('Page.stopScreencast');
      await page.waitForTimeout(100);
      const base = cur.frames[0]?.t ?? cur.t0;
      const rel = (t) => +(t - base).toFixed(4);
      fs.writeFileSync(`${dir}/frames.json`, JSON.stringify({
        frames: cur.frames.map((f) => ({ ...f, t: rel(f.t) })),
        events: cur.events.map((e) => ({ ...e, t: rel(e.t) })),
      }, null, 1));
      console.log(`${name}: ${cur.frames.length} frames, ${rel(cur.frames.at(-1).t)}s`);
      cur = null;
    },
    /** Tap with a visible ripple: logs a 'tap' event at the element's centre, then taps. */
    async tap(locator) {
      const b = await locator.boundingBox();
      mark('tap', { x: (b.x + b.width / 2) * scale, y: (b.y + b.height / 2) * scale });
      await page.waitForTimeout(220); // the ripple starts before the UI reacts
      await locator.tap();
    },
    /** Type like a person; each key logs a 'key' event (typing sound). */
    async type(text, delay = 100) {
      for (const ch of text) { mark('key'); await page.keyboard.type(ch); await page.waitForTimeout(delay); }
    },
    /** Log an element's box (frame pixels) as an event, e.g. for a highlight overlay. */
    async box(type, locator, extra = {}) {
      const b = await locator.boundingBox();
      mark(type, { ...toFrame(b), ...extra });
      return b;
    },
    async smoothScroll(dy, ms) {
      await page.evaluate(([dy, ms]) => new Promise((res) => {
        const y0 = scrollY, s = performance.now();
        const step = (n) => {
          const k = Math.min(1, (n - s) / ms), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
          scrollTo(0, y0 + dy * e);
          k < 1 ? requestAnimationFrame(step) : res();
        };
        requestAnimationFrame(step);
      }), [dy, ms]);
    },
    /** Scroll through the page once so lazy images are loaded before a scroll shot. */
    async warmLazyImages(depth = 3000) {
      for (let y = 0; y < depth; y += 500) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(250); }
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(500);
    },
    /** Wait until a <video> matching selector is actually playing. */
    waitVideo(selector = 'video', minTime = 0.1) {
      return page.waitForFunction(([s, m]) => { const v = document.querySelector(s); return v && v.currentTime > m; }, [selector, minTime], { timeout: 20000 });
    },
    /** Full-resolution screenshot of a page for rapid cuts. */
    async still(name, url, prep) {
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      if (prep) await prep();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `stills/${name}.jpg`, quality: 92, type: 'jpeg' });
    },
    close: () => browser.close(),
  };
  return r;
}
