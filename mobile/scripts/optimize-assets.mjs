import { access, rename, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(process.cwd(), "../design-assets");
const groups = [
  {
    width: 160,
    names: [
      "01_Inicio.png", "02_Trilhas.png", "03_Biblia.png", "04_Grego_Biblico.png",
      "05_Dicionario.png", "06_Estudos.png", "07_Formacao_Pastoral.png",
      "08_Professor_Noah.png", "09_Revisao.png", "10_Metas.png",
      "11_Conquistas.png", "12_Progresso.png", "13_Plano_de_Estudos.png",
      "14_Favoritos.png", "15_Perfil.png", "16_Configuracoes.png", "20_Ajuda.png"
    ]
  },
  {
    width: 640,
    names: Array.from({ length: 20 }, (_, index) =>
      `lumi_${String(index + 1).padStart(2, "0")}_`
    )
  },
  {
    width: 320,
    names: Array.from({ length: 30 }, (_, index) =>
      `${String(index + 1).padStart(2, "0")}_`
    )
  }
];

const entries = await (await import("node:fs/promises")).readdir(root);
const selected = new Map();
for (const group of groups) {
  for (const name of group.names) {
    const matches = name.endsWith(".png")
      ? entries.filter((entry) => entry === name)
      : entries.filter((entry) => entry.startsWith(name) && entry.endsWith(".png"));
    for (const match of matches) {
      selected.set(match, Math.max(selected.get(match) ?? 0, group.width));
    }
  }
}

for (const [name, width] of selected) {
  const source = path.join(root, name);
  const temporary = source + ".optimized.png";
  try {
    await access(source);
    await sharp(source)
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(temporary);
    await rm(source);
    await rename(temporary, source);
  } catch (error) {
    await rm(temporary, { force: true });
    throw new Error(`Falha ao otimizar ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
console.log(`Assets Android otimizados: ${selected.size}`);
