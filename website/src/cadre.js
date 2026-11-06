// Le cadre doré : un cadre ancien sculpté que la caméra traverse entre deux sections.
// Les calculs sont purs (testés avec node --test) ; la géométrie reçoit THREE en paramètre.

const lisse = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// p : progression de 0 à 1 dans la zone de transition.
// L'échelle suit une courbe exponentielle : 0,35 au départ, 1 au milieu (le cadre remplit l'écran), 3,4 à la fin.
export function etatDuCadre(p) {
  const q = Math.min(1, Math.max(0, p));
  const echelle = q <= 0.5 ? 0.35 * Math.pow(1 / 0.35, q / 0.5) : Math.pow(3.4, (q - 0.5) / 0.5);
  const opacite = lisse(0, 0.25, q) * (1 - lisse(0.82, 1, q));
  return { echelle, opacite };
}

// Rectangle de l'ouverture du cadre à l'écran, en pixels, pour une échelle donnée.
// remplissage : part de l'écran couverte par le bord extérieur à l'échelle 1.
// ouvertureL, ouvertureH : taille de l'ouverture par rapport au bord extérieur, en largeur et en hauteur.
export function ouvertureEcran(echelle, { largeur, hauteur, remplissage, ouvertureL, ouvertureH }) {
  const demiL = (largeur * remplissage * ouvertureL * echelle) / 2;
  const demiH = (hauteur * remplissage * ouvertureH * echelle) / 2;
  return { gauche: largeur / 2 - demiL, droite: largeur / 2 + demiL, haut: hauteur / 2 - demiH, bas: hauteur / 2 + demiH };
}

// Construit le cadre aux proportions de l'écran : largeur et hauteur en unités de la scène.
// Trois anneaux moulurés superposés et un rang de perles le long de l'ouverture.
export function creerCadre(THREE, { largeur, hauteur, ouvertureRelative, mobile }) {
  const groupe = new THREE.Group();
  const or = new THREE.MeshStandardMaterial({
    color: 0xc99a4a,
    metalness: mobile ? 0.75 : 1,
    roughness: mobile ? 0.38 : 0.3,
  });
  const orSombre = or.clone();
  orSombre.color = new THREE.Color(0x5e4320);
  orSombre.roughness = 0.5;

  // Même épaisseur de moulure sur les quatre côtés.
  const bord = (Math.min(largeur, hauteur) * (1 - ouvertureRelative)) / 2;

  function anneau(exterieur, interieur, profondeur, biseau, matiere, z) {
    const forme = new THREE.Shape();
    forme.moveTo(-exterieur.l / 2, -exterieur.h / 2);
    forme.lineTo(exterieur.l / 2, -exterieur.h / 2);
    forme.lineTo(exterieur.l / 2, exterieur.h / 2);
    forme.lineTo(-exterieur.l / 2, exterieur.h / 2);
    forme.closePath();
    const trou = new THREE.Path();
    trou.moveTo(-interieur.l / 2, -interieur.h / 2);
    trou.lineTo(-interieur.l / 2, interieur.h / 2);
    trou.lineTo(interieur.l / 2, interieur.h / 2);
    trou.lineTo(interieur.l / 2, -interieur.h / 2);
    trou.closePath();
    forme.holes.push(trou);
    const geo = new THREE.ExtrudeGeometry(forme, {
      depth: profondeur,
      bevelEnabled: true,
      bevelThickness: biseau,
      bevelSize: biseau,
      bevelSegments: mobile ? 2 : 5,
      curveSegments: 1,
    });
    const maille = new THREE.Mesh(geo, matiere);
    maille.position.z = z;
    groupe.add(maille);
  }

  const ext = { l: largeur, h: hauteur };
  const int = { l: largeur - 2 * bord, h: hauteur - 2 * bord };
  const entre = (f) => ({ l: ext.l - 2 * bord * f, h: ext.h - 2 * bord * f });

  // Bord extérieur large, gorge sombre au milieu, lèvre intérieure en relief.
  anneau(ext, entre(0.34), bord * 0.18, bord * 0.1, or, 0);
  anneau(entre(0.34), entre(0.68), bord * 0.06, bord * 0.04, orSombre, -bord * 0.04);
  anneau(entre(0.68), int, bord * 0.24, bord * 0.08, or, 0);

  // Rang de perles le long de l'ouverture.
  if (!mobile) {
    const rayon = bord * 0.07;
    const pas = rayon * 2.6;
    const cadreInt = entre(0.7);
    const positions = [];
    for (let x = -cadreInt.l / 2; x <= cadreInt.l / 2; x += pas) positions.push([x, cadreInt.h / 2], [x, -cadreInt.h / 2]);
    for (let y = -cadreInt.h / 2 + pas; y < cadreInt.h / 2; y += pas) positions.push([cadreInt.l / 2, y], [-cadreInt.l / 2, y]);
    const perles = new THREE.InstancedMesh(new THREE.SphereGeometry(rayon, 10, 8), or, positions.length);
    const m = new THREE.Matrix4();
    positions.forEach(([x, y], i) => perles.setMatrixAt(i, m.makeTranslation(x, y, bord * 0.42)));
    groupe.add(perles);
  }

  groupe.userData.ouverture = { l: int.l / largeur, h: int.h / hauteur };
  groupe.userData.matieres = [or, orSombre];
  return groupe;
}
