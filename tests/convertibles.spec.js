import { test, expect } from "@playwright/test";

test("the home studio starts with the NRVOUS roadster", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() =>
    document.querySelector("#car-preview")?.dataset.ready === "true",
  );
  await expect(page.locator("#car-preview")).toHaveAttribute("data-body", "roadster");
  await expect(page.locator("#model-name")).toHaveText("O seu roadster.");
  await expect(page.locator('[data-key="body"][data-value="roadster"]')).toHaveClass(/selected/);
  await expect(page.locator('[data-key="roof"][data-value="open"]')).toHaveClass(/selected/);
  await expect(page.locator('[data-key="color"][data-value="#ba252b"]')).toHaveClass(/picked/);
  await expect(page.getByLabel("Cor do interior")).toHaveValue("#f0dbc2");
  await page.locator('[data-tab="plate"]').click();
  await expect(page.getByLabel("Texto da placa", { exact: true })).toHaveValue("NRVOUS");
});

test("open cabins, roof compatibility and old configurations", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const result = await page.evaluate(async () => {
    const { initial, normalizeConfiguration } = await import("/src/state.js");
    const { buildVehicle } = await import("/src/car.js");
    const { disposeGroup } = await import("/src/vehicle/geometry.js");
    const THREE = await import("/tests/three.js");
    const checks = [];
    for (const body of ["roadster", "convertible"])
      for (const roof of ["open", "closed"]) {
        const car = await buildVehicle({
          ...initial,
          body,
          roof,
          spoiler: "lip",
        });
        car.updateMatrixWorld(true);
        const named = (name) => {
          let n = 0;
          car.traverse((o) => {
            if (o.name === name) n++;
          });
          return n;
        };
        const seat = car.getObjectByName("seat-cushion");
        const center = seat.getWorldPosition(new THREE.Vector3());
        const ray = new THREE.Raycaster(
          center.clone().add(new THREE.Vector3(0, 4, 0)),
          new THREE.Vector3(0, -1, 0),
        );
        const first = ray.intersectObjects(car.children, true)[0];
        const wing = car.getObjectByName("spoiler");
        const wingBounds = new THREE.Box3().setFromObject(wing);
        const deckRay = new THREE.Raycaster(
          new THREE.Vector3(0, 4, wing.position.z),
          new THREE.Vector3(0, -1, 0),
        );
        const deck = deckRay.intersectObjects(
          car.children.filter((o) => o.name === "body-paint"),
          false,
        )[0];
        checks.push({
          body,
          roof,
          lipBottom: wingBounds.min.y - deck.point.y,
          lipTop: wingBounds.max.y - deck.point.y,
          seats: named("seat-back"),
          wheel: named("wheel"),
          top: named("soft-top"),
          fold: named("folded-roof"),
          floor: named("cockpit-floor"),
          visibleSeat: ["seat-cushion", "seat-stitch"].includes(
            first?.object.name,
          ),
          windshield: named("windshield"),
          donor:
            named("windows") + named("roof") + named("rear-window-surround"),
        });
        disposeGroup(car);
      }
    return {
      checks,
      old: normalizeConfiguration({ body: "sedan", plate: { text: "OLD" } }),
      invalid: normalizeConfiguration({ body: "coupe", roof: "open" }),
      missing: normalizeConfiguration({ body: "roadster" }),
      incompatible: normalizeConfiguration({
        body: "roadster",
        roof: "removable",
      }),
    };
  });
  for (const c of result.checks) {
    expect(c.seats).toBe(2);
    expect(c.wheel).toBe(4);
    expect(c.floor).toBe(1);
    expect(c.windshield).toBe(1);
    expect(c.donor).toBe(0);
    expect(c.top).toBe(c.roof === "closed" ? 4 : 0);
    expect(c.fold).toBe(c.roof === "open" ? 1 : 0);
    expect(c.visibleSeat).toBe(c.roof === "open");
    expect(c.lipBottom).toBeLessThan(0.01);
    expect(c.lipBottom).toBeGreaterThan(-0.02);
    expect(c.lipTop).toBeGreaterThan(0.02);
  }
  expect(result.old.roof).toBe("fixed");
  expect(result.old.plate.text).toBe("OLD");
  expect(result.invalid.roof).toBe("fixed");
  expect(result.missing.roof).toBe("open");
  expect(result.incompatible.roof).toBe("open");
  await page.locator('[data-key="body"][data-value="roadster"]').click();
  await expect(
    page.locator('[data-key="roof"][data-value="open"]'),
  ).toHaveClass(/selected/);
  await page.locator('[data-tab="parts"]').click();
  await expect(page.locator('[data-input="window"]')).toHaveCount(0);
  await page.locator('[data-tab="body"]').click();
  await page.locator('[data-key="roof"][data-value="closed"]').click();
  await page.locator('[data-tab="parts"]').click();
  await expect(page.locator('[data-input="window"]')).toHaveCount(1);
  await page.locator('[data-input="window"]').fill("50");
  await page.locator('[data-tab="body"]').click();
  await page.locator("#save").click();
  await page.locator('[data-key="body"][data-value="sedan"]').click();
  await expect(page.locator('[data-key="roof"]')).toHaveCount(0);
  await page.locator("#garage").click();
  await page.locator("[data-restore]").first().click();
  await expect(
    page.locator('[data-key="roof"][data-value="closed"]'),
  ).toHaveClass(/selected/);
});
