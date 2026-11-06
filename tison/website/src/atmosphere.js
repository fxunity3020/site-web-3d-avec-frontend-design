// Atmosphère vivante par-dessus le film : braises 2D dans les couleurs de la marque + halo qui suit le curseur.
// Canvas 2D : léger sur téléphone. mode = "poussiere" | "braises" | "pluie" | "neige".
export function createAtmosphere({ canvas, accent, accent2, mode = "braises" }) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d"), mobile = matchMedia("(max-width: 820px), (pointer: coarse)").matches;
  const N = mobile ? 60 : 150, pts = [];
  let W, H, pr, mx = 0.5, my = 0.4, hx = 0.5, hy = 0.4, enMarche = false, raf = 0;
  function taille() { pr = Math.min(devicePixelRatio, mobile ? 1.5 : 2); W = canvas.width = innerWidth * pr; H = canvas.height = innerHeight * pr; }
  taille(); addEventListener("resize", taille);
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
  for (let i = 0; i < N; i++) pts.push({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, c: Math.random() < 0.75 ? accent : accent2, p: Math.random() * 6.28 });
  const vitesse = { pluie: 1.4, neige: 0.06, braises: -0.07, poussiere: -0.015 }[mode];
  let avant = performance.now();
  function boucle(now) {
    raf = requestAnimationFrame(boucle);
    if (document.hidden) return;
    const dt = Math.min((now - avant) / 1000, 0.05); avant = now;
    ctx.clearRect(0, 0, W, H);
    hx += (mx - hx) * 0.06; hy += (my - hy) * 0.06;
    if (!mobile) {
      const g = ctx.createRadialGradient(hx * W, hy * H, 0, hx * W, hy * H, W * 0.35);
      g.addColorStop(0, accent + "1c"); g.addColorStop(1, accent + "00");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = "lighter";
    for (const q of pts) {
      q.y += vitesse * q.z * dt; q.x += Math.sin(now / 1500 + q.p) * 0.0004 * q.z + (hx - 0.5) * 0.0003;
      if (q.y < -0.05) q.y = 1.05; if (q.y > 1.05) q.y = -0.05; if (q.x < 0) q.x += 1; if (q.x > 1) q.x -= 1;
      const r = (mode === "braises" ? 2.2 : 1.6) * q.z * pr, a = 0.3 + 0.45 * Math.abs(Math.sin(now / 900 + q.p));
      ctx.globalAlpha = a; ctx.fillStyle = q.c;
      if (mode === "pluie") ctx.fillRect(q.x * W, q.y * H, 1 * pr, 14 * q.z * pr);
      else { ctx.beginPath(); ctx.arc(q.x * W, q.y * H, r, 0, 6.28); ctx.fill(); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }
  // La boucle tourne seulement quand main.js la démarre (histoire à l'écran).
  return {
    demarrer() { if (enMarche) return; enMarche = true; avant = performance.now(); raf = requestAnimationFrame(boucle); },
    arreter() { if (!enMarche) return; enMarche = false; cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); },
  };
}
