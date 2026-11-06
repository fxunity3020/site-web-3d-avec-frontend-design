// Calculs purs du film au défilement (testés avec node --test).

export function indexPourProgression(p, total) {
  const borne = Math.min(1, Math.max(0, p));
  return Math.round(borne * (total - 1));
}

// Ordre de chargement progressif : 1 image sur 8, puis 1 sur 4, 1 sur 2, puis toutes.
export function ordreDeChargement(total) {
  const vus = new Set();
  const ordre = [];
  for (const pas of [8, 4, 2, 1]) {
    for (let i = 0; i < total; i += pas) {
      if (!vus.has(i)) {
        vus.add(i);
        ordre.push(i);
      }
    }
  }
  return ordre;
}
