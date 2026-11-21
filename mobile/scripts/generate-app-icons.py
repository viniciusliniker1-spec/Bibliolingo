"""
Gera os ícones de humor da Lumi para o app (primeiro plano adaptativo 432x432, fundo transparente).

Recorta cada cartão das folhas 6x4 em ../design-assets/lumi-app-icons, remove o fundo (rembg) e
centraliza a personagem na zona segura do ícone adaptativo; o verde do app vem do fundo do ícone.
Só gera os ícones com "ladder": true em assets/app-icons/catalog.json (use --all para os 48).

  python3 -m venv /tmp/rv && . /tmp/rv/bin/activate && pip install "rembg[cpu]" pillow
  python3 scripts/generate-app-icons.py
"""
import json, sys
import numpy as np
from scipy import ndimage
from pathlib import Path
from PIL import Image, ImageFilter
from rembg import new_session, remove

root = Path(__file__).resolve().parent.parent
sheets_dir = root.parent / "design-assets/lumi-app-icons"
out_dir = root / "assets/app-icons"
catalog = json.loads((out_dir / "catalog.json").read_text(encoding="utf-8"))
everything = "--all" in sys.argv

CELL, INSET, INSET_BOTTOM = 256, 22, 30          # cada folha 1536x1024: 6 colunas x 4 linhas; o recorte tira a borda dourada
AURA = {"brava_chamas", "furia", "explosao", "trofeu"}  # fogo e confete fazem parte da cena: halo suave em vez de recorte
CANVAS, FIT = 432, 304         # camada adaptativa (108 dp) e lado da caixa onde a personagem cabe
session = new_session("isnet-anime")
sheets = {key: Image.open(sheets_dir / name).convert("RGB") for key, name in catalog["sheets"].items()}

for icon_id, icon in catalog["icons"].items():
    if not everything and not icon.get("ladder"):
        continue
    x, y = (icon["col"] - 1) * CELL + INSET, (icon["row"] - 1) * CELL + INSET
    tile = sheets[icon["sheet"]].crop((x, y, x + CELL - 2 * INSET, y + CELL - INSET - INSET_BOTTOM))
    tile = tile.resize((tile.width * 3, tile.height * 3), Image.LANCZOS)
    # O rembg só decide o que é personagem; a máscara é endurecida (sem buracos nem pelos
    # translúcidos) e aplicada aos pixels originais, que ficam 100% opacos.
    if icon_id in AURA:
        yy, xx = np.mgrid[0:tile.height, 0:tile.width]
        r = np.hypot((xx - tile.width / 2) / (tile.width / 2), (yy - tile.height / 2) / (tile.height / 2))
        soft = r < 0.86
    else:
        soft = np.array(remove(tile, session=session))[..., 3] > 90
    labels, count = ndimage.label(soft)
    if count > 1:
        sizes = ndimage.sum(soft, labels, range(1, count + 1))
        keep = [i + 1 for i, size in enumerate(sizes) if size >= 0.04 * sizes.max()]
        soft = np.isin(labels, keep)
    soft = ndimage.binary_fill_holes(soft)
    soft = ndimage.binary_opening(soft, iterations=2) if icon_id not in AURA else soft
    alpha = Image.fromarray((soft * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2.2 if icon_id not in AURA else 14))
    alpha = alpha.point(lambda v: 0 if v < 64 else 255 if v > 192 else round((v - 64) * 255 / 128)) if icon_id not in AURA else alpha
    if icon_id not in AURA:  # o corte inferior do cartão vira um esmaecer, não uma linha reta
        a = np.array(alpha, dtype=float)
        bottom = int(np.nonzero(a.max(axis=1))[0].max())
        fade = min(bottom, 36)
        a[bottom - fade + 1: bottom + 1] *= np.linspace(1, 0, fade)[:, None]
        alpha = Image.fromarray(a.astype("uint8"))
    cut = tile.convert("RGBA")
    cut.putalpha(alpha)
    box = cut.getbbox()
    cut = cut.crop(box)
    scale = FIT / max(cut.size)
    cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.alpha_composite(cut, ((CANVAS - cut.width) // 2, (CANVAS - cut.height) // 2 + 6))
    canvas.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(out_dir / f"{icon_id}.png", optimize=True)
    print(icon_id)
