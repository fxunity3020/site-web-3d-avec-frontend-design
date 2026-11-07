import { test, expect } from "@playwright/test";

test("aucun défilement horizontal, sur toute la page", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const mesures = await page.evaluate(() => ({
    largeurPage: document.documentElement.scrollWidth,
    largeurEcran: document.documentElement.clientWidth,
    innerWidth,
  }));
  expect(mesures.largeurPage).toBeLessThanOrEqual(mesures.largeurEcran);
  expect(mesures.innerWidth).toBe(mesures.largeurEcran);
});

test.describe("barre mobile Réserver / Appeler", () => {
  test.skip(({ isMobile }) => !isMobile, "téléphone seulement");

  test("cachée au début du hero, visible aux services", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("nav.barre-mobile")).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, document.getElementById("services").offsetTop + 50));
    await expect(page.locator("nav.barre-mobile")).toBeVisible();
    await expect(page.locator("nav.barre-mobile a.cta-booksy")).toBeVisible();
    await expect(page.locator('nav.barre-mobile a[href="tel:+14502678792"]')).toBeVisible();
  });

  test("ne recouvre jamais l'adresse du pied de page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    const [barre, adresse] = await Promise.all([
      page.locator("nav.barre-mobile").boundingBox(),
      page.locator("footer .adresse-pied").boundingBox(),
    ]);
    expect(adresse.y + adresse.height).toBeLessThanOrEqual(barre.y);
  });
});
