/**
 * Memorização por recordação ativa: cada versículo sobe de nível conforme é
 * lembrado, e o exercício fica mais difícil a cada nível.
 *
 * Caixa (box) 0 → lacunas leves (25% das palavras)
 * Caixa 1     → lacunas fortes (50%)
 * Caixa 2     → montar o versículo em partes
 * Caixa 3     → só as primeiras letras
 * Caixa 4+    → de cor (texto escondido)
 * Os intervalos (0, 1, 3, 7, 14, 30 dias) ficam em services/studyLibrary.
 */
import { stableHash } from "./lessonPlan";

export type MemoryStage = "gaps-light" | "gaps" | "order" | "letters" | "recite";

export const MEMORY_STAGES: { stage: MemoryStage; label: string; hint: string }[] = [
  { stage: "gaps-light", label: "Complete", hint: "Toque nas palavras que faltam" },
  { stage: "gaps", label: "Complete mais", hint: "Agora metade do versículo está escondida" },
  { stage: "order", label: "Monte", hint: "Toque nas partes na ordem certa" },
  { stage: "letters", label: "Primeiras letras", hint: "Recite olhando só as iniciais" },
  { stage: "recite", label: "De cor", hint: "Recite sem olhar e confira" }
];

export function stageForBox(box: number): MemoryStage {
  return MEMORY_STAGES[Math.max(0, Math.min(MEMORY_STAGES.length - 1, box))].stage;
}

export interface Token { text: string; word: boolean }

/** Separa palavras e pontuação, preservando espaços na reconstrução. */
export function tokenize(text: string): Token[] {
  return (text.match(/[\p{L}\p{N}’'-]+|[^\p{L}\p{N}\s]+/gu) ?? []).map((part) => ({ text: part, word: /[\p{L}\p{N}]/u.test(part) }));
}

export function joinTokens(tokens: readonly string[]) {
  return tokens.join(" ").replace(/\s+([,.;:!?»”)])/g, "$1").replace(/([«“(])\s+/g, "$1");
}

/** Índices das palavras escondidas: prioriza palavras com 3+ letras, de forma estável por versículo. */
export function gapIndexes(id: string, tokens: readonly Token[], ratio: number) {
  const candidates = tokens.map((token, index) => ({ token, index })).filter(({ token }) => token.word && token.text.length >= 3);
  const count = Math.max(1, Math.round(candidates.length * ratio));
  return candidates
    .sort((a, b) => stableHash(id + a.index) - stableHash(id + b.index))
    .slice(0, count)
    .map(({ index }) => index)
    .sort((a, b) => a - b);
}

/** Banco de palavras embaralhado (com repetições preservadas). */
export function wordBank(id: string, tokens: readonly Token[], gaps: readonly number[]) {
  return gaps.map((index, order) => ({ key: `${index}`, text: tokens[index].text, order }))
    .sort((a, b) => stableHash(id + "b" + a.key) - stableHash(id + "b" + b.key));
}

/** Divide o versículo em 3 a 6 partes, preferindo cortar depois da pontuação. */
export function verseChunks(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const target = Math.max(3, Math.min(6, Math.round(words.length / 4)));
  const size = Math.ceil(words.length / target);
  const chunks: string[] = [];
  let current: string[] = [];
  for (const word of words) {
    current.push(word);
    const atPunctuation = /[,.;:!?]$/.test(word);
    if ((current.length >= size) || (atPunctuation && current.length >= Math.max(2, size - 1))) {
      chunks.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) {
    if (current.length <= 1 && chunks.length) chunks[chunks.length - 1] += " " + current.join(" ");
    else chunks.push(current.join(" "));
  }
  return chunks;
}

export function shuffledChunks(id: string, chunks: readonly string[]) {
  const items = chunks.map((text, index) => ({ key: `c${index}`, text, index }));
  const shuffled = [...items].sort((a, b) => stableHash(id + a.key) - stableHash(id + b.key));
  if (shuffled.every((item, index) => item.index === index) && shuffled.length > 1) shuffled.reverse();
  return shuffled;
}

/** Só as iniciais: "No princípio criou Deus" → "N_ p_ c_ D_". */
export function firstLetters(text: string) {
  return tokenize(text).map((token) => (token.word ? token.text[0] + "_".repeat(Math.min(3, token.text.length - 1)) : token.text));
}

export function dueLabel(dueDate: string, today: string) {
  if (dueDate <= today) return "para hoje";
  const days = Math.round((new Date(dueDate + "T12:00:00").getTime() - new Date(today + "T12:00:00").getTime()) / 86_400_000);
  return days === 1 ? "amanhã" : `em ${days} dias`;
}

/** Versículos sugeridos para começar (lidos do texto bíblico instalado). */
export const SUGGESTED_VERSES = [
  { osis: "John", chapter: 3, verse: 16, label: "João 3:16" },
  { osis: "Ps", chapter: 23, verse: 1, label: "Salmo 23:1" },
  { osis: "Phil", chapter: 4, verse: 13, label: "Filipenses 4:13" },
  { osis: "Prov", chapter: 3, verse: 5, label: "Provérbios 3:5" },
  { osis: "Rom", chapter: 8, verse: 28, label: "Romanos 8:28" },
  { osis: "Josh", chapter: 1, verse: 9, label: "Josué 1:9" },
  { osis: "Isa", chapter: 41, verse: 10, label: "Isaías 41:10" },
  { osis: "Matt", chapter: 11, verse: 28, label: "Mateus 11:28" },
  { osis: "Ps", chapter: 119, verse: 105, label: "Salmo 119:105" },
  { osis: "Gen", chapter: 1, verse: 1, label: "Gênesis 1:1" }
] as const;
