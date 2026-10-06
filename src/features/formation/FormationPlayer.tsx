import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ExerciseView } from "../../components/ExerciseView";
import { ProgressBar } from "../../components/ProgressBar";
import { GAMIFICATION } from "../../config/gamification";
import {
  formationActivityTitle,
  formationContent,
  formationLessonById,
  formationQuestionToExercise,
  formationQuestionsForActivity,
  formationReference,
  formationSubjectForActivity,
  orderedFormationActivityIds
} from "../../content/formation/catalog";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { buildBibleReaderPath } from "../../domain/bibleNavigation";
import { checkpointPassed } from "../../domain/checkpoint";
import { playFeedbackSound } from "../../services/feedbackSound";
import { useApp } from "../../state/AppContext";
import type { Exercise } from "../../types/content";
import type { LessonSummary } from "../../types/progress";

export function FormationPlayer() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const lesson = activityId ? formationLessonById.get(activityId) : undefined;
  const questions = useMemo(
    () => (activityId ? formationQuestionsForActivity(activityId) : []),
    [activityId]
  );
  const subject = activityId ? formationSubjectForActivity(activityId) : undefined;
  const isExam = Boolean(activityId && !lesson && questions.length);
  const exercises = useMemo(
    () =>
      questions.map((question) => {
        const owner = formationLessonById.get(question.lessonId);
        return owner ? formationQuestionToExercise(question, owner, isExam) : undefined;
      }).filter((exercise): exercise is Exercise => Boolean(exercise)),
    [isExam, questions]
  );
  const teachingCount = lesson ? 3 : 0;
  const totalSteps = teachingCount + exercises.length;
  const returnStep = Number(searchParams.get("step"));
  const requestedStep = Number.isInteger(returnStep) && returnStep >= 0 && returnStep < totalSteps
    ? returnStep
    : undefined;
  const storedIndex =
    state.activeSession?.lessonId === activityId ? state.activeSession.stepIndex : 0;
  const [index, setIndex] = useState(requestedStep ?? storedIndex);
  const [showIntro, setShowIntro] = useState(
    () => requestedStep === undefined && state.activeSession?.lessonId !== activityId
  );
  const [summary, setSummary] = useState<LessonSummary>();
  const [earnedBeforeFinish, setEarnedBeforeFinish] = useState<string[]>([]);

  useEffect(() => {
    if (!activityId || !totalSteps || showIntro) return;
    dispatch({ type: "START_SESSION", lessonId: activityId });
    if (requestedStep !== undefined) {
      setIndex(requestedStep);
      dispatch({ type: "SET_STEP", stepIndex: requestedStep });
      navigate("/formation/activity/" + activityId, { replace: true });
    }
  }, [activityId, dispatch, navigate, requestedStep, showIntro, totalSteps]);

  useEffect(() => {
    if (
      !showIntro &&
      state.activeSession?.lessonId === activityId &&
      state.activeSession.stepIndex < totalSteps
    ) {
      setIndex(state.activeSession.stepIndex);
    }
  }, [activityId, showIntro, state.activeSession?.lessonId, state.activeSession?.stepIndex, totalSteps]);

  if (!activityId || (!lesson && !isExam)) {
    return (
      <main className="center-state">
        <div className="brand-mark">?</div>
        <h1>Atividade não encontrada</h1>
        <p>Esta etapa não existe na Formação Pastoral.</p>
        <button className="primary-button" onClick={() => navigate("/formation")}>Voltar à formação</button>
      </main>
    );
  }

  const title = formationActivityTitle(activityId);
  const maxXp =
    exercises.length * GAMIFICATION.xp.exercise +
    (isExam ? GAMIFICATION.xp.checkpoint : GAMIFICATION.xp.lesson + GAMIFICATION.xp.perfectLesson);

  if (showIntro) {
    return (
      <main className="lesson-intro-page formation-intro-page">
        <header className="lesson-intro-top">
          <button type="button" className="icon-button" aria-label="Voltar à formação" onClick={() => navigate("/formation")}>×</button>
          <span>Formação Pastoral · {subject?.shortTitle ?? "Simulado final"}</span>
        </header>
        <section className="lesson-intro-hero">
          <div className={"lesson-intro-icon " + (isExam ? "checkpoint" : "")} aria-hidden="true">{isExam ? "★" : subject?.icon ?? "N"}</div>
          <p className="eyebrow">{isExam ? "Avaliação objetiva" : "Antes de começar"}</p>
          <h1>{title}</h1>
          <p>{isExam ? "Demonstre domínio do conteúdo estudado. A aprovação pedagógica exige 80%." : subject?.description}</p>
        </section>
        <section className="lesson-intro-stats" aria-label="Resumo da atividade">
          <div><span>◷</span><strong>{lesson?.minutes ?? Math.max(10, Math.ceil(exercises.length * 0.75))} min</strong><small>duração</small></div>
          <div><span>◎</span><strong>{exercises.length}</strong><small>questões</small></div>
          <div><span>⚡</span><strong>até {maxXp}</strong><small>XP</small></div>
        </section>
        {lesson && (
          <section className="lesson-references-card">
            <p className="eyebrow">Passagens para consultar</p>
            <div>{lesson.bibleReferences.map((reference) => <span className="reference-chip" key={reference}>▣ {reference}</span>)}</div>
          </section>
        )}
        {isExam && <aside className="formation-disclaimer compact" role="note"><span aria-hidden="true">i</span><p>A nota é um critério de aprendizagem do aplicativo e não representa resultado de banca ministerial.</p></aside>}
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
            {isExam ? "Começar avaliação" : "Começar lição"}
          </button>
          <button type="button" className="text-button" onClick={() => navigate("/formation")}>Agora não</button>
        </div>
      </main>
    );
  }

  const finish = () => {
    const answers = state.activeSession?.answers ?? {};
    const correct = exercises.filter((exercise) => answers[exercise.id]).length;
    const total = exercises.length;
    const accuracy = total ? correct / total : 1;
    const passed = !isExam || checkpointPassed(correct, total, formationContent.passAccuracy);
    const startedAt = state.activeSession?.startedAt
      ? new Date(state.activeSession.startedAt).getTime()
      : Date.now();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const bonus = passed
      ? isExam
        ? GAMIFICATION.xp.checkpoint
        : GAMIFICATION.xp.lesson + (accuracy === 1 ? GAMIFICATION.xp.perfectLesson : 0)
      : 0;

    setEarnedBeforeFinish(state.earnedAchievementIds);
    dispatch({
      type: "FINISH",
      lessonId: activityId,
      checkpoint: isExam,
      perfect: accuracy === 1,
      passed,
      durationSeconds
    });
    if (passed && state.settings.soundEnabled) void playFeedbackSound("achievement");
    setSummary({
      lessonId: activityId,
      accuracy,
      correct,
      total,
      xpEarned: total * GAMIFICATION.xp.exercise + bonus,
      durationSeconds,
      isCheckpoint: isExam,
      masteredConceptIds: correct ? [lesson?.id ?? subject?.id ?? "formacao"] : [],
      reviewConceptIds: accuracy < 1 ? [lesson?.id ?? subject?.id ?? "formacao"] : []
    });
  };

  const moveNext = () => {
    if (index < totalSteps - 1) {
      const next = index + 1;
      setIndex(next);
      dispatch({ type: "SET_STEP", stepIndex: next });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    finish();
  };

  if (summary) {
    const passed = !isExam || summary.accuracy >= formationContent.passAccuracy;
    const activityIndex = orderedFormationActivityIds.indexOf(activityId);
    const nextId =
      activityIndex >= 0 && activityIndex < orderedFormationActivityIds.length - 1
        ? orderedFormationActivityIds[activityIndex + 1]
        : undefined;
    const newAchievement = state.earnedAchievementIds
      .filter((id) => !earnedBeforeFinish.includes(id))
      .map((id) => ACHIEVEMENTS.find((achievement) => achievement.id === id))
      .find(Boolean);

    const startNext = () => {
      if (!nextId) {
        navigate("/formation");
        return;
      }
      setSummary(undefined);
      setIndex(0);
      setShowIntro(false);
      setEarnedBeforeFinish([]);
      dispatch({ type: "START_SESSION", lessonId: nextId });
      navigate("/formation/activity/" + nextId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <main className="completion-page formation-completion-page">
        <div className={"completion-burst " + (passed ? "" : "retry")} aria-hidden="true">{passed ? "★" : "↻"}</div>
        <p className="eyebrow">{isExam ? "Resultado da avaliação" : "Lição concluída"}</p>
        <h1>{passed ? "Etapa conquistada!" : "Revise e tente novamente"}</h1>
        <p>{passed ? "Você avançou na Formação Pastoral com compreensão." : "O critério pedagógico é 80%. Releia as explicações antes da nova tentativa."}</p>
        <div className="summary-grid">
          <div><span>⚡</span><strong>+{summary.xpEarned} XP</strong><small>experiência</small></div>
          <div><span>◎</span><strong>{Math.round(summary.accuracy * 100)}%</strong><small>precisão</small></div>
          <div><span>✓</span><strong>{summary.correct}/{summary.total}</strong><small>acertos</small></div>
          <div><span>🔥</span><strong>{state.streak || 1}</strong><small>sequência</small></div>
        </div>
        {newAchievement && (
          <section className="achievement-unlocked" aria-live="polite">
            <span aria-hidden="true">{newAchievement.icon}</span>
            <div><p className="eyebrow">Conquista desbloqueada</p><strong>{newAchievement.title}</strong><small>{newAchievement.description}</small></div>
          </section>
        )}
        {passed ? (
          <button type="button" className="primary-button" onClick={startNext}>
            {nextId ? "Começar próximo passo" : "Voltar à formação"}
          </button>
        ) : (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setSummary(undefined);
              setIndex(0);
              dispatch({ type: "START_SESSION", lessonId: activityId });
            }}
          >
            Refazer avaliação
          </button>
        )}
        <button type="button" className="text-button" onClick={() => navigate("/formation")}>Ver Formação Pastoral</button>
      </main>
    );
  }

  const exerciseIndex = index - teachingCount;
  const currentExercise = exerciseIndex >= 0 ? exercises[exerciseIndex] : undefined;
  const ownerLesson = currentExercise
    ? formationLessonById.get(questions[exerciseIndex]?.lessonId)
    : lesson;
  const returnPath = "/formation/activity/" + activityId + "?step=" + index;
  const referencePath = currentExercise
    ? buildBibleReaderPath(currentExercise.reference, returnPath)
    : undefined;

  return (
    <main className="lesson-page formation-player-page">
      <header className="lesson-topbar">
        <button type="button" className="icon-button" aria-label="Sair da atividade" onClick={() => navigate("/formation")}>×</button>
        <ProgressBar value={index + 1} max={totalSteps} label="Progresso da atividade" />
        <div className="heart-counter" aria-label={state.xp + " pontos de experiência"}>⚡ {state.xp}</div>
      </header>
      <div className="lesson-context"><span>Formação Pastoral · {subject?.shortTitle ?? "Simulado"}</span><strong>{title}</strong></div>

      {lesson && index === 0 && (
        <section className="learn-card formation-learn-card">
          <div className="layer-badge theology">Compreender</div>
          <h1>{lesson.title}</h1>
          {lesson.understand.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="formation-reference-list">
            {lesson.bibleReferences.map((label) => {
              const reference = formationReference(label);
              const href = reference ? buildBibleReaderPath(reference, returnPath) : undefined;
              return href ? <Link className="reference reference-link" to={href} key={label}><span>▣</span><span>{label}</span><small>Abrir →</small></Link> : <p className="reference" key={label}>{label}</p>;
            })}
          </div>
          <button type="button" className="primary-button sticky-action" onClick={moveNext}>Continuar</button>
        </section>
      )}
      {lesson && index === 1 && (
        <section className="learn-card formation-learn-card">
          <div className="layer-badge application">Prática pastoral</div>
          <h1>Leve o conteúdo para o ministério</h1>
          <div className="formation-insight application"><strong>Aplicação pastoral</strong><p>{lesson.application}</p></div>
          <div className="formation-insight warning"><strong>Confusão que você precisa evitar</strong><p>{lesson.confusion}</p></div>
          <button type="button" className="primary-button sticky-action" onClick={moveNext}>Continuar</button>
        </section>
      )}
      {lesson && index === 2 && (
        <section className="learn-card formation-learn-card">
          <div className="layer-badge history">Preparação para entrevista</div>
          <h1>Explique com suas palavras</h1>
          <blockquote className="formation-summary">{lesson.summary}</blockquote>
          <p className="formation-summary-note">Use esta síntese para praticar. Não decore um testemunho alheio nem substitua sua experiência verdadeira.</p>
          <div className="formation-source">
            <strong>Fonte de consulta</strong>
            {lesson.source.url ? <a href={lesson.source.url} target="_blank" rel="noreferrer">{lesson.source.title} ↗</a> : <span>{lesson.source.title}</span>}
            {lesson.source.locator && <small>{lesson.source.locator}</small>}
          </div>
          <button type="button" className="primary-button sticky-action" onClick={moveNext}>Ir para os exercícios</button>
        </section>
      )}
      {currentExercise && (
        <ExerciseView
          exercise={currentExercise}
          result={state.activeSession?.answers[currentExercise.id]}
          onAnswer={(correct) =>
            dispatch({
              type: "ANSWER",
              questionId: currentExercise.id,
              lessonId: activityId,
              conceptId: ownerLesson?.id ?? subject?.id ?? "formacao",
              difficulty: currentExercise.difficulty,
              correct,
              mode: "formation"
            })
          }
          onContinue={moveNext}
          continueLabel={index === totalSteps - 1 ? "Ver resultado" : "Continuar"}
          referenceHref={referencePath}
          soundEnabled={state.settings.soundEnabled}
          hapticsEnabled={state.settings.hapticsEnabled}
          failureNote={isExam ? "A explicação ajuda a preparar sua próxima tentativa." : "Revise a explicação antes de continuar."}
        />
      )}
    </main>
  );
}
