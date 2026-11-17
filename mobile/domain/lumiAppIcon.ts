/**
 * Ícone do app conforme a frequência de acesso.
 *
 * Quem abre o app todo dia vê a Lumi cada vez mais feliz; quem some a vê ficar triste e,
 * por fim, brava (de brincadeira). O ícone neutro é o padrão: novo aluno, primeiro dia e a
 * manhã seguinte a um dia sem abrir o app.
 */
import { toLocalDateKey } from "../../src/domain/streak";
import { daysBetweenKeys } from "./lumiMood";

export type LumiAppIconId = string;

export const DEFAULT_APP_ICON: LumiAppIconId = "neutra";

/** Acesso: dias seguidos abrindo o app e o último dia (AAAA-MM-DD, horário local). */
export interface AccessState {
  lastOpen?: string;
  streak: number;
}

/** Escada de alegria: a partir de N dias seguidos. */
export const HAPPY_ICONS: { from: number; icon: LumiAppIconId }[] = [
  { from: 1, icon: "neutra" },
  { from: 2, icon: "sorriso" },
  { from: 3, icon: "riso" },
  { from: 4, icon: "bracos" },
  { from: 5, icon: "olhos_estrela" },
  { from: 6, icon: "olhos_coracao" },
  { from: 7, icon: "piscadinha" },
  { from: 10, icon: "gargalhada" },
  { from: 14, icon: "pulo" },
  { from: 21, icon: "oculos" },
  { from: 30, icon: "coroa" },
  { from: 60, icon: "trofeu" },
  { from: 100, icon: "segura_coracao" }
];

/** Escada de tristeza e bronca: a partir de N dias sem abrir (1 = ainda neutra, esperando). */
export const MISSED_ICONS: { from: number; icon: LumiAppIconId }[] = [
  { from: 1, icon: "neutra" },
  { from: 2, icon: "triste" },
  { from: 3, icon: "chorosa" },
  { from: 4, icon: "chorosa_maos" },
  { from: 5, icon: "olhos_fechados_choro" },
  { from: 6, icon: "chorando_alto" },
  { from: 7, icon: "rosto_coberto" },
  { from: 8, icon: "emburrada" },
  { from: 9, icon: "brava_punho" },
  { from: 10, icon: "brava_vapor" },
  { from: 11, icon: "brava_chamas" },
  { from: 12, icon: "furia" },
  { from: 13, icon: "explosao" }
];

export const ALL_LADDER_ICONS = [...new Set([...HAPPY_ICONS, ...MISSED_ICONS].map((step) => step.icon))];

function pick(steps: { from: number; icon: LumiAppIconId }[], amount: number): LumiAppIconId {
  let chosen = steps[0].icon;
  for (const step of steps) if (amount >= step.from) chosen = step.icon;
  return chosen;
}

/** Registra uma abertura do app: soma ao encadeamento se foi ontem, reinicia se houve pausa. */
export function recordAccess(state: AccessState, now: Date): AccessState {
  const today = toLocalDateKey(now);
  if (!state.lastOpen) return { lastOpen: today, streak: 1 };
  const gap = daysBetweenKeys(state.lastOpen, today);
  if (gap <= 0) return { lastOpen: state.lastOpen, streak: Math.max(1, state.streak) };
  return { lastOpen: today, streak: gap === 1 ? state.streak + 1 : 1 };
}

/** Qual ícone mostrar agora, só com o que se sabe dos acessos. */
export function iconForAccess(state: AccessState, now: Date): LumiAppIconId {
  if (!state.lastOpen) return DEFAULT_APP_ICON;
  const gap = daysBetweenKeys(state.lastOpen, toLocalDateKey(now));
  if (gap <= 0) return pick(HAPPY_ICONS, state.streak);
  return pick(MISSED_ICONS, gap);
}
