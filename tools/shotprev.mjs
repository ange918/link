import { chromium } from '/workspace/womandla-maquettes/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath:'/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport:{width:960,height:600} });
p.on('console', m=>console.log('console:', m.text()));
for (const [m,v,out] of JSON.parse(process.argv[2])) { await p.goto(`http://127.0.0.1:5199/preview.html?m=${m}&v=${v}`); await p.waitForFunction(()=>window.__done,null,{timeout:60000}); await p.waitForTimeout(300); await p.screenshot({path:out}); }
await b.close();
