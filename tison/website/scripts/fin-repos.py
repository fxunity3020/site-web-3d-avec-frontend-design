"""§9 Vérifie que le film finit au repos. python3 fin-repos.py film.mp4
Mesure le mouvement image par image (différence moyenne de luminance) et dit
à quelle seconde le film devient immobile. Si la fin bouge encore : couper la queue."""
import re, subprocess, sys
f = sys.argv[1]
out = subprocess.run(["ffmpeg", "-i", f, "-vf", "scale=320:-2,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG",
                      "-f", "null", "-"], capture_output=True, text=True).stderr
t = [float(x) for x in re.findall(r"pts_time:([\d.]+)", out)]
y = [float(x) for x in re.findall(r"YAVG=([\d.]+)", out)]
SEUIL = 0.6
dernier = max((t[i] for i in range(len(y)) if y[i] > SEUIL), default=0)
duree = t[-1] if t else 0
print(f"durée {duree:.2f}s · dernier mouvement à {dernier:.2f}s · mouvement des 0,5 dernières s : {max(y[i] for i in range(len(y)) if t[i] > duree - .5):.2f}")
if duree - dernier >= 0.5: print("OK : le film finit au repos.")
else: print("ATTENTION : la fin bouge encore.")
