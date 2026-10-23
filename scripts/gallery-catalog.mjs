import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const titles = {
  sedan: "Sedã",
  hatch: "Hatch",
  coupe: "Cupê",
  muscle: "Muscle",
  wagon: "Perua",
  roadster: "Roadster",
  convertible: "Conversível",
  van: "Van retrô",
  pickup: "Picape",
  offroad: "Jipe",
  wedge: "Futurista",
  retro: "Compacto retrô",
};
const cards = [];
for (const [id, title] of Object.entries(titles)) {
  const images = [];
  for (const view of ["three-quarter", "rear"]) {
    const b64 = (
      await fs.readFile(`screenshots/catalog/${id}-${view}.png`)
    ).toString("base64");
    images.push(
      `<img src="data:image/png;base64,${b64}" alt="${title} ${view}">`,
    );
  }
  cards.push(
    `<article><h2>${title}</h2><div>${images.join("")}</div></article>`,
  );
}
const browser = await chromium.launch({ args: ["--disable-gpu"] });
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1100 },
  });
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#f8f5ec;color:#293a37;padding:30px;font:14px Arial}h1{font-size:36px;margin:5px 0 12px}p{color:#75806f;margin:0 0 25px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}article{border:1px solid #d7ddce;border-radius:13px;overflow:hidden;background:#e9eddf}h2{margin:0;padding:14px;background:#fffdf4;font-size:16px;font-weight:500}article div{display:flex}img{width:50%;height:auto;object-fit:contain}</style><h1>Doze miniaturas. Infinitas histórias.</h1><p>MINI MOTOR / CINE-TAXI · Capturas reais do renderizador · Vista traseira ¾ e traseira</p><div class="grid">${cards.join("")}</div>`,
  );
  await page.screenshot({
    path: "screenshots/catalog/collection-12.png",
    fullPage: true,
  });
  const options = [];
  for (const [id, title] of [
    ["van-rack", "Van · bagageiro"],
    ["pickup-flat", "Picape · lona"],
    ["pickup-canopy", "Picape · capota"],
    ["offroad-equipped", "Jipe · estepe e bagageiro"],
    ["wedge-steel", "Futurista · aço e faixas"],
    ["retro-racing", "Compacto · pintura de corrida"],
  ]) {
    const images = [];
    for (const view of ["three-quarter", "rear"]) {
      const data = (
        await fs.readFile(`screenshots/catalog/${id}-${view}.png`)
      ).toString("base64");
      images.push(`<img src="data:image/png;base64,${data}" alt="${title}">`);
    }
    options.push(
      `<article><h2>${title}</h2><div>${images.join("")}</div></article>`,
    );
  }
  await page
    .locator("h1")
    .evaluate((el) => (el.textContent = "Prontos para outra história."));
  await page
    .locator(".grid")
    .evaluate((el, html) => (el.innerHTML = html), options.join(""));
  await page.setViewportSize({ width: 1600, height: 600 });
  await page.screenshot({
    path: "screenshots/catalog/accessories.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
