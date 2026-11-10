/**
 * Converte uma tradução do eBible.org (formato VPL, um versículo por linha)
 * para os arquivos JSON por livro usados pelo leitor bíblico.
 *
 * uso: node scripts/convert-ebible-vpl.mjs <arquivo_vpl.txt> <id-da-versao> <pasta-de-saida>
 * Exige exatamente os 66 livros do cânon protestante e confere os capítulos
 * de cada livro contra src/content/bible/catalog.ts.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [vplPath, versionId, outDir] = process.argv.slice(2);
if (!vplPath || !versionId || !outDir) throw new Error("uso: convert-ebible-vpl.mjs <vpl.txt> <versao> <saida>");

const catalogSource = await readFile(new URL("../src/content/bible/catalog.ts", import.meta.url), "utf8");
const catalog = [...catalogSource.matchAll(/osis: "([^"]+)", name: "[^"]+", abbreviation: "[^"]+", testament: "(old|new)", chapters: (\d+)/g)]
  .map(([, osis, testament, chapters]) => ({ osis, testament, chapters: Number(chapters) }));
if (catalog.length !== 66) throw new Error(`catálogo com ${catalog.length} livros`);

const books = new Map();
for (const line of (await readFile(vplPath, "utf8")).split(/\r?\n/)) {
  const match = /^(\w{3}) (\d+):(\d+) (.*)$/.exec(line);
  if (!match) continue;
  const [, code, chapter, verse, raw] = match;
  const text = raw.replace(/\s+/g, " ").replace(/\s+([,.;:!?»”)])/g, "$1").trim();
  if (!text) continue;
  if (!books.has(code)) books.set(code, new Map());
  const chapters = books.get(code);
  if (!chapters.has(Number(chapter))) chapters.set(Number(chapter), []);
  chapters.get(Number(chapter)).push({ number: Number(verse), text });
}
const codes = [...books.keys()];
if (codes.length !== 66) throw new Error(`esperados 66 livros, encontrados ${codes.length}`);

await mkdir(outDir, { recursive: true });
let verses = 0;
for (const [index, code] of codes.entries()) {
  const meta = catalog[index];
  const chapters = [...books.get(code).entries()].sort((a, b) => a[0] - b[0]);
  if (chapters.length !== meta.chapters) throw new Error(`${code}/${meta.osis}: ${chapters.length} capítulos, catálogo tem ${meta.chapters}`);
  const data = {
    version: versionId,
    book: meta.osis,
    bookId: index + 1,
    englishName: code,
    testament: meta.testament === "old" ? "OT" : "NT",
    chapters: chapters.map(([chapter, list]) => ({ chapter, verses: list.sort((a, b) => a.number - b.number) }))
  };
  verses += chapters.reduce((sum, [, list]) => sum + list.length, 0);
  await writeFile(path.join(outDir, `${meta.osis}.json`), JSON.stringify(data));
}
console.log(`${versionId}: 66 livros, ${verses} versículos -> ${outDir}`);
