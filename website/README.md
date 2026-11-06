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
