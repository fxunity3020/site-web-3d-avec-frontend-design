import { test } from "node:test";
import assert from "node:assert/strict";
import { etatCoupe, progressionCoupe } from "../../src/lame-calcul.js";

test("la coupe commence quand la section entre par le bas et finit près du haut", () => {
  assert.equal(progressionCoupe(1000, 1000), 0);
  assert.equal(progressionCoupe(1200, 1000), 0);
  assert.equal(progressionCoupe(150, 1000), 1);
  assert.equal(progressionCoupe(0, 1000), 1);
  assert.ok(Math.abs(progressionCoupe(575, 1000) - 0.5) < 1e-9);
});

test("la coupe est en diagonale au début et droite à la fin", () => {
  assert.ok(etatCoupe(0).pente > 0.3);
  assert.equal(etatCoupe(1).pente, 0);
  let avant = Infinity;
  for (let i = 0; i <= 10; i++) {
    const { pente } = etatCoupe(i / 10);
    assert.ok(pente <= avant);
    avant = pente;
  }
});

test("la lame traverse l'écran de droite à gauche et n'est visible que pendant la coupe", () => {
  assert.ok(etatCoupe(0.05).lameX > 1);
  assert.ok(etatCoupe(0.95).lameX < 0);
  assert.equal(etatCoupe(0).visible, false);
  assert.equal(etatCoupe(1).visible, false);
  assert.equal(etatCoupe(0.5).visible, true);
});
