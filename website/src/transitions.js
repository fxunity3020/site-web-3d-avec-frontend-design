// Transitions entre sections : la caméra traverse un cadre doré, la section suivante apparaît dans son ouverture.
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { creerCadre, etatDuCadre, ouvertureEcran } from "./cadre.js";

const SECTIONS = ["#services", "#equipe", "#avis", "#nous-trouver"];
const REMPLISSAGE = 0.8;

export async function demarrerTransitions(scene, { mobile }) {
  const { THREE, camera } = scene;
  const etat = (window.__cadre = { opacite: 0, echelle: 0 });

  if (!mobile) {
    const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
    const pmrem = new THREE.PMREMGenerator(scene.renderer);
    scene.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.scene.environmentIntensity = 0.8;
  }
  const ambre = new THREE.DirectionalLight(0xf2c97a, 2.6);
  ambre.position.set(-3, 3, 4);
  const contour = new THREE.DirectionalLight(0x5aa0a8, 1.4);
  contour.position.set(4, -2, 2);
  const reflet = new THREE.PointLight(0xffe2a8, 18, 12);
  scene.ajouter(new THREE.AmbientLight(0xf2c97a, mobile ? 0.5 : 0.2));
  scene.ajouter(ambre);
  scene.ajouter(contour);
  scene.ajouter(reflet);

  let cadre = null;
  function construire() {
    if (cadre) scene.scene.remove(cadre);
    const h = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const l = h * camera.aspect;
    cadre = creerCadre(THREE, { largeur: l * REMPLISSAGE, hauteur: h * REMPLISSAGE, ouvertureRelative: mobile ? 0.84 : 0.78, mobile });
    cadre.visible = false;
    for (const m of cadre.userData.matieres) m.transparent = true;
    scene.ajouter(cadre);
  }
  construire();
  addEventListener("resize", () => {
    construire();
    ScrollTrigger.refresh();
  });

  function cacher(section) {
    cadre.visible = false;
    etat.opacite = 0;
    section.style.clipPath = "";
  }

  function appliquer(p, section) {
    const { echelle, opacite } = etatDuCadre(p);
    // Presque invisible : on retire le cadre et la découpe, pour ne rien laisser de figé.
    if (opacite < 0.01) {
      cacher(section);
      return;
    }
    etat.opacite = opacite;
    etat.echelle = echelle;
    cadre.visible = opacite > 0;
    cadre.scale.setScalar(echelle);
    cadre.rotation.x = (1 - p) * 0.28;
    cadre.rotation.y = (1 - p) * -0.18;
    for (const m of cadre.userData.matieres) m.opacity = opacite;
    reflet.position.set(-4 + p * 8, 1.5 - p, 3);

    const r = section.getBoundingClientRect();
    const o = ouvertureEcran(echelle, {
      largeur: innerWidth,
      hauteur: innerHeight,
      remplissage: REMPLISSAGE,
      ouvertureL: cadre.userData.ouverture.l,
      ouvertureH: cadre.userData.ouverture.h,
    });
    const haut = Math.max(0, o.haut - r.top);
    const droite = Math.max(0, r.right - o.droite);
    const bas = Math.max(0, r.bottom - o.bas);
    const gauche = Math.max(0, o.gauche - r.left);
    section.style.clipPath = haut + droite + bas + gauche > 0 ? `inset(${haut}px ${droite}px ${bas}px ${gauche}px)` : "";
  }

  for (const selecteur of SECTIONS) {
    const section = document.querySelector(selecteur);
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => appliquer(self.progress, section),
      onToggle: (self) => {
        if (!self.isActive) cacher(section);
      },
    });
  }
}
