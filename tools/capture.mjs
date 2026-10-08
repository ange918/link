import { chromium } from '/workspace/womandla-maquettes/node_modules/playwright/index.mjs';
import fs from 'fs';
const URL = process.env.URL || 'http://127.0.0.1:5200/';
const OUT = process.env.OUT || '/workspace/plane-demo/captures';
fs.mkdirSync(OUT, { recursive: true });
const jobs = JSON.parse(process.argv[2]); // [{name, i, w, h, mobile, reduced}]
const b = await chromium.launch({ executablePath: '/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const groups = {};
for (const j of jobs) { const k = `${j.w}x${j.h}${j.mobile ? 'm' : ''}${j.reduced ? 'r' : ''}`; (groups[k] ??= []).push(j); }
for (const list of Object.values(groups)) {
  const j0 = list[0];
  const ctx = await b.newContext({ viewport: { width: j0.w, height: j0.h }, deviceScaleFactor: j0.mobile ? 2 : 1, isMobile: !!j0.mobile, hasTouch: !!j0.mobile,
    reducedMotion: j0.reduced ? 'reduce' : 'no-preference',
    userAgent: j0.mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : undefined });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.type(), m.text().slice(0, 200)); });
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__demo && window.__demo.ready, null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  for (const j of list) {
    await p.evaluate((i) => { const s = window.__demo.sections[i]; window.scrollTo(0, s ? s.offsetTop : document.body.scrollHeight); }, j.i);
    // attendre que la timeline scrubée se stabilise
    for (let k = 0; k < 80; k++) { await p.waitForTimeout(250); const t = await p.evaluate(() => window.__demo.tl.time()); if (Math.abs(t - Math.min(j.i, 9)) < 0.003) break; }
    if (j.t != null) await p.evaluate((t) => { window.__demo.tl.seek(t); window.__demo.render(); }, j.t);
    if (j.hideUi) await p.addStyleTag({ content: '#story,.topbar,.progress,.callouts,.bignum{visibility:hidden!important}' });
    if (j.free) await p.evaluate((f) => window.__demo.freeCam(f.pos, f.tgt, f.fov), j.free);
    await p.waitForTimeout(j.wait ?? 900);
    const t = await p.evaluate(() => window.__demo.tl.time());
    await p.screenshot({ path: `${OUT}/${j.name}.png` });
    console.log(j.name, 'tl', t.toFixed(3));
  }
  await ctx.close();
}
await b.close();
