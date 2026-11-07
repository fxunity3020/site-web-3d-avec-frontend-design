// Carrousel 3D (avis, équipe) : les éléments sont posés sur un cylindre qu'on fait tourner.
import { gsap } from "gsap";

export function creerCarrousel(racine) {
  const anneau = racine.querySelector(".anneau");
  const avis = [...anneau.children];
  const total = avis.length;
  const pas = 360 / total;
  const etat = { index: 0, total, angle: 0 };
  window.__carrousels = { ...window.__carrousels, [racine.closest("section").id]: etat };
  racine.classList.add("actif");

  function placer() {
    const largeur = avis[0].offsetWidth;
    const rayon = (largeur / 2 / Math.tan(Math.PI / total)) * 1.08;
    anneau.style.setProperty("--rayon", `${rayon}px`);
    avis.forEach((a, i) => a.style.setProperty("--angle", `${i * pas}deg`));
  }

  function dessiner() {
    anneau.style.transform = `translateZ(calc(var(--rayon) * -1)) rotateY(${-etat.angle}deg)`;
    avis.forEach((a, i) => {
      const relatif = ((((i * pas - etat.angle) % 360) + 540) % 360) - 180;
      const face = Math.cos((relatif * Math.PI) / 180);
      a.style.opacity = String(0.3 + 0.7 * Math.max(0, face) ** 1.5);
      a.toggleAttribute("inert", Math.abs(relatif) > pas / 2);
    });
  }

  function allerA(index) {
    const brut = Math.round(index);
    etat.index = ((brut % total) + total) % total;
    gsap.to(etat, { angle: brut * pas, duration: 0.9, ease: "power3.out", onUpdate: dessiner });
  }

  racine.querySelector(".carrousel-suivant").addEventListener("click", () => allerA(Math.round(etat.angle / pas) + 1));
  racine.querySelector(".carrousel-precedent").addEventListener("click", () => allerA(Math.round(etat.angle / pas) - 1));

  // Glisser au doigt ou à la souris ; le défilement vertical reste libre (touch-action: pan-y).
  const scene = racine.querySelector(".carrousel-scene");
  let depart = null;
  scene.addEventListener("pointerdown", (e) => {
    depart = { x: e.clientX, angle: etat.angle };
    gsap.killTweensOf(etat);
  });
  addEventListener("pointermove", (e) => {
    if (!depart) return;
    etat.angle = depart.angle - (e.clientX - depart.x) * 0.35;
    dessiner();
  });
  const lacher = () => {
    if (!depart) return;
    depart = null;
    allerA(Math.round(etat.angle / pas));
  };
  addEventListener("pointerup", lacher);
  addEventListener("pointercancel", lacher);

  addEventListener("resize", () => {
    placer();
    dessiner();
  });
  placer();
  dessiner();
}
