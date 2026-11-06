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
