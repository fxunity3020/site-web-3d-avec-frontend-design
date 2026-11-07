// Halo doré qui suit le curseur, et boutons aimantés (ordinateur seulement).
import { gsap } from "gsap";

const RAYON = 48;
const FORCE = 0.35;
const MAX = 14;

export function aimanter() {
  const halo = document.createElement("div");
  halo.id = "halo";
  halo.setAttribute("aria-hidden", "true");
  document.body.append(halo);
  const haloX = gsap.quickTo(halo, "x", { duration: 0.35, ease: "power3.out" });
  const haloY = gsap.quickTo(halo, "y", { duration: 0.35, ease: "power3.out" });

  const boutons = [...document.querySelectorAll(".btn")].map((el) => ({
    el,
    x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
  }));

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    haloX(e.clientX);
    haloY(e.clientY);
    let survole = false;
    for (const b of boutons) {
      const r = b.el.getBoundingClientRect();
      const dedans = e.clientX > r.left - RAYON && e.clientX < r.right + RAYON && e.clientY > r.top - RAYON && e.clientY < r.bottom + RAYON;
      const limite = (v) => Math.max(-MAX, Math.min(MAX, v * FORCE));
      b.x(dedans ? limite(e.clientX - (r.left + r.width / 2)) : 0);
      b.y(dedans ? limite(e.clientY - (r.top + r.height / 2)) : 0);
      survole ||= dedans;
    }
    halo.classList.toggle("sur-bouton", survole);
  });
}
