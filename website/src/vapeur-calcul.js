// Calcul pur de la vapeur (testé avec node --test).

const lisse = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// haut : position du haut de la section dans l'écran, en pixels (0 = haut de l'écran).
// La vapeur se lève quand la section entre par le bas, est pleine au milieu,
// et s'est dissipée quand la section touche le haut de l'écran.
export function intensiteVapeur(haut, hauteurEcran) {
  const f = haut / hauteurEcran;
  return lisse(1, 0.5, f) * lisse(0.02, 0.25, f);
}
