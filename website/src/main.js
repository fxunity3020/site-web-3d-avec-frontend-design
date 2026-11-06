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

if (!reduit) {
  suivreLesTemps();
  demarrerFilm().catch(() => {
    racine.dataset.film = "repli";
  });
}
