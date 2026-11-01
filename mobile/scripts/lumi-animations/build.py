"""Gera as animações da Lumi usadas pelo app (mobile/assets/lumi-animations/*.webp).

uso (na raiz do repositório):
  python3 -I mobile/scripts/lumi-animations/build.py            # todas
  python3 -I mobile/scripts/lumi-animations/build.py dormir     # só uma

Fontes: design-assets/lumi-animations (folhas de poses PNG ou vídeo em fundo verde).
Requer Python 3 com numpy e Pillow, e ffmpeg compilado com libwebp.
Para adicionar uma animação: coloque a fonte em design-assets/lumi-animations,
acrescente um item em animations.json e registre o arquivo em
mobile/assets/lumiAnimationAssets.ts.
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(ROOT, "design-assets", "lumi-animations")
OUT = os.path.join(ROOT, "mobile", "assets", "lumi-animations")
sys.path.insert(0, HERE)
import video  # noqa: E402

config = json.load(open(os.path.join(HERE, "animations.json")))
only = set(sys.argv[1:])
for item in config["animations"]:
    if only and item["name"] not in only:
        continue
    cfg = dict(item, src=os.path.join(SRC, item["src"]))
    if item["type"] == "video":
        video.build(cfg, OUT)
    else:
        cfg["out"] = OUT
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as tmp:
            json.dump(cfg, tmp)
        try:
            subprocess.run([sys.executable, "-I", os.path.join(HERE, "sheet.py"), tmp.name], check=True)
        finally:
            os.unlink(tmp.name)
