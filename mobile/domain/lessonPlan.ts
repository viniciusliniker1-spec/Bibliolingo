/**
 * Roteiro de jogo de uma lição: escolhe, para cada questão, o formato que
 * combina com o conteúdo, e acrescenta no máximo UMA etapa bônus de revisão.
 *
 * Formatos por questão:
 * - "choice": raciocínio ("Por que…?", "Qual afirmação…?") ou alternativas longas;
 * - "true-false": fato curto ("Quem…?", "Onde…?"), no máximo um por lição, nunca em checkpoint;
 * - "type": lacuna de uma palavra só, para lembrar sem ver as opções (metade delas);
 * - "fill" e "blocks": lacuna com opções e montar a frase.
 *
 * Etapa bônus (não conta para aprovação; nunca em checkpoint), conforme a posição na unidade:
 * - "order": última lição de unidade narrativa — ordenar os acontecimentos da unidade;
 * - "match": ligar perguntas e respostas da unidade;
 * - "passage": dizer de qual passagem vem um fato.
 * Etapa criativa (uma por lição, no meio dela; nunca em checkpoint), em rodízio ao longo da unidade:
 * - "swipe": deslize cartas para "certo" ou "errado";
 * - "scramble": desembaralhe as letras da palavra que completa a frase;
 * - "spot": uma frase tem uma palavra trocada — toque nela (detetive).
 * Tudo é determinístico: a mesma lição mantém os mesmos formatos.
 */
import type { Exercise, LearningStep, LessonStep } from "../../src/types/content";
import { exerciseCorrectAnswerText } from "./noah";

export type Presentation = "choice" | "true-false" | "type" | "fill" | "blocks";

export interface TrueFalseSetup { optionId: string; optionText: string; isTrue: boolean }
export interface MatchPair { id: string; left: string; right: string }
export interface OrderItem { id: string; text: string }
export interface PassageOption { id: string; label: string }

export interface ScrambleLetter { id: string; ch: string }
export interface SpotToken { id: string; text: string; wrong: boolean }
export interface SwipeCard { id: string; question: string; claim: string; isTrue: boolean; truth: string }

export type PlayStep =
  | { kind: "learn"; id: string; sourceIndex: number; step: LearningStep }
  | { kind: "exercise"; id: string; sourceIndex: number; step: Exercise; presentation: Presentation; trueFalse?: TrueFalseSetup }
  | { kind: "match"; id: string; pairs: MatchPair[] }
  | { kind: "order"; id: string; items: OrderItem[]; correctOrder: string[] }
  | { kind: "passage"; id: string; statement: string; options: PassageOption[]; correctId: string }
  | { kind: "scramble"; id: string; before: string; after: string; answer: string; letters: ScrambleLetter[] }
  | { kind: "spot"; id: string; tokens: SpotToken[]; answer: string; reference: string }
  | { kind: "swipe"; id: string; cards: SwipeCard[] };

export type CreativeKind = "swipe" | "scramble" | "spot";
/** Rodízio dos formatos criativos ao longo da unidade. */
export const CREATIVE_ROTATION: readonly CreativeKind[] = ["swipe", "scramble", "spot"];

export interface UnitContext {
  /** Posição desta lição na unidade (0 = primeira). */
  index: number;
  lessonTitles: readonly string[];
  /** Livro narrativo: os títulos seguem a ordem dos acontecimentos. */
  narrative: boolean;
}

export interface LessonPlanInput {
  lessonId: string;
  steps: readonly LessonStep[];
  checkpoint: boolean;
  /** Questões já estudadas na mesma unidade (lições anteriores). */
  reviewPool?: readonly Exercise[];
  unit?: UnitContext;
}

/** Livros cujas unidades seguem a ordem dos acontecimentos. */
export const NARRATIVE_BOOKS: ReadonlySet<string> = new Set([
  "genesis", "exodus", "numbers", "joshua", "judges", "ruth", "1-samuel", "2-samuel", "1-kings", "2-kings",
  "1-chronicles", "2-chronicles", "ezra", "nehemiah", "esther", "jonah", "matthew", "mark", "luke", "john", "acts"
]);

/** Hash estável (FNV-1a) para escolhas determinísticas. */
export function stableHash(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function normalizeAnswer(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

/** Resposta digitada: ignora acentos e maiúsculas; aceita um erro de digitação em palavras de 6+ letras. */
export function typedAnswerMatches(typed: string, expected: string) {
  const a = normalizeAnswer(typed);
  const b = normalizeAnswer(expected);
  if (!a) return false;
  if (a === b) return true;
  return b.length >= 6 && editDistance(a, b) <= 1;
}

const REASONING = /^(por que|por quê|qual afirma|qual leitura|qual conclus|como |o que .* (ensina|mostra|revela)|qual (é|e) o (sentido|objetivo|papel))/i;
const FACTUAL = /^(quem|onde|quantos|quantas|qual (nome|cidade|monte|rio|rei|profeta|povo|animal)|em que|qual personagem)/i;

function wordCount(text: string) {
  return text.trim().split(/\s+/).length;
}

/** "Certo ou errado?" serve para fatos curtos, não para raciocínio. */
function fitsTrueFalse(exercise: Exercise) {
  if (exercise.type !== "multiple-choice" || exercise.options.length < 2) return false;
  const answer = exerciseCorrectAnswerText(exercise);
  if (REASONING.test(exercise.prompt.trim())) return false;
  return FACTUAL.test(exercise.prompt.trim()) || wordCount(answer) <= 4;
}

function trueFalseFor(exercise: Exercise): TrueFalseSetup | undefined {
  if (exercise.type !== "multiple-choice") return undefined;
  const hash = stableHash(exercise.id);
  const showCorrect = (hash >>> 3) % 2 === 0;
  const distractors = exercise.options.filter((option) => option.id !== exercise.correctOptionId);
  const option = showCorrect ? exercise.options.find((item) => item.id === exercise.correctOptionId) : distractors[(hash >>> 5) % distractors.length];
  if (!option) return undefined;
  return { optionId: option.id, optionText: option.text, isTrue: option.id === exercise.correctOptionId };
}

/** Digitar só quando a resposta é uma palavra (sem ambiguidade de grafia longa). */
function fitsTyping(exercise: Exercise) {
  if (exercise.type !== "fill-choice") return false;
  const answer = exerciseCorrectAnswerText(exercise).trim();
  return wordCount(answer) === 1 && answer.length >= 3 && answer.length <= 14 && stableHash(exercise.id) % 2 === 0;
}

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
    if (!left || !right || left.length > 110 || right.length > 60) continue;
    if (/^complete\b/i.test(left)) continue;
    const key = right.toLocaleLowerCase("pt-BR");
    if (usedLeft.has(left) || usedRight.has(key)) continue;
    usedLeft.add(left); usedRight.add(key);
    pairs.push({ id: exercise.id, left, right });
    if (pairs.length === max) break;
  }
  return pairs;
}

/** "Em qual passagem?": um fato desta lição e passagens diferentes da unidade como opções. */
export function buildPassageStep(lessonId: string, own: readonly Exercise[], pool: readonly Exercise[]): Extract<PlayStep, { kind: "passage" }> | undefined {
  const labels = [...new Map([...own, ...pool].map((exercise) => [exercise.reference.label, exercise.reference.label])).values()];
  if (labels.length < 3) return undefined;
  const source = own.find((exercise) => {
    const answer = exerciseCorrectAnswerText(exercise);
    return exercise.type !== "word-blocks" && answer.length >= 8 && answer.length <= 90 && wordCount(answer) >= 2;
  });
  if (!source) return undefined;
  const correct = source.reference.label;
  const others = labels.filter((label) => label !== correct).sort((a, b) => stableHash(lessonId + a) - stableHash(lessonId + b)).slice(0, 2);
  const options = [correct, ...others].sort((a, b) => stableHash(lessonId + "o" + a) - stableHash(lessonId + "o" + b)).map((label, index) => ({ id: `p${index}`, label }));
  return { kind: "passage", id: `${lessonId}-passage`, statement: exerciseCorrectAnswerText(source), options, correctId: options.find((option) => option.label === correct)!.id };
}

export function buildOrderStep(lessonId: string, titles: readonly string[]): Extract<PlayStep, { kind: "order" }> | undefined {
  const usable = titles.filter((title) => title.length <= 60).slice(0, 5);
  if (usable.length < 3) return undefined;
  const items = usable.map((text, index) => ({ id: `e${index}`, text }));
  const shuffled = [...items].sort((a, b) => stableHash(lessonId + a.id) - stableHash(lessonId + b.id));
  if (shuffled.every((item, index) => item.id === items[index].id)) shuffled.reverse();
  return { kind: "order", id: `${lessonId}-order`, items: shuffled, correctOrder: items.map((item) => item.id) };
}

const LATIN_WORD = /^[\p{Script=Latin}]+$/u;

function isFill(exercise: Exercise): exercise is Extract<Exercise, { type: "fill-choice" }> {
  return exercise.type === "fill-choice";
}

/** “Desembaralhe”: a palavra que responde a pergunta ou completa a frase, com as letras fora de ordem. */
export function buildScrambleStep(lessonId: string, own: readonly Exercise[], pool: readonly Exercise[]): Extract<PlayStep, { kind: "scramble" }> | undefined {
  const source = [...own, ...pool].find((exercise) => {
    if (exercise.type === "word-blocks") return false;
    const answer = exerciseCorrectAnswerText(exercise).trim();
    return LATIN_WORD.test(answer) && answer.length >= 3 && answer.length <= 12 && (isFill(exercise) || exercise.prompt.trim().length <= 140);
  });
  if (!source || source.type === "word-blocks") return undefined;
  const answer = exerciseCorrectAnswerText(source).trim();
  const letters = [...answer].map((ch, index) => ({ id: `l${index}`, ch }));
  let shuffled = [...letters].sort((a, b) => stableHash(lessonId + a.id + a.ch) - stableHash(lessonId + b.id + b.ch));
  if (shuffled.map((letter) => letter.ch).join("") === answer) shuffled = [...shuffled].reverse();
  if (shuffled.map((letter) => letter.ch).join("") === answer) return undefined;
  const before = isFill(source) ? source.sentenceBefore.trim() : source.prompt.trim();
  const after = isFill(source) ? source.sentenceAfter.trim() : "";
  return { kind: "scramble", id: `${lessonId}-scramble`, before, after, answer, letters: shuffled };
}

/** “Ache o erro”: a frase vem com uma palavra trocada por uma alternativa errada. */
export function buildSpotStep(lessonId: string, own: readonly Exercise[], pool: readonly Exercise[]): Extract<PlayStep, { kind: "spot" }> | undefined {
  for (const exercise of [...own, ...pool].filter(isFill)) {
    const answer = exerciseCorrectAnswerText(exercise).trim();
    const wrongOptions = exercise.options.filter((option) => option.id !== exercise.correctOptionId && option.text.trim() && option.text.trim().toLocaleLowerCase("pt-BR") !== answer.toLocaleLowerCase("pt-BR"));
    if (!wrongOptions.length || !answer || !LATIN_WORD.test(answer.replace(/\s+/g, ""))) continue;
    const wrong = wrongOptions[stableHash(lessonId + exercise.id) % wrongOptions.length].text.trim();
    if (wrong.length > 32 || !LATIN_WORD.test(wrong.replace(/\s+/g, ""))) continue;
    const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);
    const before = words(exercise.sentenceBefore);
    const after = words(exercise.sentenceAfter);
    const swapped = words(wrong);
    const total = before.length + swapped.length + after.length;
    if (total < 4 || total > 28) continue;
    // Pontuação solta (“azeitona .”) cola na palavra anterior: não vira alvo de toque.
    const glued: { text: string; wrong: boolean }[] = [];
    for (const token of [
      ...before.map((text) => ({ text, wrong: false })),
      ...swapped.map((text) => ({ text, wrong: true })),
      ...after.map((text) => ({ text, wrong: false }))
    ]) {
      const last = glued[glued.length - 1];
      if (last && /^[.,;:!?…»”)\]-]+$/.test(token.text)) last.text += token.text;
      else glued.push({ ...token });
    }
    const tokens: SpotToken[] = glued.map((token, index) => ({ id: `t${index}`, ...token }));
    return { kind: "spot", id: `${lessonId}-spot`, tokens, answer, reference: exercise.reference.label };
  }
  return undefined;
}

function cardFor(exercise: Exercise, lessonId: string): SwipeCard | undefined {
  if (exercise.type === "word-blocks" || exercise.options.length < 2) return undefined;
  const truth = exerciseCorrectAnswerText(exercise).trim();
  const wrong = exercise.options.filter((option) => option.id !== exercise.correctOptionId);
  if (!wrong.length || !truth) return undefined;
  const question = matchPrompt(exercise);
  if (!question || question.length > 150 || /^complete\b/i.test(question)) return undefined;
  const hash = stableHash(lessonId + exercise.id);
  const isTrue = (hash >>> 2) % 2 === 0;
  const claim = isTrue ? truth : wrong[(hash >>> 4) % wrong.length].text.trim();
  if (!claim || claim.length > 80 || (!isTrue && claim.toLocaleLowerCase("pt-BR") === truth.toLocaleLowerCase("pt-BR"))) return undefined;
  return { id: exercise.id, question, claim, isTrue, truth };
}

/** “Deslize”: cartas com uma pergunta e uma resposta; a pessoa diz se está certa ou errada. */
export function buildSwipeStep(lessonId: string, own: readonly Exercise[], pool: readonly Exercise[]): Extract<PlayStep, { kind: "swipe" }> | undefined {
  const seen = new Set<string>();
  const cards: SwipeCard[] = [];
  for (const exercise of [...own, ...pool]) {
    const card = cardFor(exercise, lessonId);
    if (!card || seen.has(card.question)) continue;
    seen.add(card.question);
    cards.push(card);
    if (cards.length === 5) break;
  }
  if (cards.length < 3) return undefined;
  // Garante mistura: pelo menos uma carta certa e uma errada.
  if (cards.every((card) => card.isTrue) || cards.every((card) => !card.isTrue)) {
    const first = cards[0];
    const wrongOption = [...own, ...pool].find((exercise) => exercise.id === first.id);
    if (wrongOption && wrongOption.type !== "word-blocks") {
      const distractor = wrongOption.options.find((option) => option.id !== wrongOption.correctOptionId)?.text.trim();
      if (distractor && distractor.length <= 80) cards[0] = { ...first, isTrue: !first.isTrue, claim: first.isTrue ? distractor : first.truth };
    }
  }
  return { kind: "swipe", id: `${lessonId}-swipe`, cards };
}

/** Escolhe a etapa criativa da lição pelo rodízio da posição na unidade, com reserva se faltar material. */
export function buildCreativeStep(lessonId: string, position: number, own: readonly Exercise[], pool: readonly Exercise[]): Extract<PlayStep, { kind: CreativeKind }> | undefined {
  // O formato da vez vem primeiro; se faltar material, a reserva alterna com a posição para não repetir o vizinho.
  const preferred = CREATIVE_ROTATION[position % CREATIVE_ROTATION.length];
  const others = CREATIVE_ROTATION.filter((kind) => kind !== preferred);
  const order = position % 2 === 0 ? others : [...others].reverse();
  for (const kind of [preferred, ...order]) {
    const step = kind === "swipe" ? buildSwipeStep(lessonId, own, pool) : kind === "scramble" ? buildScrambleStep(lessonId, own, pool) : buildSpotStep(lessonId, own, pool);
    if (step) return step;
  }
  return undefined;
}

export function buildLessonPlan({ lessonId, steps, checkpoint, reviewPool = [], unit }: LessonPlanInput): PlayStep[] {
  let trueFalseUsed = false;
  const plan: PlayStep[] = steps.map((step, sourceIndex) => {
    if (step.type === "learn") return { kind: "learn", id: step.id, sourceIndex, step };
    let presentation: Presentation = step.type === "fill-choice" ? "fill" : step.type === "word-blocks" ? "blocks" : "choice";
    let trueFalse: TrueFalseSetup | undefined;
    if (!checkpoint && presentation === "choice" && !trueFalseUsed && fitsTrueFalse(step)) {
      trueFalse = trueFalseFor(step);
      if (trueFalse) { presentation = "true-false"; trueFalseUsed = true; }
    }
    if (!checkpoint && presentation === "fill" && fitsTyping(step)) presentation = "type";
    return { kind: "exercise", id: step.id, sourceIndex, step, presentation, trueFalse };
  });
  if (checkpoint) return plan;

  const own = steps.filter((step): step is Exercise => step.type !== "learn");
  const recent = [...reviewPool].reverse();
  const isLast = unit ? unit.index === unit.lessonTitles.length - 1 : false;
  const order = unit && unit.narrative && isLast ? buildOrderStep(lessonId, unit.lessonTitles) : undefined;
  const pairs = buildMatchPairs([...own, ...recent]);
  const match = pairs.length >= 3 ? { kind: "match" as const, id: `${lessonId}-match`, pairs } : undefined;
  const passage = buildPassageStep(lessonId, own, recent);
  const position = unit?.index ?? 0;
  // Uma única etapa bônus, escolhida pela posição: varia ao longo da unidade.
  const bonus = order ?? (position % 2 === 1 ? match ?? passage : passage ?? match);
  // Etapa criativa no meio da lição (depois da metade dos exercícios).
  const creative = buildCreativeStep(lessonId, position, own, recent);
  if (creative) {
    const exerciseIndexes = plan.map((step, index) => (step.kind === "exercise" ? index : -1)).filter((index) => index >= 0);
    const after = exerciseIndexes[Math.max(0, Math.ceil(exerciseIndexes.length / 2) - 1)];
    plan.splice(after === undefined ? plan.length : after + 1, 0, creative);
  }
  if (bonus) plan.push(bonus);
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

/**
 * Ordem das alternativas na tela. O conteúdo costuma trazer a resposta certa na mesma posição;
 * aqui ela vai para uma posição sorteada pelo id da questão (estável: a mesma questão
 * aparece sempre igual, mas cada questão tem a certa num lugar diferente).
 */
export function arrangeOptions<T extends { id: string }>(exerciseId: string, options: readonly T[], correctId: string): T[] {
  const correct = options.find((option) => option.id === correctId);
  if (!correct || options.length < 2) return [...options];
  const others = options.filter((option) => option.id !== correctId).sort((a, b) => stableHash(exerciseId + ":" + a.id) - stableHash(exerciseId + ":" + b.id));
  const position = stableHash(exerciseId + ":posicao") % options.length;
  return [...others.slice(0, position), correct, ...others.slice(position)];
}
