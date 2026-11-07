// Cartes en 3D : elles s'inclinent sous la souris et basculent doucement au défilement.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const INCLINAISON_MAX = 14;

export function inclinerCartes(selecteur) {
  for (const carte of document.querySelectorAll(selecteur)) {
    const versRx = gsap.quickTo(carte, "--rx", { duration: 0.45, ease: "power3.out" });
    const versRy = gsap.quickTo(carte, "--ry", { duration: 0.45, ease: "power3.out" });

    carte.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const b = carte.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width;
      const y = (e.clientY - b.top) / b.height;
      versRy((x - 0.5) * 2 * INCLINAISON_MAX);
      versRx(-(y - 0.5) * 2 * INCLINAISON_MAX);
      carte.style.setProperty("--reflet-x", `${x * 100}%`);
      carte.style.setProperty("--reflet-y", `${y * 100}%`);
    });
    carte.addEventListener("pointerleave", () => {
      versRx(0);
      versRy(0);
    });

    // Au défilement, la carte se redresse en entrant puis bascule en sortant : de la profondeur, même au doigt.
    gsap.fromTo(
      carte,
      { "--rx-defil": 16 },
      { "--rx-defil": -10, ease: "none", scrollTrigger: { trigger: carte, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }
}

// Cartes de l'équipe : un bouton les retourne pour montrer les spécialités.
export function retournerCartels(selecteur) {
  for (const cartel of document.querySelectorAll(selecteur)) {
    const bouton = cartel.querySelector("button");
    bouton.addEventListener("click", () => {
      const retourne = cartel.classList.toggle("retourne");
      bouton.setAttribute("aria-pressed", String(retourne));
    });
  }
}

export function rafraichir() {
  ScrollTrigger.refresh();
}
