import { access, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(process.cwd(), "../design-assets");

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

const entries = await readdir(root);
const jobs = [];
for (const name of achievementNames) if (entries.includes(name)) jobs.push({ name, resize: { width: 192, height: 192, fit: "inside" } });
for (const name of sceneNames) if (entries.includes(name)) jobs.push({ name, resize: { width: 720, height: 340, fit: "cover", position: "attention" } });
for (const entry of entries) {
  if (/^lumi_\d{2}_.*\.png$/.test(entry)) jobs.push({ name: entry, resize: { width: 320, height: 292, fit: "inside", withoutEnlargement: true } });
}

for (const { name, resize } of jobs) {
  const source = path.join(root, name);
  const temporary = source + ".optimized.png";
  try {
    await access(source);
    await sharp(source)
      .resize(resize)
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toFile(temporary);
    await rm(source);
    await rename(temporary, source);
  } catch (error) {
    await rm(temporary, { force: true });
    throw new Error(`Falha ao otimizar ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Assets Android otimizados: ${jobs.length}; cenários 720x340, Lumi até 320px, conquistas 192px.`);
