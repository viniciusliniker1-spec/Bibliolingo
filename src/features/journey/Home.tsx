import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { getLevelProgress } from "../../domain/gamification";
import { getReviewQueue } from "../../domain/review";
import { isJourneyActivityUnlocked, nextJourneyActivityId } from "../../domain/unlocks";
import {
  getActivity,
  getBookForActivity,
  getUnitForActivity,
  journeyBooks,
  orderedActivityIds,
  orderedLessons,
  orderedUnits,
  type JourneyBook
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

function activitiesForBook(book: JourneyBook) {
  return book.units.flatMap((unit) => [
    ...unit.lessons.map((lesson) => lesson.id),
    unit.checkpoint.id
  ]);
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
  const nextBook = getBookForActivity(nextId) ?? journeyBooks[0];
  const [selectedBookId, setSelectedBookId] = useState(nextBook.id);
  const selectedBook = journeyBooks.find((book) => book.id === selectedBookId) ?? nextBook;
  const completedActivities = new Set([
    ...state.completedLessonIds,
    ...state.completedCheckpointIds
  ]);
  const completedJourneyCount = orderedActivityIds.filter((id) => completedActivities.has(id)).length;
  const journeyComplete = orderedActivityIds.every((id) => completedActivities.has(id));
  const dueConceptIds = new Set(getReviewQueue(state.reviewItems).map((item) => item.conceptId));
  const recentAchievements = useMemo(
    () =>
      state.earnedAchievementIds
        .slice(-3)
        .reverse()
        .map((id) => ACHIEVEMENTS.find((item) => item.id === id))
        .filter(Boolean),
    [state.earnedAchievementIds]
  );

  const selectedBookActivities = activitiesForBook(selectedBook);
  const selectedBookDone = selectedBookActivities.filter((id) => completedActivities.has(id)).length;
  const selectedBookIndex = journeyBooks.findIndex((book) => book.id === selectedBook.id);
  const selectedBookUnlocked = isJourneyActivityUnlocked(
    selectedBookActivities[0],
    orderedActivityIds,
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const previousBook = selectedBookIndex > 0 ? journeyBooks[selectedBookIndex - 1] : undefined;

  return (
    <main className="page home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>{journeyComplete ? "Pentateuco concluído. Sua caminhada continua." : "Seu próximo passo está pronto."}</h1>
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

      {!state.settings.dailyReminderEnabled && (
        <section className="reminder-nudge">
          <span aria-hidden="true">🔔</span>
          <div><strong>Não perca sua sequência</strong><p>Escolha um horário para lembrar da jornada todos os dias.</p></div>
          <button type="button" className="small-button" onClick={() => navigate("/profile")}>Configurar</button>
        </section>
      )}

      <section className="continue-card">
        <div>
          <p className="eyebrow">{nextBook.title} · {nextUnit.title}</p>
          <h2>{nextActivity?.title ?? nextUnit.title}</h2>
          <p>{sessionId && orderedActivityIds.includes(sessionId) ? "Continue exatamente de onde parou." : nextUnit.subtitle}</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate("/lesson/" + nextId)}>
          {journeyComplete ? "Revisitar" : "Continuar"}
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
          <div><p className="eyebrow">Sua jornada</p><h2>Escolha um livro</h2></div>
          <span>{state.completedLessonIds.filter((id) => orderedLessons.some((lesson) => lesson.id === id)).length}/{orderedLessons.length}</span>
        </div>
        <ProgressBar
          value={completedJourneyCount}
          max={orderedActivityIds.length}
          label="Progresso na jornada bíblica"
        />

        <div className="book-switcher" role="tablist" aria-label="Livros da jornada">
          {journeyBooks.map((book, bookIndex) => {
            const bookActivities = activitiesForBook(book);
            const done = bookActivities.filter((id) => completedActivities.has(id)).length;
            const unlocked = isJourneyActivityUnlocked(
              bookActivities[0],
              orderedActivityIds,
              state.completedLessonIds,
              state.completedCheckpointIds
            );
            const selected = book.id === selectedBook.id;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                className={"book-switch-card " + (selected ? "selected " : "") + (!unlocked ? "locked" : "")}
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
              >
                <span className="book-switch-monogram" aria-hidden="true">{book.shortTitle}</span>
                <span>
                  <small>Livro {bookIndex + 1}</small>
                  <strong>{book.title}</strong>
                  <em>{unlocked ? done + "/" + bookActivities.length + " etapas" : "Prévia bloqueada"}</em>
                </span>
                <span className="book-switch-status" aria-hidden="true">
                  {done === bookActivities.length ? "✓" : unlocked ? "→" : "⌁"}
                </span>
              </button>
            );
          })}
        </div>

        <section className={"book-focus-card " + (!selectedBookUnlocked ? "locked" : "")} role="tabpanel">
          <header className="book-focus-heading">
            <span className="book-monogram" aria-hidden="true">{selectedBook.shortTitle}</span>
            <div>
              <p className="eyebrow">{selectedBookUnlocked ? "Livro em estudo" : "Conheça o próximo livro"}</p>
              <h3>{selectedBook.title}</h3>
              <p>{selectedBook.units.length} unidades · {selectedBook.units.reduce((total, unit) => total + unit.lessons.length, 0)} lições</p>
            </div>
            <strong>{selectedBookDone}/{selectedBookActivities.length}</strong>
          </header>
          <div className="book-focus-progress">
            <ProgressBar
              value={selectedBookDone}
              max={selectedBookActivities.length}
              label={"Progresso em " + selectedBook.title}
              tone={selectedBook.id === "exodus" ? "gold" : "aqua"}
            />
          </div>
          {!selectedBookUnlocked && previousBook && (
            <div className="book-unlock-message">
              <span aria-hidden="true">⌁</span>
              <div>
                <strong>Continue a sequência</strong>
                <p>Conclua o checkpoint final de {previousBook.title} para começar {selectedBook.title}. Você já pode conhecer as unidades abaixo.</p>
              </div>
              <button type="button" className="small-button" onClick={() => setSelectedBookId(previousBook.id)}>
                Ver {previousBook.title}
              </button>
            </div>
          )}

          <div className="unit-list">
            {selectedBook.units.map((unit, unitIndex) => {
              const unitActivityIds = [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id];
              const unitDone = unitActivityIds.filter((id) => completedActivities.has(id)).length;
              const isCurrentUnit = unitActivityIds.includes(nextId);
              const unitUnlocked = isJourneyActivityUnlocked(
                unitActivityIds[0],
                orderedActivityIds,
                state.completedLessonIds,
                state.completedCheckpointIds
              );
              const needsReview = unit.concepts.some((concept) => dueConceptIds.has(concept.id));
              const mastery =
                state.completedCheckpointIds.includes(unit.checkpoint.id)
                  ? needsReview
                    ? { label: "Revisar", className: "review" }
                    : { label: "Dominado", className: "mastered" }
                  : unitDone > 0
                    ? { label: "Aprendendo", className: "learning" }
                    : unitUnlocked
                      ? { label: "Disponível", className: "available" }
                      : { label: "Bloqueado", className: "locked" };
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
                      <em className={"mastery-pill " + mastery.className}>{mastery.label}</em>
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
                        aria-label={"Abrir checkpoint da unidade " + (unitIndex + 1) + " de " + selectedBook.title}
                      >
                        <span aria-hidden="true">★</span>
                      </button>
                      <div className="journey-label"><small>Desafio da unidade</small><strong>Checkpoint</strong></div>
                    </div>
                  </div>
                  {!unitUnlocked && <p className="unit-locked-note">Prévia: conclua a etapa anterior para desbloquear.</p>}
                </details>
              );
            })}
          </div>
        </section>
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
