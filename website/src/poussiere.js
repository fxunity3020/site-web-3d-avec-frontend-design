// Fine poussière dorée qui monte lentement dans la lumière des lampes.
export function creerPoussiere(THREE, { nombre, couleurs }) {
  const positions = new Float32Array(nombre * 3);
  const teintes = new Float32Array(nombre * 3);
  const vitesses = new Float32Array(nombre);
  const palette = couleurs.map((c) => new THREE.Color(c));
  for (let i = 0; i < nombre; i++) {
    positions.set([(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4], i * 3);
    const c = palette[i % palette.length];
    teintes.set([c.r, c.g, c.b], i * 3);
    vitesses[i] = 0.04 + Math.random() * 0.12;
  }
  const geometrie = new THREE.BufferGeometry();
  geometrie.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometrie.setAttribute("color", new THREE.BufferAttribute(teintes, 3));

  const tache = document.createElement("canvas");
  tache.width = tache.height = 64;
  const ctx = tache.getContext("2d");
  const degrade = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  degrade.addColorStop(0, "rgba(255,255,255,1)");
  degrade.addColorStop(0.35, "rgba(255,255,255,0.45)");
  degrade.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, 64, 64);

  const points = new THREE.Points(
    geometrie,
    new THREE.PointsMaterial({
      size: 0.045,
      map: new THREE.CanvasTexture(tache),
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );

  function animer(dt, t) {
    const a = geometrie.attributes.position.array;
    for (let i = 0; i < nombre; i++) {
      let y = a[i * 3 + 1] + vitesses[i] * dt;
      if (y > 3.5) y = -3.5;
      a[i * 3 + 1] = y;
      a[i * 3] += Math.sin(t * 0.4 + i) * dt * 0.03;
    }
    geometrie.attributes.position.needsUpdate = true;
  }

  return { points, animer };
}
