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
  const ids = await page.evaluate(async () =>
    Object.keys((await import("/src/state.js")).bodies),
  );
  for (const body of ids.filter(
    (id) => !process.env.BODIES || process.env.BODIES.split(",").includes(id),
  )) {
    const captures = await page.evaluate(async (body) => {
      const { initial, normalizeConfiguration } = await import("/src/state.js");
      const { captureVehicle } = await import("/src/vehicle/renderer.js");
      const presets = {
        van: { color: "#63a9a1", secondary: "#f6e3b6", lights: "vertical" },
        pickup: { color: "#a54839", secondary: "#c99c66", lights: "vertical" },
        offroad: { color: "#7f9164", secondary: "#efe3c5", lights: "rect" },
        wedge: {
          color: "#b7c1c5",
          finish: "steel",
          lights: "bar",
          bumper: "sport",
          plate: { ...initial.plate, text: "OUTATIME" },
        },
        retro: {
          color: "#eee2c5",
          lights: "round",
          plate: { ...initial.plate, text: "HERBIE" },
        },
      };
      const s = normalizeConfiguration({ ...initial, body, ...presets[body] });
      const result = {};
      for (const view of ["rear", "three-quarter"])
        result[view] = await captureVehicle(s, {
          width: 720,
          height: 540,
          view,
        });
      return result;
    }, body);
    for (const [view, url] of Object.entries(captures))
      await fs.writeFile(
        `screenshots/catalog/${body}-${view}.png`,
        Buffer.from(url.split(",")[1], "base64"),
      );
    console.log("Captured", body);
  }
  if (errors.length) throw new Error(errors.join("\n"));
} finally {
  await browser.close();
}
