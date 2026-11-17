/**
 * Cérebro da Lumi: escolhe o que ela fala e como reage.
 *
 * Em vez de percorrer uma lista em ordem, ele:
 *  - sorteia sem repetir até esgotar as falas do evento (“sacola”);
 *  - prefere falas que combinam com o momento (hora, ofensiva, tempo fora, livro…);
 *  - só usa falas cujas variáveis existem (nunca “Hoje é dia de .”);
 *  - reage a toques repetidos (cócegas e depois cochilo);
 *  - oferece respostas rápidas para a pessoa “conversar” com ela.
 *
 * É lógica pura: a aleatoriedade e o relógio entram por parâmetro, o que a deixa testável.
 */
import type {
  BookGroup, LumiAnimationId, LumiCondition, LumiContext, LumiEvent, LumiLine, LumiReaction, LumiRuleSet, LumiVars, PhraseEntry
} from "./lumiBehavior";
import { fillPhrase } from "./lumiBehavior";

/** Janela em que toques seguidos contam como “cutucada”. */
export const TAP_WINDOW_MS = 5_000;
export const TAPS_FOR_TICKLE = 4;
export const TAPS_FOR_DIZZY = 7;
/** Falas com condição valem mais que as genéricas, para a personalidade aparecer. */
export const CONTEXT_WEIGHT = 3;

export interface LumiMemory {
  /** Falas já usadas por evento desde o último reinício da sacola. */
  bag: Partial<Record<LumiEvent, string[]>>;
  lastAnimation?: LumiAnimationId;
  /** Instantes (ms) dos toques recentes. */
  taps: number[];
}

export function newMemory(): LumiMemory {
  return { bag: {}, taps: [] };
}

const GROUPS: Record<BookGroup, string[]> = {
  pentateuco: ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"],
  historicos: ["joshua", "judges", "ruth", "1-samuel", "2-samuel", "1-kings", "2-kings", "1-chronicles", "2-chronicles", "ezra", "nehemiah", "esther"],
  poeticos: ["job", "psalms", "proverbs", "ecclesiastes", "song-of-songs"],
  profetas: ["isaiah", "jeremiah", "lamentations", "ezekiel", "daniel", "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"],
  evangelhos: ["matthew", "mark", "luke", "john"],
  atos: ["acts"],
  cartas: ["romans", "1-corinthians", "2-corinthians", "galatians", "ephesians", "philippians", "colossians", "1-thessalonians", "2-thessalonians", "1-timothy", "2-timothy", "titus", "philemon", "hebrews", "james", "1-peter", "2-peter", "1-john", "2-john", "3-john", "jude"],
  apocalipse: ["revelation"]
};

export function bookGroup(bookId: string | undefined): BookGroup | undefined {
  if (!bookId) return undefined;
  return (Object.keys(GROUPS) as BookGroup[]).find((group) => GROUPS[group].includes(bookId));
}

function hourMatches(hour: number, [from, to]: [number, number]) {
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

function between(value: number, [min, max]: [number, number]) {
  return value >= min && value <= max;
}

export function matches(when: LumiCondition | undefined, context: LumiContext, now: Date) {
  if (!when) return true;
  if (when.hours && !hourMatches(now.getHours(), when.hours)) return false;
  if (when.weekdays && !when.weekdays.includes(now.getDay())) return false;
  if (when.streak && !between(context.streak, when.streak)) return false;
  if (when.gap && !between(context.gap, when.gap)) return false;
  if (when.books && !(context.bookId && when.books.includes(context.bookId))) return false;
  if (when.groups) {
    const group = bookGroup(context.bookId);
    if (!group || !when.groups.includes(group)) return false;
  }
  if (when.lowHearts !== undefined) {
    const low = context.hearts !== undefined && context.maxHearts !== undefined && context.maxHearts > 0 && context.hearts <= 1;
    if (low !== when.lowHearts) return false;
  }
  if (when.goalDone !== undefined && (context.goalRatio ?? 0) >= 1 !== when.goalDone) return false;
  return true;
}

interface Candidate {
  id: string;
  line: LumiLine;
}

function normalize(event: LumiEvent, entries: PhraseEntry[]): Candidate[] {
  return entries.map((entry, index) => ({ id: `${event}#${index}`, line: typeof entry === "string" ? { text: entry } : entry }));
}

/** Todas as variáveis da fala existem e não estão vazias. */
function resolvable(text: string, vars: LumiVars) {
  for (const [, key] of text.matchAll(/\{(\w+)\}/g)) {
    const value = vars[key];
    if (value === undefined || value === "") return false;
  }
  return true;
}

function weightOf(line: LumiLine) {
  return (line.weight ?? 1) * (line.when ? CONTEXT_WEIGHT : 1);
}

/** O evento que realmente vale, considerando toques repetidos e quanto tempo o aluno ficou fora. */
function effectiveEvent(event: LumiEvent, taps: number[], context: LumiContext): LumiEvent {
  if (event === "toque") {
    if (taps.length >= TAPS_FOR_DIZZY) return "tonta";
    if (taps.length >= TAPS_FOR_TICKLE) return "cocegas";
  }
  if (event === "abrir" && context.gap >= 2) return "saudade";
  return event;
}

export interface ThinkInput {
  event: LumiEvent;
  memory: LumiMemory;
  vars: LumiVars;
  context: LumiContext;
  rules: LumiRuleSet;
  rng?: () => number;
  now?: Date;
}

export interface ThinkResult {
  reaction: LumiReaction;
  memory: LumiMemory;
}

export function think({ event, memory, vars, context, rules, rng = Math.random, now = new Date() }: ThinkInput): ThinkResult {
  const time = now.getTime();
  let taps = memory.taps;
  if (event === "toque") taps = [...memory.taps.filter((tap) => time - tap < TAP_WINDOW_MS), time];

  const effective = effectiveEvent(event, taps, context);
  if (effective === "tonta") taps = [];

  const rule = rules[effective];
  const all = normalize(effective, rule.phrases);
  // 1) Só falas que valem agora e cujas variáveis existem; 2) se nada sobrar, relaxa as condições.
  let pool = all.filter((item) => matches(item.line.when, context, now) && resolvable(item.line.text, vars));
  if (!pool.length) pool = all.filter((item) => !item.line.when && resolvable(item.line.text, vars));
  if (!pool.length) pool = all;

  // Sacola: só repete depois de usar todas as outras; nunca a mesma duas vezes seguidas.
  const used = memory.bag[effective] ?? [];
  let fresh = pool.filter((item) => !used.includes(item.id));
  let nextUsed = used;
  if (!fresh.length) {
    const last = used[used.length - 1];
    fresh = pool.length > 1 ? pool.filter((item) => item.id !== last) : pool;
    nextUsed = [];
  }

  const total = fresh.reduce((sum, item) => sum + weightOf(item.line), 0);
  let roll = rng() * total;
  let chosen = fresh[fresh.length - 1];
  for (const item of fresh) {
    roll -= weightOf(item.line);
    if (roll < 0) { chosen = item; break; }
  }

  const animations = rule.animations?.length ? rule.animations : [rule.animation];
  const options = animations.length > 1 ? animations.filter((animation) => animation !== memory.lastAnimation) : animations;
  const animation = chosen.line.animation ?? options[Math.floor(rng() * options.length)] ?? rule.animation;

  const text = fillPhrase(chosen.line.text, vars).replace(/\{\w+\}/g, "").replace(/\s{2,}/g, " ").trim();
  return {
    reaction: { event: effective, animation, text, returnAfterMs: rule.returnAfterMs },
    memory: { bag: { ...memory.bag, [effective]: [...nextUsed, chosen.id] }, lastAnimation: animation, taps }
  };
}

export type QuickReplyAction = { kind: "event"; event: LumiEvent } | { kind: "study" };

export interface QuickReply {
  id: string;
  label: string;
  action: QuickReplyAction;
}

/** Eventos de conversa: depois deles a Lumi oferece novas respostas rápidas. */
const CONVERSATION_EVENTS: LumiEvent[] = ["toque", "anima", "curiosidade", "piada", "cocegas"];

/** Botões que aparecem junto da fala. */
export function quickReplies(event: LumiEvent, { canStudy }: { canStudy: boolean }): QuickReply[] {
  if (!CONVERSATION_EVENTS.includes(event)) return [];
  const replies: QuickReply[] = [
    { id: "anima", label: "Me anima", action: { kind: "event", event: "anima" } },
    { id: "curiosidade", label: "Curiosidade", action: { kind: "event", event: "curiosidade" } },
    { id: "piada", label: "Piada", action: { kind: "event", event: "piada" } }
  ];
  if (canStudy) replies.push({ id: "estudar", label: "Bora estudar", action: { kind: "study" } });
  return replies;
}
