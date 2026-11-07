import "@fontsource/im-fell-english/400.css";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource-variable/instrument-sans";
import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { creerFilm } from "./film.js";

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(location.search);
const racine = document.documentElement;
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
racine.dataset.mouvement = reduit ? "reduit" : "plein";

async function demarrerFilm() {
  const manifest = await fetch("/seq/manifest.json").then((r) => r.json());
  const film = creerFilm({
    canvas: document.getElementById("film"),
    affiche: document.getElementById("affiche"),
    dossier: params.has("noseq") ? "/seq-absent/" : "/seq/",
    total: manifest.total,
  });
  ScrollTrigger.create({
    trigger: "#histoire",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => film.allerA(self.progress),
  });
}

// Un seul temps actif à la fois ; le voile passe du côté de son texte.
function suivreLesTemps() {
  for (const temps of document.querySelectorAll(".temps")) {
    const cote = temps.classList.contains("cote-droit") ? "droit" : temps.classList.contains("cote-centre") ? "centre" : "gauche";
    ScrollTrigger.create({
      trigger: temps,
      start: "top center",
      end: "bottom center",
      onToggle(self) {
        temps.classList.toggle("actif", self.isActive);
        if (self.isActive) racine.dataset.cote = cote;
      },
    });
  }
}

const mobile = matchMedia("(max-width: 820px), (pointer: coarse)").matches;

async function demarrerScene() {
  const { creerScene } = await import("./scene.js");
  const scene = await creerScene({ canvas: document.getElementById("scene"), mobile });
  if (!scene) return null;
  const { creerPoussiere } = await import("./poussiere.js");
  const poussiere = creerPoussiere(scene.THREE, { nombre: mobile ? 300 : 900, couleurs: ["#F2C97A", "#D5B27C"] });
  scene.ajouter(poussiere.points);
  scene.surImage(poussiere.animer);
  // La poussière ne flotte que tant que la visite filmée remplit l'écran.
  const histoire = document.getElementById("histoire");
  scene.surImage(() => {
    poussiere.points.visible = histoire.getBoundingClientRect().bottom >= innerHeight;
  });
  const { demarrerTransitions } = await import("./transitions.js");
  await demarrerTransitions(scene, { mobile });
  ScrollTrigger.refresh();
  return scene;
}

// Sans scène 3D : les sections apparaissent en fondu.
function fonduSansScene() {
  for (const section of document.querySelectorAll(".section")) {
    gsap.from(section.querySelector(".contenu"), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: section, start: "top 85%" },
    });
  }
}

// Barre Réserver / Appeler sur téléphone : visible dès que les services entrent à l'écran.
ScrollTrigger.create({
  trigger: "#services",
  start: "top bottom",
  end: "max",
  onToggle: (self) => {
    racine.dataset.barre = self.isActive ? "on" : "off";
  },
});

const quandLibre = window.requestIdleCallback || ((f) => setTimeout(f, 200));

if (reduit) {
  racine.dataset.scene = "off";
} else {
  quandLibre(() =>
    demarrerScene()
      .then((scene) => scene || fonduSansScene())
      .catch(() => {
        racine.dataset.scene = "off";
        fonduSansScene();
      }),
  );
  suivreLesTemps();
  demarrerFilm().catch(() => {
    racine.dataset.film = "repli";
  });
}
