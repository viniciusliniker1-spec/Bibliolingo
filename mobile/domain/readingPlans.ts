/**
 * Planos de leitura guiados no celular: usa o motor de planos já existente (cronograma, etapas e
 * eventos de conclusão) com uma vitrine curta e funções puras para começar, concluir e encerrar.
 */
import { bibleBookByOsis } from "../../src/content/bible/catalog";
import {
  STUDY_PLAN_CATALOG, createBookReadingPlan, createEnrollment, localDateKey, planProgress, scheduledSteps,
  type PlanChangeEvent, type PlanCompletionEvent, type PlanEnrollment, type StudyPlanDefinition, type StudyPlanStep
} from "../../src/domain/studyPlans";
import { toLocalDateKey, updateStreak } from "../../src/domain/streak";
import type { MobileProgress } from "../types/progress";

/** XP por dia de leitura concluído. */
export const READING_XP = 10;

export interface ShowcasePlan {
  plan: StudyPlanDefinition;
  /** Frase curta que convida a começar. */
  hook: string;
  /** Minutos aproximados por dia. */
  minutes: number;
}

function bookPlan(osis: string, days: number, title: string, description: string): StudyPlanDefinition {
  const book = bibleBookByOsis.get(osis);
  if (!book) throw new Error(`Livro ${osis} não encontrado`);
  return { ...createBookReadingPlan(osis, days, title), id: `reading-${book.id}-${days}`, description, published: true };
}

const fromCatalog = (id: string) => {
  const plan = STUDY_PLAN_CATALOG.find((item) => item.id === id);
  if (!plan) throw new Error(`Plano ${id} não encontrado`);
  return plan;
};

/** Vitrine: planos curtos primeiro, para o aluno terminar o que começa. */
export const SHOWCASE_PLANS: ShowcasePlan[] = [
  { plan: bookPlan("John", 21, "João em 21 dias", "Um capítulo por dia do evangelho que mostra quem Jesus é."), hook: "O melhor começo para ler a Bíblia", minutes: 6 },
  { plan: bookPlan("Mark", 16, "Marcos em 16 dias", "O evangelho mais direto, em um capítulo por dia."), hook: "Curto, ágil e cheio de ação", minutes: 6 },
  { plan: bookPlan("Rom", 16, "Romanos em 16 dias", "A grande carta de Paulo sobre graça e fé, passo a passo."), hook: "O coração da teologia cristã", minutes: 8 },
  { plan: bookPlan("Phil", 4, "Filipenses em 4 dias", "Quatro capítulos de alegria, mesmo na prisão."), hook: "Perfeito para uma semana leve", minutes: 5 },
  { plan: fromCatalog("proverbs-31"), hook: "Sabedoria prática para cada dia do mês", minutes: 5 },
  { plan: fromCatalog("psalms-30"), hook: "Cinco salmos por dia, para orar e adorar", minutes: 15 },
  { plan: fromCatalog("gospels-30"), hook: "A vida de Jesus em quatro olhares", minutes: 12 },
  { plan: fromCatalog("new-testament-90"), hook: "O Novo Testamento inteiro, em ritmo tranquilo", minutes: 10 }
];

export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export function activeEnrollments(progress: Pick<MobileProgress, "planEnrollments">): PlanEnrollment[] {
  return progress.planEnrollments.filter((item) => item.status === "active");
}

export function enrollmentForPlan(progress: Pick<MobileProgress, "planEnrollments">, planId: string) {
  return activeEnrollments(progress).find((item) => item.planId === planId);
}

export interface TodayReading {
  enrollment: PlanEnrollment;
  step: StudyPlanStep;
  scheduledDate: string;
  overdue: boolean;
  completedToday: boolean;
  progress: ReturnType<typeof planProgress>;
}

/** A próxima leitura de um plano ativo: a primeira ainda não feita (atrasada ou de hoje). */
export function todayReading(progress: Pick<MobileProgress, "planCompletionEvents">, enrollment: PlanEnrollment, today = localDateKey(new Date())): TodayReading | undefined {
  const steps = scheduledSteps(enrollment, progress.planCompletionEvents, today);
  const next = steps.find((item) => !item.completed);
  const summary = planProgress(enrollment, progress.planCompletionEvents);
  if (!next) return undefined;
  const completedToday = steps.some((item) => item.completed && item.completedAt?.slice(0, 10) === today);
  return { enrollment, step: next.step, scheduledDate: next.scheduledDate, overdue: next.overdue, completedToday, progress: summary };
}

/** Rótulo curto do trecho: “João 3” ou “Salmos 1–5”. */
export function stepLabel(step: StudyPlanStep): string {
  const chapters = step.chapters ?? [];
  if (!chapters.length) return step.title;
  const first = chapters[0];
  const last = chapters[chapters.length - 1];
  const book = (osis: string) => bibleBookByOsis.get(osis)?.name ?? osis;
  if (first.bookOsis === last.bookOsis) return first.chapter === last.chapter ? `${book(first.bookOsis)} ${first.chapter}` : `${book(first.bookOsis)} ${first.chapter}–${last.chapter}`;
  return `${book(first.bookOsis)} ${first.chapter} a ${book(last.bookOsis)} ${last.chapter}`;
}

/** Parâmetros da aba Bíblia para abrir o trecho da etapa. */
export function readingParams(step: StudyPlanStep): { osis: string; chapter: string } | undefined {
  const first = step.chapters?.[0];
  return first ? { osis: first.bookOsis, chapter: String(first.chapter) } : undefined;
}

export function startPlan(progress: MobileProgress, plan: StudyPlanDefinition, now = new Date()): MobileProgress {
  if (enrollmentForPlan(progress, plan.id)) return progress;
  const enrollment = createEnrollment(plan, { id: `${plan.id}-${now.getTime()}`, startDate: localDateKey(now), studyWeekdays: ALL_WEEKDAYS, now });
  const change: PlanChangeEvent = { id: `${enrollment.id}-created`, enrollmentId: enrollment.id, kind: "created", occurredAt: now.toISOString() };
  return { ...progress, planEnrollments: [...progress.planEnrollments, enrollment], planChangeEvents: [...progress.planChangeEvents, change], storageRevision: progress.storageRevision + 1 };
}

/** Marca (ou desmarca) uma etapa. Concluir conta como estudo do dia: ofensiva e um pouco de XP. */
export function setStepDone(progress: MobileProgress, enrollmentId: string, stepId: string, completed: boolean, now = new Date()): MobileProgress {
  const enrollment = progress.planEnrollments.find((item) => item.id === enrollmentId);
  if (!enrollment || !enrollment.stepsSnapshot.some((step) => step.id === stepId)) return progress;
  const event: PlanCompletionEvent = {
    id: `${enrollmentId}-${stepId}-${now.getTime()}`, enrollmentId, stepId, completed,
    occurredAt: now.toISOString(), localDate: localDateKey(now), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  };
  const events = [...progress.planCompletionEvents, event];
  let next: MobileProgress = { ...progress, planCompletionEvents: events, storageRevision: progress.storageRevision + 1 };
  if (completed) {
    const streak = updateStreak(progress.lastStudyDate, progress.streak, progress.bestStreak, now);
    const date = toLocalDateKey(now);
    const day = progress.activity[date] ?? { date, xp: 0, seconds: 0, lessons: 0 };
    next = { ...next, ...streak, xp: progress.xp + READING_XP, activity: { ...progress.activity, [date]: { ...day, xp: day.xp + READING_XP } } };
    if (planProgress(enrollment, events).complete) {
      const done: PlanChangeEvent = { id: `${enrollmentId}-completed`, enrollmentId, kind: "completed", occurredAt: now.toISOString() };
      next = { ...next, planEnrollments: next.planEnrollments.map((item) => (item.id === enrollmentId ? { ...item, status: "completed" as const, updatedAt: now.toISOString() } : item)), planChangeEvents: [...next.planChangeEvents, done] };
    }
  }
  return next;
}

export function archivePlan(progress: MobileProgress, enrollmentId: string, now = new Date()): MobileProgress {
  if (!progress.planEnrollments.some((item) => item.id === enrollmentId)) return progress;
  const change: PlanChangeEvent = { id: `${enrollmentId}-archived-${now.getTime()}`, enrollmentId, kind: "archived", occurredAt: now.toISOString() };
  return {
    ...progress,
    planEnrollments: progress.planEnrollments.map((item) => (item.id === enrollmentId ? { ...item, status: "archived" as const, updatedAt: now.toISOString() } : item)),
    planChangeEvents: [...progress.planChangeEvents, change],
    storageRevision: progress.storageRevision + 1
  };
}
