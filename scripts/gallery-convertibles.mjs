// Contact sheet made only from real Playwright/WebGL captures.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const cards=[];
for(const [id,label] of [['roadster','Roadster clássico'],['convertible','Conversível moderno']]) {
 for(const [roof,title] of [['open','Capota aberta'],['closed','Capota fechada']]) {
 const data=await fs.readFile(`screenshots/convertibles/${id}-${roof}-three-quarter.png`);
 cards.push(`<article><h2>${label} <span>${title}</span></h2><img src="data:image/png;base64,${data.toString('base64')}" /></article>`);
 }
}
const browser=await chromium.launch({args:['--disable-gpu']});
try {
 const page=await browser.newPage({viewport:{width:1200,height:1100}});
 await page.setContent(`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:28px;background:#faf7ef;color:#293a37;font-family:Arial,sans-serif}h1{font-size:32px;margin:10px 0}p{color:#7a8375;font-size:13px;margin:0 0 24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}article{border:1px solid #d9dfd0;border-radius:12px;overflow:hidden}h2{font-size:15px;font-weight:500;margin:0;padding:14px;background:#fffdf5;display:flex;justify-content:space-between}h2 span{color:#a25b47;font-size:12px}img{width:100%;display:block}</style><h1>Uma garagem. Mais céu aberto.</h1><p>MINI MOTOR / CINE-TAXI · Geometria e interiores 3D · Capturas reais do Chromium</p><div class="grid">${cards.join('')}</div>`);
 await page.screenshot({path:'screenshots/convertibles/collection.png',fullPage:true});
 console.log('screenshots/convertibles/collection.png');
} finally {await browser.close();}
