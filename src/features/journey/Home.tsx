import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { getLevelProgress } from "../../domain/gamification";
import { nextActivityId, isCheckpointUnlocked, isLessonUnlocked } from "../../domain/unlocks";
import { orderedLessonIds, pilotUnit } from "../../content/catalog";
import { toLocalDateKey } from "../../domain/streak";
import { useApp } from "../../state/AppContext";
import { ProgressBar } from "../../components/ProgressBar";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function Home() {
  const { state } = useApp();
  const navigate = useNavigate();
  const level = getLevelProgress(state.xp);
  const today = state.activity[toLocalDateKey(new Date())]?.xp ?? 0;
  const nextId = state.activeSession?.lessonId ?? nextActivityId(
    orderedLessonIds,
    pilotUnit.checkpoint.id,
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const recentAchievements = useMemo(
    () =>
      state.earnedAchievementIds
        .slice(-3)
        .reverse()
        .map((id) => ACHIEVEMENTS.find((item) => item.id === id))
        .filter(Boolean),
    [state.earnedAchievementIds]
  );

  return (
    <main className="page home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>Seu próximo passo está pronto.</h1>
        </div>
        <div className="level-orb" aria-label={"Nível " + level.level}>
          <small>NÍVEL</small>
          <strong>{level.level}</strong>
        </div>
      </header>

      <section className="status-strip" aria-label="Resumo da jornada">
        <div><span aria-hidden="true">🔥</span><strong>{state.streak}</strong><small>sequência</small></div>
        <div><span aria-hidden="true">⚡</span><strong>{state.xp}</strong><small>XP total</small></div>
        <div><span aria-hidden="true">♥</span><strong>{state.settings.heartsEnabled ? state.hearts : "∞"}</strong><small>corações</small></div>
      </section>

      <section className="daily-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Meta de hoje</p>
            <h2>{today} / {state.profile.dailyGoal} XP</h2>
          </div>
          <span>{Math.min(100, Math.round((today / state.profile.dailyGoal) * 100))}%</span>
        </div>
        <ProgressBar value={today} max={state.profile.dailyGoal} label="Progresso da meta diária" tone="gold" />
      </section>

      <section className="continue-card">
        <div>
          <p className="eyebrow">Gênesis · Unidade 1</p>
          <h2>{pilotUnit.title}</h2>
          <p>{state.activeSession ? "Continue exatamente de onde parou." : "Criação, vocação, queda e esperança."}</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate("/lesson/" + nextId)}>
          Continuar
        </button>
      </section>

      {state.settings.heartsEnabled && state.hearts === 0 && (
        <section className="heart-alert">
          <div><strong>Seus corações acabaram</strong><p>Uma revisão correta recupera um coração.</p></div>
          <button type="button" className="secondary-button" onClick={() => navigate("/study")}>Revisar agora</button>
        </section>
      )}

      <section className="journey-section">
        <div className="section-title">
          <div><p className="eyebrow">Sua jornada</p><h2>O princípio</h2></div>
          <span>{state.completedLessonIds.length}/{orderedLessonIds.length}</span>
        </div>
        <div className="journey-path">
          {pilotUnit.lessons.map((lesson, index) => {
            const complete = state.completedLessonIds.includes(lesson.id);
            const unlocked = isLessonUnlocked(lesson.id, orderedLessonIds, state.completedLessonIds);
            const current = !complete && lesson.id === nextId;
            return (
              <div className={"journey-row " + (index % 2 ? "right" : "left")} key={lesson.id}>
                <button
                  type="button"
                  className={"journey-node " + (complete ? "completed" : current ? "current" : unlocked ? "available" : "locked")}
                  disabled={!unlocked}
                  onClick={() => navigate("/lesson/" + lesson.id)}
                  aria-label={(complete ? "Concluída: " : unlocked ? "Abrir: " : "Bloqueada: ") + lesson.title}
                >
                  <span aria-hidden="true">{complete ? "✓" : unlocked ? index + 1 : "⌁"}</span>
                </button>
                <div className="journey-label">
                  <small>Lição {index + 1} · {lesson.estimatedMinutes} min</small>
                  <strong>{lesson.title}</strong>
                </div>
              </div>
            );
          })}
          <div className="journey-row checkpoint-row">
            <button
              type="button"
              className={"journey-node checkpoint " + (state.completedCheckpointIds.includes(pilotUnit.checkpoint.id) ? "completed" : isCheckpointUnlocked(orderedLessonIds, state.completedLessonIds) ? "available" : "locked")}
              disabled={!isCheckpointUnlocked(orderedLessonIds, state.completedLessonIds)}
              onClick={() => navigate("/lesson/" + pilotUnit.checkpoint.id)}
              aria-label="Abrir checkpoint da unidade"
            >
              <span aria-hidden="true">★</span>
            </button>
            <div className="journey-label"><small>Desafio final</small><strong>Checkpoint</strong></div>
          </div>
        </div>
      </section>

      {recentAchievements.length > 0 && (
        <section className="recent-section">
          <div className="section-title"><h2>Conquistas recentes</h2></div>
          <div className="achievement-mini-grid">
            {recentAchievements.map((achievement) => achievement && (
              <div className="achievement-mini" key={achievement.id}>
                <span aria-hidden="true">{achievement.icon}</span>
                <strong>{achievement.title}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
