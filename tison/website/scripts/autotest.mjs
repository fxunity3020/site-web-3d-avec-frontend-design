// Autotest (version Node de l'Annexe §11, option A : film au défilement)
// node scripts/autotest.mjs http://localhost:4173 <dossier-captures>
// Ordinateur 1440x900 et téléphone 393x852 : capture chaque temps et chaque section, vérifie la console,
// le défilement horizontal, la séquence du film (image 0 en haut, dernière image à la fin), le repli sans film et les liens vides.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
// Playwright est préinstallé globalement dans l'environnement : require() le trouve (NODE_PATH), import ne le trouve pas.
const { chromium } = createRequire(import.meta.url)("playwright");

const URL = (process.argv[2] || "http://localhost:4173").replace(/\/$/, "");
const OUT = process.argv[3] || "captures"; mkdirSync(OUT, { recursive: true });
const TAILLES = { ordi: [1440, 900], tel: [393, 852] };
const rapport = {}, echecs = [];
const pause = (page, ms) => page.waitForTimeout(ms);

async function attendreScene(page) {
  for (let i = 0; i < 120; i++) {
    const s = await page.evaluate(() => document.documentElement.dataset.stage);
    if (s === "ready" || s === "fallback") break;
    await pause(page, 250);
  }
  await pause(page, 800);
  return page.evaluate(() => ({ stage: document.documentElement.dataset.stage, film: window.__film || null }));
}
async function aller(page, sel, decal = 0.25) {
  await page.evaluate(([s, d]) => {
    const el = document.querySelector(s);
    scrollTo(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight * d);
  }, [sel, decal]);
  await pause(page, 1200);
}

const nav = await chromium.launch();
for (const [nom, [w, h]] of Object.entries(TAILLES)) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: nom === "tel", hasTouch: nom === "tel" });
  const page = await ctx.newPage(); const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && erreurs.push(m.text()));
  await page.goto(URL + "/", { waitUntil: "load" });
  const etat = await attendreScene(page);
  // laisser charger toute la séquence
  for (let i = 0; i < 60; i++) { if ((await page.evaluate(() => window.__film?.charges)) >= 160) break; await pause(page, 250); }
  const r = { scene: etat.stage, erreurs };
  r.image_haut = await page.evaluate(() => window.__film?.image);
  for (let i = 1; i <= 5; i++) {
    await aller(page, `[data-beat="${i}"]`, 0.35);
    await page.screenshot({ path: `${OUT}/${nom}-temps${i}.png` });
  }
  await page.evaluate(() => { const s = document.getElementById("histoire"); scrollTo(0, s.offsetTop + s.offsetHeight - innerHeight); });
  await pause(page, 900);
  r.image_fin = await page.evaluate(() => window.__film?.image);
  const sections = await page.$$eval("main > section[id]:not(#histoire)", (els) => els.map((e) => e.id));
  for (const sec of sections) { await aller(page, `#${sec}`, 0.05); await page.screenshot({ path: `${OUT}/${nom}-${sec}.png` }); }
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await pause(page, 800);
  await page.screenshot({ path: `${OUT}/${nom}-pied.png` });
  r.debordement = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  r.liens_vides = await page.$$eval("a", (as) => as.filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#").map((a) => a.textContent.trim()));
  // formulaire en mode développement
  await aller(page, "#contact", 0.1);
  await page.check('input[name=type][value="Baril"]', { force: true });
  await page.fill('input[name=nom]', "Test Autotest"); await page.fill('input[name=telephone]', "819 000-0000");
  await page.fill('textarea[name=message]', "Test automatique, ne pas répondre.");
  await page.click("#form-soumission [type=submit]"); await pause(page, 1200);
  r.formulaire = await page.textContent("#form-soumission .statut");
  await ctx.close();
  // repli : séquence introuvable -> l'affiche doit rester visible
  const ctx2 = await nav.newContext({ viewport: { width: w, height: h } }); const p2 = await ctx2.newPage();
  await p2.goto(URL + "/?nofilm=1", { waitUntil: "load" }); await pause(p2, 2500);
  const etat2 = await p2.evaluate(() => document.documentElement.dataset.stage);
  r.repli = { stage: etat2, affiche_visible: (await p2.evaluate(() => getComputedStyle(document.getElementById("poster")).opacity)) === "1" };
  await p2.screenshot({ path: `${OUT}/${nom}-repli.png` }); await ctx2.close();
  rapport[nom] = r;
  if (erreurs.length) echecs.push(`${nom}: erreurs console ${erreurs.slice(0, 3)}`);
  if (r.debordement) echecs.push(`${nom}: défilement horizontal`);
  if (etat.stage !== "ready") echecs.push(`${nom}: film pas prêt (${etat.stage})`);
  if (r.image_haut !== 0) echecs.push(`${nom}: image du haut = ${r.image_haut}`);
  if (r.image_fin !== 159) echecs.push(`${nom}: image de fin = ${r.image_fin}`);
  if (!(r.repli.stage === "fallback" && r.repli.affiche_visible)) echecs.push(`${nom}: repli brisé ${JSON.stringify(r.repli)}`);
  if (r.liens_vides.length) echecs.push(`${nom}: liens vides ${r.liens_vides}`);
  if (!/Mode développement/.test(r.formulaire || "")) echecs.push(`${nom}: formulaire : ${r.formulaire}`);
}
await nav.close();
console.log(JSON.stringify(rapport, null, 1));
console.log(echecs.length ? "ÉCHECS:\n- " + echecs.join("\n- ") : "TOUT PASSE");
process.exit(echecs.length ? 1 : 0);
