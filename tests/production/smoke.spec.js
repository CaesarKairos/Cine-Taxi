import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
async function ready(page, body) {
  await expect(page.locator("#car-preview")).toHaveAttribute(
    "data-ready",
    "true",
  );
  if (body)
    await expect(page.locator("#car-preview")).toHaveAttribute(
      "data-body",
      body,
    );
}
test("compiled Mini Motor: twelve cars, customization, persistence, exports and mobile", async ({
  page,
}, info) => {
  const errors = [],
    network = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    errors.push(`${request.url()}: ${request.failure()?.errorText}`),
  );
  page.on("response", (response) => {
    network.push({
      url: response.url(),
      status: response.status(),
      type: response.headers()["content-type"],
    });
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto("/");
  expect(await response.text()).not.toMatch(/(?:src|href)="\/src\//);
  await expect(page.locator("h1")).toContainText("Seu próximo");
  await ready(page, "roadster");
  await expect(page.locator("#car-preview")).toHaveAttribute(
    "data-triangles",
    /^[1-9]\d*$/,
  );
  await fs.mkdir("screenshots/production", { recursive: true });
  await page.screenshot({
    path: "screenshots/production/desktop.png",
    fullPage: true,
  });
  console.log("Production: initial roadster rendered");
  const bodies = await page
    .locator('[data-key="body"]')
    .evaluateAll((nodes) => nodes.map((node) => node.dataset.value));
  expect(bodies).toHaveLength(12);
  for (const body of bodies) {
    await page.locator(`[data-key="body"][data-value="${body}"]`).click();
    await ready(page, body);
    console.log(`Production: rendered ${body}`);
  }
  await page.locator("#reset").click();
  await ready(page, "roadster");
  await page.locator('[data-key="color"][data-value="#6389b5"]').click();
  await ready(page);
  await expect(page.locator("#color-name")).toHaveText("Azul passeio");
  await page.locator('[data-view="rear"]').click();
  await expect(page.locator("#car-preview")).toHaveAttribute(
    "data-view",
    "rear",
  );
  await page.locator('[data-view="three-quarter"]').click();
  await page.locator('[data-tab="plate"]').click();
  await page.getByLabel("Texto da placa", { exact: true }).fill("PROD 26");
  await ready(page);
  await expect(page.locator("#plate-preview")).toContainText("PROD 26");
  await page.locator("#save").click();
  console.log("Production: customization saved");
  await page.reload();
  await ready(page);
  await page.locator("#garage").click();
  await page.locator("[data-restore]").first().click();
  await ready(page, "roadster");
  await page.locator('[data-tab="plate"]').click();
  await expect(page.getByLabel("Texto da placa", { exact: true })).toHaveValue(
    "PROD 26",
  );
  for (const kind of ["png", "icon", "plate-svg"]) {
    const pending = page.waitForEvent("download");
    await page.locator(`[data-export="${kind}"]`).click();
    const download = await pending;
    console.log(`Production: downloaded ${kind}`);
    expect(await download.failure()).toBeNull();
    const bytes = await fs.readFile(await download.path());
    expect(bytes.length).toBeGreaterThan(1000);
    if (kind === "plate-svg") {
      expect(bytes.toString()).toContain("PROD 26");
      expect(bytes.toString()).toContain("data:font");
    } else expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.getByLabel("Texto da placa", { exact: true }).fill("MOBILE");
  await ready(page);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "screenshots/production/mobile.png",
    fullPage: true,
  });
  for (const item of network) {
    const path = new URL(item.url).pathname;
    if (path.endsWith(".js")) expect(item.type).toMatch(/javascript/);
    if (path.endsWith(".css")) expect(item.type).toContain("text/css");
    if (path.endsWith(".json")) expect(item.type).toContain("json");
  }
  await info.attach("console-errors", {
    body: JSON.stringify(errors),
    contentType: "application/json",
  });
  await info.attach("network", {
    body: JSON.stringify(network, null, 2),
    contentType: "application/json",
  });
  expect(
    network.some((r) => r.url.includes("/models/") && r.type?.includes("json")),
  ).toBeTruthy();
  expect(network.some((r) => r.url.endsWith(".woff2"))).toBeTruthy();
  expect(errors).toEqual([]);
});
test("WebGL unavailable keeps editor and visible explanation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : original.call(this, type, ...args);
    };
  });
  await page.goto("/");
  await expect(page.locator(".render-error")).toContainText("WebGL 2");
  await page.locator('[data-tab="plate"]').click();
  await expect(
    page.getByLabel("Texto da placa", { exact: true }),
  ).toBeVisible();
});
test("failed application chunk shows startup error", async ({ page }) => {
  await page.route("**/assets/main-*.js", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#startup-error")).toContainText(
    "Não foi possível",
  );
});
test("one failed model keeps controls available and allows recovery", async ({
  page,
}) => {
  await page.route("**/models/*.json", (route) =>
    route.fulfill({ status: 404, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/");
  await page.locator('[data-key="body"][data-value="sedan"]').click();
  await expect(page.locator("#car-preview .render-error")).toContainText(
    "Escolha outra carroceria",
  );
  await page.unroute("**/models/*.json");
  await page.locator('[data-key="body"][data-value="hatch"]').click();
  await ready(page, "hatch");
  await expect(page.locator("#car-preview .render-error")).toHaveCount(0);
});
