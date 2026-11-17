/** Marcos do plano de leitura que viram cartão para compartilhar. */
import { bibleBookByOsis } from "../../src/content/bible/catalog";
import { planProgress, type PlanCompletionEvent, type PlanEnrollment } from "../../src/domain/studyPlans";
import type { LumiMoodId } from "./lumiMood";

export const PLAN_MILESTONES = [25, 50, 75, 100] as const;

export interface PlanStatus {
  percent: number;
  completed: number;
  total: number;
}

export function planStatus(enrollment: PlanEnrollment, events: readonly PlanCompletionEvent[]): PlanStatus {
  const progress = planProgress(enrollment, events);
  return { percent: progress.percent, completed: progress.completed, total: progress.total };
}

/** Marcos já atingidos (25, 50…) para essa porcentagem. */
export function reachedPlanMilestones(percent: number): number[] {
  return PLAN_MILESTONES.filter((value) => percent >= value);
}

/** O maior marco atingido que ainda não foi comemorado. */
export function pendingPlanMilestone(percent: number, celebrated: readonly number[]): number | undefined {
  return reachedPlanMilestones(percent).filter((value) => !celebrated.includes(value)).at(-1);
}

export function planMood(percent: number): LumiMoodId {
  if (percent >= 100) return "coroa";
  if (percent >= 75) return "trofeu";
  if (percent >= 50) return "progresso";
  return "checklist";
}

export function planMilestoneTitle(percent: number) {
  if (percent >= 100) return "Plano concluído!";
  if (percent >= 75) return "Reta final!";
  if (percent >= 50) return "Metade do caminho!";
  if (percent >= 25) return "Um quarto lido!";
  return "Começou bem!";
}

export function planCaption(title: string, status: PlanStatus, name?: string) {
  const who = name ? `${name.split(" ")[0]} está` : "Estou";
  if (status.percent >= 100) return `${name ? name.split(" ")[0] : "Eu"} concluiu o plano “${title}” no Bibliolingo! ${status.total} leituras feitas. 📖🐑`;
  return `${who} no plano “${title}” do Bibliolingo: ${status.percent}% lido (${status.completed} de ${status.total} leituras). 📖🐑 Venha ler a Bíblia comigo!`;
}

/** Livro do plano (para escolher o fundo do cartão): o do primeiro trecho de leitura. */
export function planBackgroundBookId(enrollment: PlanEnrollment): string {
  const osis = enrollment.stepsSnapshot.find((step) => step.chapters?.length)?.chapters?.[0]?.bookOsis;
  return (osis && bibleBookByOsis.get(osis)?.id) || "psalms";
}
