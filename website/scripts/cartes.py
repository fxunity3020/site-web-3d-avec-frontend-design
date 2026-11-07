"""Découpe les photos du salon pour les cartes 3D (services et équipe).
Les boîtes sont données sur une largeur de 2000 px et ramenées à la taille réelle des photos."""
import sys
from pathlib import Path
from PIL import Image

CLIENT = Path(__file__).resolve().parents[2] / "assets" / "client"
SORTIE = Path(__file__).resolve().parents[1] / "public" / "img" / "cartes"
BOITES = {
    # Services
    "coupe": ("salon-attente-stations.jpg", (440, 540, 1100, 1330)),
    "coupe-barbe": ("salon-stations-murs.jpg", (600, 560, 1120, 1180)),
    "barbe": ("salon-vue-entree.jpg", (1320, 640, 1760, 1120)),
    "rasage": ("salon-stations-murs.jpg", (1220, 780, 1740, 1340)),
    "skin-fade": ("salon-attente-stations.jpg", (930, 320, 1240, 700)),
    "detente": ("salon-attente-stations.jpg", (300, 280, 760, 760)),
    "platinum": ("salon-vue-entree.jpg", (760, 0, 1420, 560)),
    # Équipe : décor du salon seulement, jamais présenté comme un portrait
    "mur": ("salon-vue-entree.jpg", (520, 420, 1120, 1080)),
    "rideau": ("salon-attente-stations.jpg", (560, 0, 900, 480)),
    "doree": ("salon-stations-murs.jpg", (160, 640, 500, 1010)),
    "fauteuil": ("salon-vue-entree.jpg", (0, 780, 640, 1240)),
    "cadres": ("salon-stations-murs.jpg", (1300, 150, 1900, 620)),
}
SORTIE.mkdir(parents=True, exist_ok=True)
for nom, (fichier, (g, h, d, b)) in BOITES.items():
    im = Image.open(CLIENT / fichier).convert("RGB")
    k = im.width / 2000
    im = im.crop((round(g * k), round(h * k), round(d * k), round(b * k)))
    im.thumbnail((720, 900))
    im.save(SORTIE / f"{nom}.webp", "WEBP", quality=80)
    print(nom, im.size)
