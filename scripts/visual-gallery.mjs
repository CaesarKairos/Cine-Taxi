// Assemble real browser captures into a review sheet; no generated car artwork.
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const items = [
  ["sedan", "Sedã · BLUE 77"],
  ["hatch", "Hatchback · ECTO-1"],
  ["coupe", "Cupê · NRVOUS"],
  ["muscle", "Muscle · OUTATIME"],
  ["wagon", "Perua · ROAD TRIP"],
  ["custom-sport", "Preparação esportiva"],
];
const cards = await Promise.all(
  items.map(async ([id, title]) => {
    const image = (await fs.readFile(`screenshots/3d/car-${id}.png`)).toString(
      "base64",
    );
    return `<article><h2>${title}</h2><img src="data:image/png;base64,${image}" alt="${title}"/></article>`;
  }),
);
const browser = await chromium.launch({ args: ["--disable-gpu"] });
try {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1100 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:34px;background:#f7f5ef;color:#293a37;font-family:Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}h1{font-size:32px;letter-spacing:-1.3px;margin:7px 0}h1 span{color:#d85d43}.eyebrow{font-size:10px;letter-spacing:2px}p{font-size:12px;line-height:1.6;margin:0;color:#76816e}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{border:1px solid #d8ddce;border-radius:12px;background:#fffdf5;overflow:hidden}h2{font-size:13px;font-weight:500;margin:0;padding:14px 17px;border-bottom:1px solid #d8ddce}img{width:100%;display:block}footer{margin-top:20px;font-size:10px;letter-spacing:1px;color:#7d8875}</style><header><div><div class="eyebrow">MINI MOTOR / CINE-TAXI</div><h1>Os novos <span>originais.</span></h1><p>Cinco carrocerias. Geometria 3D. A mesma garagem.</p></div><p>Capturas reais do Chromium<br>Vista traseira ¾ · editor preservado</p></header><div class="grid">${cards.join("")}</div><footer>THREE.JS · BASES KENNEY CC0 ADAPTADAS · PEÇAS E PLACAS PERSONALIZÁVEIS</footer></html>`,
  );
  await page.screenshot({
    path: "screenshots/3d/collection.png",
    fullPage: true,
  });
  console.log("Review sheet: screenshots/3d/collection.png");
} finally {
  await browser.close();
}
