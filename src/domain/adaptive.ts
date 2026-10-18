import type { QuestionAttempt, ReviewItem, StudyGoal, KnowledgeLevel } from "../types/progress";
import { estimateRetention, normalizeReviewItem } from "./review";
import type { PrerequisiteGraph } from "./prerequisites";

export type LearningStage =
  | "insufficient-evidence"
  | "first-contact"
  | "initial-learning"
  | "consolidating"
  | "demonstrated"
  | "review-needed";

export type AdaptiveArea = "bible" | "greek" | "formation" | "deepen";

export interface AdaptiveConcept {
  id: string;
  title: string;
}

export interface AdaptiveActivity {
  id: string;
  kind: AdaptiveArea;
  title: string;
  subtitle?: string;
  estimatedMinutes: number;
  concepts: AdaptiveConcept[];
  checkpoint: boolean;
  accessible: boolean;
  completed: boolean;
  order: number;
}

export interface ConceptLearningState {
  conceptId: string;
  title: string;
  stage: LearningStage;
  masteryEstimate: number;
  evidenceCount: number;
  distinctQuestions: number;
  independentDays: number;
  checkpointEvidence: number;
  reviewEvidence: number;
  recurringErrors: number;
  retentionEstimate?: number;
  lastPracticedAt?: string;
  evidenceLabel: "Evidências insuficientes" | "Evidência inicial" | "Evidências em formação" | "Evidências consistentes";
}

export type RecommendationKind = "review" | "reinforcement" | "prerequisite" | "continue" | "deepen";

export interface AdaptiveRecommendation {
  id: string;
  kind: RecommendationKind;
  title: string;
  reason: string;
  priority: number;
  conceptId?: string;
  activityId?: string;
  activityKind?: AdaptiveArea;
  estimatedMinutes: number;
}

export interface AdaptiveProfile {
  generatedAt: string;
  concepts: ConceptLearningState[];
  strengths: ConceptLearningState[];
  difficulties: ConceptLearningState[];
  insufficientEvidence: boolean;
}

export interface AdaptiveEngineInput {
  attempts: QuestionAttempt[];
  reviewItems: ReviewItem[];
  activities: AdaptiveActivity[];
  prerequisites?: PrerequisiteGraph;
  goal: StudyGoal;
  declaredLevel: KnowledgeLevel;
  ignoredRecommendationIds?: readonly string[];
  recentRecommendationIds?: readonly string[];
  now?: Date;
  limit?: number;
}

const DAY_MS = 86_400_000;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const dayKey = (iso: string) => iso.slice(0, 10);

function independentAttempts(attempts: QuestionAttempt[]) {
  const evidence = new Map<string, QuestionAttempt>();
  [...attempts].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt)).forEach((attempt) => {
    const key = attempt.conceptId + ":" + attempt.questionId + ":" + dayKey(attempt.answeredAt);
    evidence.set(key, attempt);
  });
  return [...evidence.values()];
}

function evidenceWeight(attempt: QuestionAttempt, now: Date) {
  const ageDays = Math.max(0, (now.getTime() - new Date(attempt.answeredAt).getTime()) / DAY_MS);
  const recency = Math.pow(0.5, ageDays / 120);
  const mode = attempt.mode === "checkpoint" ? 1.35 : attempt.mode === "review" ? 1.25 : attempt.mode === "deepen" ? 1.2 : 1;
  const difficulty = attempt.difficulty === "hard" ? 1.2 : attempt.difficulty === "easy" ? 0.85 : 1;
  return recency * mode * difficulty;
}

/**
 * A estimativa 0–100 é um índice explicável, não uma medida psicométrica:
 * 40% precisão ponderada, 25% retenção, 20% variedade e 15% espaçamento,
 * multiplicados pela confiança das evidências (até quatro oportunidades).
 */
export function buildAdaptiveProfile(
  attempts: QuestionAttempt[],
  reviewItems: ReviewItem[],
  activities: AdaptiveActivity[],
  now = new Date()
): AdaptiveProfile {
  const titles = new Map<string, string>();
  activities.forEach((activity) => activity.concepts.forEach((concept) => titles.set(concept.id, concept.title)));
  const reviewByConcept = new Map(reviewItems.map((item) => [item.conceptId, normalizeReviewItem(item)]));
  const grouped = new Map<string, QuestionAttempt[]>();
  independentAttempts(attempts).forEach((attempt) => {
    if (!attempt.conceptId) return;
    grouped.set(attempt.conceptId, [...(grouped.get(attempt.conceptId) ?? []), attempt]);
  });
  reviewItems.forEach((item) => {
    if (!grouped.has(item.conceptId)) grouped.set(item.conceptId, []);
  });

  const concepts = [...grouped.entries()].map(([conceptId, conceptAttempts]): ConceptLearningState => {
    const ordered = [...conceptAttempts].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    const weights = ordered.map((attempt) => evidenceWeight(attempt, now));
    const possible = weights.reduce((sum, weight) => sum + weight, 0);
    const correctWeight = ordered.reduce((sum, attempt, index) => sum + (attempt.correct ? weights[index] : 0), 0);
    const accuracy = possible ? correctWeight / possible : 0;
    const distinctQuestions = new Set(ordered.map((attempt) => attempt.questionId)).size;
    const independentDays = new Set(ordered.map((attempt) => dayKey(attempt.answeredAt))).size;
    const breadth = clamp(distinctQuestions / 3);
    const spacing = clamp(independentDays / 3);
    const review = reviewByConcept.get(conceptId);
    const retention = review ? estimateRetention(review, now) : accuracy;
    const confidence = clamp(ordered.length / 4);
    const masteryEstimate = Math.round(
      (accuracy * 0.4 + retention * 0.25 + breadth * 0.2 + spacing * 0.15) * confidence * 100
    );
    const recurringErrors = ordered.filter((attempt) => !attempt.correct).length;
    const last = ordered.at(-1);
    const due = Boolean(review && review.dueDate <= now.toISOString().slice(0, 10));
    let stage: LearningStage;
    if (!ordered.length) stage = "insufficient-evidence";
    else if (due || (last && !last.correct && recurringErrors >= 2)) stage = "review-needed";
    else if (ordered.length === 1) stage = "first-contact";
    else if (masteryEstimate >= 80 && distinctQuestions >= 2 && independentDays >= 2) stage = "demonstrated";
    else if (masteryEstimate >= 55) stage = "consolidating";
    else stage = "initial-learning";
    const evidenceLabel = ordered.length < 2
      ? "Evidências insuficientes"
      : ordered.length < 4
        ? "Evidência inicial"
        : distinctQuestions < 2 || independentDays < 2
          ? "Evidências em formação"
          : "Evidências consistentes";
    return {
      conceptId,
      title: titles.get(conceptId) ?? conceptId,
      stage,
      masteryEstimate,
      evidenceCount: ordered.length,
      distinctQuestions,
      independentDays,
      checkpointEvidence: ordered.filter((attempt) => attempt.mode === "checkpoint").length,
      reviewEvidence: ordered.filter((attempt) => attempt.mode === "review").length,
      recurringErrors,
      retentionEstimate: review ? Math.round(retention * 100) : undefined,
      lastPracticedAt: last?.answeredAt,
      evidenceLabel
    };
  });

  return {
    generatedAt: now.toISOString(),
    concepts,
    strengths: concepts.filter((item) => item.stage === "demonstrated").sort((a, b) => b.masteryEstimate - a.masteryEstimate),
    difficulties: concepts.filter((item) => item.stage === "review-needed" || item.recurringErrors >= 2)
      .sort((a, b) => b.recurringErrors - a.recurringErrors || a.masteryEstimate - b.masteryEstimate),
    insufficientEvidence: !concepts.some((item) => item.evidenceCount >= 2)
  };
}

function stageIsReady(state: ConceptLearningState | undefined) {
  return state?.stage === "demonstrated" || (state?.stage === "consolidating" && state.masteryEstimate >= 65);
}

export function recommendAdaptiveNext(input: AdaptiveEngineInput) {
  const now = input.now ?? new Date();
  const profile = buildAdaptiveProfile(input.attempts, input.reviewItems, input.activities, now);
  const states = new Map(profile.concepts.map((item) => [item.conceptId, item]));
  const ignored = new Set(input.ignoredRecommendationIds ?? []);
  const recent = new Set(input.recentRecommendationIds ?? []);
  const recommendations: AdaptiveRecommendation[] = [];
  const today = now.toISOString().slice(0, 10);
  const activityForConcept = (conceptId: string) =>
    input.activities.find((activity) => activity.accessible && activity.concepts.some((concept) => concept.id === conceptId));

  input.reviewItems
    .map(normalizeReviewItem)
    .filter((item) => item.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)
    .forEach((item) => {
      const state = states.get(item.conceptId);
      recommendations.push({
        id: "review:" + item.conceptId,
        kind: "review",
        title: "Revisar " + (state?.title ?? item.conceptId),
        reason: item.dueDate < today
          ? "Recomendado porque esta revisão está atrasada e a retenção estimada diminuiu."
          : "Recomendado porque este conceito chegou ao momento programado de revisão.",
        priority: item.dueDate < today ? 100 : 92,
        conceptId: item.conceptId,
        estimatedMinutes: 3
      });
    });

  profile.difficulties.slice(0, 4).forEach((state) => {
    const activity = activityForConcept(state.conceptId);
    if (!activity) return;
    recommendations.push({
      id: "reinforce:" + state.conceptId + ":" + activity.id,
      kind: "reinforcement",
      title: "Reforçar " + state.title,
      reason: "Recomendado porque houve dificuldade recorrente em oportunidades independentes.",
      priority: 82 + Math.min(8, state.recurringErrors),
      conceptId: state.conceptId,
      activityId: activity.id,
      activityKind: activity.kind,
      estimatedMinutes: activity.estimatedMinutes
    });
  });

  const nextActivities = input.activities.filter((activity) => activity.accessible && !activity.completed);
  const candidate = nextActivities.sort((a, b) => a.order - b.order)[0];
  if (candidate) {
    const unmet = candidate.concepts.flatMap((concept) => input.prerequisites?.[concept.id] ?? [])
      .find((conceptId) => !stageIsReady(states.get(conceptId)));
    if (unmet) {
      const prerequisiteActivity = activityForConcept(unmet);
      if (prerequisiteActivity && !prerequisiteActivity.completed) {
        recommendations.push({
          id: "prerequisite:" + unmet + ":" + prerequisiteActivity.id,
          kind: "prerequisite",
          title: "Preparar " + (states.get(unmet)?.title ?? prerequisiteActivity.concepts.find((item) => item.id === unmet)?.title ?? unmet),
          reason: "Recomendado porque este conceito é um pré-requisito curricular explícito para o próximo conteúdo.",
          priority: 78,
          conceptId: unmet,
          activityId: prerequisiteActivity.id,
          activityKind: prerequisiteActivity.kind,
          estimatedMinutes: prerequisiteActivity.estimatedMinutes
        });
      }
    }
    recommendations.push({
      id: "continue:" + candidate.kind + ":" + candidate.id,
      kind: candidate.kind === "deepen" ? "deepen" : "continue",
      title: "Continuar " + candidate.title,
      reason: input.declaredLevel === "beginner"
        ? "Próximo conteúdo disponível, preservando a progressão introdutória da trilha."
        : input.goal === "deepen" && candidate.kind === "deepen"
          ? "Compatível com seu objetivo explícito de aprofundamento."
          : "Próxima atividade disponível na progressão que você escolheu.",
      priority: input.goal === "deepen" && candidate.kind === "deepen" ? 76 : 70,
      activityId: candidate.id,
      activityKind: candidate.kind,
      estimatedMinutes: candidate.estimatedMinutes
    });
  }

  const seenAreas = new Set<AdaptiveArea>();
  const selected = recommendations
    .filter((item) => !ignored.has(item.id))
    .sort((a, b) => (b.priority - (recent.has(b.id) ? 18 : 0)) - (a.priority - (recent.has(a.id) ? 18 : 0)))
    .filter((item) => {
      if (!item.activityKind || item.kind === "review") return true;
      if (seenAreas.has(item.activityKind) && recommendations.length > 3) return false;
      seenAreas.add(item.activityKind);
      return true;
    })
    .slice(0, input.limit ?? 4);

  return { profile, recommendations: selected };
}
