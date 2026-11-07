import "@fontsource/im-fell-english/400.css";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource-variable/instrument-sans";
import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { creerFilm } from "./film.js";
import { inclinerCartes, retournerCartels } from "./cartes3d.js";
import { creerCarrousel } from "./carrousel.js";
import { suivreLaSouris } from "./survol.js";
import { aimanter } from "./aimant.js";

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(location.search);
const racine = document.documentElement;
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 820px), (pointer: coarse)").matches;
racine.dataset.mouvement = reduit ? "reduit" : "plein";

async function demarrerFilm() {
  const manifest = await fetch("./seq/manifest.json").then((r) => r.json());
  const film = creerFilm({
    canvas: document.getElementById("film"),
    affiche: document.getElementById("affiche"),
    dossier: params.has("noseq") ? "./seq-absent/" : "./seq/",
    total: manifest.total,
  });
  ScrollTrigger.create({
    trigger: "#histoire",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => film.allerA(self.progress),
  });
}

function coteDuTemps(temps) {
  if (temps.classList.contains("cote-droit")) return "droit";
  if (temps.classList.contains("cote-centre")) return "centre";
  return "gauche";
}

// Un seul temps actif à la fois ; le voile passe du côté de son texte.
function suivreLesTemps() {
  for (const temps of document.querySelectorAll(".temps")) {
    const cote = coteDuTemps(temps);
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

async function demarrerScene() {
  // Tous les modules d'abord : la scène ne se déclare prête qu'une fois toutes ses couches en place.
  const [{ creerScene }, { creerPoussiere }, { creerVapeur }] = await Promise.all([
    import("./scene.js"),
    import("./poussiere.js"),
    import("./vapeur.js"),
  ]);
  const scene = await creerScene({ canvas: document.getElementById("scene"), mobile });
  if (!scene) return null;

  // La poussière ne flotte que tant que la visite filmée remplit l'écran.
  const poussiere = creerPoussiere(scene.THREE, { nombre: mobile ? 300 : 900, couleurs: ["#F2C97A", "#D5B27C"] });
  scene.ajouter(poussiere.points);
  scene.surImage(poussiere.animer);
  const histoire = document.getElementById("histoire");
  scene.surImage(() => {
    poussiere.points.visible = histoire.getBoundingClientRect().bottom >= innerHeight;
  });

  // Fond sombre qui monte avec la première section, bordé de vapeur.
  const vapeur = creerVapeur(scene.THREE);
  scene.ajouter(vapeur.fond);
  scene.ajouter(vapeur.vapeur);
  const premiere = document.getElementById("services");
  scene.surImage((dt, temps) => {
    const premier = premiere.getBoundingClientRect().top;
    vapeur.maj({ premier, suivants: [], hauteur: innerHeight, ratio: scene.renderer.getPixelRatio(), temps });
  });
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

retournerCartels(".cartel");

if (reduit) {
  racine.dataset.scene = "off";
} else {
  inclinerCartes(".carte-service, .cartel");
  if (matchMedia("(pointer: fine)").matches) {
    aimanter();
    suivreLaSouris({
      film: document.getElementById("film"),
      affiche: document.getElementById("affiche"),
      lueur: document.getElementById("lueur"),
      histoire: document.getElementById("histoire"),
    });
  }
  quandLibre(() => import("./lame.js").then(({ demarrerLame }) => demarrerLame({ canvas: document.getElementById("lame"), mobile })));
  creerCarrousel(document.querySelector(".carrousel"));
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
