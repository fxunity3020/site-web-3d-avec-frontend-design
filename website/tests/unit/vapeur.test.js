import { test } from "node:test";
import assert from "node:assert/strict";
import { intensiteVapeur } from "../../src/vapeur-calcul.js";

test("pas de vapeur tant que la section est sous l'écran", () => {
  assert.equal(intensiteVapeur(900, 800), 0);
  assert.equal(intensiteVapeur(800, 800), 0);
});

test("la vapeur est pleine quand la section monte au milieu de l'écran", () => {
  assert.equal(intensiteVapeur(400, 800), 1);
});

test("la vapeur s'est dissipée une fois la section arrivée en haut", () => {
  assert.equal(intensiteVapeur(-200, 800), 0);
});

test("la vapeur monte puis redescend sans à-coup", () => {
  const valeurs = [800, 700, 600, 500, 400].map((h) => intensiteVapeur(h, 800));
  for (let i = 1; i < valeurs.length; i++) assert.ok(valeurs[i] >= valeurs[i - 1]);
});
