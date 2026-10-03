import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { getLevelProgress } from "../../domain/gamification";
import { isJourneyActivityUnlocked, nextJourneyActivityId } from "../../domain/unlocks";
import {
  getActivity,
  getUnitForActivity,
  orderedActivityIds,
  orderedLessons,
  orderedUnits
} from "../../content/catalog";
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
  const calculatedNext = nextJourneyActivityId(
    orderedActivityIds,
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const sessionId = state.activeSession?.lessonId;
  const nextId = sessionId && orderedActivityIds.includes(sessionId) ? sessionId : calculatedNext;
  const nextActivity = getActivity(nextId);
  const nextUnit = getUnitForActivity(nextId) ?? orderedUnits[0];
  const completedActivities = new Set([
    ...state.completedLessonIds,
    ...state.completedCheckpointIds
  ]);
  const bookComplete = orderedActivityIds.every((id) => completedActivities.has(id));
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
          <h1>{bookComplete ? "Gênesis concluído. Continue revisando." : "Seu próximo passo está pronto."}</h1>
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
          <p className="eyebrow">Gênesis · {nextUnit.title}</p>
          <h2>{nextActivity?.title ?? nextUnit.title}</h2>
          <p>{state.activeSession ? "Continue exatamente de onde parou." : nextUnit.subtitle}</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate("/lesson/" + nextId)}>
          {bookComplete ? "Revisitar" : "Continuar"}
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
          <div><p className="eyebrow">Sua jornada</p><h2>Gênesis completo</h2></div>
          <span>{state.completedLessonIds.length}/{orderedLessons.length}</span>
        </div>
        <ProgressBar
          value={completedActivities.size}
          max={orderedActivityIds.length}
          label="Progresso no livro de Gênesis"
        />

        <div className="unit-list">
          {orderedUnits.map((unit, unitIndex) => {
            const unitActivityIds = [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id];
            const unitDone = unitActivityIds.filter((id) => completedActivities.has(id)).length;
            const isCurrentUnit = unitActivityIds.includes(nextId);
            const unitUnlocked = isJourneyActivityUnlocked(
              unitActivityIds[0],
              orderedActivityIds,
              state.completedLessonIds,
              state.completedCheckpointIds
            );
            return (
              <details
                className={"unit-journey-card " + (isCurrentUnit ? "current-unit" : "")}
                key={unit.id}
                open={isCurrentUnit || unitIndex === 0}
              >
                <summary>
                  <span className="unit-index">{unitIndex + 1}</span>
                  <span>
                    <small>Unidade {unitIndex + 1} · capítulos {unit.chapters[0]}–{unit.chapters[unit.chapters.length - 1]}</small>
                    <strong>{unit.title}</strong>
                  </span>
                  <span className="unit-count">{unitDone}/{unitActivityIds.length}</span>
                </summary>
                <p className="unit-subtitle">{unit.subtitle}</p>
                <div className="journey-path">
                  {unit.lessons.map((lesson, lessonIndex) => {
                    const complete = state.completedLessonIds.includes(lesson.id);
                    const unlocked = isJourneyActivityUnlocked(
                      lesson.id,
                      orderedActivityIds,
                      state.completedLessonIds,
                      state.completedCheckpointIds
                    );
                    const current = !complete && lesson.id === nextId;
                    return (
                      <div className={"journey-row " + (lessonIndex % 2 ? "right" : "left")} key={lesson.id}>
                        <button
                          type="button"
                          className={"journey-node " + (complete ? "completed" : current ? "current" : unlocked ? "available" : "locked")}
                          disabled={!unlocked}
                          onClick={() => navigate("/lesson/" + lesson.id)}
                          aria-label={(complete ? "Concluída: " : unlocked ? "Abrir: " : "Bloqueada: ") + lesson.title}
                        >
                          <span aria-hidden="true">{complete ? "✓" : unlocked ? lessonIndex + 1 : "⌁"}</span>
                        </button>
                        <div className="journey-label">
                          <small>Lição {lessonIndex + 1} · {lesson.estimatedMinutes} min</small>
                          <strong>{lesson.title}</strong>
                        </div>
                      </div>
                    );
                  })}
                  <div className="journey-row checkpoint-row">
                    <button
                      type="button"
                      className={"journey-node checkpoint " + (
                        state.completedCheckpointIds.includes(unit.checkpoint.id)
                          ? "completed"
                          : isJourneyActivityUnlocked(
                              unit.checkpoint.id,
                              orderedActivityIds,
                              state.completedLessonIds,
                              state.completedCheckpointIds
                            )
                            ? "available"
                            : "locked"
                      )}
                      disabled={!isJourneyActivityUnlocked(
                        unit.checkpoint.id,
                        orderedActivityIds,
                        state.completedLessonIds,
                        state.completedCheckpointIds
                      )}
                      onClick={() => navigate("/lesson/" + unit.checkpoint.id)}
                      aria-label={"Abrir checkpoint da unidade " + (unitIndex + 1)}
                    >
                      <span aria-hidden="true">★</span>
                    </button>
                    <div className="journey-label"><small>Desafio da unidade</small><strong>Checkpoint</strong></div>
                  </div>
                </div>
                {!unitUnlocked && <p className="unit-locked-note">Conclua a unidade anterior para desbloquear.</p>}
              </details>
            );
          })}
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
