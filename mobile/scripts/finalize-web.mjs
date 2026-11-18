/**
 * Acabamento da versão web (depois do `expo export --platform web`):
 *  - liga o manifesto e os ícones do PWA (com o caminho base do GitHub Pages, se houver);
 *  - em telas largas, mostra o app dentro de uma moldura de celular (o app é feito para ~420 px);
 *  - copia index.html para 404.html: o GitHub Pages não reescreve rotas, então um link direto
 *    (ex.: /Bibliolingo/study) cai no 404.html, que carrega o mesmo app.
 *
 *   EXPO_BASE_URL=/Bibliolingo node scripts/finalize-web.mjs dist-web
 */
import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve(process.argv[2] ?? "dist-web");
const base = (process.env.EXPO_BASE_URL ?? "").replace(/\/$/, "");
const FRAME_MIN_WIDTH = 760;

const frameScript = `(function(){try{
var embedded=window.self!==window.top,popup=Boolean(window.opener);
if(embedded||popup||window.innerWidth<${FRAME_MIN_WIDTH})return;
var src=location.href;
if(/auth\\/callback$/.test(location.pathname)){history.replaceState(null,"",location.pathname.replace(/auth\\/callback$/,""));}
var css='html,body{margin:0;height:100%;background:#061423;overflow:hidden}.frame{height:100%;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}iframe{width:min(430px,100%);height:min(900px,100%);border:0;border-radius:28px;background:#0b1a2c;box-shadow:0 24px 80px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08)}';
document.open();
document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Bibliolingo</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style></head><body><div class="frame"><iframe title="Bibliolingo" allow="clipboard-write; fullscreen" src="'+src.replace(/"/g,"")+'"></iframe></div></body></html>');
document.close();
}catch(e){}})();`;

const head = [
  `<link rel="manifest" href="${base}/manifest.json">`,
  `<link rel="icon" type="image/png" href="${base}/favicon.png">`,
  `<link rel="apple-touch-icon" href="${base}/icon-192.png">`,
  `<meta name="apple-mobile-web-app-capable" content="yes">`,
  `<script>${frameScript}</script>`
].join("\n");

const indexPath = path.join(dist, "index.html");
let html = await readFile(indexPath, "utf8");
if (!html.includes("</head>")) throw new Error("index.html sem </head>");
html = html.replace("</head>", `${head}\n</head>`);
await writeFile(indexPath, html);
await copyFile(indexPath, path.join(dist, "404.html"));
console.log(`Web finalizada em ${dist} (base "${base || "/"}").`);
