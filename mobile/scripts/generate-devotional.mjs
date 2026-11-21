#!/usr/bin/env node
/**
 * Gera o devocional de uma data (padrão: hoje no fuso de Brasília) com o Gemini e grava em
 * mobile/public/devotionals/AAAA-MM-DD.json. O app baixa esse arquivo; o texto do versículo é lido
 * da Bíblia local a partir da referência, então a IA só escolhe a referência.
 *
 * Uso: GEMINI_API_KEY=... node scripts/generate-devotional.mjs [AAAA-MM-DD]
 * Se o arquivo da data já existe, não faz nada (seguro para reexecutar).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "devotionals");
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
// O job do GitHub tem 8 minutos: o script para de insistir um pouco antes, com mensagem clara.
const DEADLINE = Date.now() + Number(process.env.DEVOTIONAL_DEADLINE_MS ?? 6.5 * 60_000);
const CALL_TIMEOUT_MS = Number(process.env.DEVOTIONAL_CALL_TIMEOUT_MS ?? 70_000);
const key = process.env.GEMINI_API_KEY;

const todayBrasilia = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
const date = process.argv[2] || todayBrasilia();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Data inválida: ${date}`);

const target = join(outDir, `${date}.json`);
if (existsSync(target)) { console.log(`Já existe: ${target}`); process.exit(0); }
if (!key) throw new Error("GEMINI_API_KEY ausente");

mkdirSync(outDir, { recursive: true });

// Livros válidos (OSIS) lidos do catálogo do app, para a IA não inventar referência.
const catalog = readFileSync(join(root, "..", "src", "content", "bible", "catalog.ts"), "utf8");
const books = [...catalog.matchAll(/osis: "([A-Za-z0-9]+)", name: "([^"]+)".*?chapters: (\d+)/g)].map((m) => ({ osis: m[1], name: m[2], chapters: Number(m[3]) }));
if (books.length < 60) throw new Error("Catálogo de livros não encontrado");

// Evita repetir o que foi publicado recentemente.
const recent = readdirSync(outDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().slice(-30)
  .map((f) => { try { const d = JSON.parse(readFileSync(join(outDir, f), "utf8")); return `${d.title} (${d.verse?.book} ${d.verse?.chapter}:${d.verse?.from})`; } catch { return ""; } })
  .filter(Boolean);

const weekday = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long" });

const system = `Você escreve devocionais diários em português do Brasil para o aplicativo Bibliolingo.
Tom: pastoral e jovial, caloroso, próximo, com linguagem simples e exemplos do dia a dia; sem juridiquês teológico, sem clichês vazios, sem sermão pesado.
Teologia: cristã evangélica, fiel às Escrituras, na tradição wesleyana-arminiana. Isso significa ênfases naturais, sem nunca nomear a tradição, denominações ou teólogos:
- a graça de Deus alcança todas as pessoas e vem antes da nossa resposta (graça preveniente);
- Deus convida e a pessoa responde livremente; a salvação é pela graça, por meio da fé;
- a santidade de coração e de vida: amar a Deus de todo o coração e ao próximo como a si mesmo;
- a obra do Espírito Santo transformando a pessoa por inteiro, e a vida prática de justiça, misericórdia e piedade;
- esperança, comunidade e os meios da graça (oração, Palavra, comunhão, serviço).
Nunca escreva as palavras "Nazareno", "Arminiano", "Arminianismo", "Wesleyano", "Wesley" nem o nome de outras denominações.
Fidelidade: explique o texto em seu contexto, sem inventar fatos históricos nem forçar o versículo. Não cite outros versículos com texto entre aspas (o app mostra o texto do versículo escolhido); pode mencionar referências.
Não use emojis. Não prometa prosperidade nem cura garantida. Evite polêmicas políticas e ataques a pessoas ou grupos.`;

const user = `Escreva o devocional de ${date} (${weekday}).
Escolha UMA passagem curta (1 a 4 versículos) de um destes livros, usando o código OSIS exato: ${books.map((b) => `${b.osis}=${b.name}(${b.chapters} cap.)`).join(", ")}.
Varie livros e temas. Não repita estes recentes: ${recent.length ? recent.join("; ") : "nenhum ainda"}.
Estrutura: título curto e atraente; reflexão com 3 parágrafos curtos; uma frase-chave marcante; uma aplicação prática concreta para o dia; 3 perguntas para pensar; uma oração curta em primeira pessoa.`;

const schema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    verse: { type: "OBJECT", properties: { book: { type: "STRING" }, chapter: { type: "INTEGER" }, from: { type: "INTEGER" }, to: { type: "INTEGER" } }, required: ["book", "chapter", "from", "to"] },
    keyPhrase: { type: "STRING" },
    reflection: { type: "ARRAY", items: { type: "STRING" } },
    application: { type: "STRING" },
    questions: { type: "ARRAY", items: { type: "STRING" } },
    prayer: { type: "STRING" }
  },
  required: ["title", "verse", "keyPhrase", "reflection", "application", "questions", "prayer"]
};

/** Modelos de texto "flash" realmente disponíveis para esta chave (estáveis primeiro, mais novos primeiro). */
async function discoverModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(20_000) });
    if (!response.ok) { console.warn(`Lista de modelos: HTTP ${response.status}`); return []; }
    const data = await response.json();
    const names = (data.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
      .map((m) => String(m.name).replace(/^models\//, ""))
      .filter((name) => /flash/i.test(name) && !/tts|image|live|audio|embed|thinking-exp|robotics|computer|native/i.test(name));
    const stable = (name) => !/preview|exp/i.test(name);
    return names.sort((a, b) => Number(stable(b)) - Number(stable(a)) || b.localeCompare(a, "en", { numeric: true }));
  } catch (error) {
    console.warn(`Lista de modelos indisponível: ${error?.message ?? error}`);
    return [];
  }
}

const FORBIDDEN = /nazareno|arminian|wesley|wesleyan|metodista/i;
const len = (v, min, max) => typeof v === "string" && v.trim().length >= min && v.trim().length <= max;

function validate(d) {
  const problems = [];
  const book = books.find((b) => b.osis === d?.verse?.book);
  if (!book) problems.push("livro inválido");
  else if (!(Number.isInteger(d.verse.chapter) && d.verse.chapter >= 1 && d.verse.chapter <= book.chapters)) problems.push("capítulo inválido");
  const { from, to } = d?.verse ?? {};
  if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to - from <= 4)) problems.push("versículos inválidos");
  if (!len(d?.title, 3, 120)) problems.push("título");
  if (!len(d?.keyPhrase, 3, 220)) problems.push("frase-chave");
  if (!len(d?.application, 10, 700)) problems.push("aplicação");
  if (!len(d?.prayer, 10, 900)) problems.push("oração");
  if (!Array.isArray(d?.reflection) || d.reflection.length < 2 || d.reflection.length > 6 || !d.reflection.every((p) => len(p, 20, 900))) problems.push("reflexão");
  if (!Array.isArray(d?.questions) || d.questions.length < 1 || d.questions.length > 4 || !d.questions.every((q) => len(q, 8, 280))) problems.push("perguntas");
  if (FORBIDDEN.test(JSON.stringify(d))) problems.push("menciona a tradição teológica");
  return problems;
}

class HttpError extends Error {
  constructor(status) { super(`Gemini respondeu ${status}`); this.status = status; }
}

async function generate(model) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.9, maxOutputTokens: 8192, thinkingConfig: { thinkingLevel: "low" } }
    }),
    signal: AbortSignal.timeout(CALL_TIMEOUT_MS)
  });
  if (!response.ok) throw new HttpError(response.status);
  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return JSON.parse(raw);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const ATTEMPTS_PER_MODEL = 3;

const discovered = await discoverModels();
console.log(`Modelos disponíveis (flash): ${discovered.slice(0, 8).join(", ") || "nenhum listado"}`);
const extra = (process.env.GEMINI_FALLBACK_MODELS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
// Se o principal nem consta na lista da chave, ele só entra por último.
const known = discovered.length ? new Set(discovered) : undefined;
const ordered = [PRIMARY_MODEL, ...extra, ...discovered.slice(0, 4)].filter((item, index, list) => item && list.indexOf(item) === index);
const models = known ? [...ordered.filter((m) => known.has(m)), ...ordered.filter((m) => !known.has(m) && m === PRIMARY_MODEL)] : ordered;
console.log(`Ordem de tentativa: ${models.join(" > ")}`);

let lastProblems = [];
for (const model of models) {
  for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt += 1) {
    if (Date.now() > DEADLINE) { lastProblems = [...lastProblems, "tempo máximo do job esgotado"]; break; }
    try {
      const draft = await generate(model);
      lastProblems = validate(draft);
      if (!lastProblems.length) {
        const clean = {
          date,
          title: draft.title.trim(),
          verse: { book: draft.verse.book, chapter: draft.verse.chapter, from: draft.verse.from, to: draft.verse.to },
          keyPhrase: draft.keyPhrase.trim(),
          reflection: draft.reflection.map((p) => p.trim()),
          application: draft.application.trim(),
          questions: draft.questions.map((q) => q.trim()),
          prayer: draft.prayer.trim()
        };
        writeFileSync(target, JSON.stringify(clean, null, 2) + "\n");
        console.log(`Devocional gerado com ${model}: ${target}`);
        process.exit(0);
      }
      console.warn(`[${model}] tentativa ${attempt}: rejeitado (${lastProblems.join(", ")})`);
      await sleep(2000);
    } catch (error) {
      lastProblems = [String(error?.message ?? error)];
      console.warn(`[${model}] tentativa ${attempt}: ${lastProblems[0]}`);
      // Chave/permissão inválida: não adianta insistir em nenhum modelo.
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) throw error;
      // Modelo inexistente ou pedido recusado: passa para o próximo modelo.
      if (error instanceof HttpError && !RETRYABLE.has(error.status)) break;
      await sleep(Math.min(45_000, Number(process.env.RETRY_BASE_MS ?? 5000) * 2 ** (attempt - 1)));
    }
  }
}
throw new Error(`Não foi possível gerar um devocional válido: ${lastProblems.join(", ")}`);
