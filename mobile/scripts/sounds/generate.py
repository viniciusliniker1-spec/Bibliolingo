"""Gera os efeitos sonoros do Bibliolingo (originais, sintetizados).

uso: python3 -I mobile/scripts/sounds/generate.py
Saída: mobile/assets/sounds/*.wav (44,1 kHz, 16 bits, mono). Requer numpy.

Timbres: marimba (madeira, para respostas), sino/glockenspiel (brilho, para
conquistas) e um leve reverb. Volumes normalizados para soarem equilibrados.
"""
import os, wave
import numpy as np

SR = 44100
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "assets", "sounds"))
rng = np.random.default_rng(7)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def note(name):
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + 12 * (octave - 4) - 9) / 12)


def envelope(n, attack=0.004, decay=0.35):
    t = np.arange(n) / SR
    env = np.exp(-t / decay)
    a = max(1, int(attack * SR))
    env[:a] *= np.linspace(0, 1, a) ** 2
    # fim sempre suave (meio cosseno nos últimos 25%): evita estalos
    f = max(1, int(n * 0.25))
    env[-f:] *= 0.5 * (1 + np.cos(np.linspace(0, np.pi, f)))
    return env


def marimba(freq, dur=0.6, bright=1.0):
    t = t_axis(dur)
    # parciais típicos de barra de marimba (1, 4, 10) com decaimentos curtos
    partials = [(1, 1.0, 0.45), (3.93, 0.35 * bright, 0.12), (9.2, 0.12 * bright, 0.05)]
    sig = sum(a * np.sin(2 * np.pi * freq * r * t) * envelope(len(t), 0.002, dur * d) for r, a, d in partials if freq * r < 15000)
    # "batida" da baqueta
    click = lowpass(rng.normal(0, 1, len(t)), 5000) * np.exp(-t / 0.003) * 0.05
    return sig + click


def bell(freq, dur=1.2):
    t = t_axis(dur)
    ratios = [(1, 1.0, 0.9), (2.0, 0.5, 0.6), (2.76, 0.35, 0.4), (5.4, 0.18, 0.25), (8.93, 0.08, 0.12)]
    # parciais acima de 15 kHz são descartados (evita aliasing/chiado)
    sig = sum(a * np.sin(2 * np.pi * freq * r * t) * envelope(len(t), 0.002, dur * d) for r, a, d in ratios if freq * r < 15000)
    return sig


def soft_thud(freq, dur=0.35):
    t = t_axis(dur)
    sig = np.sin(2 * np.pi * freq * t + 0.8 * np.sin(2 * np.pi * freq * 0.5 * t)) * envelope(len(t), 0.004, 0.11)
    sig += 0.4 * np.sin(2 * np.pi * freq * 2 * t) * envelope(len(t), 0.003, 0.05)
    return lowpass(sig, 1800)


def lowpass(sig, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    out = np.zeros_like(sig)
    acc = 0.0
    for i, x in enumerate(sig):
        acc = (1 - a) * x + a * acc
        out[i] = acc
    return out


def mix(parts, total):
    buf = np.zeros(int(SR * total))
    for offset, sig, gain in parts:
        start = int(SR * offset)
        end = min(len(buf), start + len(sig))
        buf[start:end] += gain * sig[: end - start]
    return buf


def reverb(sig, amount=0.18, length=0.7):
    """Reverb por convolução com resposta de sala sintética (ruído filtrado que decai)."""
    n = int(length * SR)
    t = np.arange(n) / SR
    ir = lowpass(rng.normal(0, 1, n), 4500) * np.exp(-t / (length / 4.5))
    ir[: int(0.012 * SR)] = 0  # pré-delay
    ir /= np.sqrt(np.sum(ir ** 2))
    size = len(sig) + n
    wet = np.fft.irfft(np.fft.rfft(sig, size) * np.fft.rfft(ir, size), size)
    dry = np.pad(sig, (0, n))
    return dry + amount * 3.0 * wet


def finish(sig, peak=0.89, tail=0.06):
    sig = sig - np.mean(sig)
    level = np.abs(sig)
    last = np.max(np.nonzero(level > 0.003 * level.max())) if level.max() > 0 else len(sig) - 1
    sig = sig[: min(len(sig), last + int(tail * SR))]
    fade = min(len(sig) // 4, int(0.08 * SR))
    sig[-fade:] *= 0.5 * (1 + np.cos(np.linspace(0, np.pi, fade)))
    return sig / np.max(np.abs(sig)) * peak


def save(name, sig, peak=0.89):
    data = (finish(sig, peak) * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print(f"{name}.wav  {len(data) / SR:.2f}s")


os.makedirs(OUT, exist_ok=True)

# toque leve em botões e opções
t = t_axis(0.09)
save("select", marimba(note("A6"), 0.09, 0.4) * 0.8 + 0.3 * np.sin(2 * np.pi * 2200 * t) * np.exp(-t / 0.012), 0.55)

# acerto: duas notas subindo (terça maior + quinta) com brilho
save("correct", reverb(mix([(0, marimba(note("E5"), 0.5), 0.8), (0.075, marimba(note("B5"), 0.55), 0.9), (0.075, bell(note("B6"), 0.5), 0.12)], 0.75), 0.16), 0.85)

# erro: madeira grave, curta e gentil (não pune)
save("wrong", mix([(0, soft_thud(note("A3")), 0.9), (0.11, soft_thud(note("F3")), 0.8)], 0.5), 0.7)

# combo: arpejos cada vez mais altos e brilhantes
for level, root in [(1, ["G5", "B5", "D6"]), (2, ["A5", "C#6", "E6", "A6"]), (3, ["C6", "E6", "G6", "C7"])]:
    parts = [(i * 0.055, marimba(note(n), 0.45, 1.2), 0.75) for i, n in enumerate(root)]
    parts.append((len(root) * 0.055, bell(note(root[-1]) * 2, 0.7), 0.15 + 0.05 * level))
    save(f"combo{level}", reverb(mix(parts, 1.0), 0.2), 0.86)

# par ligado corretamente
save("match", reverb(mix([(0, marimba(note("D6"), 0.3, 1.1), 0.8), (0, bell(note("D7"), 0.3), 0.1)], 0.4), 0.12), 0.7)

# início de lição: subida suave com ar
t = t_axis(0.5)
air = lowpass(rng.normal(0, 1, len(t)), 3000) * np.sin(np.pi * t / 0.5) ** 2 * 0.25
save("start", reverb(mix([(0, air, 1.0), (0.18, bell(note("E6"), 0.6), 0.5), (0.26, bell(note("A6"), 0.6), 0.4)], 0.9), 0.25), 0.7)

# lição concluída: arpejo e acorde final com brilho
arp = ["C5", "E5", "G5", "C6"]
parts = [(i * 0.085, marimba(note(n), 0.6), 0.75) for i, n in enumerate(arp)]
parts += [(0.38, bell(note(n), 1.1), 0.33) for n in ["C6", "E6", "G6"]]
parts += [(0.42, bell(note("C7"), 0.9), 0.14)]
save("complete", reverb(mix(parts, 1.5), 0.28), 0.9)

# checkpoint: progressão maior (IV - V - I) e sino
seq = [(0.0, ["F5", "A5", "C6"]), (0.16, ["G5", "B5", "D6"]), (0.34, ["C6", "E6", "G6", "C7"])]
parts = []
for offset, chord in seq:
    for n in chord:
        parts.append((offset, marimba(note(n), 0.7), 0.42))
parts += [(0.36, bell(note("C7"), 1.3), 0.32), (0.44, bell(note("G7"), 1.0), 0.12)]
save("checkpoint", reverb(mix(parts, 1.8), 0.3), 0.9)

# conquista: cascata de sinos
cascade = ["G6", "E6", "C6", "E6", "G6", "C7"]
save("achievement", reverb(mix([(i * 0.07, bell(note(n), 0.9), 0.36) for i, n in enumerate(cascade)], 1.5), 0.3), 0.88)

# Professor Noah: dois toques calmos (quarta justa)
save("noah", reverb(mix([(0, bell(note("A5"), 0.7), 0.5), (0.12, bell(note("D6"), 0.7), 0.45)], 0.9), 0.22), 0.7)
