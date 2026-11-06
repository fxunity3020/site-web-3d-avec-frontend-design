# Site de La Maison Moreno : plan d'implémentation

> **Pour les agents :** sous-skill requis : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**But :** construire le site d'une page de La Maison Moreno, avec une visite filmée du salon qui avance au défilement et des transitions 3D « cadre doré » entre les sections.

**Architecture :**
- Une seule page HTML statique : tout le contenu est en vrai HTML, pour le référencement.
- Le film du hero est une séquence d'images WebP dessinée sur un canvas 2D, pilotée par GSAP ScrollTrigger.
- Une seule scène Three.js, fixe derrière la page, porte la poussière dorée et le cadre doré des transitions.
- Sans WebGL, ou si l'utilisateur a demandé moins de mouvement, la page reste complète : affiche fixe et fondus.

**Pile technique :**
- Vite 8.3.6, JavaScript natif en modules ES.
- three 0.187.0, gsap 3.15.1 (avec ScrollTrigger).
- @fontsource/im-fell-english 5.3.0 et @fontsource-variable/instrument-sans 5.3.0.
- Tests : `node --test` pour les fonctions pures, @playwright/test 1.63.0 pour le navigateur. C'est la version du Chromium préinstallé.

**Spec :** `docs/superpowers/specs/2026-11-06-maison-moreno-site-design.md`

## Contraintes globales

- Bibliothèques 3D et d'animation : Three.js et GSAP seulement. Pas de Lenis, pas de React.
- Consulter Context7 pour three et gsap avant d'écrire le code qui les utilise (tâches 3, 5 et 6).
- Palette (variables CSS) :
  - `--petrole: #12313A`, `--nuit: #0B2026`, `--or: #D5B27C`, `--ambre: #F2C97A` ;
  - `--rouille: #9C4A22`, `--bois: #3B2214`, `--ivoire: #EDE3CF`, `--ivoire-doux: #C9C0AE`.
- Polices :
  - titres en `"IM Fell English", Georgia, serif` ;
  - texte en `"Instrument Sans Variable", system-ui, sans-serif`.
- Le logo calligraphique n'est utilisé que sous forme d'image.
- Textes en français québécois. Pas de tiret cadratin. Pas de majuscules partout dans les libellés. Pas de numéros « 01 / 02 ». Pas de boutons en pilule.
- Pas d'avis inventés : uniquement des avis recopiés mot pour mot, avec prénom et initiale. Pas d'image IA présentée comme un barbier ou une coupe.
- Coordonnées identiques partout :
  - « La Maison Moreno » ;
  - « 301, montée du Comté, local 3, Les Coteaux (Québec) J7X 0B1 » ;
  - « 450 267-8792 » (lien `tel:+14502678792`) ;
  - Booksy : `https://lamaisonmoreno.booksy.com`.
- Toute info non fournie par le client est entourée de `<span class="a-confirmer">…</span>` et listée dans `website/README.md`.
- Pas de formulaire, pas de secret, pas de script en ligne (sauf le JSON-LD).
- Captures de vérification : à 1440 px et à 390 px de large.

## Points de vigilance

1. **Moins de mouvement demandé.** Ni séquence, ni 3D, ni transition animée. L'affiche reste fixe et tout le texte est visible. Test : tâche 4.
2. **Pas de WebGL, ou erreur Three.js.** Le site reste complet et lisible, et `html[data-scene="off"]` est posé. Test : tâche 5 (`?noscene=1`).
3. **Images de la séquence lentes ou absentes.** L'affiche reste visible et l'image la plus proche est dessinée. Test : tâche 3 (`?noseq=1`).
4. **Saut par une ancre** (`#reserver`, `#equipe`) ou défilement très rapide. La bonne image du film, aucun cadre figé à l'écran, le texte de la section visible. Test : tâche 6.
5. **Téléphone à 390 px.** Pas de défilement horizontal, et la barre collante ne cache jamais les coordonnées du pied de page. Test : tâche 7.

---

### Tâche 1 : échafaudage, contenu HTML complet et styles de base

**Fichiers :**
- Créer :
  - `website/package.json`, `website/vite.config.js`, `website/index.html` ;
  - `website/src/main.js`, `website/src/style.css`, `website/README.md` ;
  - `website/playwright.config.js`, `website/tests/e2e/contenu.spec.js`.

**Interfaces :**
- Produit : les identifiants de sections dont dépendent les tâches suivantes :
  - `#histoire` (hero), avec 5 `.temps[data-temps="1..5"]` ;
  - `#services`, `#equipe`, `#avis`, `#nous-trouver`, `footer` ;
  - `img#affiche` (image fixe) ;
  - `canvas#film` (séquence) et `canvas#scene` (Three.js) ;
  - `.cta-booksy` : tous les liens Booksy.
- Produit : les scripts npm `dev`, `build`, `preview`, `test:unit` (`node --test tests/unit`) et `test:e2e` (`playwright test`).

- [ ] **Étape 1 : échafaudage.** `npm init -y`, puis :
  - `npm i three@0.187.0 gsap@3.15.1 @fontsource/im-fell-english@5.3.0 @fontsource-variable/instrument-sans@5.3.0` ;
  - `npm i -D vite@8.3.6 @playwright/test@1.63.0`.

  Dans `vite.config.js` : `build.sourcemap: false` et `chunkSizeWarningLimit: 1200`.

  Dans `playwright.config.js` :
  - `webServer` lance `npm run build && npx vite preview --port 4173` ;
  - deux projets : `ordi` (1440×900) et `tel` (390×844, `isMobile`, `hasTouch`) ;
  - `trace: 'off'`.

- [ ] **Étape 2 : écrire le test qui échoue.** Dans `tests/e2e/contenu.spec.js` :
  - `test('le contenu essentiel est en HTML')` :
    - il y a exactement une `h1` et son texte contient « Barbier à Les Coteaux » ;
    - la page contient « 301, montée du Comté » et « 450 267-8792 » ;
    - tous les `a.cta-booksy` ont `href="https://lamaisonmoreno.booksy.com"`, `target="_blank"` et `rel="noopener noreferrer"` ;
    - au moins un `a[href="tel:+14502678792"]` existe ;
    - les sections `#services`, `#equipe`, `#avis` et `#nous-trouver` existent.
  - `test('aucune erreur de console au chargement')` : la liste des `pageerror` et des messages `console.error` est vide.

- [ ] **Étape 3 :** `npx playwright test tests/e2e/contenu.spec.js`. Attendu : ÉCHEC, parce que `index.html` est vide.

- [ ] **Étape 4 : écrire `index.html` et `style.css`.** L'ordre dans `<body>` :
  1. `img#affiche` ;
  2. `canvas#film` ;
  3. `canvas#scene` ;
  4. `div#voile` ;
  5. `<main>` et `<footer>`.

  Le contenu réel :
  - **Hero** : le logo, la `h1` « Barbier à Les Coteaux » et 5 lignes de temps courtes qui s'inspirent des avis (prendre le temps, la minutie, l'accueil, les dégradés et la barbe, la réservation).
  - **Services** : une liste en `<dl>`. Prix et durée entre `.a-confirmer` tant que le client ne les a pas fournis.
  - **Équipe** : Jérémy, Fred, Orélie et Edwin en cartels typographiques, sans photo. La spécialité de Fred est « dégradés », d'après l'avis de Camille F. Les autres sont entre `.a-confirmer`.
  - **Avis** : trois avis Google recopiés mot pour mot :
    - « Excellent service! Mon conjoint est toujours très satisfait de ses rendez-vous avec Fred. L'accueil est chaleureux, il est très flexible dans ses disponibilités et maîtrise parfaitement les coupes avec un « fade ». On le recommande sans hésitation! » (Camille F.) ;
    - « Mon conjoint est très satisfait de sa coupe réalisée par Jérémy. Professionnel, accueillant, à l'écoute et très sympathique, il a pris le temps de comprendre ses attentes et le résultat est impeccable. » (Mélissa M.) ;
    - la phrase « Tres méticuleux, attentionnée, belle ambiance et deco. » sans auteur, puisque le nom n'est pas connu. Elle est présentée comme un extrait du résumé Google.
    - La note est affichée : 5,0 sur 144 avis Google.
  - **Nous trouver** : l'adresse avec un lien Google Maps (recherche par adresse), les heures entre `.a-confirmer` (« ferme à 20 h » est le seul fait connu), le téléphone et Booksy.

  Les styles : les variables de la palette, une échelle typographique, les sections pleines sur fond `--nuit`, le focus visible et `prefers-reduced-motion`.

- [ ] **Étape 5 :** `npx playwright test tests/e2e/contenu.spec.js`. Attendu : RÉUSSITE (2 tests × 2 projets).

- [ ] **Étape 6 : commit.** `git add website && git commit -m "Scaffold Maison Moreno site with full HTML content"`. Ajouter `website/node_modules` et `website/dist` à `.gitignore`.

### Tâche 2 : médias (séquence, affiche, logo, image de partage)

**Fichiers :**
- Créer :
  - `website/scripts/medias.sh` ;
  - `website/public/seq/f001.webp…` ;
  - `website/public/img/affiche.jpg`, `website/public/img/og.jpg`, `website/public/img/logo.webp` ;
  - `website/public/favicon.svg` ;
  - `website/tests/unit/medias.test.js`.

**Interfaces :**
- Produit : `public/seq/f%03d.webp`, numérotées sans trou à partir de `f001`. `public/seq/manifest.json` vaut `{ "total": N, "largeur": 1600, "hauteur": 900 }`.
- Produit : `img/affiche.jpg` (1920 px, la première image du film), `img/og.jpg` (1200×630, la dernière image) et `img/logo.webp` (logo sur fond transparent).

- [ ] **Étape 1 : écrire le test qui échoue.** Dans `tests/unit/medias.test.js` :
  - `manifest.total` est entre 120 et 180 ;
  - chaque fichier de `f001` à `f{total}` existe ;
  - la taille totale de `public/seq` est inférieure à 8 Mo ;
  - `affiche.jpg`, `og.jpg` et `logo.webp` existent.

- [ ] **Étape 2 :** `npm run test:unit`. Attendu : ÉCHEC.

- [ ] **Étape 3 : écrire `scripts/medias.sh`.** Il lit `../assets/videos/moreno-film.mp4` (12 s) et `../assets/client/logo-fond-noir.jpg`.
  - **Séquence** : `ffmpeg -vf "fps=12,scale=1600:-2" -c:v libwebp -quality 72`, ce qui donne 144 images.
  - **Affiche** : la première image en 1920 px, qualité 3.
  - **Image de partage** : la dernière image (`-sseof -0.1`), recadrée en 1200×630.
  - **Logo** : le noir devient transparent. L'alpha est calculé à partir de la luminance, avec Python et Pillow, et le résultat est réduit à 800 px de large.
  - **Fichiers** : écrit `manifest.json` et crée `favicon.svg`, un monogramme « M » or `#D5B27C` sur fond `#12313A`.

- [ ] **Étape 4 :** `bash scripts/medias.sh && npm run test:unit`. Attendu : RÉUSSITE.

- [ ] **Étape 5 : contrôle visuel.** Regarder `affiche.jpg`, `og.jpg` et `logo.webp` (outil Read). Le logo doit être net, sans halo noir.

- [ ] **Étape 6 : commit.**

### Tâche 3 : le film au défilement

**Fichiers :**
- Créer : `website/src/film.js`, `website/tests/unit/film.test.js`, `website/tests/e2e/film.spec.js`.
- Modifier : `website/src/main.js`.

**Interfaces :**
- Consomme : `public/seq/manifest.json` (tâche 2), `canvas#film` et `img#affiche` (tâche 1).
- Produit :
  - `indexPourProgression(p: number, total: number): number`, qui borne `p` entre 0 et 1 et renvoie `Math.round(p * (total - 1))` ;
  - `ordreDeChargement(total: number): number[]`, qui renvoie les indices 1 sur 8, puis 4, 2, 1, sans doublon ;
  - `creerFilm({ canvas, affiche, dossier, total }): { allerA(p: number): void }`.
  - Effets de `creerFilm` :
    - `window.__film = { image, charges, total }` ;
    - `html[data-film="pret"]` au premier dessin ;
    - `html[data-film="repli"]` si aucune image ne charge.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - **Unitaires** :
    - `indexPourProgression(0,144)===0`, `(1,144)===143`, `(0.5,144)===72`, `(-1,144)===0`, `(2,144)===143` ;
    - `ordreDeChargement(144)` contient chaque indice de 0 à 143 une seule fois et commence par `0,8,16`.
  - **Navigateur** (`film.spec.js`) :
    - en haut de page, `__film.image === 0` ;
    - après un défilement jusqu'à la fin de `#histoire`, `__film.image === total-1` ;
    - avec `?noseq=1` (dossier inexistant), `html[data-film="repli"]` est posé et l'opacité de `#affiche` vaut 1.

- [ ] **Étape 2 :** lancer les deux suites. Attendu : ÉCHEC.

- [ ] **Étape 3 : consulter Context7** (ScrollTrigger : `scrub`, `start`/`end`, `onUpdate`), puis implémenter `film.js`.
  - Dessin en mode « couvrir », redessiné seulement quand l'image change.
  - Si une image manque, dessiner la plus proche déjà chargée.
  - Dans `main.js`, un `ScrollTrigger` sur `#histoire` (`start: "top top"`, `end: "bottom bottom"`) appelle `film.allerA(self.progress)`.
  - `#histoire` mesure 5 × 120 vh.

- [ ] **Étape 4 :** les deux suites. Attendu : RÉUSSITE.

- [ ] **Étape 5 : commit.**

### Tâche 4 : les cinq temps du hero, le voile et le mode « moins de mouvement »

**Fichiers :**
- Modifier : `website/src/main.js`, `website/src/style.css`.
- Créer : `website/tests/e2e/hero.spec.js`.

**Interfaces :**
- Consomme : `.temps[data-temps]` (tâche 1) et le `ScrollTrigger` du film (tâche 3).
- Produit :
  - `html[data-cote="gauche"|"droit"|"centre"]` suit le temps actif ;
  - `.temps.actif` est posé sur un seul temps à la fois.

- [ ] **Étape 1 : écrire le test qui échoue.**
  - `test('un seul temps actif à la fois')` : au milieu de chaque temps (1 à 5), exactement un `.temps.actif`, et c'est le bon.
  - `test('moins de mouvement : tout est lisible')` : avec `page.emulateMedia({ reducedMotion: 'reduce' })` :
    - `#film` est caché et l'opacité de `#affiche` vaut 1 ;
    - les 5 textes de temps sont visibles (opacité 1) ;
    - `__film` n'est pas défini.

- [ ] **Étape 2 :** lancer. Attendu : ÉCHEC.

- [ ] **Étape 3 : implémenter.**
  - Un seul `#voile` fixe, dont le dégradé change de côté selon `data-cote`.
  - Le texte d'un temps est en `position: sticky`.
  - Sous `prefers-reduced-motion: reduce` :
    - `main.js` ne crée ni le film ni la scène ;
    - le CSS affiche toutes les `.copie` ;
    - `#histoire` reprend une hauteur normale.
  - Le côté de chaque temps est choisi d'après les zones calmes du film :
    - temps 1 à gauche (plancher dégagé) ;
    - temps 2 à gauche ;
    - temps 3 à droite ;
    - temps 4 à gauche ;
    - temps 5 au centre-bas.
  - Capturer chaque temps à 1440 et à 390 px, et ajuster jusqu'à ce que le texte ne recouvre aucune chaise ni aucun cadre.

- [ ] **Étape 4 :** lancer. Attendu : RÉUSSITE.

- [ ] **Étape 5 : commit.**

### Tâche 5 : la scène Three.js et la poussière dorée

**Fichiers :**
- Créer : `website/src/scene.js`, `website/tests/e2e/scene.spec.js`.
- Modifier : `website/src/main.js`.

**Interfaces :**
- Consomme : `canvas#scene`.
- Produit :
  - `creerScene({ canvas, mobile: boolean }): Promise<Scene | null>` ;
  - `Scene = { THREE, scene, camera, renderer, ajouter(objet), surImage(fn: (dt, t) => void) }` ;
  - `null` et `html[data-scene="off"]` si WebGL est absent ou si l'URL contient `?noscene=1` ;
  - `html[data-scene="pret"]` après le premier rendu ;
  - `window.__scene = { etat, fps }`.

- [ ] **Étape 1 : écrire le test qui échoue.**
  - Sans paramètre, `html[data-scene]` passe à `pret` en moins de 10 s (Chromium logiciel).
  - Avec `?noscene=1`, `data-scene="off"`, et la `h1` et `#services` sont visibles.
  - Aucune erreur de console dans les deux cas.

- [ ] **Étape 2 :** lancer. Attendu : ÉCHEC.

- [ ] **Étape 3 : consulter Context7** (WebGLRenderer avec `alpha: true`, Points, PointsMaterial), puis implémenter.
  - `scene.js` est importé dynamiquement après le premier affichage du texte (`requestIdleCallback`).
  - Le canvas est transparent, par-dessus le film, avec `pointer-events: none`.
  - La poussière : 900 points sur ordinateur, 300 sur téléphone, couleurs `--ambre` et `--or`, mélange additif, montée lente.
  - Ratio de pixels : 2 au maximum sur ordinateur, 1,5 sur téléphone.
  - Pause quand l'onglet est caché.

- [ ] **Étape 4 :** lancer. Attendu : RÉUSSITE.

- [ ] **Étape 5 : commit.**

### Tâche 6 : la transition du cadre doré

**Fichiers :**
- Créer :
  - `website/src/cadre.js` ;
  - `website/tests/unit/cadre.test.js` ;
  - `website/tests/e2e/transitions.spec.js`.
- Modifier : `website/src/main.js`, `website/src/style.css`.

**Interfaces :**
- Consomme : `Scene` (tâche 5), et les sections `#services`, `#equipe`, `#avis` et `#nous-trouver` (tâche 1).
- Produit :
  - `etatDuCadre(p: number): { echelle: number, z: number, opacite: number, ouverture: number }`. C'est une fonction pure, avec `p` entre 0 et 1 sur la zone de transition :
    - à 0 : le cadre est petit et lointain, opacité 0 ;
    - à 0,5 : le cadre remplit environ 80 % de l'écran, opacité 1 ;
    - à 1 : la caméra l'a traversé, échelle au moins 3, opacité 0.
  - `creerCadre(THREE): THREE.Group` : le cadre construit en code.
    - Une moulure obtenue en extrudant un profil sculpté le long d'un rectangle.
    - Un matériau `MeshStandardMaterial` : couleur `#D5B27C`, `metalness: 1`, `roughness: 0.32`.
    - Un éclairage ambré `#F2C97A` en lumière principale, un contour pétrole et un environnement doux.
  - Chaque section reçoit `.dans-le-cadre` pendant la transition : la section apparaît dans l'ouverture du cadre grâce à un `clip-path` qui suit `ouverture`.

- [ ] **Étape 1 : écrire les tests qui échouent.**
  - **Unitaires** :
    - `etatDuCadre(0).opacite===0` ;
    - `etatDuCadre(0.5).opacite===1` ;
    - `etatDuCadre(1).opacite===0` ;
    - `etatDuCadre(1).echelle>=3` ;
    - `echelle` augmente strictement de 0 à 1 (échantillons tous les 0,1).
  - **Navigateur** :
    - `test('le cadre apparaît entre le hero et les services')` : au milieu de la zone de transition, `window.__cadre.opacite > 0.9`.
    - `test('saut par ancre : aucun cadre figé')` : `page.goto('/#nous-trouver')`, attendre 1 s, puis vérifier :
      - `__cadre.opacite === 0` ;
      - la `h2` de `#nous-trouver` est dans l'écran ;
      - `__film.image === total-1`.
    - `test('moins de mouvement : pas de cadre')` : `__cadre` n'est pas défini et toutes les sections sont visibles.

- [ ] **Étape 2 :** lancer. Attendu : ÉCHEC.

- [ ] **Étape 3 : consulter Context7** (ExtrudeGeometry avec `extrudePath`, ou Shape et Path ; MeshStandardMaterial ; RoomEnvironment). Puis implémenter :
  - un `ScrollTrigger` par frontière de section (`start: "top bottom"`, `end: "top top"`, `scrub: true`) envoie sa progression à `etatDuCadre` ;
  - `window.__cadre` expose le dernier état ;
  - sur téléphone : moulure simplifiée (moins de segments), pas d'environnement PMREM, une lumière directionnelle et une lumière ambiante ;
  - sans scène (`data-scene="off"`), les sections font un simple fondu GSAP.

- [ ] **Étape 4 :** lancer. Attendu : RÉUSSITE.

- [ ] **Étape 5 : contrôle visuel.** Capturer à 25 %, 50 % et 75 % de la première transition, à 1440 et à 390 px. Le cadre doit avoir l'air d'un vrai cadre ancien (moulures, reflets), pas d'un rectangle doré plat. Ajuster le profil et l'éclairage d'après les captures.

- [ ] **Étape 6 : commit.**

### Tâche 7 : les sections, la barre mobile et le responsive

**Fichiers :**
- Modifier : `website/index.html`, `website/src/style.css`.
- Créer : `website/tests/e2e/responsive.spec.js`.

**Interfaces :**
- Consomme : la structure de la tâche 1.
- Produit : `nav.barre-mobile`, avec « Réserver » (`.cta-booksy`) et « Appeler » (`tel:`). Elle est visible sous 820 px de large, après le hero.

- [ ] **Étape 1 : écrire le test qui échoue** (projet `tel`) :
  - `document.documentElement.scrollWidth <= innerWidth` sur toute la page ;
  - `.barre-mobile` est cachée sur le temps 1, et visible à `#services` ;
  - en bas de page, le rectangle de `.barre-mobile` ne recouvre pas le paragraphe d'adresse du `footer`.

- [ ] **Étape 2 :** lancer. Attendu : ÉCHEC.

- [ ] **Étape 3 : mettre en forme les sections.** Sans répéter la même mise en page d'une section à l'autre :
  - **Services** : une carte de maison en deux colonnes, nom et prix alignés, avec des points de conduite.
  - **Équipe** : des cartels de musée (nom en IM Fell, spécialité), avec un filet doré.
  - **Avis** : un « livre d'or », des citations en IM Fell italique sur fond `--bois`.
  - **Nous trouver** : l'adresse, les heures en tableau (`font-variant-numeric: tabular-nums`) et deux boutons.
  - **Pied de page** : `padding-bottom` de la hauteur de la barre mobile.

- [ ] **Étape 4 :** lancer toute la suite e2e. Attendu : RÉUSSITE.

- [ ] **Étape 5 : commit.**

### Tâche 8 : référencement local et en-têtes de sécurité

**Fichiers :**
- Modifier : `website/index.html`.
- Créer :
  - `website/public/_headers`, `website/public/robots.txt`, `website/public/sitemap.xml` ;
  - `website/tests/e2e/seo.spec.js`.

**Interfaces :**
- Consomme : les coordonnées des contraintes globales.
- Produit : un JSON-LD `HairSalon` dont les champs sont identiques au HTML visible.

- [ ] **Étape 1 : écrire le test qui échoue.**
  - Le `<title>` contient « Barbier » et « Les Coteaux », et fait moins de 60 caractères.
  - La méta-description fait moins de 155 caractères.
  - `og:locale` vaut `fr_CA` et `og:image` finit par `/img/og.jpg`.
  - `link[rel=canonical]` existe.
  - Le JSON-LD se lit avec `JSON.parse`, et vérifie :
    - `@type === "HairSalon"` ;
    - `telephone === "+1-450-267-8792"` ;
    - `address.postalCode === "J7X 0B1"` ;
    - `address.addressLocality === "Les Coteaux"` ;
    - `aggregateRating.ratingValue === "5.0"` et `aggregateRating.reviewCount === "144"`.
  - `/robots.txt` et `/sitemap.xml` répondent 200 sur `vite preview`.

- [ ] **Étape 2 :** lancer. Attendu : ÉCHEC.

- [ ] **Étape 3 : implémenter.**
  - Le domaine inconnu est remplacé par `https://lamaisonmoreno.pages.dev` et noté dans le README.
  - `_headers` contient la CSP :
    `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`
  - Il contient aussi HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` et `Permissions-Policy`, plus le cache immuable pour `/assets/*` et `/seq/*`.
  - Le JSON-LD n'est pas exécuté : il reste compatible avec `script-src 'self'`.
  - `aggregateRating` reprend la note publique de Google. C'est à confirmer avec le client, car Google peut ignorer une note qui ne vient pas du site lui-même. À noter dans le README.

- [ ] **Étape 4 :** lancer. Attendu : RÉUSSITE.

- [ ] **Étape 5 : commit.**

### Tâche 9 : vérification avant livraison

Cette tâche n'écrit pas de code. Elle suit le `CLAUDE.md`.

- [ ] **Étape 1 : tests.** `npm run test:unit && npm run test:e2e`. Attendu : tout réussit.
- [ ] **Étape 2 : barrière du texte.** Chercher `—` et les mots creux de la liste du skill dans `index.html` (`grep`). Attendu : aucun résultat.
- [ ] **Étape 3 : captures Playwright.** Prendre chaque temps du hero, chaque transition et chaque section à 1440 et à 390 px, puis relever la console. Regarder chaque capture.
- [ ] **Étape 4 : simplification.** `code-simplifier`, puis relancer les tests.
- [ ] **Étape 5 : revue.** `/code-review` sur le diff, et `/security-review` (CSP, liens externes).
- [ ] **Étape 6 : Lighthouse.** Sur `vite preview`, avec les rapports dans le scratchpad. Signaler que les mesures de performance sont faussées sans GPU.
- [ ] **Étape 7 : rapport.** Un rapport en français classé par gravité, puis attendre l'accord de l'utilisateur avant toute mise en ligne.
