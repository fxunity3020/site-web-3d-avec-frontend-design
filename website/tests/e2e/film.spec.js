import { test, expect } from "@playwright/test";

async function filmPret(page) {
  await page.waitForFunction(() => document.documentElement.dataset.film === "pret", null, { timeout: 30_000 });
}

test("le film suit le défilement du début à la fin de la visite", async ({ page }) => {
  await page.goto("/");
  await filmPret(page);
  expect(await page.evaluate(() => window.__film.image)).toBe(0);

  await page.evaluate(() => {
    const h = document.getElementById("histoire");
    window.scrollTo(0, h.offsetTop + h.offsetHeight - innerHeight);
  });
  await page.waitForFunction(() => window.__film.image === window.__film.total - 1, null, { timeout: 15_000 });
});

test("sans séquence, l'affiche reste visible", async ({ page }) => {
  await page.goto("/?noseq=1");
  await page.waitForFunction(() => document.documentElement.dataset.film === "repli", null, { timeout: 30_000 });
  const opacite = await page.evaluate(() => getComputedStyle(document.getElementById("affiche")).opacity);
  expect(opacite).toBe("1");
});
