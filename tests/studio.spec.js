import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
test("estúdio, garagem, placas, combinações e exportações", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#car-preview svg")).toHaveCount(2);
  await page.screenshot({
    path: "screenshots/01-estudio-desktop.png",
    fullPage: true,
  });
  await page.locator("#save").click();
  await page.locator('[data-key="body"][data-value="wagon"]').click();
  await page.locator("#garage").click();
  await page.locator("[data-restore]").first().click();
  await expect(page.locator("#model-name")).toHaveText("O seu cupê.");
  for (const [body, color, text] of [
    ["sedan", "#6389b5", "BLUE 77"],
    ["hatch", "#87a996", "ECTO-1"],
    ["muscle", "#353e47", "OUTATIME"],
    ["wagon", "#f1b849", "ROAD\nTRIP"],
  ]) {
    await page.locator('[data-tab="body"]').click();
    await page.locator(`[data-key="body"][data-value="${body}"]`).click();
    await page.locator(`[data-key="color"][data-value="${color}"]`).click();
    await page.locator('[data-tab="parts"]').click();
    await page
      .locator(
        `[data-key="lights"][data-value="${body === "hatch" ? "vertical" : body === "muscle" ? "rect" : "round"}"]`,
      )
      .click();
    if (body === "muscle")
      await page.locator('[data-key="spoiler"][data-value="sport"]').click();
    await page.locator('[data-tab="plate"]').click();
    await page.getByLabel("Texto da placa", { exact: true }).fill(text);
    await page
      .locator(".stage")
      .screenshot({ path: `screenshots/car-${body}.png` });
  }
  await page
    .getByLabel("Texto da placa", { exact: true })
    .fill("UMA PLACA MUITO LONGA 123456789");
  let fontSize = await page
    .locator("#plate-preview text")
    .last()
    .getAttribute("font-size");
  expect(Number(fontSize)).toBeLessThan(30);
  await page
    .getByText("Ajustar texto automaticamente", { exact: true })
    .click();
  await page.getByLabel("Tamanho da fonte", { exact: true }).fill("60");
  await expect(page.locator("#plate-preview text").last()).toHaveAttribute(
    "font-size",
    "60",
  );
  await page.getByLabel("Espaçamento", { exact: true }).fill("8");
  await expect(page.locator("#plate-preview text").last()).toHaveAttribute(
    "letter-spacing",
    "8",
  );
  await page.getByLabel("Texto da placa", { exact: true }).fill("OUTA\nTIME");
  await page
    .getByText("Ajustar texto automaticamente", { exact: true })
    .click();
  await expect(page.locator("#plate-preview text")).toHaveCount(3);
  await page.locator('[data-preset="europe"]').click();
  await page.locator("summary").filter({ hasText: "Formato" }).click();
  await page.getByLabel("Largura", { exact: true }).fill("280");
  await page.getByLabel("Altura", { exact: true }).fill("130");
  await page.screenshot({
    path: "screenshots/02-editor-placa.png",
    fullPage: true,
  });
  await page.locator("#reset").click();
  for (const kind of ["svg", "png", "icon"]) {
    const pending = page.waitForEvent("download");
    await page.locator(`[data-export="${kind}"]`).click();
    const download = await pending;
    await download.saveAs(
      `screenshots/export-${kind}.${kind === "svg" ? "svg" : "png"}`,
    );
    expect(await download.failure()).toBeNull();
  }
  const svg = await fs.readFile("screenshots/export-svg.svg", "utf8");
  expect(svg).toContain("data:font");
  expect(svg).toContain("NRVOUS");
  await page.locator('[data-tab="parts"]').click();
  await page.locator('[data-key="bumper"][data-value="sport"]').click();
  await page.locator('[data-key="spoiler"][data-value="wild"]').click();
  await page.locator('[data-key="wheels"][data-value="sport"]').click();
  await page.locator('[data-key="exhaust"][data-value="quad"]').click();
  await page.getByLabel("Área do vidro", { exact: true }).fill("50");
  await page.locator('[data-tab="details"]').click();
  await page.getByText("Faixas de corrida", { exact: true }).click();
  await page.getByText("Adesivo de estrela", { exact: true }).click();
  await page
    .locator(".stage")
    .screenshot({ path: "screenshots/car-custom-sport.png" });
  await page.locator('[data-tab="plate"]').click();
  await page
    .locator('[data-key="plate.font"][data-value="Barlow Condensed"]')
    .click();
  await page.getByLabel("Espessura", { exact: true }).fill("900");
  await expect(page.locator("#plate-preview text").last()).toHaveAttribute(
    "font-weight",
    "900",
  );
  await page.locator("#reset").click();
  await page.evaluate(() =>
    document.querySelector("#toast").classList.remove("show"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-tab="body"]').click();
  await page.screenshot({ path: "screenshots/03-mobile.png", fullPage: true });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.locator('[data-tab="plate"]').click();
  await page.getByLabel("Texto da placa", { exact: true }).fill("MOBILE 1");
  await page.screenshot({
    path: "screenshots/04-mobile-placa.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
