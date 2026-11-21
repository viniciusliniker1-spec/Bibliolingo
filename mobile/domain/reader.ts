import { GREEK_READER } from "../content/reader/greek";
import { HEBREW_READER } from "../content/reader/hebrew";
import type { ReaderLanguage, ReaderPassage, ReaderWord } from "../content/reader/types";
import { stableHash } from "./lessonPlan";

export const READER: Record<ReaderLanguage, ReaderPassage[]> = { grc: GREEK_READER, hbo: HEBREW_READER };

export type ReaderStep =
  | { kind: "read" }
  | { kind: "sound"; word: ReaderWord; options: string[]; answer: string }
  | { kind: "meaning"; word: ReaderWord; options: string[]; answer: string }
  | { kind: "order"; words: ReaderWord[]; translation: string }
  | { kind: "solo" };

/** Uma leitura libera a seguinte quando é concluída. */
export function isPassageUnlocked(passages: ReaderPassage[], done: Record<string, unknown>, id: string) {
  const index = passages.findIndex((passage) => passage.id === id);
  return index <= 0 || Boolean(done[passages[index - 1].id]);
}

export function nextPassage(passages: ReaderPassage[], done: Record<string, unknown>) {
  return passages.find((passage) => !done[passage.id]);
}

const shuffle = <T,>(items: T[], seed: string) =>
  items.map((item, i) => ({ item, key: stableHash(`${seed}:${i}`) })).sort((a, b) => a.key - b.key).map(({ item }) => item);

/** Palavras distintas do texto, priorizando as mais longas (as mais informativas para treinar). */
function practiceWords(passage: ReaderPassage, count: number, seed: string) {
  const seen = new Set<string>();
  const unique = passage.words.filter((word) => {
    const key = word.translit.toLowerCase();
    if (seen.has(key) || word.gloss.startsWith("(")) return false;
    seen.add(key);
    return true;
  });
  const ranked = passage.kind === "words" ? shuffle(unique, seed) : [...unique].sort((a, b) => b.text.length - a.text.length);
  return ranked.slice(0, count);
}

function optionsFor(answer: string, pool: string[], seed: string) {
  const distractors = shuffle([...new Set(pool)].filter((value) => value.toLowerCase() !== answer.toLowerCase()), seed).slice(0, 3);
  return shuffle([answer, ...distractors], seed + "o");
}

/**
 * Monta uma sessão de leitura: ler com apoio → reconhecer o som → reconhecer o sentido →
 * montar o texto na ordem → ler sozinho.
 */
export function buildReaderSession(language: ReaderLanguage, passage: ReaderPassage, seed: string): ReaderStep[] {
  const all = READER[language].flatMap((item) => item.words);
  const sounds = all.map((word) => word.translit);
  const glosses = all.map((word) => word.gloss).filter((gloss) => !gloss.startsWith("("));
  const steps: ReaderStep[] = [{ kind: "read" }];
  const words = practiceWords(passage, passage.kind === "words" ? 3 : 2, seed);
  for (const word of words) steps.push({ kind: "sound", word, options: optionsFor(word.translit, sounds, seed + word.text), answer: word.translit });
  for (const word of practiceWords(passage, 3, seed + "m")) steps.push({ kind: "meaning", word, options: optionsFor(word.gloss, glosses, seed + word.gloss), answer: word.gloss });
  if (passage.kind === "text") {
    // Textos longos: monta o primeiro trecho (até 7 palavras).
    const chunk = passage.words.slice(0, Math.min(7, passage.words.length));
    steps.push({ kind: "order", words: chunk, translation: passage.words.length > 7 ? chunk.map((word) => word.gloss).join(" ") : passage.translation });
  }
  steps.push({ kind: "solo" });
  return steps;
}

/** Texto corrido do original, para exibir e para a voz. */
export function passageText(passage: ReaderPassage) {
  return passage.words.map((word) => word.text).join(passage.kind === "words" ? " · " : " ").replace(/־ /g, "־");
}
