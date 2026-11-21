/** Motor de comportamento da Lumi: decide animação e fala para cada evento. */

export type LumiAnimationId = "acenar" | "pular" | "trofeu" | "dormir" | "ler" | "ensinar" | "joinha" | "lanterna" | "binoculo" | "estudar";

/**
 * Animações com traço diferente das demais (a `acenar` foi extraída de um vídeo).
 * Ficam reservadas a momentos únicos de saudação (tour, convite de notificações,
 * configurações) e não entram no acompanhante da trilha nem em telas recorrentes.
 */
export const LUMI_WELCOME_ONLY_ANIMATIONS: readonly LumiAnimationId[] = ["acenar"];

export type LumiEvent =
  | "abrir" | "idle" | "checkpoint" | "concluir" | "unidade" | "sequencia"
  | "erro" | "parado" | "acordar" | "concluido" | "toque"
  // Conversa e personalidade
  | "anima" | "curiosidade" | "piada" | "cocegas" | "tonta" | "saudade";

export type BookGroup = "pentateuco" | "historicos" | "poeticos" | "profetas" | "evangelhos" | "atos" | "cartas" | "apocalipse";

/** Condições para uma fala valer. Todas as chaves informadas precisam ser verdadeiras. */
export interface LumiCondition {
  /** Faixa de horas [início, fim) — aceita virada de dia, como [22, 5]. */
  hours?: [number, number];
  /** Dias da semana (0 = domingo … 6 = sábado). */
  weekdays?: number[];
  /** Ofensiva mínima e máxima, em dias. */
  streak?: [number, number];
  /** Dias sem estudar (0 = estudou hoje). */
  gap?: [number, number];
  books?: string[];
  groups?: BookGroup[];
  /** Poucos corações (1 ou menos) com a regra de corações ligada. */
  lowHearts?: boolean;
  /** Meta diária já batida. */
  goalDone?: boolean;
}

export interface LumiLine {
  text: string;
  when?: LumiCondition;
  /** Padrão 1. Falas com condição ganham prioridade extra automática. */
  weight?: number;
  animation?: LumiAnimationId;
}

export type PhraseEntry = string | LumiLine;

export interface LumiRule {
  animation: LumiAnimationId;
  phrases: PhraseEntry[];
  /** Animações alternadas entre as falas (opcional; senão usa `animation`). */
  animations?: LumiAnimationId[];
  /** Depois desse tempo a Lumi volta ao estado de espera. Sem valor: permanece. */
  returnAfterMs?: number;
}

export type LumiRuleSet = Record<LumiEvent, LumiRule>;
export type LumiVars = Record<string, string | number | undefined>;

/** O que a Lumi sabe sobre o momento do aluno. */
export interface LumiContext {
  bookId?: string;
  streak: number;
  /** Dias desde o último estudo (0 = estudou hoje). */
  gap: number;
  hearts?: number;
  maxHearts?: number;
  /** Fração da meta diária cumprida hoje (0–1). */
  goalRatio?: number;
}

export interface LumiReaction {
  /** Evento efetivo (um toque repetido vira “cocegas” ou “tonta”). */
  event: LumiEvent;
  animation: LumiAnimationId;
  text: string;
  returnAfterMs?: number;
}

/** Tempo sem interação até a Lumi dormir. */
export const LUMI_IDLE_SLEEP_MS = 25_000;

export function fillPhrase(template: string, vars: LumiVars) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined || value === "" ? match : String(value);
  });
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
