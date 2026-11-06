import "@fontsource-variable/big-shoulders-display";
import "@fontsource-variable/figtree";
import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFilm } from "./film.js";
import { createAtmosphere } from "./atmosphere.js";

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
const tactile = matchMedia("(pointer: coarse)").matches;
const css = (v) => getComputedStyle(html).getPropertyValue(v).trim();
const histoire = document.getElementById("histoire");
const TOTAL_IMAGES = 160; // nombre d'images dans public/seq/

// Courbe défilement -> film. Chaque texte est visible sur une plage précise du défilement
// (1 : 0-0,15 · 2 : 0,13-0,39 · 3 : 0,37-0,63 · 4 : 0,61-0,87 · 5 : 0,85-1). On ralentit le film là où le côté gauche
// est calme (le lac pour 1 à 3), on passe la porte pendant le temps 4, et l'intérieur est au repos pour le temps 5.
const POINTS = [[0, 0], [0.13, 0.08], [0.39, 0.28], [0.63, 0.42], [0.85, 0.9], [0.9, 1], [1, 1]];
function courbe(p) {
  for (let k = 1; k < POINTS.length; k++) {
    const [p0, f0] = POINTS[k - 1], [p1, f1] = POINTS[k];
    if (p <= p1) return f0 + ((p - p0) / (p1 - p0)) * (f1 - f0);
  }
  return 1;
}

// ---------- Le film et les braises ----------
let film = null, braises = null;
if (!reduit) {
  // Sur téléphone, garder le sauna dans le cadre : il est à droite au début du film, puis au centre.
  const cadrage = (f) => (f < 0.35 ? 0.62 - f * 0.3 : 0.5);
  const sansFilm = new URLSearchParams(location.search).has("nofilm"); // test du repli sur l'affiche
  film = createFilm({
    canvas: document.getElementById("film"), poster: document.getElementById("poster"),
    dossier: sansFilm ? "./absent/" : "./seq/", total: TOTAL_IMAGES, cadrage, courbe,
  });
  braises = createAtmosphere({
    canvas: document.getElementById("atmo"), accent: css("--accent"), accent2: css("--accent-2"), mode: "braises",
  });
} else {
  html.dataset.stage = "fallback"; // mouvement réduit : l'affiche reste, sans film
}

// ---------- Un seul texte et un seul voile à la fois ----------
// L'état vient toujours de la position réelle de la page, même si on recharge plus bas ou arrive par #contact.
// Pendant onRefresh, self.isActive n'est pas encore à jour : on compare scrollY à self.start et self.end.
const actifReel = (self) => scrollY >= self.start && scrollY <= self.end;
const tousLesTemps = [...document.querySelectorAll(".temps")];
function majCote() {
  const actif = tousLesTemps.find((el) => el.classList.contains("actif"));
  if (actif) html.dataset.cote = actif.classList.contains("cote-droit") ? "droit" : "gauche";
  else delete html.dataset.cote;
}
tousLesTemps.forEach((el) => {
  const appliquer = (actif) => { el.classList.toggle("actif", actif); majCote(); };
  ScrollTrigger.create({
    trigger: el, start: "top 55%", end: "bottom 45%",
    onToggle: (self) => appliquer(self.isActive), onRefresh: (self) => appliquer(actifReel(self)),
  });
});

// ---------- Signature : la température monte quand on entre dans le sauna ----------
const valeur = document.querySelector(".thermo-valeur");
const plein = document.querySelector(".thermo-plein");
const lieu = document.querySelector(".thermo-lieu");
// f = position dans le film : la porte est franchie vers 0,65.
function temperature(f) {
  if (f < 0.65) return -24 + f * 8;                       // dehors : le froid de janvier
  return -19 + Math.pow((f - 0.65) / 0.35, 0.7) * 99;     // on passe la porte : jusqu'à 80 °C
}
function afficherTemperature(p) {
  const f = courbe(p), t = Math.round(temperature(f));
  valeur.textContent = `${t < 0 ? "−" : ""}${Math.abs(t)}°`;
  plein.style.height = `${((t + 30) / 110) * 100}%`;
  lieu.textContent = f < 0.65 ? "dehors" : "dedans";
}
// Un seul calcul de progression pour le film et le thermomètre.
const suivreHistoire = (self) => { afficherTemperature(self.progress); film?.allerA(self.progress); };
const thermoVisible = (actif) => html.classList.toggle("dans-histoire", actif);
ScrollTrigger.create({
  trigger: histoire, start: "top top", end: "bottom bottom",
  onUpdate: suivreHistoire,
  onToggle: (self) => thermoVisible(self.isActive),
  onRefresh: (self) => { suivreHistoire(self); thermoVisible(actifReel(self)); },
});
// Les braises ne tournent que tant que l'histoire est à l'écran (batterie des téléphones).
const braisesActives = (actif) => (actif ? braises?.demarrer() : braises?.arreter());
ScrollTrigger.create({
  trigger: histoire, start: "top top", end: "bottom top",
  onToggle: (self) => braisesActives(self.isActive), onRefresh: (self) => braisesActives(actifReel(self)),
});

// ---------- En-tête et barre d'appel ----------
// Simple écoute du défilement : un ScrollTrigger avec end: "max" se désactive au tout dernier pixel.
function etatDefilement() {
  html.classList.toggle("defile", scrollY > 80);
  html.classList.toggle("apres-hero", scrollY > innerHeight * 0.85);
}
addEventListener("scroll", etatDefilement, { passive: true }); etatDefilement();

// ---------- Cartes inclinables (ordinateur seulement) ----------
if (!reduit && !tactile) {
  document.querySelectorAll(".carte-inclinable").forEach((carte) => {
    const img = carte.querySelector("img");
    const rx = gsap.quickTo(img, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(img, "rotationY", { duration: 0.6, ease: "power3.out" });
    carte.addEventListener("pointermove", (e) => {
      const r = carte.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    carte.addEventListener("pointerleave", () => { rx(0); ry(0); });
  });
}

// ---------- Politique de confidentialité ----------
const dialogue = document.getElementById("confidentialite");
document.querySelectorAll("[data-ouvre]").forEach((b) => b.addEventListener("click", () => {
  const d = document.getElementById(b.dataset.ouvre); if (d?.showModal) d.showModal();
}));
// Fermer seulement sur un clic dans le fond assombri, pas dans la marge intérieure de la fenêtre.
dialogue?.addEventListener("click", (e) => {
  if (e.target !== dialogue) return;
  const r = dialogue.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialogue.close();
});

// ---------- Formulaire : Web3Forms + hCaptcha + pot de miel ----------
const form = document.getElementById("form-soumission");
if (form) {
  const statut = form.querySelector(".statut"), bouton = form.querySelector("[type=submit]");
  // Le script de Web3Forms (et son hCaptcha) se charge seulement quand on touche au formulaire.
  let scriptCharge = false;
  form.addEventListener("focusin", () => {
    if (scriptCharge) return; scriptCharge = true;
    const s = document.createElement("script"); s.src = "https://web3forms.com/client/script.js"; s.async = true; s.defer = true;
    document.head.appendChild(s);
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data.botcheck) return; // robot
    bouton.disabled = true; statut.textContent = "Envoi en cours…";
    try {
      if (data.access_key === "ACCESS_KEY_A_REMPLACER") { await new Promise((r) => setTimeout(r, 600)); throw new Error("dev"); }
      // Exiger la case seulement si hCaptcha s'est vraiment affiché (un bloqueur peut l'empêcher) ;
      // sinon Web3Forms décide, et en cas de refus le visiteur reçoit le numéro de téléphone.
      if (!data["h-captcha-response"] && form.querySelector(".h-captcha iframe")) throw new Error("captcha");
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message);
      form.reset(); window.hcaptcha?.reset(); statut.textContent = "Merci ! On te rappelle au plus tard le prochain jour ouvrable.";
    } catch (err) {
      statut.textContent = err.message === "dev"
        ? "Mode développement : la clé Web3Forms n'est pas encore en place. Rien n'a été envoyé."
        : err.message === "captcha"
          ? "Coche la case anti-robot, puis renvoie ta demande."
          : "L'envoi n'a pas fonctionné. Appelle-nous directement au 819 000-0000.";
    } finally { bouton.disabled = false; }
  });
  // Les liens « Demander un baril », etc. présélectionnent le modèle.
  document.querySelectorAll("[data-type]").forEach((a) => a.addEventListener("click", () => {
    const r = form.querySelector(`input[name=type][value="${a.dataset.type}"]`); if (r) r.checked = true;
  }));
}
