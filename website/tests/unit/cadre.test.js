import { test } from "node:test";
import assert from "node:assert/strict";
import { etatDuCadre, ouvertureEcran } from "../../src/cadre.js";

test("le cadre apparaît, remplit l'écran au milieu, puis disparaît une fois traversé", () => {
  assert.equal(etatDuCadre(0).opacite, 0);
  assert.equal(etatDuCadre(0.5).opacite, 1);
  assert.equal(etatDuCadre(1).opacite, 0);
  assert.ok(etatDuCadre(1).echelle >= 3);
  assert.equal(etatDuCadre(0.5).echelle, 1);
});

test("le cadre grandit sans jamais reculer", () => {
  let avant = -Infinity;
  for (let i = 0; i <= 10; i++) {
    const { echelle } = etatDuCadre(i / 10);
    assert.ok(echelle > avant, `échelle ${echelle} à p=${i / 10}`);
    avant = echelle;
  }
});

test("l'ouverture du cadre est centrée et proportionnelle à l'échelle", () => {
  const a = ouvertureEcran(1, { largeur: 1000, hauteur: 800, remplissage: 0.8, ouvertureL: 0.75, ouvertureH: 0.75 });
  assert.deepEqual(a, { gauche: 200, droite: 800, haut: 160, bas: 640 });
  const grand = ouvertureEcran(3, { largeur: 1000, hauteur: 800, remplissage: 0.8, ouvertureL: 0.75, ouvertureH: 0.75 });
  assert.ok(grand.gauche < 0 && grand.droite > 1000);
});
