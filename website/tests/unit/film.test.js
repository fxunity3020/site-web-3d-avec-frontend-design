import { test } from "node:test";
import assert from "node:assert/strict";
import { indexPourProgression, ordreDeChargement } from "../../src/film-calcul.js";

test("indexPourProgression borne et arrondit", () => {
  assert.equal(indexPourProgression(0, 120), 0);
  assert.equal(indexPourProgression(1, 120), 119);
  assert.equal(indexPourProgression(0.5, 120), 60);
  assert.equal(indexPourProgression(-1, 120), 0);
  assert.equal(indexPourProgression(2, 120), 119);
});

test("ordreDeChargement couvre chaque image une seule fois, 1 sur 8 d'abord", () => {
  const ordre = ordreDeChargement(120);
  assert.equal(ordre.length, 120);
  assert.equal(new Set(ordre).size, 120);
  assert.deepEqual(ordre.slice(0, 3), [0, 8, 16]);
  assert.ok(ordre.every((i) => i >= 0 && i < 120));
});
