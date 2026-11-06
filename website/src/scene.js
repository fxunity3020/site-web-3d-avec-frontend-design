// La scène Three.js fixe derrière la page : un seul renderer pour la poussière dorée et le cadre doré.
import * as THREE from "three";

export async function creerScene({ canvas, mobile }) {
  const racine = document.documentElement;
  const etat = (window.__scene = { etat: "chargement", fps: 0 });
  const off = () => {
    etat.etat = "off";
    racine.dataset.scene = "off";
    return null;
  };

  if (new URLSearchParams(location.search).has("noscene")) return off();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
  } catch {
    return off();
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mobile ? 50 : 40, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const abonnes = [];
  const horloge = new THREE.Clock();
  let premier = true;
  let images = 0;
  let debutMesure = performance.now();

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });

  renderer.setAnimationLoop(() => {
    if (document.hidden) return;
    const dt = Math.min(horloge.getDelta(), 0.05);
    const t = horloge.elapsedTime;
    for (const fn of abonnes) fn(dt, t);
    renderer.render(scene, camera);
    images++;
    const maintenant = performance.now();
    if (maintenant - debutMesure >= 1000) {
      etat.fps = Math.round((images * 1000) / (maintenant - debutMesure));
      images = 0;
      debutMesure = maintenant;
    }
    if (premier) {
      premier = false;
      etat.etat = "pret";
      racine.dataset.scene = "pret";
    }
  });

  return {
    THREE,
    scene,
    camera,
    renderer,
    ajouter: (objet) => scene.add(objet),
    surImage: (fn) => abonnes.push(fn),
  };
}
