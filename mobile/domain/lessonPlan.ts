/**
 * Roteiro de jogo de uma lição: transforma as etapas de conteúdo em formatos
 * variados de exercício, sem criar conteúdo novo.
 *
 * - Múltipla escolha vira, às vezes, "Certo ou errado?" (nunca em checkpoint).
 * - "Ligue os pares" aparece no fim quando há pelo menos 3 pares, usando as
 *   questões desta lição e das lições anteriores da unidade (prática de
 *   recuperação). É uma etapa bônus: não conta para aprovação.
 * - A escolha é determinística: a mesma lição mantém os mesmos formatos.
 */
import type { Exercise, LearningStep, LessonStep } from "../../src/types/content";
import { exerciseCorrectAnswerText } from "./noah";

export type Presentation = "choice" | "true-false" | "fill" | "blocks";

export interface TrueFalseSetup {
  /** Alternativa exibida como resposta da pergunta. */
  optionId: string;
  optionText: string;
  /** A alternativa exibida é a correta? */
  isTrue: boolean;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export type PlayStep =
  | { kind: "learn"; id: string; sourceIndex: number; step: LearningStep }
  | { kind: "exercise"; id: string; sourceIndex: number; step: Exercise; presentation: Presentation; trueFalse?: TrueFalseSetup }
  | { kind: "match"; id: string; pairs: MatchPair[] };

export interface LessonPlanInput {
  lessonId: string;
  steps: readonly LessonStep[];
  checkpoint: boolean;
  /** Questões já estudadas na mesma unidade (lições anteriores), para "Ligue os pares". */
  reviewPool?: readonly Exercise[];
}

/** Hash estável (FNV-1a) para escolhas determinísticas. */
export function stableHash(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function trueFalseFor(exercise: Exercise): TrueFalseSetup | undefined {
  if (exercise.type !== "multiple-choice" || exercise.options.length < 2) return undefined;
  const hash = stableHash(exercise.id);
  if (hash % 3 !== 0) return undefined; // cerca de 1 em cada 3
  const showCorrect = (hash >>> 3) % 2 === 0;
  const distractors = exercise.options.filter((option) => option.id !== exercise.correctOptionId);
  const option = showCorrect
    ? exercise.options.find((item) => item.id === exercise.correctOptionId)
    : distractors[(hash >>> 5) % distractors.length];
  if (!option) return undefined;
  return { optionId: option.id, optionText: option.text, isTrue: option.id === exercise.correctOptionId };
}

/** Texto curto que identifica a questão no "Ligue os pares". */
export function matchPrompt(exercise: Exercise) {
  if (exercise.type === "fill-choice") return `${exercise.sentenceBefore} ___ ${exercise.sentenceAfter}`.replace(/\s+/g, " ").trim();
  return exercise.prompt;
}

export function buildMatchPairs(exercises: readonly Exercise[], max = 4): MatchPair[] {
  const pairs: MatchPair[] = [];
  const usedLeft = new Set<string>();
  const usedRight = new Set<string>();
  for (const exercise of exercises) {
    if (exercise.type === "word-blocks") continue;
    const left = matchPrompt(exercise);
    const right = exerciseCorrectAnswerText(exercise);
    // pares ambíguos ou longos demais para a tela ficam de fora
    if (!left || !right || left.length > 110 || right.length > 60) continue;
    if (/^complete\b/i.test(left)) continue;
    const key = right.toLocaleLowerCase("pt-BR");
    if (usedLeft.has(left) || usedRight.has(key)) continue;
    usedLeft.add(left);
    usedRight.add(key);
    pairs.push({ id: exercise.id, left, right });
    if (pairs.length === max) break;
  }
  return pairs;
}

export function buildLessonPlan({ lessonId, steps, checkpoint, reviewPool = [] }: LessonPlanInput): PlayStep[] {
  const plan: PlayStep[] = steps.map((step, sourceIndex) => {
    if (step.type === "learn") return { kind: "learn", id: step.id, sourceIndex, step };
    const presentation: Presentation = step.type === "fill-choice" ? "fill" : step.type === "word-blocks" ? "blocks" : "choice";
    const trueFalse = !checkpoint && presentation === "choice" ? trueFalseFor(step) : undefined;
    return { kind: "exercise", id: step.id, sourceIndex, step, presentation: trueFalse ? "true-false" : presentation, trueFalse };
  });
  if (!checkpoint) {
    const own = steps.filter((step): step is Exercise => step.type !== "learn");
    // questões desta lição primeiro; depois as mais recentes da unidade
    const pairs = buildMatchPairs([...own, ...[...reviewPool].reverse()]);
    if (pairs.length >= 3) plan.push({ kind: "match", id: `${lessonId}-match`, pairs });
  }
  return plan;
}

/** Ordem embaralhada estável para a coluna da direita. */
export function shuffledRights(pairs: readonly MatchPair[], seed: string) {
  return [...pairs].sort((a, b) => stableHash(seed + a.id) - stableHash(seed + b.id));
}

/** Nível do combo (0 sem combo; 1–3 para os sons e o visual). */
export function comboLevel(streak: number) {
  if (streak >= 6) return 3;
  if (streak >= 4) return 2;
  if (streak >= 2) return 1;
  return 0;
}
