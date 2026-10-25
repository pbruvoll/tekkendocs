// Renders comp.html + timeline.js frame by frame.
//   node render.mjs test 0.5 3.8 12     → out/test/t<time>.jpg (check framing)
//   node render.mjs full                → out/frames/NNNN.jpg + out/cues.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [mode = 'test', ...times] = process.argv.slice(2);
const shots = Object.fromEntries(fs.existsSync('shots')
  ? fs.readdirSync('shots').filter((s) => fs.existsSync(`shots/${s}/frames.json`)).map((s) => [s, JSON.parse(fs.readFileSync(`shots/${s}/frames.json`, 'utf8'))])
  : []);
const avatars = fs.existsSync('media/avatars') ? fs.readdirSync('media/avatars').filter((f) => f.endsWith('.png')) : [];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
p.on('console', (m) => m.type() === 'error' && console.log('page:', m.text()));
p.on('pageerror', (e) => console.log('page error:', e.message));
await p.addInitScript(([s, a]) => { window.SHOTS = s; window.AVATARS = a; }, [shots, avatars]);
const url = pathToFileURL(path.resolve('comp.html')).href;
await p.goto(url);
const { width, height, fps = 30, duration } = await p.evaluate(() => window.VIDEO);
await p.setViewportSize({ width, height });
await p.goto(url); // reload at the final size so the layout is computed for it
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));

const dir = mode === 'full' ? 'out/frames' : 'out/test';
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const ts = mode === 'full' ? Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps) : times.map(Number);
const t0 = Date.now();
for (const [i, t] of ts.entries()) {
  await p.evaluate((t) => window.renderAt(t), t);
  const name = mode === 'full' ? `${String(i).padStart(4, '0')}.jpg` : `t${t.toFixed(2)}.jpg`;
  await p.screenshot({ path: `${dir}/${name}`, type: 'jpeg', quality: 94 });
  if (mode === 'full' && i % 150 === 0) console.log(`${i}/${ts.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
fs.writeFileSync('out/cues.json', JSON.stringify({ duration, cues: await p.evaluate(() => window.cues()) }));
console.log(`${ts.length} frames → ${dir}, ${width}x${height}@${fps}`);
await b.close();
