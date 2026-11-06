// Film au défilement : séquence d'images WebP sur canvas (fiable sur iPhone, contrairement à video.currentTime).
// Chargement progressif : 1 image sur 8, puis 4, 2, 1, par lots de 6. Dessin « couvrir », redessin seulement si l'image change.
// courbe(p) relie la progression du défilement à la progression du film (pour poser chaque texte sur une image calme).
// cadrage(i) renvoie le point horizontal à garder (0 à 1) quand l'écran est plus étroit que le film (téléphone).
export function createFilm({ canvas, poster, dossier = "./seq/", total, ext = "webp", cadrage = () => 0.5, courbe = (p) => p, onProgress }) {
  const ctx = canvas.getContext("2d");
  const imgs = new Array(total), pret = new Uint8Array(total), echec = new Uint8Array(total);
  const nom = (i) => `${dossier}f${String(i + 1).padStart(3, "0")}.${ext}`;
  let courant = -1, voulu = 0, charges = 0;
  const etat = (window.__film = { charges: 0, total, image: 0, progression: 0 });

  function taille() {
    const pr = Math.min(devicePixelRatio, 2);
    canvas.width = innerWidth * pr; canvas.height = innerHeight * pr; courant = -1; dessiner();
  }
  function plusProche(i) {
    for (let d = 0; d < total; d++) { if (pret[i - d]) return i - d; if (pret[i + d]) return i + d; }
    return -1;
  }
  function dessiner() {
    const i = plusProche(voulu); if (i < 0 || i === courant) return;
    const im = imgs[i], W = canvas.width, H = canvas.height, s = Math.max(W / im.width, H / im.height);
    const w = im.width * s, h = im.height * s;
    const x = Math.min(0, Math.max(W - w, W / 2 - w * cadrage(i / (total - 1))));
    ctx.drawImage(im, x, (H - h) / 2, w, h);
    if (courant < 0) { canvas.style.opacity = 1; poster?.classList.add("cache"); document.documentElement.dataset.stage = "ready"; }
    courant = i; etat.image = i;
  }
  async function charger(i) {
    if (imgs[i] || echec[i]) return;
    const im = new Image(); im.decoding = "async"; im.src = nom(i); imgs[i] = im;
    try {
      await im.decode(); pret[i] = 1; etat.charges = ++charges; onProgress?.(charges / total);
      if (Math.abs(i - voulu) < 8) { courant = -1; dessiner(); }
    } catch { imgs[i] = null; echec[i] = 1; } // ne pas la redemander aux passes suivantes
  }
  (async () => {
    for (const pas of [8, 4, 2, 1]) {
      const lot = []; for (let i = 0; i < total; i += pas) if (!imgs[i] && !echec[i]) lot.push(i);
      for (let k = 0; k < lot.length; k += 6) await Promise.all(lot.slice(k, k + 6).map(charger));
    }
    if (!pret.some(Boolean)) document.documentElement.dataset.stage = "fallback"; // aucune image : l'affiche reste
  })();

  addEventListener("resize", taille); taille();
  // La progression (0 à 1) vient du ScrollTrigger de l'histoire, dans main.js.
  let demande = false;
  function allerA(p) {
    voulu = Math.round(courbe(p) * (total - 1)); etat.progression = p;
    if (!demande) { demande = true; requestAnimationFrame(() => { demande = false; dessiner(); }); }
  }
  allerA(0);
  return { allerA };
}
