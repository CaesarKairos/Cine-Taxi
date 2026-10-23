import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
await fs.mkdir("screenshots/convertibles", { recursive: true });
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
  console.log("Opening");
  await page.goto(process.env.STUDIO_URL || "http://127.0.0.1:5173");
  console.log("Opened");
  await page.waitForLoadState("networkidle");
  console.log("Loaded");
  for (const body of ["roadster", "convertible"]) {
    await page.locator(`[data-key="body"][data-value="${body}"]`).click();
    await page.waitForFunction(
      (b) =>
        document.querySelector("#car-preview").dataset.body === b &&
        document.querySelector("#car-preview").dataset.ready === "true",
      body,
    );
    console.log("Selected", body);
    await page.locator('[data-tab="paint"]').click();
    await page
      .getByLabel("Cor principal", { exact: true })
      .fill(body === "roadster" ? "#ba252b" : "#6389b5");
    await page.locator('[data-tab="parts"]').click();
    await page
      .locator(
        `[data-key="lights"][data-value="${body === "roadster" ? "round" : "bar"}"]`,
      )
      .click();
    await page
      .locator(
        `[data-key="bumper"][data-value="${body === "roadster" ? "chrome" : "sport"}"]`,
      )
      .click();
    await page.locator('[data-tab="body"]').click();
    for (const roof of ["open", "closed"]) {
      await page.locator(`[data-key="roof"][data-value="${roof}"]`).click();
      await page.waitForFunction(
        () => document.querySelector("#car-preview").dataset.ready === "true",
      );
      for (const view of ["three-quarter", "rear"]) {
        await page.locator(`[data-view="${view}"]`).click();
        console.log(body, roof, view);
        await page.locator(".stage").screenshot({
          path: `screenshots/convertibles/${body}-${roof}-${view}.png`,
        });
      }
    }
  }
  await page.locator('[data-tab="paint"]').click();
  await page.getByLabel("Cor principal", { exact: true }).fill("#ba252b");
  await page.locator('[data-tab="parts"]').click();
  await page.locator('[data-key="lights"][data-value="round"]').click();
  await page.locator('[data-key="bumper"][data-value="chrome"]').click();
  await page.locator('[data-tab="body"]').click();
  await page.locator('[data-key="body"][data-value="roadster"]').click();
  await page.locator('[data-key="roof"][data-value="open"]').click();
  await page.locator('[data-view="three-quarter"]').click();
  await page.waitForFunction(
    () => document.querySelector("#car-preview")?.dataset.ready === "true",
  );
  await page.screenshot({
    path: "screenshots/convertibles/desktop.png",
    fullPage: true,
  });
  for (const kind of ["png", "icon"]) {
    const pending = page.waitForEvent("download");
    await page.locator(`[data-export="${kind}"]`).click();
    const download = await pending;
    await download.saveAs(`screenshots/convertibles/export-${kind}.png`);
    if (await download.failure()) throw new Error(`Failed export ${kind}`);
  }
  await page.evaluate(() =>
    document.querySelector("#toast").classList.remove("show"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > 390))
    throw new Error("Mobile overflow");
  await page.screenshot({
    path: "screenshots/convertibles/mobile.png",
    fullPage: true,
  });
  await page.locator('[data-tab="plate"]').click();
  await page.getByLabel("Texto da placa", { exact: true }).fill("NRVOUS");
  await page.waitForFunction(
    () => document.querySelector("#car-preview")?.dataset.ready === "true",
  );
  await page.screenshot({
    path: "screenshots/convertibles/mobile-plate.png",
    fullPage: true,
  });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("All captures and downloads completed without page errors.");
} finally {
  await browser.close();
}
