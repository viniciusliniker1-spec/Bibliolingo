import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BibleReferencePreview } from "../../components/BibleReferencePreview";
import { ExerciseView } from "../../components/ExerciseView";
import { buildLearningProfile, contextualNoahEnabled, exerciseOptions, type ExerciseAnswerDetails } from "../../domain/noahLearning";
import { ProgressBar } from "../../components/ProgressBar";
import { NoahTutor, type NoahTutorTrigger } from "../noah/NoahTutor";
import type { NoahContext } from "../../services/noahRemote";
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
import { playFeedbackSound } from "../../services/feedbackSound";
import { useApp } from "../../state/AppContext";
import type {
  BibleReference,
  Checkpoint,
  Exercise,
  LearningStep,
  Lesson
} from "../../types/content";
import type { LessonSummary } from "../../types/progress";

function lessonPath(
  activityId: string,
  mode: "canonical" | "individual",
  bookId?: string,
  step?: number
) {
  const params = new URLSearchParams();
  if (mode === "individual" && bookId) {
    params.set("mode", "individual");
    params.set("book", bookId);
  }
  if (step !== undefined) params.set("step", String(step));
  const query = params.toString();
  return "/lesson/" + activityId + (query ? "?" + query : "");
}

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
  const individualMode =
    searchParams.get("mode") === "individual" &&
    Boolean(activityBook) &&
    searchParams.get("book") === activityBook?.id;
  const studyMode = individualMode ? "individual" : "canonical";
  const journeyBookId = individualMode ? activityBook?.id : undefined;
  const bookActivityIds =
    activityBook?.units.flatMap((unit) => [
      ...unit.lessons.map((lesson) => lesson.id),
      unit.checkpoint.id
    ]) ?? [];
  const returnPath = individualMode && activityBook
    ? "/?mode=individual&book=" + encodeURIComponent(activityBook.id)
    : "/";
  const [summary, setSummary] = useState<LessonSummary>();
  const [previewReference, setPreviewReference] = useState<BibleReference>();
  const [earnedBeforeFinish, setEarnedBeforeFinish] = useState<string[]>([]);
  const [noahTrigger, setNoahTrigger] = useState<NoahTutorTrigger>();
  const [lastAnswerDetails, setLastAnswerDetails] = useState<ExerciseAnswerDetails>();
  const contextualTutor = contextualNoahEnabled();
  const isCheckpoint = Boolean(activity && "exercises" in activity);
  const steps = useMemo(
    () => (activity ? ("exercises" in activity ? activity.exercises : activity.steps) : []),
    [activity]
  );
  const initialSession = state.activeSession;
  const sessionMatchesContext = Boolean(
    initialSession &&
      initialSession.lessonId === activityId &&
      (initialSession.journeyMode ?? "canonical") === studyMode &&
      initialSession.journeyBookId === journeyBookId
  );
  const storedIndex = sessionMatchesContext && initialSession ? initialSession.stepIndex : 0;
  const [returnStep] = useState(() => {
    const value = Number(searchParams.get("step"));
    return Number.isInteger(value) && value >= 0 ? value : undefined;
  });
  const initialIndex =
    returnStep !== undefined && returnStep < steps.length ? returnStep : storedIndex;
  const [index, setIndex] = useState(initialIndex);
  const [showIntro, setShowIntro] = useState(
    () => returnStep === undefined && !sessionMatchesContext
  );

  useEffect(() => {
    if (!activityId || !activity || showIntro) return;
    dispatch({
      type: "START_SESSION",
      lessonId: activityId,
      journeyMode: studyMode,
      journeyBookId
    });
    if (returnStep !== undefined && returnStep < steps.length) {
      setIndex(returnStep);
      dispatch({ type: "SET_STEP", stepIndex: returnStep });
      navigate(lessonPath(activityId, studyMode, journeyBookId), { replace: true });
    }
  }, [
    activityId,
    activity,
    dispatch,
    journeyBookId,
    navigate,
    returnStep,
    showIntro,
    steps.length,
    studyMode
  ]);

  useEffect(() => {
    const session = state.activeSession;
    if (!showIntro && session && session.lessonId === activityId) setIndex(session.stepIndex);
  }, [activityId, showIntro, state.activeSession?.lessonId, state.activeSession?.stepIndex]);

  useEffect(() => {
    setNoahTrigger(undefined);
    setLastAnswerDetails(undefined);
  }, [activityId, index]);

  if (!activity || !activityId) {
    return (
      <main className="center-state">
        <div className="brand-mark">?</div>
        <h1>Atividade não encontrada</h1>
        <p>Esta rota não existe ou o conteúdo ainda não foi baixado.</p>
        <button className="primary-button" onClick={() => navigate(returnPath)}>Voltar à jornada</button>
      </main>
    );
  }

  const returnToCurrentStep = lessonPath(activityId, studyMode, journeyBookId, index);
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
          <button type="button" className="icon-button" aria-label="Voltar à jornada" onClick={() => navigate(returnPath)}>×</button>
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
        {"study" in activity && activity.study && (
          <button type="button" className="secondary-button" onClick={() => navigate("/study?lesson=" + activity.id)}>
            Abrir estudo completo
          </button>
        )}
        <div className="lesson-intro-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setIndex(0);
              dispatch({
                type: "START_SESSION",
                lessonId: activityId,
                journeyMode: studyMode,
                journeyBookId
              });
              setShowIntro(false);
            }}
          >
            {isCheckpoint ? "Começar checkpoint" : "Começar lição"}
          </button>
          <button type="button" className="text-button" onClick={() => navigate(returnPath)}>Agora não</button>
        </div>
        {previewReference && (
          <BibleReferencePreview
            reference={previewReference}
            fullHref={buildBibleReaderPath(
              previewReference,
              lessonPath(activityId, studyMode, journeyBookId, 0)
            )}
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
    if (passed && state.settings.soundEnabled) {
      void playFeedbackSound("achievement");
    }
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
    const activitySequence = individualMode ? bookActivityIds : orderedActivityIds;
    const activityIndex = activitySequence.indexOf(activityId);
    const nextId =
      activityIndex >= 0 && activityIndex < activitySequence.length - 1
        ? activitySequence[activityIndex + 1]
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

    const startNextActivity = () => {
      if (!nextId) {
        navigate(returnPath);
        return;
      }
      setSummary(undefined);
      setIndex(0);
      setShowIntro(false);
      setEarnedBeforeFinish([]);
      setPreviewReference(undefined);
      dispatch({
        type: "START_SESSION",
        lessonId: nextId,
        journeyMode: studyMode,
        journeyBookId
      });
      navigate(lessonPath(nextId, studyMode, journeyBookId));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
          <button className="primary-button" onClick={startNextActivity}>
            {nextId ? "Começar próximo passo" : individualMode ? "Voltar ao livro" : "Voltar à jornada"}
          </button>
        ) : (
          <button
            className="primary-button"
            onClick={() => {
              setSummary(undefined);
              setIndex(0);
              dispatch({
                type: "START_SESSION",
                lessonId: activityId,
                journeyMode: studyMode,
                journeyBookId
              });
            }}
          >
            Refazer checkpoint
          </button>
        )}
        {summary.reviewConceptIds.length > 0 && (
          <button className="secondary-button" onClick={() => navigate("/study")}>Revisar erros</button>
        )}
        <button className="text-button" onClick={() => navigate(returnPath)}>
          {individualMode ? "Ver livro" : "Ver jornada"}
        </button>
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
  const currentExercise = current && current.type !== "learn" ? (current as Exercise) : undefined;
  const reviewedSources =
    activityUnit?.sources
      .filter((source) => !current || !("sourceIds" in current) || !current.sourceIds?.length || current.sourceIds.includes(source.id))
      .map((source) =>
        [source.title, source.author ?? source.institution, source.license, source.status]
          .filter(Boolean)
          .join(" · ")
      )
      .slice(0, 6) ?? [];
  const sourceStatus =
    activityUnit?.sources.some((source) => source.status === "reviewed" || source.status === "incorporated")
      ? "reviewed"
      : "pending";
  const noahContext: NoahContext = {
    area: "bible",
    title,
    objective: currentExercise?.objective,
    reference: currentReference?.label,
    content: current?.type === "learn" ? current.body : undefined,
    currentQuestion: currentExercise?.prompt,
    options: currentExercise ? exerciseOptions(currentExercise) : undefined,
    answerStatus:
      currentExercise && typeof state.activeSession?.answers[currentExercise.id] === "boolean"
        ? state.activeSession.answers[currentExercise.id]
          ? "correct"
          : "incorrect"
        : "unanswered",
    difficulty: currentExercise?.difficulty,
    conceptId: currentExercise?.conceptId,
    lessonId: activityId,
    questionId: currentExercise?.id,
    learningProfile: buildLearningProfile(state, currentExercise?.conceptId),
    sources: reviewedSources,
    editorialStatus: sourceStatus
  };

  if (state.settings.heartsEnabled && state.hearts === 0 && current?.type !== "learn") {
    return (
      <main className="center-state">
        <div className="heart-empty" aria-hidden="true">♥</div>
        <h1>Hora de fortalecer</h1>
        <p>Faça uma revisão para recuperar corações e continuar sem bloqueio permanente.</p>
        <button className="primary-button" onClick={() => navigate("/study")}>Recuperar na revisão</button>
        <button className="text-button" onClick={() => navigate(returnPath)}>Voltar</button>
      </main>
    );
  }

  return (
    <main className="lesson-page">
      <header className="lesson-topbar">
        <button type="button" className="icon-button" aria-label="Sair da lição" onClick={() => navigate(returnPath)}>×</button>
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
          <button type="button" className="primary-button sticky-action" onClick={moveNext}>Entendi</button>
        </section>
      ) : current ? (
        <ExerciseView
          exercise={current as Exercise}
          result={state.activeSession?.answers[(current as Exercise).id]}
          onAnswer={(correct, details) => {
            const exercise = current as Exercise;
            setLastAnswerDetails(details);
            dispatch({
              type: "ANSWER",
              questionId: exercise.id,
              lessonId: activityId,
              conceptId: exercise.conceptId,
              difficulty: exercise.difficulty,
              correct,
              mode: isCheckpoint ? "checkpoint" : "lesson"
            });

          }}
          onContinue={moveNext}
          continueLabel={index === steps.length - 1 ? "Ver resultado" : "Continuar"}
          referenceHref={currentReferenceHref}
          onPreviewReference={() => currentReference && setPreviewReference(currentReference)}
          soundEnabled={state.settings.soundEnabled}
          hapticsEnabled={state.settings.hapticsEnabled}
          onAskNoah={
            contextualTutor
              ? () => {
                  const exercise = current as Exercise;
                  setNoahTrigger({
                    id: exercise.id + "-hint-" + Date.now(),
                    mode: "practice",
                    reason: "hint",
                    autoSend: true,
                    question:
                      "Dê uma pista progressiva para eu raciocinar sobre esta questão. Não revele nem indique diretamente a alternativa correta.",
                    context: { ...noahContext, answerStatus: "unanswered", content: undefined }
                  });
                }
              : undefined
          }
          onUnderstandMore={
            contextualTutor
              ? () => {
                  const exercise = current as Exercise;
                  const wasCorrect = state.activeSession?.answers[exercise.id] === true;
                  setNoahTrigger({
                    id: exercise.id + "-understand-" + Date.now(),
                    mode: wasCorrect ? "deepen" : "error",
                    reason: wasCorrect ? "correct" : "incorrect",
                    autoSend: true,
                    question: wasCorrect
                      ? "Aprofunde brevemente por que esta resposta está correta e como ela se relaciona ao contexto bíblico."
                      : "Explique por que minha resposta está incorreta. Considere a frase ou alternativa completa que montei, o gabarito e a explicação editorial.",
                    context: {
                      ...noahContext,
                      content: exercise.explanation,
                      selectedAnswer: lastAnswerDetails?.selectedAnswer,
                      correctAnswer: lastAnswerDetails?.correctAnswer,
                      answerStatus: wasCorrect ? "correct" : "incorrect"
                    }
                  });
                }
              : undefined
          }
        />
      ) : null}

      {previewReference && (
        <BibleReferencePreview
          reference={previewReference}
          fullHref={buildBibleReaderPath(previewReference, returnToCurrentStep)}
          onClose={() => setPreviewReference(undefined)}
        />
      )}
      <NoahTutor
        hideLauncher
        context={noahContext}
        contextKey={activityId + ":" + (current?.id ?? index)}
        trigger={contextualTutor ? noahTrigger : undefined}
        onContinueLesson={contextualTutor ? () => setNoahTrigger(undefined) : undefined}
      />
    </main>
  );
}
