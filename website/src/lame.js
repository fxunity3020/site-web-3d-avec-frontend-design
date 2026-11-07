// Transition « lame droite » : un rasoir droit en 3D glisse le long d'une coupe en diagonale
// au bord de la section qui arrive ; la section qui part glisse comme un morceau coupé.
// Le rasoir a son propre canvas, au-dessus du contenu, et ne se dessine que pendant une coupe.
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { etatCoupe, progressionCoupe } from "./lame-calcul.js";

const PAIRES = [
  ["#services", "#equipe"],
  ["#equipe", "#avis"],
  ["#avis", "#nous-trouver"],
];

function creerRasoir(mobile) {
  const groupe = new THREE.Group();
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe8ecef, metalness: 1, roughness: mobile ? 0.25 : 0.12 });
  const bois = new THREE.MeshStandardMaterial({ color: 0x3b2214, metalness: 0.1, roughness: 0.55 });
  const laiton = new THREE.MeshStandardMaterial({ color: 0xd5b27c, metalness: 1, roughness: 0.3 });

  // Lame : dos droit, tranchant légèrement bombé, pointe arrondie.
  const profil = new THREE.Shape();
  profil.moveTo(0, 0);
  profil.lineTo(2.6, 0);
  profil.quadraticCurveTo(2.95, 0, 2.95, -0.32);
  profil.quadraticCurveTo(2.9, -0.62, 2.55, -0.62);
  profil.quadraticCurveTo(1.3, -0.5, 0.15, -0.42);
  profil.lineTo(0, -0.3);
  profil.closePath();
  const lame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(profil, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3 }),
    chrome,
  );
  lame.position.set(0, 0.31, -0.02);
  groupe.add(lame);

  // Manche en bois, avec ses deux rivets en laiton.
  const manche = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.42, 0.12), bois);
  manche.position.set(-1.45, 0.02, 0);
  groupe.add(manche);
  for (const x of [-0.25, -2.65]) {
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 16), laiton);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(x, 0.02, 0);
    groupe.add(rivet);
  }
  return groupe;
}

function creerTrait() {
  // Traînée dorée qui suit le tranchant : un ruban additif qui s'estompe vers la droite.
  const materiau = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uOpacite: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform float uOpacite;
      varying vec2 vUv;
      void main() {
        float coeur = 1.0 - abs(vUv.y - 0.5) * 2.0;
        float a = pow(coeur, 3.0) * (1.0 - vUv.x) * uOpacite;
        gl_FragColor = vec4(vec3(1.0, 0.82, 0.5) * 1.4, a);
      }`,
  });
  const trait = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.09), materiau);
  trait.geometry.translate(0.5, 0, 0);
  return trait;
}

export function demarrerLame({ canvas, mobile }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 50);
  camera.position.z = 10;
  scene.add(new THREE.AmbientLight(0xf2c97a, 0.6));
  const cle = new THREE.DirectionalLight(0xffffff, 2.4);
  cle.position.set(-2, 3, 5);
  scene.add(cle);
  const reflet = new THREE.PointLight(0xf2c97a, 30, 12);
  scene.add(reflet);
  if (!mobile) {
    import("three/addons/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
      scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    });
  }

  const rasoir = creerRasoir(mobile);
  const trait = creerTrait();
  scene.add(trait, rasoir);

  const hauteurMonde = () => 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
  const versMonde = (sx, sy) => {
    const h = hauteurMonde();
    return new THREE.Vector3((sx / innerWidth - 0.5) * h * camera.aspect, -(sy / innerHeight - 0.5) * h, 0);
  };

  const etat = (window.__lame = { visible: false });
  const paires = PAIRES.map(([avant, apres]) => ({
    avant: document.querySelector(`${avant} .contenu`),
    apres: document.querySelector(apres),
  }));

  function appliquer(temps) {
    let active = null;
    for (const paire of paires) {
      const p = progressionCoupe(paire.apres.getBoundingClientRect().top, innerHeight);
      const coupe = etatCoupe(p);
      const L = coupe.pente * innerHeight;
      // La section qui arrive est tranchée en diagonale ; la section qui part glisse en biais.
      paire.apres.style.clipPath = coupe.visible ? `polygon(0 ${L}px, 100% 0, 100% 100%, 0 100%)` : "";
      paire.avant.style.transform = p ? `translate(${-4 * p}vw, ${-5 * p}vh) rotate(${-2 * p}deg)` : "";
      paire.avant.style.opacity = p ? String(1 - 0.6 * p) : "";
      if (coupe.visible) active = { coupe, haut: paire.apres.getBoundingClientRect().top, L, p };
    }

    etat.visible = Boolean(active);
    canvas.style.opacity = active ? "1" : "0";
    if (!active) return;

    const { coupe, haut, L, p } = active;
    const sx = coupe.lameX * innerWidth;
    const sy = haut + L * (1 - coupe.lameX);
    const angle = Math.atan2(L, innerWidth); // la coupe descend vers la gauche
    const position = versMonde(sx, sy);
    const longueur = (mobile ? 0.55 : 0.32) * hauteurMonde() * camera.aspect; // part de la largeur de l'écran
    const echelle = longueur / 5.6;

    rasoir.position.copy(position);
    rasoir.scale.setScalar(echelle);
    rasoir.rotation.set(0.5 + Math.sin(temps * 2.5) * 0.25, 0.35 + p * 0.6, angle);
    reflet.position.set(position.x + 1.5, position.y + 1, 3);

    const bordDroit = versMonde(innerWidth * 1.05, haut);
    trait.position.copy(position);
    trait.rotation.z = angle;
    trait.scale.set(Math.max(0.01, position.distanceTo(bordDroit)), 1, 1);
    trait.material.uniforms.uOpacite.value = Math.sin(Math.PI * p);

    renderer.render(scene, camera);
  }

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });
  const horloge = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!document.hidden) appliquer(horloge.getElapsedTime());
  });
  ScrollTrigger.refresh();
  return etat;
}
