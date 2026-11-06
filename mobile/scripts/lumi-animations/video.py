"""Vídeo da Lumi em fundo verde -> WebP animado transparente.

Recorta o fundo verde quadro a quadro e remove o reflexo verde só nas bordas,
para não alterar a capa verde-água da Lumi. Requer numpy, Pillow e ffmpeg.
"""
import glob, os, shutil, subprocess
import numpy as np
from PIL import Image, ImageFilter


def key_frame(path, out_path):
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    excess = g - np.maximum(r, b)
    alpha = np.clip((140 - excess) / (140 - 70), 0, 1)
    a_img = Image.fromarray((alpha * 255).astype(np.uint8))
    a_img = a_img.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    a = np.asarray(a_img).astype(np.float32) / 255
    near = np.asarray(a_img.filter(ImageFilter.MinFilter(7))).astype(np.float32) / 255 < 0.99
    spill = near & (g > np.maximum(r, b))
    g2 = np.where(spill, np.maximum(r, b) + (g - np.maximum(r, b)) * 0.15, g)
    out = np.dstack([r, g2, b, a * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(out_path)


def build(cfg, out_dir):
    work = os.path.join(out_dir, cfg["name"] + "_work")
    shutil.rmtree(work, ignore_errors=True)
    raw, keyed = os.path.join(work, "raw"), os.path.join(work, "keyed")
    os.makedirs(raw); os.makedirs(keyed)
    x, y, w, h = cfg["crop"]
    start, end = cfg["loop_frames"]
    vf = (f"trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,"
          f"crop={w}:{h}:{x}:{y},fps={cfg.get('fps', 12)},scale={cfg['size']}:{cfg['size']}:flags=lanczos")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", cfg["src"], "-vf", vf, os.path.join(raw, "%03d.png")], check=True)
    for f in sorted(glob.glob(os.path.join(raw, "*.png"))):
        key_frame(f, os.path.join(keyed, os.path.basename(f)))
    out = os.path.join(out_dir, cfg["name"] + ".webp")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(cfg.get("fps", 12)), "-i", os.path.join(keyed, "%03d.png"),
                    "-c:v", "libwebp_anim", "-lossless", "0", "-quality", str(cfg.get("quality", 72)),
                    "-compression_level", "6", "-loop", "0", "-pix_fmt", "yuva420p", out], check=True)
    shutil.rmtree(work)
    print(cfg["name"], os.path.getsize(out) // 1024, "KB")
