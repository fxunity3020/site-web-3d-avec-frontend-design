# Site de La Maison Moreno

Site d'une page : visite filmée du salon au défilement, transitions « cadre doré » en 3D.

## Commandes

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run test:unit  # fonctions pures (node --test)
npm run test:e2e   # Playwright, ordinateur 1440 px et téléphone 390 px
```

## À confirmer avec le client

Tout texte entouré de `<span class="a-confirmer">` dans `index.html` attend une confirmation :

- Description du service Platinum.
- Rôle d'Olivia dans l'équipe.
- Heures d'ouverture complètes, jour par jour.
- Domaine : le site utilise `https://lamaisonmoreno.pages.dev` (canonical, Open Graph, JSON-LD, robots.txt, sitemap.xml). À remplacer par le vrai domaine à la mise en ligne.
- Note globale du JSON-LD : 5,0 sur 144 avis Google. Google peut ignorer une note qui ne vient pas d'avis publiés sur le site lui-même.
- Code postal : J7X 1A8 (confirmé par le client). La fiche Google Maps affiche encore J7X 0B1 et doit être corrigée.

## Médias

`bash scripts/medias.sh` régénère la séquence du film (`public/seq/`), l'affiche, l'image de partage et le logo détouré à partir de `../assets/`.
