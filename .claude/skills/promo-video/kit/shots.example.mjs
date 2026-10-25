// Example recording script: the shots of the Oct 2026 overview promo (portrait, phone UI).
// Adapt per video. Run: node shots.mjs [shotName,...]   (no args → all)
import { openBrowser, BASE } from './record.mjs';

const only = process.argv[2]?.split(',');
const want = (n) => !only || only.includes(n);
const r = await openBrowser({ width: 400, height: 711, scale: 2.7, mobile: true }); // → 1080x1920 frames
const { page } = r;

// Live shot: search a move, highlight its block cell, open the video preview
if (want('search')) {
  await page.goto(`${BASE}/kazuya?viewMode=simple`, { waitUntil: 'networkidle' });
  await r.rec('search', async () => {
    await page.waitForTimeout(500);
    await r.tap(page.getByPlaceholder(/Search moves/));
    await r.type('df+2', 110);
    await page.waitForTimeout(500);
    const row = page.locator('tbody tr').filter({ has: page.locator('a[href="/t8/kazuya/df2"]') }).first();
    await r.box('hlBox', row.locator('td').nth(3)); // Block column → a 'box' overlay reads this event
    await page.waitForTimeout(2300);
    await r.tap(row.locator('button').first());
    await r.waitVideo('[role="dialog"] video');
    await page.waitForTimeout(2600);
  });
}

// Stills: rapid cuts
if (want('chars')) {
  for (const c of ['jin', 'reina', 'nina', 'king', 'bryan', 'paul', 'hwoarang', 'asuka', 'dragunov', 'lili', 'yoshimitsu', 'victor']) {
    await r.still(`char-${c}`, `/${c}?viewMode=simple`);
  }
}

// Live scroll + stills of one guide in every language
if (want('guides')) {
  await page.goto(`${BASE}/t8/guides`, { waitUntil: 'networkidle' });
  await r.warmLazyImages();
  await r.rec('guides', async () => { await page.waitForTimeout(200); await r.smoothScroll(1400, 1800); await page.waitForTimeout(300); });
  for (const l of ['en', 'ja', 'ko', 'es', 'de', 'ru', 'tr', 'ur']) await r.still(`guide-${l}`, `/kazuya/guide${l === 'en' ? '' : `?lang=${l}`}`);
}

// Live shot with app logic: answer two frame-quiz questions correctly.
// The quiz picks random moves, so look the answer up in the API and log 'correct' (→ ding sound).
if (want('quiz')) {
  const chars = (await (await fetch(`${BASE}/api/t8/characters`)).json()).characters;
  const fd = {};
  const blockFor = async (label) => {
    const [name, cmd] = label.split(/:\s(.+)/);
    const c = chars.find((x) => x.displayName.toLowerCase() === name.toLowerCase());
    fd[c.id] ??= (await (await fetch(`${BASE}/api/t8/${c.id}/framedata`)).json()).framesNormal;
    return parseInt(String(fd[c.id].find((m) => m.command === cmd).block).replace('+', ''), 10);
  };
  const bucket = (n) => n >= 1 ? '+1 or more' : n >= -9 ? '0 to -9' : n >= -11 ? '-10 to -11' : n >= -14 ? '-12 to -14' : '-15 or more';
  const label = () => page.evaluate(() => {
    const q = [...document.querySelectorAll('p')].find((e) => e.textContent.startsWith('How many frames is'));
    const card = q.closest('[data-slot="card"]') ?? q.parentElement.parentElement;
    return `${card.querySelector('span.whitespace-nowrap').textContent.replace(':', '').trim()}: ${q.querySelector('.font-bold').textContent.trim()}`;
  });
  await page.goto(`${BASE}/t8/framequiz`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Start quiz' }).first().click();
  await r.waitVideo('video', 0.3);
  await r.rec('quiz', async () => {
    for (let q = 0; q < 2; q++) {
      const n = await blockFor(await label());
      await page.waitForTimeout(q === 0 ? 1700 : 1300);
      await r.tap(page.getByRole('button', { name: bucket(n), exact: true }));
      if (await page.getByText('Excellent!').isVisible({ timeout: 1500 }).catch(() => false)) r.mark('correct');
      await page.waitForTimeout(1300);
      if (q === 0) { await r.tap(page.getByText('Excellent!')); await r.waitVideo('video', 0.3).catch(() => {}); }
    }
    await page.waitForTimeout(600);
  });
  await r.still('daily', '/t8/dailychallenge');
}

await r.close();
