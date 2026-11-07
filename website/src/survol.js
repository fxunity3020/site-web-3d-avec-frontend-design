// Le hero suit la souris : légère profondeur 3D sur la visite filmée et lueur ambrée sous le pointeur.
import { gsap } from "gsap";

export function suivreLaSouris({ film, affiche, lueur, histoire }) {
  const couches = [film, affiche];
  const vers = {
    rx: couches.map((c) => gsap.quickTo(c, "--hx", { duration: 0.9, ease: "power3.out" })),
    ry: couches.map((c) => gsap.quickTo(c, "--hy", { duration: 0.9, ease: "power3.out" })),
  };
  const lueurX = gsap.quickTo(lueur, "--lx", { duration: 0.5, ease: "power3.out" });
  const lueurY = gsap.quickTo(lueur, "--ly", { duration: 0.5, ease: "power3.out" });

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    vers.ry.forEach((f) => f(x * 6));
    vers.rx.forEach((f) => f(-y * 4));
    lueurX(e.clientX);
    lueurY(e.clientY);
    lueur.style.opacity = histoire.getBoundingClientRect().bottom > innerHeight * 0.5 ? "1" : "0";
  });
}
