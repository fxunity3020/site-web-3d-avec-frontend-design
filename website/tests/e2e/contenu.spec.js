import { test, expect } from "@playwright/test";

const BOOKSY = "https://lamaisonmoreno.booksy.com";

test("le contenu essentiel est en HTML", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("Barbier à Les Coteaux");

  const texte = await page.locator("body").textContent();
  expect(texte).toContain("301, montée du Comté");
  expect(texte).toContain("450 267-8792");

  const booksy = page.locator("a.cta-booksy");
  expect(await booksy.count()).toBeGreaterThan(0);
  for (const lien of await booksy.all()) {
    await expect(lien).toHaveAttribute("href", BOOKSY);
    await expect(lien).toHaveAttribute("target", "_blank");
    await expect(lien).toHaveAttribute("rel", "noopener noreferrer");
  }

  expect(await page.locator('a[href="tel:+14502678792"]').count()).toBeGreaterThan(0);
  for (const id of ["services", "equipe", "avis", "nous-trouver"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("aucune erreur de console au chargement", async ({ page }) => {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && erreurs.push(m.text()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(erreurs).toEqual([]);
});
