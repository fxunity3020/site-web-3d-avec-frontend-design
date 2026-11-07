// La vapeur : un fond sombre qui monte avec la première section, bordé d'une vapeur chaude
// qui s'élève, et des volutes plus légères au passage des sections suivantes.
// Deux quads plein écran dessinés directement en coordonnées d'écran.
import { intensiteVapeur } from "./vapeur-calcul.js";

const BRUIT = /* glsl */ `
  float hasard(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float bruit(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hasard(i), hasard(i + vec2(1.0, 0.0)), u.x),
               mix(hasard(i + vec2(0.0, 1.0)), hasard(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * bruit(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

const SOMMET = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Fond : opaque sous le bord de la première section, avec une lisière irrégulière.
const FOND = /* glsl */ `
  uniform float uBord;      // bord en pixels depuis le bas de l'écran
  uniform float uHauteur;   // hauteur de l'écran en pixels
  uniform float uIntensite;
  uniform float uTemps;
  uniform vec3 uCouleur;
  ${BRUIT}
  void main() {
    vec2 p = gl_FragCoord.xy / uHauteur;
    float ondulation = (fbm(vec2(p.x * 3.0, uTemps * 0.15)) - 0.5) * 0.12 * uHauteur * uIntensite;
    float dessous = 1.0 - smoothstep(uBord + ondulation - 0.02 * uHauteur, uBord + ondulation + 0.02 * uHauteur, gl_FragCoord.y);
    gl_FragColor = vec4(uCouleur, dessous);
  }
`;

// Vapeur : volutes de bruit fractal qui montent au-dessus de chaque bord.
const VAPEUR = /* glsl */ `
  uniform vec2 uBords;       // deux bords en pixels depuis le bas
  uniform vec2 uIntensites;
  uniform float uHauteur;
  uniform float uTemps;
  uniform vec3 uChaud;
  uniform vec3 uClair;
  ${BRUIT}
  float volute(float bord, float intensite, vec2 p) {
    if (intensite <= 0.0) return 0.0;
    float r = (gl_FragCoord.y - bord) / uHauteur;        // > 0 au-dessus du bord
    float bande = smoothstep(-0.1, 0.02, r) * (1.0 - smoothstep(0.08, 0.6, r));
    vec2 q = vec2(p.x * 1.8, r * 2.4 - uTemps * 0.28);
    float d = fbm(q + vec2(fbm(q + uTemps * 0.05), 0.0) * 1.4);
    return smoothstep(0.3, 0.75, d) * bande * intensite;
  }
  void main() {
    vec2 p = gl_FragCoord.xy / uHauteur;
    float a = max(volute(uBords.x, uIntensites.x, p), volute(uBords.y, uIntensites.y, p));
    vec3 couleur = mix(uChaud, uClair, smoothstep(0.1, 0.6, a));
    gl_FragColor = vec4(couleur, clamp(a * 1.25, 0.0, 0.92));
  }
`;

export function creerVapeur(THREE, { couleurFond = "#0B2026" } = {}) {
  const geo = new THREE.PlaneGeometry(2, 2);
  const commun = { vertexShader: SOMMET, transparent: true, depthTest: false, depthWrite: false };

  const fond = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      ...commun,
      fragmentShader: FOND,
      uniforms: {
        uBord: { value: -1 },
        uHauteur: { value: 1 },
        uIntensite: { value: 0 },
        uTemps: { value: 0 },
        uCouleur: { value: new THREE.Color(couleurFond) },
      },
    }),
  );
  const vapeur = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      ...commun,
      fragmentShader: VAPEUR,
      uniforms: {
        uBords: { value: new THREE.Vector2(-1, -1) },
        uIntensites: { value: new THREE.Vector2(0, 0) },
        uHauteur: { value: 1 },
        uTemps: { value: 0 },
        uChaud: { value: new THREE.Color("#F2C97A") },
        uClair: { value: new THREE.Color("#EDE3CF") },
      },
    }),
  );
  for (const [m, ordre] of [[fond, -10], [vapeur, 10]]) {
    m.frustumCulled = false;
    m.renderOrder = ordre;
  }

  const etat = (window.__vapeur = { intensite: 0 });

  // premier : haut de la première section (px) ; suivants : hauts des sections suivantes (px).
  function maj({ premier, suivants, hauteur, ratio, temps }) {
    const versGL = (haut) => (hauteur - haut) * ratio;
    const intensite = intensiteVapeur(premier, hauteur);
    etat.intensite = intensite;

    const f = fond.material.uniforms;
    f.uBord.value = versGL(premier);
    f.uHauteur.value = hauteur * ratio;
    f.uIntensite.value = intensite;
    f.uTemps.value = temps;

    // La plus forte volute des sections suivantes accompagne celle de la première.
    let bord2 = -1;
    let int2 = 0;
    for (const haut of suivants) {
      const i = intensiteVapeur(haut, hauteur) * 0.6;
      if (i > int2) {
        int2 = i;
        bord2 = versGL(haut);
      }
    }
    const v = vapeur.material.uniforms;
    v.uBords.value.set(versGL(premier), bord2);
    v.uIntensites.value.set(intensite, int2);
    v.uHauteur.value = hauteur * ratio;
    v.uTemps.value = temps;
  }

  return { fond, vapeur, maj };
}
