import { test, expect } from "@playwright/test";

test("le cadre apparaît entre le hero et les services", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
  await page.evaluate(() => {
    const s = document.getElementById("services");
    window.scrollTo(0, s.offsetTop - innerHeight / 2);
  });
  await page.waitForFunction(() => window.__cadre && window.__cadre.opacite > 0.9, null, { timeout: 5_000 });
});

test("saut par ancre : aucun cadre figé", async ({ page }) => {
  await page.goto("/#nous-trouver");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => window.__cadre.opacite)).toBe(0);
  await expect(page.locator("#nous-trouver h2")).toBeInViewport();
  await page.waitForFunction(() => window.__film && window.__film.image === window.__film.total - 1, null, { timeout: 15_000 });
});

test("moins de mouvement : pas de cadre", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => typeof window.__cadre)).toBe("undefined");
  for (const id of ["services", "equipe", "avis", "nous-trouver"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} h2`)).toBeVisible();
    expect(await page.evaluate((id) => getComputedStyle(document.getElementById(id)).opacity, id)).toBe("1");
  }
});

test("aucun cadre pendant la lecture d'une section", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
  for (const id of ["services", "equipe", "avis"]) {
    await page.evaluate((id) => window.scrollTo(0, document.getElementById(id).offsetTop + 2), id);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.__cadre.opacite), `cadre visible en lisant #${id}`).toBe(0);
  }
});
