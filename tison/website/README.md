# Site Tison

Site d'une page pour Tison, saunas de cèdre (Val-David). Vite + JavaScript natif, GSAP ScrollTrigger, film au défilement en séquence WebP.

## Commandes

```bash
npm install
npm run dev                      # http://localhost:5173
npm run build -- --base=./       # compilation portable dans dist/
npx vite preview --port 4173     # tester la compilation (jamais en file://)
NODE_PATH=$(npm root -g) node scripts/autotest.mjs http://localhost:4173 ../captures
```

## À remplacer avant la mise en ligne

- **Clé Web3Forms** : dans `index.html`, `ACCESS_KEY_A_REMPLACER` (clé gratuite créée sur web3forms.com avec le courriel du client). Tant qu'elle n'est pas là, le formulaire affiche « Mode développement » et n'envoie rien. Activer hCaptcha dans le tableau de bord Web3Forms.
- **Coordonnées** : téléphone `819 000-0000`, courriel `bonjour@tison.ca`, adresse et heures (index.html, JSON-LD, politique de confidentialité, message d'erreur du formulaire dans `src/main.js`).
- **Adresse du site** : `https://tison.pages.dev/` dans `canonical`, `og:url`, `og:image`, JSON-LD, `public/robots.txt` et `public/sitemap.xml`.
- Les infos marquées *à confirmer* dans `../copy/fiche-marque.md` (délais, garantie, épaisseur du bois, chaud en 45 minutes).

## Structure

- `src/film.js` : la séquence `public/seq/f001.webp` à `f160.webp` dessinée sur un canvas selon le défilement. `?nofilm=1` teste le repli sur l'affiche.
- `src/atmosphere.js` : braises 2D par-dessus le film.
- `src/main.js` : textes des 5 temps, courbe défilement → film, thermomètre (élément signature), formulaire, politique de confidentialité.
- `public/_headers` : en-têtes de sécurité et CSP appliqués par Cloudflare Pages.
- Les images sont générées par IA (OpenArt) : ce sont des images d'ambiance, pas des réalisations du client.
