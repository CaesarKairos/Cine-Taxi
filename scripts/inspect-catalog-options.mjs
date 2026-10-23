import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
await fs.mkdir("screenshots/catalog", { recursive: true });
const browser = await chromium.launch({
  args: ["--disable-gpu", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(180000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.STUDIO_URL || "http://127.0.0.1:5173");
  await page.waitForLoadState("networkidle");
  for (const [id, config] of [
    [
      "van-rack",
      {
        body: "van",
        rack: true,
        color: "#63a9a1",
        secondary: "#f4d78b",
        lights: "vertical",
      },
    ],
    [
      "pickup-flat",
      {
        body: "pickup",
        bedCover: "flat",
        color: "#a54839",
        lights: "vertical",
      },
    ],
    [
      "pickup-canopy",
      {
        body: "pickup",
        bedCover: "canopy",
        color: "#6389b5",
        secondary: "#f0dbc2",
        lights: "vertical",
      },
    ],
    [
      "offroad-equipped",
      {
        body: "offroad",
        spare: true,
        rack: true,
        color: "#7f9164",
        secondary: "#e4d5b3",
        bumper: "sport",
        lights: "rect",
      },
    ],
    [
      "wedge-steel",
      {
        body: "wedge",
        finish: "steel",
        color: "#b7c1c5",
        secondary: "#323e45",
        stripes: true,
        lights: "bar",
        bumper: "sport",
      },
    ],
    [
      "retro-racing",
      { body: "retro", color: "#eee2c5", secondary: "#a54839", stripes: true },
    ],
  ].filter(
    ([id]) =>
      !process.env.OPTIONS || process.env.OPTIONS.split(",").includes(id),
  )) {
    const captures = await page.evaluate(async (config) => {
      const { initial, normalizeConfiguration } = await import("/src/state.js");
      const { captureVehicle } = await import("/src/vehicle/renderer.js");
      const s = normalizeConfiguration({
        ...initial,
        ...config,
        plate: {
          ...initial.plate,
          text:
            config.body === "wedge"
              ? "OUTATIME"
              : config.body === "retro"
                ? "HERBIE"
                : config.body === "van"
                  ? "MYSTERY"
                  : "MINI 12",
        },
      });
      const result = {};
      for (const view of ["rear", "three-quarter"])
        result[view] = await captureVehicle(s, {
          width: 800,
          height: 600,
          view,
        });
      result.icon = await captureVehicle(s, { width: 256, height: 256 });
      return result;
    }, config);
    for (const [view, url] of Object.entries(captures))
      await fs.writeFile(
        `screenshots/catalog/${id}-${view}.png`,
        Buffer.from(url.split(",")[1], "base64"),
      );
    console.log("Options captured", id);
  }
  if (!process.env.OPTIONS) {
    await page.locator('[data-family="utility"]').click();
    await page.locator('[data-key="body"][data-value="offroad"]').click();
    await page.getByText("Estepe externo", { exact: true }).click();
    await page.getByText("Bagageiro no teto", { exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector("#car-preview")?.dataset.ready === "true",
    );
    await page.screenshot({
      path: "screenshots/catalog/desktop.png",
      fullPage: true,
    });
    for (const kind of ["png", "icon", "plate-svg"]) {
      const pending = page.waitForEvent("download");
      await page.locator(`[data-export="${kind}"]`).click();
      const d = await pending;
      await d.saveAs(
        `screenshots/catalog/export-${kind}.${kind === "plate-svg" ? "svg" : "png"}`,
      );
      if (await d.failure()) throw new Error("Download " + kind);
    }
    await page.evaluate(() =>
      document.querySelector("#toast").classList.remove("show"),
    );
    await page.setViewportSize({ width: 390, height: 844 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > 390))
      throw new Error("Mobile overflow");
    await page.screenshot({
      path: "screenshots/catalog/mobile.png",
      fullPage: true,
    });
    await page.locator('[data-key="body"][data-value="pickup"]').click();
    await page.locator('[data-key="bedCover"][data-value="canopy"]').click();
    await page.waitForFunction(
      () => document.querySelector("#car-preview")?.dataset.ready === "true",
    );
    await page.screenshot({
      path: "screenshots/catalog/mobile-pickup.png",
      fullPage: true,
    });
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    process.env.OPTIONS
      ? "Selected options captured."
      : "Options, mobile and downloads verified.",
  );
} finally {
  await browser.close();
}
