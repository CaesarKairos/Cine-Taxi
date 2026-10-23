import { test, expect } from "@playwright/test";

test("catalog capabilities, open bed, accessory mounts and garage migration", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const result = await page.evaluate(async () => {
    const { initial, bodies, normalizeConfiguration } =
      await import("/src/state.js");
    const { buildVehicle } = await import("/src/car.js");
    const { disposeGroup } = await import("/src/vehicle/geometry.js");
    const { Vector3, Raycaster, Box3 } = await import("/tests/three.js");
    const rows = [];
    for (const body of ["van", "pickup", "offroad", "wedge", "retro"]) {
      const config = normalizeConfiguration({
        ...initial,
        body,
        rack: true,
        spare: true,
        bedCover: "canopy",
        finish: "steel",
        spoiler: "wild",
        stripes: true,
      });
      const car = await buildVehicle(config);
      car.updateMatrixWorld(true);
      const named = (n) => {
        let count = 0;
        car.traverse((o) => {
          if (o.name === n) count++;
        });
        return count;
      };
      const rackGaps = car.children
        .filter((o) => o.name === "rack-foot")
        .map((foot) => {
          const bounds = new Box3().setFromObject(foot);
          const hit = new Raycaster(
            new Vector3(foot.position.x, 4, foot.position.z),
            new Vector3(0, -1, 0),
          ).intersectObjects(
            car.children.filter((o) => o.name === "roof"),
            false,
          )[0];
          return hit ? bounds.min.y - hit.point.y : 100;
        });
      let spareGap = null;
      if (config.spare) {
        const bracket = car.getObjectByName("spare-bracket");
        const bounds = new Box3().setFromObject(bracket);
        const hit = new Raycaster(
          new Vector3(0, bracket.position.y, -4),
          new Vector3(0, 0, 1),
        ).intersectObjects(
          car.children.filter((o) => o.name === "cabin-rear"),
          false,
        )[0];
        spareGap = hit ? hit.point.z - bounds.max.z : 100;
      }
      rows.push({
        body,
        config,
        wheels: named("wheel"),
        plate: named("license-plate"),
        rack: named("rack-foot"),
        spare: named("spare-tire"),
        spoiler: named("spoiler"),
        floor: named("bed-floor"),
        stripes: named("racing-stripes"),
        rackGaps,
        spareGap,
        bounds: new Box3().setFromObject(car).getSize(new Vector3()).toArray(),
      });
      disposeGroup(car);
    }
    const bed = await buildVehicle({
      ...initial,
      body: "pickup",
      bedCover: "open",
    });
    bed.updateMatrixWorld(true);
    const hit = new Raycaster(
      new Vector3(0, 4, -0.8),
      new Vector3(0, -1, 0),
    ).intersectObjects(bed.children, true)[0];
    const openBed = hit?.object.name;
    disposeGroup(bed);
    const old = normalizeConfiguration({
      body: "coupe",
      plate: { text: "OLD GARAGE" },
    });
    return { initial, count: Object.keys(bodies).length, rows, openBed, old };
  });
  expect(result.count).toBe(12);
  expect(result.initial).toMatchObject({
    body: "roadster",
    roof: "open",
    color: "#ba252b",
    interior: "#f0dbc2",
    plate: { text: "NRVOUS" },
  });
  for (const row of result.rows) {
    expect(row.wheels).toBe(4);
    expect(row.plate).toBe(1);
    expect(row.spoiler).toBe(0);
    expect(row.rack).toBe(["van", "offroad"].includes(row.body) ? 4 : 0);
    expect(row.spare).toBe(row.body === "offroad" ? 1 : 0);
    expect(row.config.finish).toBe(row.body === "wedge" ? "steel" : "gloss");
    expect(row.stripes).toBeGreaterThan(0);
    for (const gap of row.rackGaps) {
      expect(gap).toBeLessThan(0.015);
      expect(gap).toBeGreaterThan(-0.02);
    }
    if (row.spareGap !== null) {
      expect(row.spareGap).toBeLessThan(0.01);
      expect(row.spareGap).toBeGreaterThan(-0.03);
    }
  }
  expect(["bed-floor", "bed-rib"]).toContain(result.openBed);
  expect(result.old).toMatchObject({
    body: "coupe",
    roof: "fixed",
    rack: false,
    spare: false,
    bedCover: "open",
    plate: { text: "OLD GARAGE" },
  });
  await expect(page.locator(".body-card")).toHaveCount(12);
  await page.locator('[data-family="utility"]').click();
  await expect(page.locator(".body-card")).toHaveCount(4);
  await page.locator('[data-key="body"][data-value="offroad"]').click();
  await page.getByText("Estepe externo", { exact: true }).click();
  await page.getByText("Bagageiro no teto", { exact: true }).click();
  await page.locator("#save").click();
  await page.locator('[data-family="sport"]').click();
  await expect(page.locator(".body-card")).toHaveCount(4);
  await page.locator('[data-key="body"][data-value="wedge"]').click();
  await expect(page.locator('[data-input="spare"]')).toHaveCount(0);
  await page.locator('[data-tab="paint"]').click();
  await page.locator('[data-key="finish"][data-value="steel"]').click();
  await page.locator('[data-tab="parts"]').click();
  await expect(page.locator('[data-key="spoiler"]')).toHaveCount(0);
  await page.locator("#garage").click();
  await page.locator("[data-restore]").first().click();
  await page.locator('[data-tab="body"]').click();
  await expect(page.locator('[data-input="spare"]')).toBeChecked();
  await page.locator("#reset").click();
  await expect(page.locator("#model-name")).toHaveText("O seu roadster.");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  const box = await page.locator(".catalog-grid").boundingBox();
  expect(box.height).toBeLessThanOrEqual(286);
});
