// Calculs purs de la transition « lame droite » (testés avec node --test).

const lisse = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// haut : haut de la section qui arrive, en pixels dans l'écran.
// 0 quand elle entre par le bas, 1 quand elle atteint 15 % du haut de l'écran.
export function progressionCoupe(haut, hauteurEcran) {
  return Math.min(1, Math.max(0, (hauteurEcran - haut) / (0.85 * hauteurEcran)));
}

// pente : hauteur de la coupe à gauche, en fraction de l'écran (0 = coupe droite).
// lameX : position de la lame, de 1,15 (hors écran à droite) à -0,2 (hors écran à gauche).
export function etatCoupe(p) {
  return {
    pente: 0.45 * (1 - lisse(0.15, 0.9, p)),
    lameX: 1.15 - 1.35 * lisse(0.1, 0.9, p),
    visible: p > 0.04 && p < 0.96,
  };
}
