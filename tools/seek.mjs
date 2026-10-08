// Capture rapide à un temps de timeline donné (réglage des plans)
import { chromium } from '/workspace/womandla-maquettes/node_modules/playwright/index.mjs';
const [w, h, mobile] = [+process.env.W || 1280, +process.env.H || 800, !!process.env.MOBILE];
const URL = process.env.URL || 'http://127.0.0.1:5199/';
const TAG = process.env.TAG || 'x';
const b = await chromium.launch({ executablePath: '/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
p.on('pageerror', (e) => console.log('pageerror', e.message));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.type(), m.text()); });
await p.goto(URL); await p.waitForFunction(() => window.__demo?.ready, null, { timeout: 90000 });
await p.waitForTimeout(800);
for (const t of process.argv.slice(2)) {
  await p.evaluate((t) => window.scrollTo(0, Math.round(+t * window.innerHeight)), t);
  await p.waitForFunction((t) => Math.abs(window.__demo.tl.time() - +t) < 0.003, t, { timeout: 20000 }).catch(() => console.log('no settle', t));
  await p.evaluate((t) => { window.__demo.tl.seek(+t); window.__demo.render(); }, t);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `/workspace/plane-demo/.scratch/seek-${TAG}-${w}-${t}.png` });
}
await b.close();
