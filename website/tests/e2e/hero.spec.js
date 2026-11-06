import { test, expect } from "@playwright/test";

test("un seul temps actif à la fois", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.film === "pret", null, { timeout: 30_000 });
  for (let n = 1; n <= 5; n++) {
    await page.evaluate((n) => {
      const el = document.querySelector(`.temps[data-temps="${n}"]`);
      window.scrollTo(0, el.offsetTop + el.offsetHeight / 2 - innerHeight / 2);
    }, n);
    await page.waitForTimeout(400);
    const actifs = await page.evaluate(() => [...document.querySelectorAll(".temps.actif")].map((e) => e.dataset.temps));
    expect(actifs).toEqual([String(n)]);
  }
});

test("moins de mouvement : tout est lisible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => getComputedStyle(document.getElementById("film")).display)).toBe("none");
  expect(await page.evaluate(() => getComputedStyle(document.getElementById("affiche")).opacity)).toBe("1");
  const opacites = await page.evaluate(() => [...document.querySelectorAll(".temps .copie")].map((e) => getComputedStyle(e).opacity));
  expect(opacites).toEqual(["1", "1", "1", "1", "1"]);
  expect(await page.evaluate(() => typeof window.__film)).toBe("undefined");
});
