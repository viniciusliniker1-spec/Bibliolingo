/**
 * Recorta os ícones de humor da Lumi (as duas folhas 6×4 em ../design-assets/lumi-app-icons)
 * e gera o primeiro plano 432×432 de cada ícone adaptativo em assets/app-icons/.
 * Só entram os ícones com "ladder": true no catálogo (os usados na escada); passe --all para gerar os 48.
 *
 *   npm install --no-save --no-audit --no-fund sharp@0.34.4
 *   node scripts/generate-app-icons.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const sheetsDir = path.resolve(root, "../design-assets/lumi-app-icons");
const outDir = path.join(root, "assets/app-icons");
const catalog = JSON.parse(await readFile(path.join(outDir, "catalog.json"), "utf8"));
const all = process.argv.includes("--all");

const CANVAS = 432; // camada adaptativa de 108 dp em xxxhdpi
const TILE = 408; // o cartão quase preenche a camada; o dourado do fundo cobre os cantos
const CELL = 256; // cada folha tem 1536×1024: 6 colunas × 4 linhas
const INSET = 4;
const side = CELL - INSET * 2;

const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" rx="${TILE * 0.16}" fill="#fff"/></svg>`);
const montage = [];

for (const [id, icon] of Object.entries(catalog.icons)) {
  if (!all && !icon.ladder) continue;
  const sheet = path.join(sheetsDir, catalog.sheets[icon.sheet]);
  const tile = await sharp(sheet)
    .extract({ left: (icon.col - 1) * CELL + INSET, top: (icon.row - 1) * CELL + INSET, width: side, height: side })
    .resize(TILE, TILE, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  const rounded = await sharp(tile).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const png = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: rounded, left: (CANVAS - TILE) / 2, top: (CANVAS - TILE) / 2 }])
    .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 })
    .toBuffer();
  await writeFile(path.join(outDir, `${id}.png`), png);
  montage.push({ id, png });
}
console.log(`${montage.length} ícones gerados em assets/app-icons`);
