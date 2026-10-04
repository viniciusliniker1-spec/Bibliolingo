import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BibleReferencePreview } from "../../components/BibleReferencePreview";
import { ExerciseView } from "../../components/ExerciseView";
import { ProgressBar } from "../../components/ProgressBar";
import { GAMIFICATION } from "../../config/gamification";
import { checkpointPassed } from "../../domain/checkpoint";
import { buildBibleReaderPath } from "../../domain/bibleNavigation";
import {
  getActivity,
  getBookForActivity,
  getUnitForActivity,
  orderedActivityIds
} from "../../content/catalog";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { buildNoahPrompt, launchNoah } from "../../services/noah";
import { useApp } from "../../state/AppContext";
import type {
  BibleReference,
  Checkpoint,
  Exercise,
  LearningStep,
  Lesson
} from "../../types/content";
import type { LessonSummary } from "../../types/progress";

const layerLabels: Record<LearningStep["layer"], string> = {
  "biblical-text": "Texto bíblico",
  history: "Contexto histórico",
  theology: "Interpretação teológica",
  application: "Aplicação"
};

export function LessonPlayer() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const activity = activityId ? getActivity(activityId) : undefined;
  const activityUnit = activityId ? getUnitForActivity(activityId) : undefined;
  const activityBook = activityId ? getBookForActivity(activityId) : undefined;
  const [summary, setSummary] = useState<LessonSummary>();
  const [notice, setNotice] = useState<string>();
  const [previewReference, setPreviewReference] = useState<BibleReference>();
  const [earnedBeforeFinish, setEarnedBeforeFinish] = useState<string[]>([]);
  const isCheckpoint = Boolean(activity && "exercises" in activity);
  const steps = useMemo(
    () => (activity ? ("exercises" in activity ? activity.exercises : activity.steps) : []),
    [activity]
  );
  const initialSession = state.activeSession;
  const storedIndex = initialSession && initialSession.lessonId === activityId ? initialSession.stepIndex : 0;
  const [returnStep] = useState(() => {
    const value = Number(searchParams.get("step"));
    return Number.isInteger(value) && value >= 0 ? value : undefined;
  });
  const initialIndex =
    returnStep !== undefined && returnStep < steps.length ? returnStep : storedIndex;
  const [index, setIndex] = useState(initialIndex);
  const [showIntro, setShowIntro] = useState(
    () => returnStep === undefined && initialSession?.lessonId !== activityId
  );

  useEffect(() => {
    if (!activityId || !activity || showIntro) return;
    dispatch({ type: "START_SESSION", lessonId: activityId });
    if (returnStep !== undefined && returnStep < steps.length) {
      setIndex(returnStep);
      dispatch({ type: "SET_STEP", stepIndex: returnStep });
      navigate("/lesson/" + activityId, { replace: true });
    }
  }, [activityId, activity, dispatch, navigate, returnStep, showIntro, steps.length]);

  useEffect(() => {
    const session = state.activeSession;
    if (!showIntro && session && session.lessonId === activityId) setIndex(session.stepIndex);
  }, [activityId, showIntro, state.activeSession?.lessonId, state.activeSession?.stepIndex]);

  if (!activity || !activityId) {
    return (
      <main className="center-state">
        <div className="brand-mark">?</div>
        <h1>Atividade não encontrada</h1>
        <p>Esta rota não existe ou o conteúdo ainda não foi baixado.</p>
        <button className="primary-button" onClick={() => navigate("/")}>Voltar à jornada</button>
      </main>
    );
  }

  const returnToCurrentStep = "/lesson/" + activityId + "?step=" + index;
  const exercises = steps.filter((step): step is Exercise => step.type !== "learn");
  const introReferences = "references" in activity
    ? activity.references
    : Array.from(
        new Map(activity.exercises.map((exercise) => [exercise.reference.label, exercise.reference])).values()
      );
  const introConceptIds = "conceptIds" in activity
    ? activity.conceptIds
    : Array.from(new Set(activity.exercises.map((exercise) => exercise.conceptId)));
  const introConcepts = activityUnit?.concepts.filter((concept) => introConceptIds.includes(concept.id)) ?? [];
  const maxXp =
    exercises.length * GAMIFICATION.xp.exercise +
    (isCheckpoint
      ? GAMIFICATION.xp.checkpoint
      : GAMIFICATION.xp.lesson + GAMIFICATION.xp.perfectLesson);

  if (showIntro) {
    return (
      <main className="lesson-intro-page">
        <header className="lesson-intro-top">
          <button type="button" className="icon-button" aria-label="Voltar à jornada" onClick={() => navigate("/")}>×</button>
          <span>{activityBook?.title ?? "Jornada"} · {activityUnit?.title}</span>
        </header>
        <section className="lesson-intro-hero">
          <div className={"lesson-intro-icon " + (isCheckpoint ? "checkpoint" : "")} aria-hidden="true">
            {isCheckpoint ? "★" : "▣"}
          </div>
          <p className="eyebrow">{isCheckpoint ? "Desafio da unidade" : "Antes de começar"}</p>
          <h1>{activity.title}</h1>
          <p>{activity.subtitle}</p>
        </section>
        <section className="lesson-intro-stats" aria-label="Resumo da atividade">
          <div><span>◷</span><strong>{"estimatedMinutes" in activity ? activity.estimatedMinutes : 10} min</strong><small>duração</small></div>
          <div><span>◎</span><strong>{exercises.length}</strong><small>questões</small></div>
          <div><span>⚡</span><strong>até {maxXp}</strong><small>XP</small></div>
        </section>
        <section className="lesson-objectives-card">
          <p className="eyebrow">Você vai aprender</p>
          <ul>
            {introConcepts.map((concept) => <li key={concept.id}>{concept.title}</li>)}
            {!introConcepts.length && <li>Integrar os conceitos estudados nesta unidade</li>}
          </ul>
        </section>
        <section className="lesson-references-card">
          <p className="eyebrow">Passagens</p>
          <div>
            {introReferences.map((reference) => (
              <button
                type="button"
                className="reference-chip"
                key={reference.label}
                onClick={() => setPreviewReference(reference)}
              >
                ▣ {reference.label}
              </button>
            ))}
          </div>
        </section>
        <div className="lesson-intro-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setIndex(0);
              dispatch({ type: "START_SESSION", lessonId: activityId });
              setShowIntro(false);
            }}
          >
            {isCheckpoint ? "Começar checkpoint" : "Começar lição"}
          </button>
          <button type="button" className="text-button" onClick={() => navigate("/")}>Agora não</button>
        </div>
        {previewReference && (
          <BibleReferencePreview
            reference={previewReference}
            fullHref={buildBibleReaderPath(previewReference, "/lesson/" + activityId + "?step=0")}
            onClose={() => setPreviewReference(undefined)}
          />
        )}
      </main>
    );
  }

  const moveNext = () => {
    if (index < steps.length - 1) {
      const next = index + 1;
      setIndex(next);
      dispatch({ type: "SET_STEP", stepIndex: next });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const answers = state.activeSession?.answers ?? {};
    const correct = exercises.filter((exercise) => answers[exercise.id]).length;
    const total = exercises.length;
    const accuracy = total ? correct / total : 1;
    const passed = !isCheckpoint || checkpointPassed(correct, total, (activity as Checkpoint).passAccuracy);
    const startedAt = state.activeSession?.startedAt
      ? new Date(state.activeSession.startedAt).getTime()
      : Date.now();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const bonus = passed
      ? isCheckpoint
        ? GAMIFICATION.xp.checkpoint
        : GAMIFICATION.xp.lesson + (accuracy === 1 ? GAMIFICATION.xp.perfectLesson : 0)
      : 0;
    const masteredConceptIds = Array.from(
      new Set(exercises.filter((exercise) => answers[exercise.id]).map((exercise) => exercise.conceptId))
    );
    const reviewConceptIds = Array.from(
      new Set(exercises.filter((exercise) => !answers[exercise.id]).map((exercise) => exercise.conceptId))
    );

    setEarnedBeforeFinish(state.earnedAchievementIds);
    dispatch({
      type: "FINISH",
      lessonId: activityId,
      checkpoint: isCheckpoint,
      perfect: accuracy === 1,
      passed,
      durationSeconds
    });
    setSummary({
      lessonId: activityId,
      accuracy,
      correct,
      total,
      xpEarned: total * GAMIFICATION.xp.exercise + bonus,
      durationSeconds,
      isCheckpoint,
      masteredConceptIds,
      reviewConceptIds
    });
  };

  if (summary) {
    const passed = !summary.isCheckpoint || summary.accuracy >= (activity as Checkpoint).passAccuracy;
    const activityIndex = orderedActivityIds.indexOf(activityId);
    const nextId =
      activityIndex >= 0 && activityIndex < orderedActivityIds.length - 1
        ? orderedActivityIds[activityIndex + 1]
        : undefined;
    const nextActivity = nextId ? getActivity(nextId) : undefined;
    const nextUnit = nextId ? getUnitForActivity(nextId) : undefined;
    const nextBook = nextId ? getBookForActivity(nextId) : undefined;
    const conceptTitle = (conceptId: string) =>
      activityUnit?.concepts.find((concept) => concept.id === conceptId)?.title ?? conceptId;
    const newAchievement = state.earnedAchievementIds
      .filter((id) => !earnedBeforeFinish.includes(id))
      .map((id) => ACHIEVEMENTS.find((achievement) => achievement.id === id))
      .find(Boolean);

    return (
      <main className="completion-page">
        <div className={"completion-burst " + (passed ? "" : "retry")} aria-hidden="true">{passed ? "★" : "↻"}</div>
        <p className="eyebrow">{summary.isCheckpoint ? "Resultado do checkpoint" : "Lição concluída"}</p>
        <h1>{passed ? "Muito bem!" : "Quase lá"}</h1>
        <p>{passed ? "Você avançou com compreensão, não apenas com respostas." : "Revise os conceitos indicados e tente novamente."}</p>
        <div className="summary-grid">
          <div><span>⚡</span><strong>+{summary.xpEarned} XP</strong><small>experiência</small></div>
          <div><span>◎</span><strong>{Math.round(summary.accuracy * 100)}%</strong><small>precisão</small></div>
          <div><span>◷</span><strong>{Math.max(1, Math.round(summary.durationSeconds / 60))} min</strong><small>tempo</small></div>
          <div><span>🔥</span><strong>{state.streak || 1}</strong><small>sequência</small></div>
        </div>

        <section className="concept-results">
          <div>
            <p className="eyebrow">Conceitos demonstrados</p>
            <div className="concept-chip-list">
              {summary.masteredConceptIds.map((id) => <span className="concept-chip mastered" key={id}>✓ {conceptTitle(id)}</span>)}
              {!summary.masteredConceptIds.length && <span className="concept-chip neutral">Continue praticando</span>}
            </div>
          </div>
          {summary.reviewConceptIds.length > 0 && (
            <div>
              <p className="eyebrow">Para revisar</p>
              <div className="concept-chip-list">
                {summary.reviewConceptIds.map((id) => <span className="concept-chip review" key={id}>↻ {conceptTitle(id)}</span>)}
              </div>
            </div>
          )}
        </section>

        {newAchievement && (
          <section className="achievement-unlocked" aria-live="polite">
            <span aria-hidden="true">{newAchievement.icon}</span>
            <div><p className="eyebrow">Conquista desbloqueada</p><strong>{newAchievement.title}</strong><small>{newAchievement.description}</small></div>
          </section>
        )}

        {passed && nextActivity && (
          <section className="next-lesson-card">
            <div>
              <p className="eyebrow">Próximo passo · {nextBook?.title}</p>
              <h2>{nextActivity.title}</h2>
              <p>{nextUnit?.title} · {nextActivity.subtitle}</p>
            </div>
            <span aria-hidden="true">→</span>
          </section>
        )}

        {passed ? (
          <button className="primary-button" onClick={() => navigate(nextId ? "/lesson/" + nextId : "/")}>
            {nextId ? "Começar próximo passo" : "Voltar à jornada"}
          </button>
        ) : (
          <button
            className="primary-button"
            onClick={() => {
              setSummary(undefined);
              setIndex(0);
              dispatch({ type: "START_SESSION", lessonId: activityId });
            }}
          >
            Refazer checkpoint
          </button>
        )}
        {summary.reviewConceptIds.length > 0 && (
          <button className="secondary-button" onClick={() => navigate("/study")}>Revisar erros</button>
        )}
        <button className="text-button" onClick={() => navigate("/")}>Ver jornada</button>
      </main>
    );
  }

  const current = steps[index];
  const progress = (index + 1) / steps.length;
  const title = activity.title;
  const currentReference =
    current?.type === "learn"
      ? current.reference
      : (current as Exercise | undefined)?.reference;
  const currentReferenceHref = currentReference
    ? buildBibleReaderPath(currentReference, returnToCurrentStep)
    : undefined;

  const askNoah = async () => {
    const prompt = buildNoahPrompt("deepen", {
      title,
      reference: currentReference?.label ?? ("references" in activity ? activity.references[0]?.label : activityUnit?.subtitle ?? activityBook?.title ?? "Bíblia"),
      exercise: current?.type !== "learn" ? (current as Exercise) : undefined
    });
    try {
      await launchNoah(prompt);
      dispatch({ type: "PROMPT", promptType: "deepen" });
      setNotice("Prompt copiado. Noah foi aberto em outra aba.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível abrir Noah.");
    }
  };

  if (state.settings.heartsEnabled && state.hearts === 0 && current?.type !== "learn") {
    return (
      <main className="center-state">
        <div className="heart-empty" aria-hidden="true">♥</div>
        <h1>Hora de fortalecer</h1>
        <p>Faça uma revisão para recuperar corações e continuar sem bloqueio permanente.</p>
        <button className="primary-button" onClick={() => navigate("/study")}>Recuperar na revisão</button>
        <button className="text-button" onClick={() => navigate("/")}>Voltar</button>
      </main>
    );
  }

  return (
    <main className="lesson-page">
      <header className="lesson-topbar">
        <button type="button" className="icon-button" aria-label="Sair da lição" onClick={() => navigate("/")}>×</button>
        <ProgressBar value={progress} label="Progresso da lição" />
        <div className="heart-counter" aria-label={state.hearts + " corações"}>♥ {state.settings.heartsEnabled ? state.hearts : "∞"}</div>
      </header>

      <div className="lesson-context">
        <span>{isCheckpoint
          ? "Checkpoint · " + (activityUnit?.title ?? activityBook?.title ?? "Jornada")
          : (activityBook?.title ?? "Bíblia") + " · " + (activityUnit?.title ?? "Jornada")}</span>
        <strong>{title}</strong>
      </div>

      {current?.type === "learn" ? (
        <section className="learn-card">
          <div className={"layer-badge " + current.layer}>{layerLabels[current.layer]}</div>
          <h1>{current.title}</h1>
          <p>{current.body}</p>
          {current.keyPoints && (
            <ul>{current.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
          )}
          {current.reference && currentReferenceHref && (
            <button type="button" className="reference reference-link" onClick={() => setPreviewReference(current.reference)}>
              <span aria-hidden="true">▣</span>
              <span>{current.reference.label}</span>
              <small>Ler sem sair →</small>
            </button>
          )}
          <button type="button" className="noah-inline" onClick={askNoah}>✦ Estudar com Noah</button>
          <button type="button" className="primary-button sticky-action" onClick={moveNext}>Entendi</button>
        </section>
      ) : current ? (
        <ExerciseView
          exercise={current as Exercise}
          result={state.activeSession?.answers[(current as Exercise).id]}
          onAnswer={(correct) =>
            dispatch({
              type: "ANSWER",
              questionId: (current as Exercise).id,
              lessonId: activityId,
              conceptId: (current as Exercise).conceptId,
              difficulty: (current as Exercise).difficulty,
              correct,
              mode: isCheckpoint ? "checkpoint" : "lesson"
            })
          }
          onContinue={moveNext}
          continueLabel={index === steps.length - 1 ? "Ver resultado" : "Continuar"}
          referenceHref={currentReferenceHref}
          onPreviewReference={() => currentReference && setPreviewReference(currentReference)}
          soundEnabled={state.settings.soundEnabled}
          hapticsEnabled={state.settings.hapticsEnabled}
        />
      ) : null}

      {previewReference && (
        <BibleReferencePreview
          reference={previewReference}
          fullHref={buildBibleReaderPath(previewReference, returnToCurrentStep)}
          onClose={() => setPreviewReference(undefined)}
        />
      )}
      {notice && <div className="toast" role="status" onAnimationEnd={() => setNotice(undefined)}>{notice}</div>}
    </main>
  );
}
