/**
 * Funil de uso, só no aparelho: onde as pessoas avançam ou desistem
 * (instalou → fez a primeira lição → voltou no dia seguinte → voltou na semana).
 * Nada sai do aparelho; o relatório é para a própria pessoa (ou a equipe) copiar e analisar.
 */
export type FunnelEvent =
  | "first_open" | "first_lesson" | "first_checkpoint" | "first_book_done" | "first_share"
  | "plan_started" | "plan_step_done" | "streak_saved" | "notifications_on" | "noah_used" | "devotional_done";

export interface FunnelState {
  /** Primeira vez que cada evento aconteceu (ISO). */
  events: Partial<Record<FunnelEvent, string>>;
  /** Dias (AAAA-MM-DD) em que o app foi aberto, os mais recentes no fim (máx. 90). */
  openDays: string[];
}

export const EMPTY_FUNNEL: FunnelState = { events: {}, openDays: [] };

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) / 86_400_000);
}

export function recordEvent(state: FunnelState, event: FunnelEvent, now = new Date()): FunnelState {
  if (state.events[event]) return state;
  return { ...state, events: { ...state.events, [event]: now.toISOString() } };
}

export function recordOpen(state: FunnelState, now = new Date()): FunnelState {
  const today = dayKey(now);
  const first = recordEvent(state, "first_open", now);
  if (first.openDays.includes(today)) return first;
  return { ...first, openDays: [...first.openDays, today].slice(-90) };
}

export interface FunnelStage {
  id: string;
  label: string;
  reached: boolean;
  /** Quando foi alcançado (ISO), se souber. */
  at?: string;
  /** Só faz sentido medir depois de N dias de instalação. */
  pending?: boolean;
}

/** Retornou N dias depois da primeira abertura (ou depois, até N+2 dias para ser justo). */
function returnedAfter(state: FunnelState, days: number, now: Date) {
  const first = state.openDays[0];
  if (!first) return { reached: false, pending: true };
  const age = daysBetween(first, dayKey(now));
  const reached = state.openDays.some((day) => { const gap = daysBetween(first, day); return gap >= days && gap <= days + 2; });
  return { reached, pending: !reached && age < days };
}

export function funnelStages(state: FunnelState, now = new Date()): FunnelStage[] {
  const event = (id: FunnelEvent, label: string): FunnelStage => ({ id, label, reached: Boolean(state.events[id]), at: state.events[id] });
  const d1 = returnedAfter(state, 1, now);
  const d7 = returnedAfter(state, 7, now);
  return [
    event("first_open", "Abriu o app"),
    event("first_lesson", "Concluiu a primeira lição"),
    { id: "return_d1", label: "Voltou no dia seguinte", ...d1 },
    event("first_checkpoint", "Venceu o primeiro checkpoint"),
    { id: "return_d7", label: "Voltou depois de 1 semana", ...d7 },
    event("first_book_done", "Concluiu um livro"),
    event("plan_started", "Começou um plano de leitura"),
    event("first_share", "Compartilhou um cartão")
  ];
}

export function funnelReport(state: FunnelState, now = new Date()): string {
  const lines = funnelStages(state, now).map((stage) => `${stage.reached ? "✔" : stage.pending ? "…" : "✘"} ${stage.label}${stage.at ? ` (${stage.at.slice(0, 10)})` : ""}`);
  return ["Funil do Bibliolingo (neste aparelho)", `Dias com o app aberto: ${state.openDays.length}`, ...lines].join("\n");
}
