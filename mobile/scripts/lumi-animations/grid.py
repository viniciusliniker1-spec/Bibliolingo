"""Folha 5x5 da Lumi -> um WebP animado transparente por movimento.

Cada coluna (ou linha, com "motions": "rows") da folha é um movimento com 5 quadros.
Chamado por build.py com um item de animations.json do tipo "grid":
  {"src", "names": [5 nomes, "" pula], "motions": "cols"|"rows", "mask_curve": [lo, hi],
   "white_bg": bool, "profile_cuts": bool, "hats": [...], "bottom_yellow": [...],
   "orders": {nome: [quadros]}, "widget_poses": [...], "size", "fps", "quality"}
O alfa vem da máscara da própria folha (curva de contraste); em fundo branco, também
se remove o branco ligado às bordas e o halo claro. Sobras dos quadros vizinhos
(casco, capa, capacete) são retiradas, e as poses mantêm o alinhamento da folha.
"""
import sys, os, json, math, subprocess, shutil
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

def build_alpha(im, cfg):
    arr = np.asarray(im.convert("RGBA")).astype(np.float32)
    rgb = arr[..., :3]; mask = arr[..., 3]
    lo, hi = cfg["mask_curve"]
    alpha = np.clip((mask - lo) / (hi - lo), 0, 1)
    if cfg.get("white_bg"):
        H, W = mask.shape
        mx, mn = rgb.max(2), rgb.min(2)
        white = (mn > cfg.get("white_min", 236)) & ((mx - mn) < cfg.get("white_chroma", 14))
        bg = np.zeros((H, W), bool); q = deque()
        for x in range(W):
            for y in (0, H - 1):
                if white[y, x]: bg[y, x] = True; q.append((y, x))
        for y in range(H):
            for x in (0, W - 1):
                if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
        while q:
            y, x = q.popleft()
            for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                if 0 <= ny < H and 0 <= nx < W and white[ny, nx] and not bg[ny, nx]:
                    bg[ny, nx] = True; q.append((ny, nx))
        keep = Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
        alpha = np.minimum(alpha, np.asarray(keep).astype(np.float32) / 255) if cfg.get("combine", "min") == "min" else np.asarray(keep).astype(np.float32) / 255
    alpha[alpha < 0.06] = 0
    if cfg.get("white_bg"):
        # tira o branco do fundo misturado nas bordas (evita halo claro no tema escuro)
        a3 = np.clip(alpha, 0.25, 1)[..., None]
        rgb = np.clip((rgb - (1 - a3) * 255) / a3, 0, 255)
        alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))).astype(np.float32) / 255
    return np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)

def keep_main(img, min_frac=0.02):
    """Remove pontinhos soltos que não fazem parte da pose (mantém brilhos grandes)."""
    a = np.asarray(img)[..., 3] > 60
    h, w = a.shape; seen = np.zeros_like(a); keep = np.zeros_like(a); total = a.sum(); comps = []
    for sy in range(h):
        for sx in range(w):
            if a[sy, sx] and not seen[sy, sx]:
                comp = []; dq = deque([(sy, sx)]); seen[sy, sx] = True
                while dq:
                    y, x = dq.popleft(); comp.append((y, x))
                    for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                        if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; dq.append((ny, nx))
                if len(comp) >= max(25, total * min_frac):
                    ys, xs = zip(*comp); keep[list(ys), list(xs)] = True
                    comps.append((len(comp), min(xs), min(ys), max(xs), max(ys), comp))
    # brilhos e confetes ficam só se estiverem perto do corpo (o maior pedaço)
    if comps:
        big = max(comps, key=lambda c: c[0]); _, x0, y0, x1, y1, _ = big
        mx, my = (x1 - x0) * 0.65, (y1 - y0) * 0.45
        for n_, cx0, cy0, cx1, cy1, comp in comps:
            if cx1 < x0 - mx or cx0 > x1 + mx or cy1 < y0 - my or cy0 > y1 + my:
                ys, xs = zip(*comp); keep[list(ys), list(xs)] = False
    m = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))
    out = np.asarray(img).copy()
    out[..., 3] = (out[..., 3].astype(np.float32) * np.asarray(m) / 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")

def drop_edge_bits(img, max_frac=0.05):
    """Tira pedaços de quadros vizinhos (ex.: casco do quadro de cima) que encostam na borda do recorte."""
    arr = np.asarray(img).copy()
    solid = Image.fromarray(((arr[..., 3] > 60) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    a = np.asarray(solid) > 0
    h, w = a.shape; seen = np.zeros_like(a); remove = np.zeros_like(a); total = max(1, a.sum())
    for sy in range(h):
        for sx in range(w):
            if a[sy, sx] and not seen[sy, sx]:
                comp = []; dq = deque([(sy, sx)]); seen[sy, sx] = True
                while dq:
                    y, x = dq.popleft(); comp.append((y, x))
                    for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                        if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; dq.append((ny, nx))
                ys, xs = zip(*comp)
                touches = min(ys) <= 3 or max(ys) >= h - 4 or min(xs) <= 3 or max(xs) >= w - 4
                if touches and len(comp) < total * max_frac:
                    remove[list(ys), list(xs)] = True
    rm = np.asarray(Image.fromarray((remove * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    arr[..., 3] = np.where(rm, 0, arr[..., 3])
    return Image.fromarray(arr, "RGBA")

def strip_top_hoof(img, band=0.2):
    """Tira o casco escuro do quadro de cima que encosta no alto da cabeça."""
    arr = np.asarray(img).copy()
    h = arr.shape[0]; top = int(h * band)
    r, g, b, al = [arr[:top, :, i].astype(np.int32) for i in range(4)]
    hoof = (al > 30) & (np.maximum(np.maximum(r, g), b) < 150) & (r >= g) & (g >= b - 5) & ((r - b) > 12)
    cape = (al > 30) & (g > r + 25) & (g > b) & (np.maximum(np.maximum(r, g), b) < 170)
    hoof = hoof | cape
    if hoof.sum() == 0: return img
    m = np.zeros(arr.shape[:2], np.uint8); m[:top][hoof] = 255
    m = np.asarray(Image.fromarray(m).filter(ImageFilter.MaxFilter(7))) > 0
    m[top:] = False
    # só apaga o que é escuro ou meio transparente: a lã clara fica
    full = arr.astype(np.int32)
    m &= (full[..., :3].max(2) < 185) | (full[..., 3] < 200)
    arr[..., 3] = np.where(m, 0, arr[..., 3])
    return Image.fromarray(arr, "RGBA")

def strip_bottom_yellow(img, band=0.16):
    """Tira o amarelo (capacete do quadro de baixo) encostado nos pés."""
    arr = np.asarray(img).copy(); h = arr.shape[0]; y0 = int(h * (1 - band))
    r, g, b, al = [arr[y0:, :, i].astype(np.int32) for i in range(4)]
    yel = (al > 30) & (r > 190) & (g > 150) & (b < 110)
    m = np.zeros(arr.shape[:2], np.uint8); m[y0:][yel] = 255
    m = np.asarray(Image.fromarray(m).filter(ImageFilter.MaxFilter(5))) > 0; m[:y0] = False
    arr[..., 3] = np.where(m, 0, arr[..., 3])
    return Image.fromarray(arr, "RGBA")

def seam(cost):
    """Costura de custo mínimo de cima para baixo em `cost` (linhas x colunas)."""
    n_rows, n_cols = cost.shape
    acc = cost.astype(np.float64).copy(); back = np.zeros(cost.shape, np.int64)
    for y in range(1, n_rows):
        prev = acc[y - 1]
        st = np.vstack([np.r_[np.inf, prev[:-1]], prev, np.r_[prev[1:], np.inf]])
        idx = st.argmin(0); acc[y] += st[idx, np.arange(n_cols)]; back[y] = idx - 1
    x = int(acc[-1].argmin()); xs = np.zeros(n_rows, np.int64)
    for y in range(n_rows - 1, -1, -1):
        xs[y] = x; x = int(np.clip(x + back[y, x], 0, n_cols - 1))
    return xs

def split(rgba, axis_cuts, n, along):
    """Divide em n faixas ao longo de `along` ('x' ou 'y') usando costuras nas regiões indicadas."""
    a = rgba[..., 3].astype(np.float64) + 1
    if along == "y": a = a.T
    L = a.shape[1]
    cuts = [np.zeros(a.shape[0], np.int64)]
    # perfil: quanto "conteúdo" há em cada posição; os vãos entre quadros são vales
    prof = np.convolve(a.sum(0), np.ones(9) / 9, mode="same")
    for k in range(1, n):
        if axis_cuts:
            c = axis_cuts[k - 1]
        elif not PROFILE_CUTS:
            c = L * k // n
        else:
            w0 = int(L * k / n - L / n * 0.45); w1 = int(L * k / n + L / n * 0.45)
            c = w0 + int(prof[w0:w1].argmin())
        band = int(L / n * (0.16 if PROFILE_CUTS else 0.28))
        lo, hi = max(0, c - band), min(L, c + band)
        cuts.append(seam(a[:, lo:hi]) + lo)
    cuts.append(np.full(a.shape[0], L, np.int64))
    idx = np.arange(L)[None, :]
    parts = []
    for i in range(n):
        m = (idx >= cuts[i][:, None]) & (idx < cuts[i + 1][:, None])
        if along == "y": m = m.T
        p = rgba.copy(); p[..., 3] = np.where(m, p[..., 3], 0)
        parts.append(p)
    return parts

def wool_center(img):
    a = np.asarray(img).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    m = (al > 200) & (r > 215) & (g > 175) & (b > 140) & ((r - b) > 15) & ((r - b) < 90)
    ys, xs = np.nonzero(m)
    if len(xs) < 50: return img.width / 2, img.height / 2
    return xs.mean(), np.percentile(ys, 20)  # topo da cabeça/lã: estável entre poses

PROFILE_CUTS = False

def main():
    global PROFILE_CUTS
    cfg = json.load(open(sys.argv[1]))
    PROFILE_CUTS = cfg.get("profile_cuts", False)
    out_dir = cfg["out"]; os.makedirs(out_dir, exist_ok=True)
    im = Image.open(cfg["src"])
    rgba = build_alpha(im, cfg)
    motions_axis = cfg.get("motions", "cols")  # cols: cada coluna é um movimento
    # 1) separa os movimentos; 2) dentro de cada um, separa os 5 quadros
    groups = split(rgba, cfg.get("motion_cuts"), 5, "x" if motions_axis == "cols" else "y")
    for gi, (name, group) in enumerate(zip(cfg["names"], groups)):
        if not name: continue
        frames_raw = split(group, cfg.get("frame_cuts"), 5, "y" if motions_axis == "cols" else "x")
        poses = []; origins = []
        Hs, Ws = rgba.shape[:2]
        for k, p in enumerate(frames_raw):
            img = Image.fromarray(p, "RGBA")
            bb = img.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
            img = drop_edge_bits(img.crop(bb))
            if name not in cfg.get("hats", []): img = strip_top_hoof(img)
            if name in cfg.get("bottom_yellow", []): img = strip_bottom_yellow(img)
            img = keep_main(img)
            bb2 = img.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
            poses.append(img.crop(bb2))
            # posição na célula da grade (o ilustrador já alinhou as poses)
            origins.append((bb[0] + bb2[0], bb[1] + bb2[1]))
        if cfg.get("align", "grid") == "grid":
            # passo real entre as poses (a folha nem sempre é dividida em quintos iguais)
            ax = 1 if motions_axis == "cols" else 0
            mids = [o[ax] + (p.height if ax else p.width) / 2 for o, p in zip(origins, poses)]
            pitch = (mids[-1] - mids[0]) / 4
            centers = []
            for k, (ox, oy) in enumerate(origins):
                if ax: oy -= mids[0] + k * pitch - mids[0]
                else: ox -= k * pitch
                centers.append((-ox, -oy))
        else:
            centers = [wool_center(p) for p in poses]
        left = min(-cx for cx, _ in centers); right = max(p.width - cx for p, (cx, _) in zip(poses, centers))
        top = min(-cy for _, cy in centers); bottom = max(p.height - cy for p, (_, cy) in zip(poses, centers))
        pad = 6
        cw, ch = int(right - left) + 2 * pad, int(bottom - top) + 2 * pad
        def layer(i, dy=0.0, sc=1.0):
            p = poses[i]; cx, cy = centers[i]
            c = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            x0, y0 = int(-left + pad - cx), int(-top + pad - cy + dy)
            if sc != 1.0:
                q = p.resize((int(p.width * sc), int(p.height * sc)), Image.LANCZOS)
                c.alpha_composite(q, (int(x0 - (q.width - p.width) / 2), int(y0 + p.height - q.height)))
            else:
                c.alpha_composite(p, (x0, y0))
            return c
        def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
        hold, trans = cfg.get("hold", 6), cfg.get("trans", 2)
        order = cfg.get("orders", {}).get(name, cfg.get("order", [0, 1, 2, 3, 4]))
        frames = []
        for k, i in enumerate(order):
            nxt = order[(k + 1) % len(order)]
            for f in range(hold):
                t = f / hold
                frames.append(layer(i, 0, 1 + 0.012 * math.sin(2 * math.pi * t)))
            for f in range(trans):
                frames.append(Image.blend(layer(i), layer(nxt), ease((f + 1) / (trans + 1))))
        size = cfg.get("size", 240)
        scale = size / max(cw, ch)
        ow, oh = int(cw * scale) // 2 * 2, int(ch * scale) // 2 * 2
        work = os.path.join(out_dir, name + "_work"); shutil.rmtree(work, ignore_errors=True); os.makedirs(work)
        for n, fr in enumerate(frames):
            fr = fr.resize((ow, oh), Image.LANCZOS)
            if scale > 1.05:
                r, g, b, al = fr.split()
                fr = Image.merge("RGBA", (*Image.merge("RGB", (r, g, b)).filter(ImageFilter.UnsharpMask(1.2, 60, 2)).split(), al))
            fr.save(os.path.join(work, f"{n:03d}.png"))
        if name in cfg.get("widget_poses", []):
            # pose parada para o widget do Android (que não anima)
            pose_dir = os.path.join(out_dir, "poses"); os.makedirs(pose_dir, exist_ok=True)
            still = layer(cfg.get("widget_frame", {}).get(name, 0))
            still = still.crop(still.getbbox()); still.thumbnail((220, 220), Image.LANCZOS)
            still.save(os.path.join(pose_dir, name + ".png"), optimize=True)
        out = os.path.join(out_dir, name + ".webp")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(cfg.get("fps", 18)), "-i", os.path.join(work, "%03d.png"),
                        "-c:v", "libwebp_anim", "-lossless", "0", "-quality", str(cfg.get("quality", 70)), "-compression_level", "6",
                        "-loop", "0", "-pix_fmt", "yuva420p", out], check=True)
        shutil.rmtree(work)
        print(name, f"{ow}x{oh}", len(frames), "quadros", os.path.getsize(out) // 1024, "KB")

main()
