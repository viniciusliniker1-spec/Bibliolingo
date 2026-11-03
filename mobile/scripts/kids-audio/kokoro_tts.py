"""Sintetiza falas com Kokoro (voz pt-BR) e grava .m4a mono.

Uso: python3 kokoro_tts.py <lines.json> <saida> <modelo.onnx> <vozes.bin> [voz] [velocidade]
lines.json = [{"key": "...", "text": "..."}]. Pula arquivos que já existem.
"""
import json, os, subprocess, sys, tempfile

import soundfile as sf
from kokoro_onnx import Kokoro

lines_path, out_dir, model, voices = sys.argv[1:5]
voice = sys.argv[5] if len(sys.argv) > 5 else "pf_dora"
speed = float(sys.argv[6]) if len(sys.argv) > 6 else 0.9

kokoro = Kokoro(model, voices)
items = json.load(open(lines_path, encoding="utf-8"))
made = 0
for item in items:
    target = os.path.join(out_dir, item["key"] + ".m4a")
    if os.path.exists(target):
        continue
    samples, rate = kokoro.create(item["text"], voice=voice, speed=speed, lang="pt-br")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wav:
        sf.write(wav.name, samples, rate)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav.name,
                    "-af", "silenceremove=start_periods=1:start_threshold=-50dB,apad=pad_dur=0.15",
                    "-ac", "1", "-c:a", "aac", "-b:a", "48k", target], check=True)
    os.unlink(wav.name)
    made += 1
    print(f"[{made}] {item['key']}: {item['text']}", flush=True)
print(f"ok: {made} novos áudios")
