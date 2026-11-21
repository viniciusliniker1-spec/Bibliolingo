/**
 * Treino do alfabeto: perguntas variadas sobre um grupo de letras e domínio por letra.
 * Uma letra fica "dominada" depois de 3 acertos (cada erro tira 1).
 */
import { ALPHABETS, type AlphabetId, type Letter } from "../content/alphabet";
import { stableHash } from "./lessonPlan";

export type AlphabetQuestionKind = "name" | "letter" | "listen" | "sound" | "case" | "final";

export interface AlphabetQuestion {
  id: string;
  kind: AlphabetQuestionKind;
  letter: Letter;
  prompt: string;
  /** O que aparece em destaque (letra, nome…); vazio em "ouça". */
  shown: string;
  options: { id: string; label: string; glyph: boolean }[];
  answerId: string;
}

export const MASTERY_GOAL = 3;
export type AlphabetProgress = Record<string, number>;

export function masteryOf(progress: AlphabetProgress, letterId: string) {
  return Math.max(0, Math.min(MASTERY_GOAL, progress[letterId] ?? 0));
}

export function applyAnswer(progress: AlphabetProgress, letterId: string, correct: boolean): AlphabetProgress {
  const current = progress[letterId] ?? 0;
  return { ...progress, [letterId]: Math.max(0, Math.min(MASTERY_GOAL + 2, current + (correct ? 1 : -1))) };
}

export function groupMastery(alphabet: AlphabetId, groupIndex: number, progress: AlphabetProgress) {
  const ids = ALPHABETS[alphabet].groups[groupIndex].letters;
  return ids.filter((id) => masteryOf(progress, id) >= MASTERY_GOAL).length / ids.length;
}

/** Próximo grupo a estudar: o primeiro que ainda não chegou a 80%. */
export function suggestedGroup(alphabet: AlphabetId, progress: AlphabetProgress) {
  const groups = ALPHABETS[alphabet].groups;
  const index = groups.findIndex((_, i) => groupMastery(alphabet, i, progress) < 0.8);
  return index < 0 ? groups.length - 1 : index;
}

function shuffle<T>(items: T[], seed: string, key: (item: T) => string) {
  return [...items].sort((a, b) => stableHash(seed + key(a)) - stableHash(seed + key(b)));
}

/**
 * Monta um treino com as letras do grupo (e algumas já vistas, para revisar).
 * As opções erradas vêm do próprio alfabeto, de preferência do mesmo grupo.
 */
export function buildAlphabetSession(alphabet: AlphabetId, groupIndex: number, progress: AlphabetProgress, seed: string, size = 10): AlphabetQuestion[] {
  const data = ALPHABETS[alphabet];
  const byId = new Map(data.letters.map((letter) => [letter.id, letter]));
  const groupIds = data.groups[groupIndex].letters;
  const previous = data.groups.slice(0, groupIndex).flatMap((group) => group.letters);
  // Letras menos dominadas aparecem mais.
  const weighted = groupIds.flatMap((id) => Array.from({ length: Math.max(1, MASTERY_GOAL + 1 - masteryOf(progress, id)) }, () => id));
  const pool = shuffle([...weighted, ...shuffle(previous, seed + "p", (id) => id).slice(0, 3)], seed, (id) => id);
  const picked: string[] = [];
  for (let i = 0; picked.length < size && i < pool.length * 3; i += 1) {
    const id = pool[i % pool.length];
    if (picked[picked.length - 1] !== id) picked.push(id);
  }
  const kinds: AlphabetQuestionKind[] = alphabet === "grc" ? ["name", "letter", "listen", "sound", "case"] : ["name", "letter", "listen", "sound"];

  return picked.map((id, index) => {
    const letter = byId.get(id)!;
    let kind = kinds[stableHash(seed + index + id) % kinds.length];
    if (alphabet === "hbo" && letter.alt && stableHash(seed + "f" + index) % 3 === 0) kind = "final";
    const others = shuffle(data.letters.filter((item) => item.id !== id), seed + index, (item) => item.id)
      .sort((a, b) => Number(groupIds.includes(b.id)) - Number(groupIds.includes(a.id)));
    const distractors = (kind === "final" ? others.filter((item) => item.alt) : others).slice(0, 3);
    const choices = shuffle([letter, ...distractors], seed + "c" + index, (item) => item.id);
    const option = (item: Letter) => {
      switch (kind) {
        case "name": return { id: item.id, label: item.name, glyph: false };
        case "sound": return { id: item.id, label: `${item.translit} · ${item.sound}`, glyph: false };
        case "case": return { id: item.id, label: item.glyph, glyph: true };
        case "final": return { id: item.id, label: item.glyph, glyph: true };
        default: return { id: item.id, label: item.glyph, glyph: true };
      }
    };
    const prompt = {
      name: "Qual é o nome desta letra?",
      letter: `Qual é a letra ${letter.name}?`,
      listen: "Ouça e toque na letra",
      sound: "Qual é o som desta letra?",
      case: "Qual é a minúscula desta maiúscula?",
      final: "Esta é a forma final de qual letra?"
    }[kind];
    const shown = kind === "name" || kind === "sound" ? letter.glyph : kind === "case" || kind === "final" ? letter.alt ?? letter.glyph : kind === "letter" ? letter.name : "";
    return { id: `${seed}-${index}`, kind, letter, prompt, shown, options: choices.map(option), answerId: letter.id };
  });
}
