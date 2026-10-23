import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
await fs.mkdir("screenshots/3d", { recursive: true });
const browser = await chromium.launch({
  args: ["--disable-gpu", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const ready = () =>
    page.waitForFunction(
      () => document.querySelector("#car-preview")?.dataset.ready === "true",
    );
  const tab = (id) => page.locator(`[data-tab="${id}"]`).click();
  const choose = (key, value) =>
    page.locator(`[data-key="${key}"][data-value="${value}"]`).click();
  const shot = async (name) => {
    await ready();
    await page
      .locator(".stage")
      .screenshot({ path: `screenshots/3d/${name}.png` });
  };
  const angle = async (view) => {
    await page.locator(`[data-view="${view}"]`).click();
  };
  await page.goto("http://127.0.0.1:5173/");
  await page.waitForLoadState("networkidle");
  await ready();
  await page.waitForFunction(
    () => document.querySelectorAll(".body-art img").length === 5,
  );
  const mountFailures = await page.evaluate(async () => {
    const { checkMounts } = await import("/tests/mount-check.js");
    return checkMounts();
  });
  if (mountFailures.length) throw new Error(JSON.stringify(mountFailures));
  console.log("Plate visibility: all 90 mounting scenarios passed.");
  await page.screenshot({
    path: "screenshots/3d/01-desktop.png",
    fullPage: true,
  });
  await page.screenshot({
    path: "screenshots/3d/01-estudio-desktop.png",
    fullPage: true,
  });
  for (const [body, color, text] of [
    ["sedan", "#6389b5", "BLUE 77"],
    ["hatch", "#87a996", "ECTO-1"],
    ["coupe", "#df593e", "NRVOUS"],
    ["muscle", "#353e47", "OUTATIME"],
    ["wagon", "#f1b849", "ROAD\nTRIP"],
  ]) {
    await page.locator("#reset").click();
    await tab("body");
    await choose("body", body);
    await shot(`${body}-quarter`);
    await angle("rear");
    await shot(`${body}-rear`);
    await angle("three-quarter");
    await choose("color", color);
    if (body === "hatch") {
      await tab("paint");
      await choose("finish", "matte");
    }
    await tab("parts");
    await choose(
      "lights",
      body === "hatch" ? "vertical" : body === "muscle" ? "rect" : "round",
    );
    if (body === "muscle") await choose("spoiler", "sport");
    if (body === "wagon") await choose("spoiler", "lip");
    if (body === "sedan") await choose("glass", "blue");
    await tab("plate");
    await page.getByLabel("Texto da placa", { exact: true }).fill(text);
    await shot(`car-${body}`);
    await angle("rear");
    await shot(`car-${body}-rear`);
    await angle("three-quarter");
    console.log(`Captured ${body}: both angles, original and customized.`);
  }
  await page.locator("#reset").click();
  await tab("parts");
  for (const [key, value] of [
    ["bumper", "sport"],
    ["spoiler", "wild"],
    ["wheels", "sport"],
    ["exhaust", "quad"],
  ])
    await choose(key, value);
  await tab("details");
  await page.getByText("Faixas de corrida", { exact: true }).click();
  await page.getByText("Adesivo de estrela", { exact: true }).click();
  await shot("car-custom-sport");
  await tab("plate");
  await page.locator('[data-preset="europe"]').click();
  await page.getByLabel("Texto da placa", { exact: true }).fill("OUTA\nTIME");
  await ready();
  await page.screenshot({
    path: "screenshots/3d/02-editor-placa.png",
    fullPage: true,
  });
  await page.locator("#reset").click();
  await ready();
  for (const kind of ["png", "icon", "plate-svg"]) {
    const pending = page.waitForEvent("download");
    await page.locator(`[data-export="${kind}"]`).click();
    const download = await pending;
    await download.saveAs(
      `screenshots/export-${kind}.${kind === "plate-svg" ? "svg" : "png"}`,
    );
    if (await download.failure()) throw new Error(`Export failed: ${kind}`);
  }
  await tab("body");
  await page.setViewportSize({ width: 390, height: 844 });
  await ready();
  await page.evaluate(() =>
    document.querySelector("#toast").classList.remove("show"),
  );
  await page.screenshot({
    path: "screenshots/3d/03-mobile.png",
    fullPage: true,
  });
  await tab("plate");
  await page.getByLabel("Texto da placa", { exact: true }).fill("MOBILE 1");
  await ready();
  await page.screenshot({
    path: "screenshots/3d/04-mobile-placa.png",
    fullPage: true,
  });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    "Visual QA captures complete, including transparent exports and mobile.",
  );
} finally {
  await browser.close();
}
