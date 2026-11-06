import "@fontsource/im-fell-english/400.css";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource-variable/instrument-sans";
import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { creerFilm } from "./film.js";

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(location.search);

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

demarrerFilm().catch(() => {
  document.documentElement.dataset.film = "repli";
});
