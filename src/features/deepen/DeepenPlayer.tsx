import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ExerciseView } from "../../components/ExerciseView";
import { ProgressBar } from "../../components/ProgressBar";
import { GAMIFICATION } from "../../config/gamification";
import {
  deepenActivity,
  deepenActivityIds,
  deepenGenesisUnit,
  deepenLessonById
} from "../../content/deepen/catalog";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { buildBibleReaderPath } from "../../domain/bibleNavigation";
import { playFeedbackSound } from "../../services/feedbackSound";
import { useApp } from "../../state/AppContext";
import type { LessonSummary } from "../../types/progress";

export function DeepenPlayer() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const activeSession = state.activeSession;
  const activity = activityId ? deepenActivity(activityId) : undefined;
  const lesson = activityId ? deepenLessonById.get(activityId) : undefined;
  const isCheckpoint = Boolean(activity && !lesson);
  const blocks = lesson?.blocks ?? [];
  const exercises = activity?.exercises ?? [];
  const totalSteps = blocks.length + exercises.length;
  const returnStep = Number(searchParams.get("step"));
  const requestedStep = Number.isInteger(returnStep) && returnStep >= 0 && returnStep < totalSteps ? returnStep : undefined;
  const storedIndex = activeSession && activeSession.lessonId === activityId ? activeSession.stepIndex : 0;
  const [index, setIndex] = useState(requestedStep ?? storedIndex);
  const [showIntro, setShowIntro] = useState(() => requestedStep === undefined && activeSession?.lessonId !== activityId);
  const [summary, setSummary] = useState<LessonSummary>();
  const [earnedBeforeFinish, setEarnedBeforeFinish] = useState<string[]>([]);

  const title = activity?.title ?? "Atividade avançada";
  const referencePath = useMemo(() => {
    const exerciseIndex = index - blocks.length;
    const reference = exerciseIndex >= 0 ? exercises[exerciseIndex]?.reference : lesson?.baseText;
    return reference && activityId
      ? buildBibleReaderPath(reference, "/deepen/activity/" + activityId + "?step=" + index)
      : undefined;
  }, [activityId, blocks.length, exercises, index, lesson?.baseText]);

  useEffect(() => {
    if (!activityId || !totalSteps || showIntro) return;
    dispatch({ type: "START_SESSION", lessonId: activityId });
    if (requestedStep !== undefined) {
      setIndex(requestedStep);
      dispatch({ type: "SET_STEP", stepIndex: requestedStep });
      navigate("/deepen/activity/" + activityId, { replace: true });
    }
  }, [activityId, dispatch, navigate, requestedStep, showIntro, totalSteps]);

  useEffect(() => {
    const session = state.activeSession;
    if (!showIntro && session && session.lessonId === activityId && session.stepIndex < totalSteps) {
      setIndex(session.stepIndex);
    }
  }, [activityId, showIntro, state.activeSession, totalSteps]);

  if (state.profile.knowledgeLevel !== "advanced") {
    return (
      <main className="center-state">
        <div className="brand-mark">⌁</div>
        <h1>Ative o nível avançado</h1>
        <p>Escolha “Avançado” no Perfil para entrar na jornada Aprofundar.</p>
        <button className="primary-button" onClick={() => navigate("/profile")}>Abrir Perfil</button>
      </main>
    );
  }

  if (!activityId || !activity) {
    return (
      <main className="center-state">
        <div className="brand-mark">?</div>
        <h1>Estudo não encontrado</h1>
        <button className="primary-button" onClick={() => navigate("/deepen")}>Voltar ao Aprofundar</button>
      </main>
    );
  }

  const maxXp = exercises.length * GAMIFICATION.xp.exercise +
    (isCheckpoint ? GAMIFICATION.xp.checkpoint : GAMIFICATION.xp.lesson + GAMIFICATION.xp.perfectLesson);

  if (showIntro) {
    return (
      <main className="lesson-intro-page deepen-intro-page">
        <header className="lesson-intro-top">
          <button type="button" className="icon-button" aria-label="Voltar" onClick={() => navigate("/deepen")}>×</button>
          <span>Aprofundar · Gênesis</span>
        </header>
        <section className="lesson-intro-hero">
          <div className={"lesson-intro-icon " + (isCheckpoint ? "checkpoint" : "")} aria-hidden="true">{isCheckpoint ? "★" : "⌁"}</div>
          <p className="eyebrow">{isCheckpoint ? "Checkpoint avançado" : "Estudo em profundidade"}</p>
          <h1>{title}</h1>
          <p>{lesson?.objective ?? deepenGenesisUnit.checkpoint.subtitle}</p>
        </section>
        <section className="lesson-intro-stats">
          <div><span>◷</span><strong>{lesson?.estimatedMinutes ?? 10} min</strong><small>duração</small></div>
          <div><span>▤</span><strong>{blocks.length}</strong><small>blocos</small></div>
          <div><span>⚡</span><strong>até {maxXp}</strong><small>XP</small></div>
        </section>
        <section className="lesson-references-card">
          <p className="eyebrow">Texto-base</p>
          <div>{referencePath ? <Link className="reference-chip" to={referencePath}>▣ {lesson?.baseText.label ?? "Gênesis 1:1–31"}</Link> : null}</div>
        </section>
        <div className="lesson-intro-actions">
          <button type="button" className="primary-button" onClick={() => {
            setIndex(0);
            dispatch({ type: "START_SESSION", lessonId: activityId });
            setShowIntro(false);
          }}>{isCheckpoint ? "Começar checkpoint" : "Começar estudo"}</button>
          <button type="button" className="text-button" onClick={() => navigate("/deepen")}>Agora não</button>
        </div>
      </main>
    );
  }

  const finish = () => {
    const answers = state.activeSession?.answers ?? {};
    const correct = exercises.filter((exercise) => answers[exercise.id]).length;
    const total = exercises.length;
    const accuracy = total ? correct / total : 1;
    const passed = !isCheckpoint || accuracy >= deepenGenesisUnit.checkpoint.passAccuracy;
    const startedAt = state.activeSession?.startedAt ? new Date(state.activeSession.startedAt).getTime() : Date.now();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const bonus = passed
      ? isCheckpoint ? GAMIFICATION.xp.checkpoint : GAMIFICATION.xp.lesson + (accuracy === 1 ? GAMIFICATION.xp.perfectLesson : 0)
      : 0;
    setEarnedBeforeFinish(state.earnedAchievementIds);
    dispatch({ type: "FINISH", lessonId: activityId, checkpoint: isCheckpoint, perfect: accuracy === 1, passed, durationSeconds });
    if (passed && state.settings.soundEnabled) void playFeedbackSound("achievement");
    setSummary({
      lessonId: activityId,
      accuracy,
      correct,
      total,
      xpEarned: total * GAMIFICATION.xp.exercise + bonus,
      durationSeconds,
      isCheckpoint,
      masteredConceptIds: exercises.filter((exercise) => answers[exercise.id]).map((exercise) => exercise.conceptId),
      reviewConceptIds: exercises.filter((exercise) => !answers[exercise.id]).map((exercise) => exercise.conceptId)
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
    const passed = !isCheckpoint || summary.accuracy >= deepenGenesisUnit.checkpoint.passAccuracy;
    const activityIndex = deepenActivityIds.indexOf(activityId);
    const nextId = activityIndex >= 0 ? deepenActivityIds[activityIndex + 1] : undefined;
    const newAchievement = state.earnedAchievementIds
      .filter((id) => !earnedBeforeFinish.includes(id))
      .map((id) => ACHIEVEMENTS.find((achievement) => achievement.id === id))
      .find(Boolean);
    return (
      <main className="completion-page deepen-completion-page">
        <div className={"completion-burst " + (passed ? "" : "retry")} aria-hidden="true">{passed ? "⌁" : "↻"}</div>
        <p className="eyebrow">Resultado avançado</p>
        <h1>{passed ? "Conhecimento aprofundado!" : "Revise os argumentos"}</h1>
        <p>{passed ? "Você avançou com evidências, limites e interpretação responsável." : "O checkpoint exige 80%. Releia os blocos e tente novamente."}</p>
        <div className="summary-grid">
          <div><span>⚡</span><strong>+{summary.xpEarned} XP</strong><small>experiência</small></div>
          <div><span>◎</span><strong>{Math.round(summary.accuracy * 100)}%</strong><small>precisão</small></div>
          <div><span>✓</span><strong>{summary.correct}/{summary.total}</strong><small>acertos</small></div>
          <div><span>🔥</span><strong>{state.streak || 1}</strong><small>sequência</small></div>
        </div>
        {newAchievement && <section className="achievement-unlocked"><span>{newAchievement.icon}</span><div><p className="eyebrow">Conquista desbloqueada</p><strong>{newAchievement.title}</strong><small>{newAchievement.description}</small></div></section>}
        {passed ? (
          <button className="primary-button" onClick={() => {
            if (!nextId) { navigate("/deepen"); return; }
            setSummary(undefined);
            setIndex(0);
            setShowIntro(false);
            dispatch({ type: "START_SESSION", lessonId: nextId });
            navigate("/deepen/activity/" + nextId);
          }}>{nextId ? "Começar próximo passo" : "Voltar ao Aprofundar"}</button>
        ) : (
          <button className="primary-button" onClick={() => {
            setSummary(undefined);
            setIndex(0);
            dispatch({ type: "START_SESSION", lessonId: activityId });
          }}>Refazer checkpoint</button>
        )}
        <button className="text-button" onClick={() => navigate("/deepen")}>Ver jornada Aprofundar</button>
      </main>
    );
  }

  const currentBlock = index < blocks.length ? blocks[index] : undefined;
  const exerciseIndex = index - blocks.length;
  const currentExercise = exerciseIndex >= 0 ? exercises[exerciseIndex] : undefined;

  return (
    <main className="lesson-page deepen-player-page">
      <header className="lesson-topbar">
        <button type="button" className="icon-button" aria-label="Sair" onClick={() => navigate("/deepen")}>×</button>
        <ProgressBar value={index + 1} max={totalSteps} label="Progresso do estudo avançado" tone="gold" />
        <div className="heart-counter">⚡ {state.xp}</div>
      </header>
      <div className="lesson-context"><span>Aprofundar · Gênesis 1</span><strong>{title}</strong></div>
      {currentBlock && (
        <section className="learn-card deepen-study-card">
          <div className="layer-badge theology">Estudo completo · {index + 1}/{blocks.length}</div>
          <h1>{currentBlock.title}</h1>
          <p>{currentBlock.body}</p>
          {currentBlock.sourceIds?.length ? <div className="deepen-source-note"><strong>Rastreabilidade</strong><span>{currentBlock.sourceIds.join(" · ")}</span></div> : null}
          {referencePath ? <Link className="reference reference-link" to={referencePath}><span>▣</span><span>{lesson?.baseText.label}</span><small>Abrir na Bíblia →</small></Link> : null}
          <button type="button" className="primary-button sticky-action" onClick={moveNext}>{index === blocks.length - 1 ? "Ir para questões avançadas" : "Continuar estudo"}</button>
        </section>
      )}
      {currentExercise && (
        <ExerciseView
          exercise={currentExercise}
          result={state.activeSession?.answers[currentExercise.id]}
          onAnswer={(correct) => dispatch({
            type: "ANSWER",
            questionId: currentExercise.id,
            lessonId: activityId,
            conceptId: currentExercise.conceptId,
            difficulty: currentExercise.difficulty,
            correct,
            mode: "deepen"
          })}
          onContinue={moveNext}
          continueLabel={index === totalSteps - 1 ? "Ver resultado" : "Continuar"}
          referenceHref={referencePath}
          soundEnabled={state.settings.soundEnabled}
          hapticsEnabled={state.settings.hapticsEnabled}
          failureNote="Conceito registrado para revisão"
        />
      )}
    </main>
  );
}
