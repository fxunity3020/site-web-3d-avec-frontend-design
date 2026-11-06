import { test, expect } from "@playwright/test";

function suivreErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && erreurs.push(m.text()));
  return erreurs;
}

test("la scène 3D démarre", async ({ page }) => {
  const erreurs = suivreErreurs(page);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 10_000 });
  expect(erreurs).toEqual([]);
});

test("sans scène 3D, la page reste complète", async ({ page }) => {
  const erreurs = suivreErreurs(page);
  await page.goto("/?noscene=1");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "off", null, { timeout: 10_000 });
  await expect(page.locator("h1")).toBeVisible();
  await page.locator("#services").scrollIntoViewIfNeeded();
  await expect(page.locator("#services h2")).toBeVisible();
  expect(erreurs).toEqual([]);
});
