"""Folha de poses da Lumi -> WebP animado transparente (pose a pose).

Chamado por build.py (um processo por animação) com um item de animations.json:
  {"name", "src", "grid": [linhas, colunas], "black_bg": bool, "alpha_curve": [lo, hi],
   "script": [[pose, quadros_parada, quadros_transicao, movimento], ...], "size", "quality"}
movimento: "" | "breathe" (respira) | "hop" (pulinho) | "pulse" (brilho)
Requer Python 3 com numpy e Pillow, e ffmpeg com libwebp.
"""
import sys, os, json, math, subprocess, shutil
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

cfg = json.load(open(sys.argv[1]))
work = os.path.join(cfg["out"], cfg["name"] + "_work")
shutil.rmtree(work, ignore_errors=True); os.makedirs(work)
im = Image.open(cfg["src"])
rgb = np.asarray(im.convert("RGB")).astype(np.int32)
H, W = rgb.shape[:2]

# ---------- 1. alfa ----------
if cfg.get("black_bg"):
    dark = rgb.max(axis=2) < 22
    bg = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if dark[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if dark[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0 <= ny < H and 0 <= nx < W and dark[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    a_img = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    alpha = np.asarray(a_img)
else:
    alpha = np.asarray(im.convert("RGBA"))[..., 3].copy()

# ---------- 2. limpeza: só o que está ligado a regiões sólidas ----------
core = Image.fromarray(((alpha > 170) * 255).astype(np.uint8))
core = core.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))  # abertura remove pontinhos
f = 4
small = np.asarray(core.resize((W // f, H // f), Image.BOX)) > 100
h2, w2 = small.shape
seen = np.zeros_like(small); keep = np.zeros_like(small)
for sy in range(h2):
    for sx in range(w2):
        if small[sy, sx] and not seen[sy, sx]:
            comp = []; dq = deque([(sy, sx)]); seen[sy, sx] = True
            while dq:
                y, x = dq.popleft(); comp.append((y, x))
                for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                    if 0 <= ny < h2 and 0 <= nx < w2 and small[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; dq.append((ny, nx))
            if len(comp) >= cfg.get("min_component", 40):
                for y, x in comp: keep[y, x] = True
keep_img = Image.fromarray((keep * 255).astype(np.uint8)).resize((W, H), Image.NEAREST)
keep_img = keep_img.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
mask = np.asarray(keep_img).astype(np.float32) / 255
clean_alpha = (alpha.astype(np.float32) * mask)
clean_alpha[clean_alpha < 40] = 0
if cfg.get("alpha_curve"):
    lo_a, hi_a = cfg["alpha_curve"]
    clean_alpha = np.clip((clean_alpha - lo_a) / (hi_a - lo_a), 0, 1) * 255
rgba = np.dstack([rgb.astype(np.uint8), clean_alpha.astype(np.uint8)])

# ---------- 3. separar poses (costuras de custo mínimo) ----------
def seam(a2d, lo, hi):
    cost = a2d[:, lo:hi].astype(np.float64) + 1.0
    n_rows, n_cols = cost.shape
    acc = cost.copy(); back = np.zeros(cost.shape, np.int64)
    for y in range(1, n_rows):
        prev = acc[y - 1]
        st = np.vstack([np.r_[np.inf, prev[:-1]], prev, np.r_[prev[1:], np.inf]])
        idx = st.argmin(0); acc[y] += st[idx, np.arange(n_cols)]; back[y] = idx - 1
    x = int(acc[-1].argmin()); xs = np.zeros(n_rows, np.int64)
    for y in range(n_rows - 1, -1, -1):
        xs[y] = x + lo; x = int(np.clip(x + back[y, x], 0, n_cols - 1))
    return xs

def split_cols(block, y0, n):
    a2d = block[..., 3]; bw = a2d.shape[1]
    seams = [np.zeros(a2d.shape[0], np.int64)]
    for k in range(1, n):
        if cfg.get("bands"):  # faixas manuais [inicio, fim] para folhas com espaçamento irregular
            lo, hi = cfg["bands"][k - 1]
        else:
            c = bw * k // n; band = int(bw * 0.09); lo, hi = c - band, c + band
        seams.append(seam(a2d, lo, hi))
    seams.append(np.full(a2d.shape[0], bw, np.int64))
    cols = np.arange(bw)[None, :]; parts = []
    for i in range(n):
        m = (cols >= seams[i][:, None]) & (cols < seams[i + 1][:, None])
        p = block.copy(); p[..., 3] = np.where(m, p[..., 3], 0)
        img = Image.fromarray(p, "RGBA")
        bb = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
        parts.append((img.crop(bb), bb[0], bb[1] + y0))
    return parts

rows, ncols = cfg.get("grid", [1, 5])
poses = []
if rows == 1:
    poses = split_cols(rgba, 0, ncols)
else:
    hs = seam(rgba[..., 3].T, H // 2 - int(H * 0.12), H // 2 + int(H * 0.12))  # costura horizontal
    ys = np.arange(H)[:, None]
    for r in range(rows):
        m = (ys < hs[None, :]) if r == 0 else (ys >= hs[None, :])
        blk = rgba.copy(); blk[..., 3] = np.where(m, blk[..., 3], 0)
        img = Image.fromarray(blk, "RGBA"); bb = img.getchannel("A").getbbox()
        sub = np.asarray(img.crop((0, bb[1], W, bb[3])))
        for p, x, y in split_cols(sub.copy(), bb[1], ncols):
            # dentro da linha, o y vira relativo ao topo da linha (mesmo "chão" por linha)
            poses.append((p, x, y - bb[1] + 0))
for i, (p, _, _) in enumerate(poses):
    p.save(os.path.join(work, f"pose{i+1}.png"))

# ---------- 4. alinhar pelo corpo ----------
def body_cx(img):
    a = np.asarray(img).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    m = (al > 200) & (r > 200) & (g > 170) & (b > 130) & ((r - b) < 80)
    xs = np.nonzero(m)[1]
    return xs.mean() if len(xs) else img.width / 2
places = [(x + body_cx(p), y) for p, x, y in poses]
rel = [(x - cx, y) for (p, x, y), (cx, _) in zip(poses, places)]
left = min(rx for rx, _ in rel); right = max(rx + p.width for (rx, _), (p, _, _) in zip(rel, poses))
top = min(ry for _, ry in rel); bottom = max(ry + p.height for (_, ry), (p, _, _) in zip(rel, poses))
pad = 24
cw, ch = int(right - left) + 2 * pad, int(bottom - top) + 2 * pad
ox, oy = -left + pad, -top + pad

def layer(i, dy=0.0, scale=1.0):
    p, _, _ = poses[i]; rx, ry = rel[i]
    c = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    if scale != 1.0:
        nw, nh = int(p.width * scale), int(p.height * scale)
        q2 = p.resize((nw, nh), Image.LANCZOS)
        c.alpha_composite(q2, (int(ox + rx * scale), int(oy + ry + p.height - nh + dy)))
    else:
        c.alpha_composite(p, (int(ox + rx), int(oy + ry + dy)))
    return c

def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
frames = []
script = cfg["script"]
for k, (i, hold, trans, motion) in enumerate(script):
    nxt = script[(k + 1) % len(script)][0]
    for fidx in range(hold):
        t = fidx / max(1, hold)
        dy, sc = 0.0, 1.0
        if motion == "breathe": sc = 1 + 0.012 * math.sin(2 * math.pi * t)
        if motion == "hop": dy = -8 * math.sin(math.pi * (fidx + 1) / (hold + 1))
        if motion == "pulse": sc = 1 + 0.02 * math.sin(2 * math.pi * t)
        frames.append(layer(i, dy, sc))
    for fidx in range(trans):
        frames.append(Image.blend(layer(i), layer(nxt), ease((fidx + 1) / (trans + 1))))

size = cfg.get("size", 320)
scale = size / max(cw, ch)
ow, oh = int(cw * scale) // 2 * 2, int(ch * scale) // 2 * 2
fdir = os.path.join(work, "frames"); os.makedirs(fdir)
for n, fr in enumerate(frames):
    fr.resize((ow, oh), Image.LANCZOS).save(os.path.join(fdir, f"{n:03d}.png"))
out = os.path.join(cfg["out"], cfg["name"] + ".webp")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(cfg.get("fps", 24)), "-i", os.path.join(fdir, "%03d.png"),
                "-c:v", "libwebp_anim", "-lossless", "0", "-quality", str(cfg.get("quality", 65)),
                "-compression_level", "6", "-loop", "0", "-pix_fmt", "yuva420p", out], check=True)
shutil.rmtree(work)
print(cfg["name"], "poses", len(poses), "frames", len(frames), f"{ow}x{oh}", os.path.getsize(out) // 1024, "KB")
