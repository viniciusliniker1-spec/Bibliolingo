/**
 * Gera os derivados de imagem usados pelo app Android/iOS.
 *
 * Os masters aprovados em ../design-assets e ../assets/lumi/skins nunca são alterados. Os derivados
 * ficam em assets/generated/ e são versionados no git, para que builds locais,
 * CI e EAS empacotem exatamente os mesmos arquivos leves.
 *
 * Rode sempre que um master mudar:
 *   npm install --no-save --no-audit --no-fund sharp@0.34.4
 *   npm run assets:generate
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const mastersDir = path.resolve(import.meta.dirname, "../../design-assets");
const skinsDir = path.resolve(import.meta.dirname, "../../assets/lumi/skins");
const outputDir = path.resolve(import.meta.dirname, "../assets/generated");

const achievementNames = [
  "02_10_licoes.png", "03_7_dias_seguidos.png", "04_30_dias_seguidos.png",
  "05_50_dias_seguidos.png", "06_25_licoes.png", "07_1_livro.png",
  "08_5_livros.png", "09_formacao_pastoral.png", "10_rota_grego.png",
  "11_50_acertos_seguidos.png", "12_100_acertos_seguidos.png",
  "14_10_capitulos.png", "15_licao_servico.png", "16_licao_missoes.png",
  "17_licao_oracao.png", "18_20_perguntas_tutor.png", "19_50_perguntas_tutor.png",
  "20_50_licoes.png", "21_200_licoes.png", "22_100_dias_seguidos.png",
  "23_500_licoes.png", "24_todos_nt.png", "25_todos_at.png",
  "26_toda_biblia.png", "27_todas_rotas.png", "28_nivel_maximo.png",
  "29_100_porcento_rota.png", "30_100_porcento_app.png"
];

const sceneNames = [
  "01_boas_vindas_noturnas.png", "02_jardim_do_aprendizado.png",
  "03_caminho_da_jornada.png", "04_biblioteca_do_conhecimento.png",
  "05_horizonte_dos_propositos.png", "06_santuario_da_constancia.png",
  "07_portal_da_jornada.png"
];

const masters = await readdir(mastersDir);
const jobs = [
  ...achievementNames.map((name) => ({ name, kind: "achievement", resize: { width: 192, height: 192, fit: "inside" } })),
  ...sceneNames.map((name) => ({ name, kind: "scene", resize: { width: 720, height: 340, fit: "cover", position: "attention" } })),
  ...masters
    .filter((name) => /^lumi_\d{2}_.*\.png$/.test(name))
    .sort()
    .map((name) => ({ name, kind: "lumi", resize: { width: 320, height: 292, fit: "inside", withoutEnlargement: true } }))
];

const skins = (await readdir(skinsDir)).filter((name) => /^lumi_.*\.png$/.test(name)).sort();
const skinJobs = skins.map((name) => ({
  name: "skins/" + name,
  source: path.join(skinsDir, name),
  kind: "skin",
  // Exibidas em até 190 dp (loja); 512 px cobre telas 3x com folga.
  resize: { width: 512, height: 512, fit: "inside", withoutEnlargement: true }
}));

const missing = jobs.filter(({ name }) => !masters.includes(name)).map(({ name }) => name);
if (missing.length) throw new Error("Masters ausentes em design-assets: " + missing.join(", "));

await rm(outputDir, { recursive: true, force: true });
await mkdir(path.join(outputDir, "skins"), { recursive: true });

const manifest = [];
for (const { name, kind, resize, source } of [...jobs, ...skinJobs]) {
  const { data, info } = await sharp(source ?? path.join(mastersDir, name))
    .resize(resize)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: kind === "scene" || kind === "skin", quality: 90, effort: 10 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(path.join(outputDir, name), data);
  manifest.push({ name, kind, width: info.width, height: info.height, bytes: data.length });
}
await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const total = manifest.reduce((sum, item) => sum + item.bytes, 0);
console.log(`Derivados gerados: ${manifest.length} arquivos, ${(total / 1024 / 1024).toFixed(2)} MB em assets/generated.`);
