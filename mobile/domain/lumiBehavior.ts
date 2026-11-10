/** Motor de comportamento da Lumi: decide animação e fala para cada evento. */

export type LumiAnimationId = "acenar" | "pular" | "trofeu" | "dormir" | "ler" | "ensinar" | "joinha" | "lanterna" | "binoculo" | "estudar";

export type LumiEvent =
  | "abrir" | "idle" | "checkpoint" | "concluir" | "unidade" | "sequencia"
  | "erro" | "parado" | "acordar" | "concluido" | "toque";

export interface LumiRule {
  animation: LumiAnimationId;
  phrases: string[];
  /** Animações alternadas junto com as frases (opcional; senão usa `animation`). */
  animations?: LumiAnimationId[];
  /** Depois desse tempo a Lumi volta ao estado de espera. Sem valor: permanece. */
  returnAfterMs?: number;
}

export type LumiRuleSet = Record<LumiEvent, LumiRule>;
export type LumiVars = Record<string, string | number | undefined>;
export type PhraseRotation = Partial<Record<LumiEvent, number>>;

export interface LumiReaction {
  event: LumiEvent;
  animation: LumiAnimationId;
  text: string;
  returnAfterMs?: number;
  rotation: PhraseRotation;
}

/** Tempo sem interação até a Lumi dormir. */
export const LUMI_IDLE_SLEEP_MS = 25_000;

export function fillPhrase(template: string, vars: LumiVars) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined || value === "" ? match : String(value);
  });
}

/** Escolhe a próxima frase do evento (alternando) e devolve a reação completa. */
export function nextReaction(event: LumiEvent, rotation: PhraseRotation, vars: LumiVars, rules: LumiRuleSet): LumiReaction {
  const rule = rules[event];
  const index = (rotation[event] ?? 0) % Math.max(1, rule.phrases.length);
  const template = rule.phrases[index] ?? "";
  return {
    event,
    animation: rule.animations?.length ? rule.animations[index % rule.animations.length] : rule.animation,
    text: fillPhrase(template, vars).replace(/\{\w+\}/g, "").replace(/\s{2,}/g, " ").trim(),
    returnAfterMs: rule.returnAfterMs,
    rotation: { ...rotation, [event]: (index + 1) % Math.max(1, rule.phrases.length) }
  };
}

export interface ProgressSnapshot {
  lessons: number;
  checkpoints: number;
  streak: number;
}

/** Converte uma mudança de progresso no evento que a Lumi deve celebrar. */
export function detectProgressEvent(previous: ProgressSnapshot | undefined, next: ProgressSnapshot): LumiEvent | undefined {
  if (!previous) return undefined;
  if (next.checkpoints > previous.checkpoints) return "unidade";
  if (next.streak > previous.streak && next.streak > 1 && next.streak % 7 === 0) return "sequencia";
  if (next.lessons > previous.lessons) return "concluir";
  return undefined;
}
