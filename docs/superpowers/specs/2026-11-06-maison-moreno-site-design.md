# La Maison Moreno : conception du site

Date : 2026-11-06. Statut : en attente d'approbation.

## 1. Intention

La Maison Moreno est un barbier au 301, montée du Comté, local 3, à Les Coteaux (Québec), J7X 1A8. Téléphone : (450) 267-8792. Note Google : 5,0 sur 144 avis.

Le site a deux buts :

- **Identité.** Être la vitrine officielle du salon et transmettre son ambiance dès la première seconde : un cabinet de curiosités victorien, avec des murs pétrole, des cadres dorés, des lampes ambrées, des chaises de barbier vintage et un plafond lumineux en hexagones.
- **Visibilité.** Être trouvé sur Google pour « barbier Les Coteaux » et les villes voisines.

La réservation reste sur Booksy (lamaisonmoreno.booksy.com). Le site y envoie, il ne la remplace pas.

### Ce que disent les clients (repris des avis Google)

On ne se sent pas pressé. Le travail est méticuleux, les dégradés sont maîtrisés et la barbe est soignée. L'accueil est chaleureux, et la déco est souvent citée. Beaucoup d'avis sont écrits par des conjointes qui recommandent le salon pour leur partenaire.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**

- Un hero qui fait visiter le vrai salon au rythme du défilement.
- En 3 secondes, le visiteur sait que c'est un barbier, à Les Coteaux, et comment réserver.
- Un référencement local solide, une page rapide, l'accessibilité, un bon rendu sur mobile.

**Non-objectifs**

- Pas de système de réservation maison : Booksy s'en charge.
- Pas de formulaire de contact : téléphone et Booksy suffisent. Ça évite de recueillir des renseignements personnels au sens de la Loi 25.
- Pas de boutique en ligne.

**Anti-objectifs** (échec même si tout fonctionne)

- Un site « barbier de luxe » noir et doré générique, qu'on pourrait confondre avec n'importe quel autre salon.
- Des images IA présentées comme de vraies coupes ou de vrais barbiers.
- Des avis inventés.
- Un hero si lourd que le téléphone rame ou que la page reste blanche.

## 3. Décisions déjà prises avec le client

| Sujet | Décision |
|---|---|
| Direction artistique | Cabinet de curiosités |
| Palette | Pétrole `#12313A`, nuit `#0B2026`, or du logo `#D5B27C`, ambre `#F2C97A`, rouille `#9C4A22` (bouton Réserver), bois `#3B2214`, ivoire `#EDE3CF` |
| Typographie | Titres : IM Fell English. Texte : Instrument Sans. Le logo garde sa calligraphie. |
| Logo | Fourni en JPG sur fond noir (`assets/client/logo-fond-noir.jpg`) |
| Hero | Visite filmée du vrai salon : départ à droite sur les stations, tour par le salon d'attente, arrivée sous le plafond hexagonal |
| Film | Kling 4.0 via OpenArt, généré à partir des 3 photos du client, approuvé : « parfait comme vidéo ». 12 s, 1080p, sans son (`assets/videos/moreno-film.mp4`) |
| Méthode de génération | Celle du skill `site-10k-pme`, uniquement pour la génération des médias |
| Transitions entre sections | ~~Le cadre doré~~ retiré à la demande du client (phase 5), remplacé par **la vapeur** et des interactions 3D (voir `copy/fiche-marque.md`, section 18). Ancienne description : **Le cadre doré** : un cadre ancien sculpté et doré, en vraie 3D (Three.js), s'avance au défilement. La caméra le traverse et la section suivante apparaît à l'intérieur, comme si on entrait dans un tableau du salon. Les reflets dorés bougent avec la lumière. Une seule transition, utilisée partout. Allégée sur téléphone, remplacée par un fondu si l'utilisateur a demandé moins de mouvement. |

## 4. Structure de la page (proposition)

1. **Hero : la visite.** Le film avance et recule avec le défilement. Cinq temps, chacun avec une seule ligne de texte du côté calme de l'image :
   1. Les stations de droite : `<h1>` « Barbier à Les Coteaux », sous le logo.
   2. Le long des stations : le soin, sans se presser.
   3. Le salon d'attente : l'accueil, le lieu.
   4. Le retour au centre : les dégradés et la barbe.
   5. Le repos sous le plafond hexagonal : le bouton « Réserver sur Booksy ».
2. **Services.** Une liste façon « carte de la maison » avec prix et durée, si le client les fournit. Sinon, un lien vers Booksy.
3. **L'équipe.** Chaque barbier dans un cadre doré avec un cartel de musée : nom et spécialité. Avec de vraies photos seulement. Sans photo, un cartel typographique, sans portrait inventé.
4. **Avis.** Le « livre d'or » : 3 à 6 vrais avis Google recopiés mot pour mot, avec prénom et initiale, et la note de 5,0 sur 144 avis.
5. **Nous trouver.** L'adresse avec un lien vers Google Maps (pas de carte intégrée, pour la vitesse et la vie privée), les heures, le téléphone et Booksy.
6. **Pied de page.** Le logo, les coordonnées et les réseaux sociaux.

Une barre « Réserver / Appeler » reste en bas de l'écran sur mobile après le hero.

## 5. Choix techniques (mes décisions, à valider)

- **Vite** avec du **JavaScript natif**. C'est une page unique : React et React Three Fiber ajouteraient du poids sans rien apporter ici. React Three Fiber reste disponible si une section 3D plus riche est ajoutée plus tard.
- **GSAP + ScrollTrigger** pour faire avancer le film au défilement et pour les apparitions.
  - Pas de Lenis : la bibliothèque n'est pas autorisée par le `CLAUDE.md`.
  - Si un défilement adouci est voulu, ScrollSmoother fait partie de GSAP.
- **Le film en séquence d'images WebP** (environ 140 images, moins de 8 Mo au total). C'est la méthode fiable sur iPhone.
- **Three.js** pour la transition du cadre doré entre les sections. Le cadre est construit en code (moulures extrudées, matériau or métallique, éclairage ambré), sans modèle 3D à générer ni crédit à dépenser.
- **Three.js** aussi pour une fine poussière dorée qui flotte dans la lumière des lampes, par-dessus le film.
  - Elle est désactivée si l'utilisateur a demandé moins de mouvement.
  - Elle est allégée sur téléphone.
- **L'image de départ du film comme affiche** : c'est l'image qui s'affiche en premier et elle sert de repli si le film ne charge pas.
- **Polices auto-hébergées** (@fontsource), sans requête vers Google Fonts.
- **Versions** vérifiées dans la documentation à jour (Context7) avant d'écrire le code.

## 6. Référencement local

- Une seule `<h1>` : « Barbier à Les Coteaux ».
- Un titre de page et une méta-description en français du Québec.
- Données structurées JSON-LD `HairSalon` : adresse, téléphone, heures, note globale, lien vers Booksy.
- Image de partage Open Graph, `robots.txt` et `sitemap.xml`.
- Tout le texte important est en HTML, jamais seulement dans le film.

## 7. Sécurité

- Site statique, sans formulaire ni secret.
- Un fichier `_headers` pour Cloudflare Pages : CSP stricte, HSTS, `X-Frame-Options`, `Referrer-Policy`.
- Les liens externes en `rel="noopener noreferrer"`.

## 8. Hébergement

Cloudflare Pages par glisser-déposer, comme le prévoit le skill. Aucune mise en ligne sans autorisation explicite.

## 9. Ce qu'il manque (à fournir par le client)

1. Les heures d'ouverture, jour par jour.
2. Les services, avec leur prix et leur durée.
3. La liste des barbiers et leur spécialité, avec de vraies photos si possible.
4. Les liens Facebook et Instagram.
5. Une version anglaise : oui ou non ?
6. Le nom de domaine : existant ou à acheter ?
7. Le logo en fichier vectoriel (SVG, AI, EPS ou PDF), si le graphiste l'a.

La page Booksy n'a pas pu être lue automatiquement : elle redirige vers une application. Les informations doivent donc venir du client.

## 10. Laissé au constructeur

Les textes exacts (à faire valider), les positions précises des cinq temps sur le film, les tailles et espacements, et le rendu de la poussière dorée.
