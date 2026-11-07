import { test, expect } from "@playwright/test";

async function pret(page) {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
}

test("la lame tranche la section qui arrive, puis disparaît", async ({ page }) => {
  await pret(page);
  await page.evaluate(() => window.scrollTo(0, document.getElementById("equipe").offsetTop - innerHeight * 0.5));
  await page.waitForFunction(() => window.__lame && window.__lame.visible === true, null, { timeout: 5_000 });
  const coupe = await page.evaluate(() => getComputedStyle(document.getElementById("equipe")).clipPath);
  expect(coupe).toContain("polygon");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("equipe").offsetTop + 2));
  await page.waitForFunction(() => window.__lame.visible === false, null, { timeout: 5_000 });
  expect(await page.evaluate(() => getComputedStyle(document.getElementById("equipe")).clipPath)).toBe("none");
});

test.describe("ordinateur seulement", () => {
  test.skip(({ isMobile }) => isMobile, "souris");

  test("le hero suit la souris en profondeur", async ({ page }) => {
    await pret(page);
    const avant = await page.evaluate(() => getComputedStyle(document.getElementById("film")).transform);
    await page.mouse.move(100, 100);
    await page.mouse.move(1300, 800, { steps: 8 });
    await page.waitForTimeout(700);
    const apres = await page.evaluate(() => getComputedStyle(document.getElementById("film")).transform);
    expect(apres).not.toBe(avant);
  });

  test("un halo doré suit le curseur et les boutons sont aimantés", async ({ page }) => {
    await pret(page);
    await expect(page.locator("#halo")).toBeAttached();
    const bouton = page.locator("#nous-trouver .btn-principal");
    await bouton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const b = await bouton.boundingBox();
    await page.mouse.move(b.x + b.width + 14, b.y + b.height / 2, { steps: 6 });
    await page.waitForTimeout(500);
    const decalage = await bouton.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    expect(decalage).toBeGreaterThan(2);
  });
});

test("moins de mouvement : ni lame, ni halo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => typeof window.__lame)).toBe("undefined");
  expect(await page.locator("#halo").count()).toBe(0);
});
