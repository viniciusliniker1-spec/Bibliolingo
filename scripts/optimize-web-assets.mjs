import { access, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(process.cwd(), "design-assets");
const navigation = new Set([
  "01_Inicio.png","02_Trilhas.png","03_Biblia.png","04_Grego_Biblico.png",
  "05_Dicionario.png","06_Estudos.png","07_Formacao_Pastoral.png",
  "08_Professor_Noah.png","09_Revisao.png","10_Metas.png","11_Conquistas.png",
  "12_Progresso.png","13_Plano_de_Estudos.png","14_Favoritos.png",
  "15_Perfil.png","16_Configuracoes.png","20_Ajuda.png"
]);
const scenes = new Set([
  "01_boas_vindas_noturnas.png","02_jardim_do_aprendizado.png",
  "03_caminho_da_jornada.png","04_biblioteca_do_conhecimento.png",
  "05_horizonte_dos_propositos.png","06_santuario_da_constancia.png",
  "07_portal_da_jornada.png"
]);

const entries = (await readdir(root)).filter((name) => name.endsWith(".png"));
let optimized = 0;
for (const name of entries) {
  const source = path.join(root, name);
  const temporary = source + ".web.png";
  const width = scenes.has(name)
    ? 1600
    : name.startsWith("lumi_")
      ? 640
      : navigation.has(name)
        ? 160
        : /logotipo|wordmark|marca_|icone_/.test(name)
          ? 720
          : 360;
  try {
    await access(source);
    await sharp(source)
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toFile(temporary);
    await rm(source);
    await rename(temporary, source);
    optimized += 1;
  } catch (error) {
    await rm(temporary, { force: true });
    throw new Error(`Falha ao otimizar ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
console.log(`Assets Web otimizados: ${optimized}`);
