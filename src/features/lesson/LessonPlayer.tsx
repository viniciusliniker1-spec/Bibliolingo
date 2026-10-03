import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseView } from "../../components/ExerciseView";
import { ProgressBar } from "../../components/ProgressBar";
import { GAMIFICATION } from "../../config/gamification";
import { checkpointPassed } from "../../domain/checkpoint";
import { getActivity } from "../../content/catalog";
import { buildNoahPrompt, launchNoah } from "../../services/noah";
import { useApp } from "../../state/AppContext";
import type { Checkpoint, Exercise, LearningStep, Lesson } from "../../types/content";
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
  const { state, dispatch } = useApp();
  const activity = activityId ? getActivity(activityId) : undefined;
  const [summary, setSummary] = useState<LessonSummary>();
  const [notice, setNotice] = useState<string>();
  const isCheckpoint = Boolean(activity && "exercises" in activity);
  const steps = useMemo(
    () => (activity ? ("exercises" in activity ? activity.exercises : activity.steps) : []),
    [activity]
  );
  const initialSession = state.activeSession;
  const storedIndex = initialSession && initialSession.lessonId === activityId ? initialSession.stepIndex : 0;
  const [index, setIndex] = useState(storedIndex);

  useEffect(() => {
    if (activityId && activity) dispatch({ type: "START_SESSION", lessonId: activityId });
  }, [activityId, activity, dispatch]);

  useEffect(() => {
    const session = state.activeSession;
    if (session && session.lessonId === activityId) setIndex(session.stepIndex);
  }, [activityId, state.activeSession?.lessonId, state.activeSession?.stepIndex]);

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

  const moveNext = () => {
    if (index < steps.length - 1) {
      const next = index + 1;
      setIndex(next);
      dispatch({ type: "SET_STEP", stepIndex: next });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const answers = state.activeSession?.answers ?? {};
    const exercises = steps.filter((step): step is Exercise => step.type !== "learn");
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
      isCheckpoint
    });
  };

  if (summary) {
    const passed = !summary.isCheckpoint || summary.accuracy >= (activity as Checkpoint).passAccuracy;
    return (
      <main className="completion-page">
        <div className={"completion-burst " + (passed ? "" : "retry")} aria-hidden="true">{passed ? "★" : "↻"}</div>
        <p className="eyebrow">{summary.isCheckpoint ? "Resultado do checkpoint" : "Lição concluída"}</p>
        <h1>{passed ? "Muito bem!" : "Quase lá"}</h1>
        <p>{passed ? "O conhecimento desta etapa agora faz parte da sua jornada." : "Revise os conceitos indicados e tente novamente."}</p>
        <div className="summary-grid">
          <div><span>⚡</span><strong>+{summary.xpEarned} XP</strong><small>experiência</small></div>
          <div><span>◎</span><strong>{Math.round(summary.accuracy * 100)}%</strong><small>precisão</small></div>
          <div><span>◷</span><strong>{Math.max(1, Math.round(summary.durationSeconds / 60))} min</strong><small>tempo</small></div>
          <div><span>🔥</span><strong>{state.streak || 1}</strong><small>sequência</small></div>
        </div>
        {summary.isCheckpoint && (
          <div className="mastery-card">
            <div><strong>{summary.correct}</strong><span>conceitos demonstrados</span></div>
            <div><strong>{summary.total - summary.correct}</strong><span>pontos para revisar</span></div>
          </div>
        )}
        {passed ? (
          <button className="primary-button" onClick={() => navigate("/")}>Continuar jornada</button>
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
        <button className="secondary-button" onClick={() => navigate("/study")}>Revisar erros</button>
      </main>
    );
  }

  const current = steps[index];
  const progress = (index + 1) / steps.length;
  const title = activity.title;
  const currentReference =
    current?.type === "learn"
      ? current.reference?.label
      : (current as Exercise | undefined)?.reference.label;

  const askNoah = async () => {
    const prompt = buildNoahPrompt("deepen", {
      title,
      reference: currentReference ?? ("references" in activity ? activity.references[0]?.label : "Gênesis 1–3"),
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
        <span>{isCheckpoint ? "Checkpoint" : "Gênesis · O princípio"}</span>
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
          {current.reference && <p className="reference">{current.reference.label}</p>}
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
        />
      ) : null}

      {notice && <div className="toast" role="status" onAnimationEnd={() => setNotice(undefined)}>{notice}</div>}
    </main>
  );
}
