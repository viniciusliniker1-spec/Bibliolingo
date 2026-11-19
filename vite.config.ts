import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const PRECACHE_PLACEHOLDER = "const PRECACHE_ASSETS = [];";
const BUILD_ID_PLACEHOLDER = 'const BUILD_ID = "dev";';

/**
 * Injeta no service worker a lista de JS/CSS gerados e um identificador do build.
 * Assim todas as telas (inclusive as carregadas sob demanda) funcionam offline
 * depois da primeira visita, e cada deploy recebe um cache novo.
 * Imagens continuam em cache sob demanda para não baixar dezenas de MB na instalação.
 */
function serviceWorkerPrecache(): Plugin {
  let outDir = "dist";
  let assets: string[] = [];
  return {
    name: "bibliolingo-sw-precache",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    generateBundle(_options, bundle) {
      assets = Object.keys(bundle)
        .filter((fileName) => /\.(js|css)$/.test(fileName))
        .sort();
    },
    async closeBundle() {
      const swPath = resolve(outDir, "sw.js");
      const source = await readFile(swPath, "utf8");
      if (!source.includes(PRECACHE_PLACEHOLDER) || !source.includes(BUILD_ID_PLACEHOLDER)) {
        throw new Error("sw.js sem os marcadores de precache esperados");
      }
      const buildId = createHash("sha256").update(assets.join("\n")).digest("hex").slice(0, 12);
      const precache = assets.map((fileName) => "./" + fileName);
      await writeFile(
        swPath,
        source
          .replace(PRECACHE_PLACEHOLDER, `const PRECACHE_ASSETS = ${JSON.stringify(precache)};`)
          .replace(BUILD_ID_PLACEHOLDER, `const BUILD_ID = ${JSON.stringify(buildId)};`)
      );
    }
  };
}

function manualChunks(id: string) {
  const path = id.replace(/\\/g, "/");
  if (path.includes("/node_modules/")) {
    if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return "react";
    if (/\/node_modules\/(react-router|react-router-dom|cookie|set-cookie-parser)\//.test(path)) return "router";
    if (path.includes("/node_modules/zod/")) return "zod";
    return "vendor";
  }
  // Todo o conteúdo curricular é usado na abertura; isolá-lo permite que
  // alterações de código não invalidem o cache do conteúdo (e vice-versa).
  if (path.includes("/src/content/")) return "content";
  return undefined;
}

export default defineConfig({
  base: "./",
  plugins: [react(), serviceWorkerPrecache()],
  build: {
    // O chunk "content" reúne o currículo dos 66 livros (~230 kB gzip) e é
    // necessário na abertura; os demais chunks ficam bem abaixo deste limite.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: { manualChunks }
    }
  }
});
