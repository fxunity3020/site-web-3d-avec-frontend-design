// Le plafond hexagonal du salon, en vraie 3D : une grille d'alvéoles lumineuses inclinée
// derrière les sections, qui s'allument sous la souris ou le doigt.

const SOMMET = /* glsl */ `
  attribute float aLueur;
  varying float vLueur;
  void main() {
    vLueur = aLueur;
    vec4 p = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * p;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uBord;   // ne dessine que sous le bord du fond sombre
  varying float vLueur;
  void main() {
    if (gl_FragCoord.y > uBord) discard;
    vec3 couleur = mix(vec3(0.62, 0.78, 0.8), vec3(1.0, 0.97, 0.9), vLueur);
    gl_FragColor = vec4(couleur, 0.07 + 0.78 * vLueur);
  }
`;

export function creerPlafond(THREE, { camera, mobile }) {
  const R = mobile ? 0.34 : 0.42;
  const colonnes = mobile ? 14 : 24;
  const rangees = mobile ? 22 : 14;
  const geo = new THREE.RingGeometry(R * 0.9, R, 6, 1);
  const total = colonnes * rangees;
  const lueurs = new Float32Array(total);
  geo.setAttribute("aLueur", new THREE.InstancedBufferAttribute(lueurs, 1));

  const materiau = new THREE.ShaderMaterial({
    vertexShader: SOMMET,
    fragmentShader: FRAGMENT,
    uniforms: { uBord: { value: -1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const alveoles = new THREE.InstancedMesh(geo, materiau, total);
  alveoles.frustumCulled = false;

  // Alvéoles à sommet plat : pas horizontal 1,5 R, pas vertical √3 R, colonnes impaires décalées.
  const centres = [];
  const m = new THREE.Matrix4();
  const largeur = (colonnes - 1) * 1.5 * R;
  const hauteur = (rangees - 1) * Math.sqrt(3) * R;
  for (let c = 0; c < colonnes; c++) {
    for (let r = 0; r < rangees; r++) {
      const x = c * 1.5 * R - largeur / 2;
      const y = r * Math.sqrt(3) * R + (c % 2 ? (Math.sqrt(3) / 2) * R : 0) - hauteur / 2;
      centres.push(x, y, c + r);
      alveoles.setMatrixAt(centres.length / 3 - 1, m.makeTranslation(x, y, 0));
    }
  }

  const groupe = new THREE.Group();
  groupe.add(alveoles);
  groupe.position.set(0, 0.6, -2.5);
  groupe.rotation.x = -0.62;
  groupe.renderOrder = 0;

  // Pointeur : coordonnées normalisées, ou null tant qu'il n'a pas bougé.
  let pointeur = null;
  let dernierMouvement = -10;
  const suivre = (e) => {
    pointeur = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    dernierMouvement = performance.now() / 1000;
  };
  addEventListener("pointermove", suivre, { passive: true });
  addEventListener("pointerdown", suivre, { passive: true });

  const rayon = new THREE.Raycaster();
  const plan = new THREE.Plane();
  const normale = new THREE.Vector3();
  const touche = new THREE.Vector3();
  const etat = (window.__plafond = { allumees: 0 });

  function maj({ bordGL, temps, dt }) {
    materiau.uniforms.uBord.value = bordGL;

    let local = null;
    const recent = performance.now() / 1000 - dernierMouvement < 2.5;
    if (pointeur && recent) {
      groupe.updateMatrixWorld();
      normale.set(0, 0, 1).applyQuaternion(groupe.quaternion);
      plan.setFromNormalAndCoplanarPoint(normale, groupe.position);
      rayon.setFromCamera(pointeur, camera);
      if (rayon.ray.intersectPlane(plan, touche)) local = groupe.worldToLocal(touche.clone());
    }

    const sigma = R * 2.2;
    const k = 1 - Math.pow(0.002, dt);
    let allumees = 0;
    for (let i = 0; i < total; i++) {
      const x = centres[i * 3];
      const y = centres[i * 3 + 1];
      // Un frisson lumineux traverse lentement le plafond en diagonale.
      const vague = 0.18 * Math.pow(Math.max(0, Math.sin(temps * 0.7 - centres[i * 3 + 2] * 0.32)), 10);
      let cible = vague;
      if (local) {
        const d2 = (x - local.x) ** 2 + (y - local.y) ** 2;
        cible = Math.max(cible, Math.exp(-d2 / (2 * sigma * sigma)));
      }
      lueurs[i] += (cible - lueurs[i]) * k;
      if (lueurs[i] > 0.5) allumees++;
    }
    geo.attributes.aLueur.needsUpdate = true;
    etat.allumees = allumees;
  }

  return { groupe, maj };
}
