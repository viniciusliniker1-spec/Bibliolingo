// Gera a narração do modo criança com Kokoro (open source, gratuito, uso comercial liberado).
//
// Preparação (uma vez):
//   pip install kokoro-onnx soundfile   (e ffmpeg instalado)
//   baixe kokoro-v1.0.onnx e voices-v1.0.bin de
//   https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
// Uso:
//   KOKORO_DIR=/caminho/dos/modelos node scripts/kids-audio/generate.mjs [--voice pf_dora] [--speed 0.9] [--fresh]
//
// Vozes pt-BR: pf_dora (feminina, padrão), pm_alex, pm_santa.
// Só sintetiza falas novas; apaga áudios que não são mais usados e reescreve content/kids/audio.ts.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "assets/kids/audio");
const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? process.argv[at + 1] : fallback;
};
const kokoroDir = process.env.KOKORO_DIR ?? path.join(root, ".kokoro");
const work = path.join(tmpdir(), `kids-audio-${process.pid}`);
mkdirSync(work, { recursive: true });
mkdirSync(outDir, { recursive: true });

const bundle = path.join(work, "lines.mjs");
await build({
  entryPoints: [path.join(root, "domain/kidsNarration.ts")],
  bundle: true, format: "esm", platform: "node", outfile: bundle,
  loader: { ".png": "empty", ".webp": "empty", ".jpg": "empty" },
  external: ["react-native", "expo-*"],
  logLevel: "error"
});
const { kidsNarrationLines, narrationKey } = await import(pathToFileURL(bundle).href);
const items = kidsNarrationLines().map((text) => ({ key: narrationKey(text), text }));
if (new Set(items.map((item) => item.key)).size !== items.length) throw new Error("colisão de chaves de áudio");

if (process.argv.includes("--fresh")) for (const file of readdirSync(outDir)) rmSync(path.join(outDir, file));
const linesJson = path.join(work, "lines.json");
writeFileSync(linesJson, JSON.stringify(items));
execFileSync("python3", [
  path.join(root, "scripts/kids-audio/kokoro_tts.py"), linesJson, outDir,
  path.join(kokoroDir, "kokoro-v1.0.onnx"), path.join(kokoroDir, "voices-v1.0.bin"),
  arg("voice", "pf_dora"), arg("speed", "0.9")
], { stdio: "inherit" });

const keys = new Set(items.map((item) => item.key));
for (const file of readdirSync(outDir)) if (!keys.has(file.replace(/\.m4a$/, ""))) rmSync(path.join(outDir, file));

const registry = [
  "// Gerado por scripts/kids-audio/generate.mjs — não edite à mão.",
  "export const KIDS_AUDIO: Record<string, number> = {",
  ...items.sort((a, b) => a.key.localeCompare(b.key)).map((item) => `  ${item.key}: require("../../assets/kids/audio/${item.key}.m4a"),`),
  "};",
  ""
].join("\n");
writeFileSync(path.join(root, "content/kids/audio.ts"), registry);
rmSync(work, { recursive: true, force: true });
console.log(`${items.length} falas no registro.`);
