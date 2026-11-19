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
const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
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

async function generate() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.9, maxOutputTokens: 4096 }
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) throw new Error(`Gemini respondeu ${response.status}`);
  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return JSON.parse(raw);
}

let lastProblems = [];
for (let attempt = 1; attempt <= 4; attempt += 1) {
  try {
    const draft = await generate();
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
      console.log(`Devocional gerado: ${target}`);
      process.exit(0);
    }
    console.warn(`Tentativa ${attempt}: rejeitado (${lastProblems.join(", ")})`);
  } catch (error) {
    lastProblems = [String(error?.message ?? error)];
    console.warn(`Tentativa ${attempt}: ${lastProblems[0]}`);
  }
  await new Promise((r) => setTimeout(r, 2000 * attempt));
}
throw new Error(`Não foi possível gerar um devocional válido: ${lastProblems.join(", ")}`);
