import { test, expect } from "@playwright/test";

async function scenePrete(page) {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
}
const allerA = (page, id, decalage = 2) =>
  page.evaluate(([id, d]) => window.scrollTo(0, document.getElementById(id).offsetTop + d), [id, decalage]);

test("la vapeur accompagne la montée de la première section, puis se dissipe", async ({ page }) => {
  await scenePrete(page);
  expect(await page.evaluate(() => window.__vapeur.intensite)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, document.getElementById("services").offsetTop - innerHeight / 2));
  await page.waitForFunction(() => window.__vapeur.intensite > 0.9, null, { timeout: 5_000 });
  await allerA(page, "services");
  await page.waitForFunction(() => window.__vapeur.intensite === 0, null, { timeout: 5_000 });
});

test("les cartes des services s'inclinent en 3D", async ({ page, isMobile }) => {
  test.skip(isMobile, "souris seulement ; sur téléphone l'inclinaison suit le défilement");
  await scenePrete(page);
  await allerA(page, "services");
  const carte = page.locator(".carte-service").first();
  await expect(carte.locator("img")).toBeVisible();
  const boite = await carte.boundingBox();
  await page.mouse.move(boite.x + boite.width * 0.9, boite.y + boite.height * 0.1, { steps: 4 });
  await page.waitForTimeout(500);
  const ry = await carte.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--ry")));
  expect(Math.abs(ry)).toBeGreaterThan(2);
});

test("on retourne une carte de l'équipe", async ({ page }) => {
  await scenePrete(page);
  await allerA(page, "equipe");
  const bouton = page.locator(".cartel button").first();
  await expect(bouton).toHaveAttribute("aria-pressed", "false");
  await bouton.click();
  await expect(bouton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".cartel").first()).toHaveClass(/retourne/);
});

test("le carrousel des avis tourne avec les boutons", async ({ page }) => {
  await scenePrete(page);
  await allerA(page, "avis");
  expect(await page.evaluate(() => window.__carrousel.index)).toBe(0);
  await page.locator(".carrousel-suivant").click();
  await page.waitForFunction(() => window.__carrousel.index === 1);
  await page.locator(".carrousel-precedent").click();
  await page.locator(".carrousel-precedent").click();
  await page.waitForFunction(() => window.__carrousel.index === window.__carrousel.total - 1);
});

test("saut par ancre : la section est lisible, sans vapeur", async ({ page }) => {
  await page.goto("/#nous-trouver");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  await expect(page.locator("#nous-trouver h2")).toBeInViewport();
  expect(await page.evaluate(() => window.__vapeur.intensite)).toBe(0);
  await page.waitForFunction(() => window.__film && window.__film.image === window.__film.total - 1, null, { timeout: 15_000 });
});

test("moins de mouvement : tout est lisible, sans 3D", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => typeof window.__carrousel)).toBe("undefined");
  for (const id of ["services", "equipe", "avis", "nous-trouver"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} h2`)).toBeVisible();
  }
  const citations = page.locator(".citation");
  for (const c of await citations.all()) {
    await c.scrollIntoViewIfNeeded();
    await expect(c).toBeVisible();
    expect(await c.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  }
});
