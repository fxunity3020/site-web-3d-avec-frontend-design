import { test, expect } from "@playwright/test";

test("titre, description et partage", async ({ page }) => {
  await page.goto("/");
  const titre = await page.title();
  expect(titre).toContain("Barbier");
  expect(titre).toContain("Les Coteaux");
  expect(titre.length).toBeLessThan(60);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description.length).toBeLessThan(155);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "fr_CA");
  expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toMatch(/\/img\/og\.jpg$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test("données structurées HairSalon", async ({ page }) => {
  await page.goto("/");
  const brut = await page.locator('script[type="application/ld+json"]').textContent();
  const d = JSON.parse(brut);
  expect(d["@type"]).toBe("HairSalon");
  expect(d.telephone).toBe("+1-450-267-8792");
  expect(d.address.postalCode).toBe("J7X 1A8");
  expect(d.address.addressLocality).toBe("Les Coteaux");
  expect(d.aggregateRating.ratingValue).toBe("5.0");
  expect(d.aggregateRating.reviewCount).toBe("144");
});

test("robots.txt et sitemap.xml répondent", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("<urlset");
});

test("la politique de sécurité de _headers ne bloque rien du site", async ({ page }) => {
  const { readFileSync } = await import("node:fs");
  const csp = readFileSync(new URL("../../public/_headers", import.meta.url), "utf8")
    .split("\n")
    .find((l) => l.includes("Content-Security-Policy:"))
    .split("Content-Security-Policy:")[1]
    .trim();
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const reponse = await route.fetch();
    await route.fulfill({ response: reponse, headers: { ...reponse.headers(), "content-security-policy": csp } });
  });
  const erreurs = [];
  page.on("console", (m) => m.type() === "error" && erreurs.push(m.text()));
  page.on("pageerror", (e) => erreurs.push(String(e)));
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.scene === "pret", null, { timeout: 15_000 });
  await page.evaluate(() => window.scrollTo(0, document.getElementById("services").offsetTop - innerHeight / 2));
  await page.waitForTimeout(800);
  expect(erreurs).toEqual([]);
});
