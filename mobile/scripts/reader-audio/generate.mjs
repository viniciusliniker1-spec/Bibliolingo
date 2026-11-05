// Gera o áudio do Leitor do original (grego e hebraico) com Kokoro.
// A transliteração vira fonemas (domain/readerPronunciation.ts) e a voz lê os fonemas:
// pronúncia acadêmica, sem depender das vozes do aparelho.
//
// Preparação: a mesma de scripts/kids-audio/generate.mjs (kokoro-onnx, soundfile, ffmpeg e os modelos).
// Uso: KOKORO_DIR=/caminho node scripts/reader-audio/generate.mjs [--voice pm_alex] [--speed 0.85] [--fresh]
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "assets/reader/audio");
const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? process.argv[at + 1] : fallback;
};
const kokoroDir = process.env.KOKORO_DIR ?? path.join(root, ".kokoro");
const work = path.join(tmpdir(), `reader-audio-${process.pid}`);
mkdirSync(work, { recursive: true });
mkdirSync(outDir, { recursive: true });

const entry = path.join(work, "entry.ts");
writeFileSync(entry, `export { READER } from ${JSON.stringify(path.join(root, "domain/reader.ts"))};\nexport * from ${JSON.stringify(path.join(root, "domain/readerPronunciation.ts"))};\n`);
const bundle = path.join(work, "bundle.mjs");
await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "error" });
const { READER, wordPhonemes, passagePhonemes, readerAudioKey } = await import(pathToFileURL(bundle).href);

const items = new Map();
for (const lang of ["grc", "hbo"]) {
  for (const passage of READER[lang]) {
    for (const word of passage.words) items.set(readerAudioKey(lang, word.text), { text: wordPhonemes(word.translit, lang) + ".", phonemes: true });
    const full = passage.words.map((word) => word.text).join(" ");
    items.set(readerAudioKey(lang, full), { text: passagePhonemes(passage, lang), phonemes: true });
  }
}
const list = [...items].map(([key, item]) => ({ key, ...item }));

if (process.argv.includes("--fresh")) for (const file of readdirSync(outDir)) rmSync(path.join(outDir, file));
const linesJson = path.join(work, "lines.json");
writeFileSync(linesJson, JSON.stringify(list));
execFileSync("python3", [
  path.join(root, "scripts/kids-audio/kokoro_tts.py"), linesJson, outDir,
  path.join(kokoroDir, "kokoro-v1.0.onnx"), path.join(kokoroDir, "voices-v1.0.bin"),
  arg("voice", "pm_alex"), arg("speed", "0.85")
], { stdio: "inherit" });

for (const file of readdirSync(outDir)) if (!items.has(file.replace(/\.m4a$/, ""))) rmSync(path.join(outDir, file));
const registry = [
  "// Gerado por scripts/reader-audio/generate.mjs — não edite à mão.",
  "export const READER_AUDIO: Record<string, number> = {",
  ...list.sort((a, b) => a.key.localeCompare(b.key)).map((item) => `  ${item.key}: require("../../assets/reader/audio/${item.key}.m4a"),`),
  "};",
  ""
].join("\n");
writeFileSync(path.join(root, "content/reader/audio.ts"), registry);
rmSync(work, { recursive: true, force: true });
console.log(`${list.length} áudios no registro.`);
