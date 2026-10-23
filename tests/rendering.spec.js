import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test("3D exports, texture parity, old garage and renderer resources", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(
    () => document.querySelector("#car-preview")?.dataset.ready === "true",
  );
  const result = await page.evaluate(async () => {
    const [
      { initial },
      { buildVehicle },
      { disposeGroup },
      { captureVehicle },
      { plateCanvas },
    ] = await Promise.all([
      import("/src/state.js"),
      import("/src/car.js"),
      import("/src/vehicle/geometry.js"),
      import("/src/vehicle/renderer.js"),
      import("/src/plate.js"),
    ]);
    const model = await buildVehicle(initial),
      part = model.getObjectByName("license-plate");
    const expected = plateCanvas(initial.plate).toDataURL();
    const textureMatches = part.material.map.image.toDataURL() === expected;
    const dims = [
      part.geometry.parameters.width,
      part.geometry.parameters.height,
    ];
    const wheelCount = model.children.filter((c) => c.name === "wheel").length;
    const triangles = model.userData.triangles;
    disposeGroup(model);
    const png = await captureVehicle(initial, {
      width: 800,
      height: 580,
      view: "rear",
    });
    const image = new Image();
    await new Promise((resolve) => {
      image.onload = resolve;
      image.src = png;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 580;
    const c = canvas.getContext("2d");
    c.drawImage(image, 0, 0);
    const px = c.getImageData(0, 0, 800, 580).data;
    let painted = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] > 0) painted++;
    return {
      textureMatches,
      dims,
      wheelCount,
      triangles,
      png,
      cornerAlpha: px[3],
      painted,
    };
  });
  expect(result.textureMatches).toBe(true);
  expect(result.wheelCount).toBe(4);
  expect(result.dims[0] / result.dims[1]).toBeCloseTo(164 / 72, 5);
  expect(result.triangles).toBeGreaterThan(1000);
  expect(result.cornerAlpha).toBe(0);
  expect(result.painted).toBeGreaterThan(20000);
  await fs.writeFile(
    "screenshots/3d/export-rear.png",
    Buffer.from(result.png.split(",")[1], "base64"),
  );
  await page.evaluate(async () => {
    const { initial } = await import("/src/state.js");
    const old = structuredClone(initial);
    old.plate.text = "OLD TIMER";
    delete old.plate.vertical;
    localStorage.setItem(
      "mini-motor-garage",
      JSON.stringify([{ id: 123, name: "Garagem antiga", config: old }]),
    );
  });
  await page.reload();
  await page.waitForFunction(
    () => document.querySelector("#car-preview")?.dataset.ready === "true",
  );
  await page.locator("#garage").click();
  await page.locator('[data-restore="123"]').click();
  await page.locator('[data-tab="plate"]').click();
  await expect(page.getByLabel("Texto da placa", { exact: true })).toHaveValue(
    "OLD TIMER",
  );
  await expect(
    page.getByLabel("Alinhamento vertical", { exact: true }),
  ).toHaveValue("center");
  const captures = await page.evaluate(async () => {
    const { initial } = await import("/src/state.js");
    const { captureVehicle } = await import("/src/vehicle/renderer.js");
    const normal = await captureVehicle(initial, { width: 320, height: 320 });
    const variant = await captureVehicle(
      {
        ...initial,
        lights: "vertical",
        bumper: "sport",
        spoiler: "wild",
        wheels: "sport",
        exhaust: "quad",
        stripes: true,
      },
      { width: 320, height: 320 },
    );
    return [normal, variant];
  });
  expect(captures[0]).not.toBe(captures[1]);
});

test("plates remain unobstructed in every body and bumper, in both angles", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const failures = await page.evaluate(async () => {
    const { checkMounts } = await import("/tests/mount-check.js");
    return checkMounts();
  });
  expect(failures).toEqual([]);
});
