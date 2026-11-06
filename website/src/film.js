// La visite filmée : séquence d'images WebP dessinée sur un canvas, au rythme du défilement.
import { indexPourProgression, ordreDeChargement } from "./film-calcul.js";

const LOT = 6;

export function creerFilm({ canvas, affiche, dossier, total }) {
  const ctx = canvas.getContext("2d");
  const images = new Array(total);
  const pretes = new Uint8Array(total);
  const etat = (window.__film = { image: 0, charges: 0, total });
  const racine = document.documentElement;
  let voulu = 0;
  let dessinee = -1;
  let exactRequis = true;

  const nom = (i) => `${dossier}f${String(i + 1).padStart(3, "0")}.webp`;

  function plusProche(i) {
    for (let d = 0; d < total; d++) {
      if (pretes[i - d]) return i - d;
      if (pretes[i + d]) return i + d;
    }
    return -1;
  }

  function dessiner(force = false) {
    const i = plusProche(voulu);
    if (i < 0 || (i === dessinee && !force)) return;
    // Premier dessin : seulement l'image exacte, pour passer de l'affiche au film sans saut.
    if (dessinee < 0 && exactRequis && i !== voulu) return;
    const im = images[i];
    const { width: W, height: H } = canvas;
    const echelle = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    const w = im.naturalWidth * echelle;
    const h = im.naturalHeight * echelle;
    ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    if (dessinee < 0) {
      racine.dataset.film = "pret";
      affiche?.classList.add("cachee");
    }
    dessinee = i;
    etat.image = i;
  }

  function redimensionner() {
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    dessiner(true);
  }

  async function charger(i) {
    const im = new Image();
    im.decoding = "async";
    im.src = nom(i);
    try {
      await im.decode();
      images[i] = im;
      pretes[i] = 1;
      etat.charges++;
      if (Math.abs(i - voulu) <= 8) dessiner();
    } catch {
      // image absente : la plus proche sera dessinée à sa place
    }
  }

  (async () => {
    const ordre = ordreDeChargement(total);
    for (let k = 0; k < ordre.length; k += LOT) {
      await Promise.all(ordre.slice(k, k + LOT).map(charger));
    }
    exactRequis = false;
    if (!pretes.some(Boolean)) racine.dataset.film = "repli";
    else dessiner();
  })();

  addEventListener("resize", redimensionner);
  redimensionner();

  return {
    allerA(p) {
      voulu = indexPourProgression(p, total);
      dessiner();
    },
  };
}
