/**
 * Gera mobile/content/maps/coastlines.ts: litoral (Natural Earth, domínio público)
 * recortado e projetado para cada mapa bíblico, como caminhos SVG leves.
 *
 * Uso: npm install --no-save world-atlas@2 topojson-client@3
 *      node mobile/scripts/maps/build-coastlines.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

// Resolve a partir da pasta atual (onde world-atlas e topojson-client foram instalados).
const require = createRequire(path.join(process.cwd(), "index.js"));
const { feature } = require("topojson-client");
const here = path.dirname(new URL(import.meta.url).pathname);
const views = JSON.parse(await readFile(path.join(here, "views.json"), "utf8"));
const atlas = (name) => JSON.parse(require("fs").readFileSync(require.resolve(`world-atlas/${name}`), "utf8"));
const land10 = feature(atlas("land-10m.json"), atlas("land-10m.json").objects.land);
const land50 = feature(atlas("land-50m.json"), atlas("land-50m.json").objects.land);

export const WIDTH = 1000;
function projector(view) {
  const [west, south, east, north] = view.bbox;
  const k = Math.cos(((south + north) / 2) * Math.PI / 180);
  const scale = WIDTH / ((east - west) * k);
  return { height: Math.round((north - south) * scale), project: ([lon, lat]) => [(lon - west) * k * scale, (north - lat) * scale] };
}

// Recorte de polígono por retângulo (Sutherland–Hodgman).
function clip(ring, w, h) {
  const edges = [
    (p) => p[0] >= -2, (p) => p[0] <= w + 2, (p) => p[1] >= -2, (p) => p[1] <= h + 2
  ];
  const cross = [
    (a, b) => { const t = (-2 - a[0]) / (b[0] - a[0]); return [-2, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (w + 2 - a[0]) / (b[0] - a[0]); return [w + 2, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (-2 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), -2]; },
    (a, b) => { const t = (h + 2 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), h + 2]; }
  ];
  let out = ring;
  for (let e = 0; e < 4; e += 1) {
    const input = out; out = [];
    for (let i = 0; i < input.length; i += 1) {
      const cur = input[i]; const prev = input[(i + input.length - 1) % input.length];
      const inCur = edges[e](cur); const inPrev = edges[e](prev);
      if (inCur) { if (!inPrev) out.push(cross[e](prev, cur)); out.push(cur); }
      else if (inPrev) out.push(cross[e](prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

function simplify(points, tolerance) {
  const out = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= tolerance) out.push(p);
  }
  return out;
}

const result = {};
for (const view of views) {
  const { project, height } = projector(view);
  const land = view.detail === "10m" ? land10 : land50;
  let d = "";
  for (const f of land.features) {
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const ring of poly) {
      const [west, south, east, north] = view.bbox;
      if (!ring.some(([lon, lat]) => lon > west - 3 && lon < east + 3 && lat > south - 3 && lat < north + 3)) continue;
      const pts = simplify(clip(ring.map(project), WIDTH, height), view.tolerance ?? 1.2);
      if (pts.length < 3) continue;
      d += "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + "Z";
    }
  }
  result[view.id] = { width: WIDTH, height, bbox: view.bbox, land: d };
  console.log(view.id, `${WIDTH}x${height}`, `${(d.length / 1024).toFixed(1)} KB`);
}
const header = "/* Gerado por mobile/scripts/maps/build-coastlines.mjs a partir do Natural Earth (domínio público). Não edite à mão. */\n";
await writeFile(path.join(here, "../../content/maps/coastlines.ts"), header + "export const COASTLINES: Record<string, { width: number; height: number; bbox: [number, number, number, number]; land: string }> = " + JSON.stringify(result) + ";\n");
