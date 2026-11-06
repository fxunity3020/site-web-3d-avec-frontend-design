#!/usr/bin/env bash
# Prépare les médias du site à partir des fichiers bruts de ../assets.
set -euo pipefail
cd "$(dirname "$0")/.."
FILM=../assets/videos/moreno-film.mp4
LOGO=../assets/client/logo-fond-noir.jpg
mkdir -p public/seq public/img
rm -f public/seq/*.webp

# Séquence : 10 images par seconde sur 12 s = 120 images WebP de 1280 px (moins de 8 Mo).
ffmpeg -v error -y -i "$FILM" -vf "fps=10,scale=1280:-2" -c:v libwebp -quality 50 public/seq/f%03d.webp
TOTAL=$(ls public/seq/*.webp | wc -l)
printf '{ "total": %d, "largeur": 1280, "hauteur": 720 }\n' "$TOTAL" > public/seq/manifest.json

# Affiche : première image du film, 1920 px. Image de partage : dernière image, 1200 x 630.
ffmpeg -v error -y -i "$FILM" -frames:v 1 -vf scale=1920:-2 -q:v 3 public/img/affiche.jpg
ffmpeg -v error -y -sseof -0.1 -i "$FILM" -frames:v 1 \
  -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 3 public/img/og.jpg

# Logo : le fond noir devient transparent (alpha tiré de la luminance), recadré, 800 px.
python3 -I - "$LOGO" public/img/logo.webp <<'PY'
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
im = im.crop((24, 24, im.width - 24, im.height - 24))  # coins gris de l'export
px = im.load()
out = Image.new("RGBA", im.size)
po = out.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b = px[x, y]
        a = max(r, g, b)
        if a < 18:
            po[x, y] = (0, 0, 0, 0)
            continue
        k = 255 / a
        po[x, y] = (min(255, round(r * k)), min(255, round(g * k)), min(255, round(b * k)), a)
out = out.crop(out.getbbox())
out.thumbnail((800, 800))
out.save(dst, "WEBP", quality=90)
print("logo", out.size)
PY

cat > public/favicon.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#12313A"/><text x="16" y="23" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="#D5B27C">M</text></svg>
SVG
echo "séquence : $TOTAL images, $(du -sh public/seq | cut -f1)"
