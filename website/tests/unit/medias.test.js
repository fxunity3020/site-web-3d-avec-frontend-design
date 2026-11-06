import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const pub = new URL("../../public/", import.meta.url).pathname;

test("la séquence du film est complète et légère", () => {
  const manifest = JSON.parse(readFileSync(join(pub, "seq/manifest.json"), "utf8"));
  assert.ok(manifest.total >= 120 && manifest.total <= 180, `total = ${manifest.total}`);
  for (let i = 1; i <= manifest.total; i++) {
    const nom = `f${String(i).padStart(3, "0")}.webp`;
    assert.ok(existsSync(join(pub, "seq", nom)), `manque ${nom}`);
  }
  const octets = readdirSync(join(pub, "seq")).reduce((s, f) => s + statSync(join(pub, "seq", f)).size, 0);
  assert.ok(octets < 8 * 1024 * 1024, `séquence trop lourde : ${octets} octets`);
});

test("l'affiche, l'image de partage et le logo existent", () => {
  for (const f of ["img/affiche.jpg", "img/og.jpg", "img/logo.webp", "favicon.svg"]) {
    assert.ok(existsSync(join(pub, f)), `manque ${f}`);
  }
});
