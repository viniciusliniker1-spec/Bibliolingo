import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ACHIEVEMENTS } from "../../domain/achievements";
import { getLevelProgress } from "../../domain/gamification";
import { getReviewQueue } from "../../domain/review";
import {
  isBookActivityUnlocked,
  isJourneyActivityUnlocked,
  nextBookActivityId,
  nextJourneyActivityId
} from "../../domain/unlocks";
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
import { weeklyGoalProgress, smartChallenges } from "../../domain/weeklyGoals";
import { recommendAdaptiveNext } from "../../domain/adaptive";
import { adaptiveWebPath, buildAdaptiveActivityCatalog } from "../../domain/adaptiveCatalog";
import { CURATED_PREREQUISITES } from "../../domain/prerequisites";

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

function lessonPath(activityId: string, bookId?: string) {
  return bookId
    ? "/lesson/" + activityId + "?mode=individual&book=" + encodeURIComponent(bookId)
    : "/lesson/" + activityId;
}

export function Home() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = getLevelProgress(state.xp);
  const today = state.activity[toLocalDateKey(new Date())]?.xp ?? 0;
  const weekly = weeklyGoalProgress(state.activity, state.profile.dailyGoal);
  const challenges = smartChallenges(state);
  const canonicalNextId = nextJourneyActivityId(
    orderedActivityIds,
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const canonicalNextBook = getBookForActivity(canonicalNextId) ?? journeyBooks[0];
  const sessionId = state.activeSession?.lessonId;
  const sessionBook = sessionId ? getBookForActivity(sessionId) : undefined;
  const sessionIsIndividual =
    state.activeSession?.journeyMode === "individual" &&
    state.activeSession.journeyBookId === sessionBook?.id;
  const nextId = sessionId && orderedActivityIds.includes(sessionId) ? sessionId : canonicalNextId;
  const nextActivity = getActivity(nextId);
  const nextUnit = getUnitForActivity(nextId) ?? orderedUnits[0];
  const nextBook = getBookForActivity(nextId) ?? canonicalNextBook;
  const requestedBookId = searchParams.get("book");
  const requestedIndividualBook =
    searchParams.get("mode") === "individual" &&
    journeyBooks.some((book) => book.id === requestedBookId)
      ? requestedBookId ?? undefined
      : undefined;
  const [selectedBookId, setSelectedBookId] = useState(requestedBookId ?? nextBook.id);
  const [individualBookId, setIndividualBookId] = useState<string | undefined>(
    requestedIndividualBook
  );
  const [studyChoiceBookId, setStudyChoiceBookId] = useState<string>();
  const [bookSelectorOpen, setBookSelectorOpen] = useState(false);
  const selectedBook = journeyBooks.find((book) => book.id === selectedBookId) ?? nextBook;
  const completedActivities = new Set([
    ...state.completedLessonIds,
    ...state.completedCheckpointIds
  ]);
  const completedJourneyCount = orderedActivityIds.filter((id) => completedActivities.has(id)).length;
  const journeyComplete = orderedActivityIds.every((id) => completedActivities.has(id));
  const dueConceptIds = new Set(getReviewQueue(state.reviewItems).map((item) => item.conceptId));
  const adaptiveActivities = useMemo(
    () => buildAdaptiveActivityCatalog({
      completedLessonIds: state.completedLessonIds,
      completedCheckpointIds: state.completedCheckpointIds
    }),
    [state.completedLessonIds, state.completedCheckpointIds]
  );
  const adaptive = useMemo(
    () => recommendAdaptiveNext({
      attempts: state.attempts,
      reviewItems: state.reviewItems,
      activities: adaptiveActivities,
      prerequisites: CURATED_PREREQUISITES,
      goal: state.profile.goal,
      declaredLevel: state.profile.knowledgeLevel,
      ignoredRecommendationIds: state.ignoredRecommendationIds,
      recentRecommendationIds: state.recentRecommendationIds,
      limit: 4
    }),
    [adaptiveActivities, state.attempts, state.reviewItems, state.profile.goal, state.profile.knowledgeLevel, state.ignoredRecommendationIds, state.recentRecommendationIds]
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

  const selectedBookActivities = activitiesForBook(selectedBook);
  const selectedBookDone = selectedBookActivities.filter((id) => completedActivities.has(id)).length;
  const selectedBookIndex = journeyBooks.findIndex((book) => book.id === selectedBook.id);
  const selectedBookUnlocked = isJourneyActivityUnlocked(
    selectedBookActivities[0],
    orderedActivityIds,
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const studyingSelectedBookIndividually = individualBookId === selectedBook.id;
  const selectedBookAccessible = selectedBookUnlocked || studyingSelectedBookIndividually;
  const selectedBookNextId =
    nextBookActivityId(
      selectedBookActivities,
      state.completedLessonIds,
      state.completedCheckpointIds
    ) ?? selectedBookActivities[0];
  const selectedCurrentId = studyingSelectedBookIndividually ? selectedBookNextId : nextId;
  const previousBook = selectedBookIndex > 0 ? journeyBooks[selectedBookIndex - 1] : undefined;
  const choiceBook = journeyBooks.find((book) => book.id === studyChoiceBookId);
  const isSelectedActivityUnlocked = (activityId: string) =>
    studyingSelectedBookIndividually
      ? isBookActivityUnlocked(
          activityId,
          selectedBookActivities,
          state.completedLessonIds,
          state.completedCheckpointIds
        )
      : isJourneyActivityUnlocked(
          activityId,
          orderedActivityIds,
          state.completedLessonIds,
          state.completedCheckpointIds
        );
  const selectedActivityPath = (activityId: string) =>
    lessonPath(activityId, studyingSelectedBookIndividually ? selectedBook.id : undefined);

  useEffect(() => {
    if (!studyChoiceBookId) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStudyChoiceBookId(undefined);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [studyChoiceBookId]);

  return (
    <main className="page home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>{journeyComplete ? "Jornada bíblica concluída. Continue revisando e aprofundando." : "Seu próximo passo está pronto."}</h1>
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

      <section className="weekly-goal-card">
        <div className="card-heading">
          <div><p className="eyebrow">Meta semanal</p><h2>{weekly.xp} / {weekly.goal} XP</h2></div>
          <span>{weekly.activeDays}/5 dias</span>
        </div>
        <ProgressBar value={weekly.xp} max={weekly.goal} label="Progresso da meta semanal" tone="aqua" />
        <div className="weekly-challenges">
          {challenges.slice(1).map((challenge) => (
            <button type="button" key={challenge.id} onClick={() => navigate(challenge.route)}>
              <span aria-hidden="true">{challenge.completed ? "✓" : "◇"}</span>
              <span><strong>{challenge.title}</strong><small>{challenge.progress}/{challenge.target} · {challenge.description}</small></span>
            </button>
          ))}
        </div>
      </section>

      {!state.settings.dailyReminderEnabled && (
        <section className="reminder-nudge">
          <span aria-hidden="true">🔔</span>
          <div><strong>Não perca sua sequência</strong><p>Escolha um horário para lembrar da jornada todos os dias.</p></div>
          <button type="button" className="small-button" onClick={() => navigate("/profile")}>Configurar</button>
        </section>
      )}

      <section className="alternative-paths" aria-labelledby="adaptive-title">
        <div className="section-title">
          <div><p className="eyebrow">Aprendizado adaptativo</p><h2 id="adaptive-title">Recomendado para você</h2></div>
        </div>
        {adaptive.recommendations.length ? (
          <div className="alternative-path-list">
            {adaptive.recommendations.map((recommendation) => (
              <article className="context-card" key={recommendation.id}>
                <button
                  type="button"
                  className="alternative-path-link"
                  onClick={() => {
                    dispatch({ type: "RECORD_RECOMMENDATION", recommendationId: recommendation.id });
                    navigate(
                      recommendation.kind === "review"
                        ? "/study"
                        : adaptiveWebPath(recommendation.activityKind ?? "bible", recommendation.activityId)
                    );
                  }}
                >
                  <span className="deepen-mark" aria-hidden="true">
                    {recommendation.kind === "review" ? "↻" : recommendation.kind === "prerequisite" ? "◇" : "→"}
                  </span>
                  <span>
                    <strong>{recommendation.title}</strong>
                    <small>{recommendation.reason} · ~{recommendation.estimatedMinutes} min</small>
                  </span>
                  <i aria-hidden="true">→</i>
                </button>
                <button type="button" className="text-button" onClick={() => dispatch({ type: "DISMISS_RECOMMENDATION", recommendationId: recommendation.id })}>
                  Ignorar esta recomendação
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="context-card">
            <strong>Continue explorando</strong>
            <p>Ainda não há evidências suficientes para uma recomendação específica. A trilha original permanece disponível.</p>
          </div>
        )}
        <div className="context-card">
          <strong>Seu perfil de aprendizagem</strong>
          <p>
            {adaptive.profile.insufficientEvidence
              ? "Evidências insuficientes: responda atividades em momentos diferentes para formar uma estimativa."
              : adaptive.profile.strengths.length + " conceitos demonstrados · " + adaptive.profile.difficulties.length + " conceitos para reforçar."}
          </p>
          {adaptive.profile.concepts.slice(0, 3).map((concept) => (
            <small key={concept.conceptId}>{concept.title}: {concept.evidenceLabel} · {concept.stage === "review-needed" ? "revisão necessária" : concept.stage}</small>
          ))}
        </div>
      </section>

      <section className="continue-card">
        <div>
          <p className="eyebrow">{sessionIsIndividual ? "Livro avulso · " : ""}{nextBook.title} · {nextUnit.title}</p>
          <h2>{nextActivity?.title ?? nextUnit.title}</h2>
          <p>{sessionId && orderedActivityIds.includes(sessionId) ? "Continue exatamente de onde parou." : nextUnit.subtitle}</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate(lessonPath(nextId, sessionIsIndividual ? sessionBook?.id : undefined))}>
          {journeyComplete ? "Revisitar" : "Continuar"}
        </button>
      </section>

      {state.profile.knowledgeLevel === "advanced" && (
        <section className="alternative-paths" aria-labelledby="alternative-paths-title">
          <div className="section-title">
            <div><p className="eyebrow">Percurso opcional</p><h2 id="alternative-paths-title">Aprofundar</h2></div>
          </div>
          <p className="alternative-paths-copy">Estudos completos e questões de integração para quem selecionou o nível avançado.</p>
          <div className="alternative-path-list">
            <button type="button" className="alternative-path-link" onClick={() => navigate("/deepen")}>
              <span className="deepen-mark" aria-hidden="true">⌁</span>
              <span><strong>Aprofundar</strong><small>Conteúdo avançado com progresso próprio</small></span>
              <i aria-hidden="true">→</i>
            </button>
          </div>
        </section>
      )}

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

        <button
          type="button"
          className="book-filter-toggle"
          aria-expanded={bookSelectorOpen}
          aria-controls="journey-book-list"
          onClick={() => setBookSelectorOpen((open) => !open)}
        >
          <span className="book-filter-icon" aria-hidden="true">☰</span>
          <span>
            <small>{bookSelectorOpen ? "Lista aberta" : "Livro selecionado"}</small>
            <strong>{bookSelectorOpen ? "Ocultar livros" : "Escolher outro livro"}</strong>
            <em>{selectedBook.title} · {selectedBookIndex + 1} de {journeyBooks.length}</em>
          </span>
          <span className="book-filter-chevron" aria-hidden="true">{bookSelectorOpen ? "⌃" : "⌄"}</span>
        </button>

        {bookSelectorOpen && (
          <div id="journey-book-list" className="book-switcher" role="tablist" aria-label="Livros da jornada">
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
                  onClick={() => {
                    setSelectedBookId(book.id);
                    if (individualBookId !== book.id) setIndividualBookId(undefined);
                    setBookSelectorOpen(false);
                  }}
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
        )}

        <section className={"book-focus-card " + (!selectedBookAccessible ? "locked" : "")} role="tabpanel">
          <header className="book-focus-heading">
            <span className="book-monogram" aria-hidden="true">{selectedBook.shortTitle}</span>
            <div>
              <p className="eyebrow">{studyingSelectedBookIndividually ? "Livro avulso" : selectedBookUnlocked ? "Livro em estudo" : "Conheça o próximo livro"}</p>
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
          {studyingSelectedBookIndividually && (
            <div className="individual-study-banner">
              <span aria-hidden="true">▣</span>
              <div>
                <strong>Estudo individual de {selectedBook.title}</strong>
                <p>Avance somente neste livro. Sua posição na jornada principal continua preservada em {canonicalNextBook.title}.</p>
              </div>
              <button
                type="button"
                className="small-button"
                onClick={() => {
                  setIndividualBookId(undefined);
                  setSelectedBookId(canonicalNextBook.id);
                  navigate("/", { replace: true });
                }}
              >
                Voltar à jornada
              </button>
            </div>
          )}
          {!studyingSelectedBookIndividually && selectedBook.id !== canonicalNextBook.id && (
            <button
              type="button"
              className="individual-study-trigger"
              onClick={() => setStudyChoiceBookId(selectedBook.id)}
            >
              <span aria-hidden="true">↗</span>
              <span><strong>Estudar este livro fora da rota</strong><small>A jornada principal não perde sua posição</small></span>
            </button>
          )}
          {!selectedBookUnlocked && !studyingSelectedBookIndividually && previousBook && (
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
              const isCurrentUnit = unitActivityIds.includes(selectedCurrentId);
              const unitUnlocked = isSelectedActivityUnlocked(unitActivityIds[0]);
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
                      const unlocked = isSelectedActivityUnlocked(lesson.id);
                      const current = !complete && lesson.id === selectedCurrentId;
                      return (
                        <div className={"journey-row " + (lessonIndex % 2 ? "right" : "left")} key={lesson.id}>
                          <button
                            type="button"
                            className={"journey-node " + (complete ? "completed" : current ? "current" : unlocked ? "available" : "locked")}
                            disabled={!unlocked}
                            onClick={() => navigate(selectedActivityPath(lesson.id))}
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
                            : isSelectedActivityUnlocked(unit.checkpoint.id)
                              ? "available"
                              : "locked"
                        )}
                        disabled={!isSelectedActivityUnlocked(unit.checkpoint.id)}
                        onClick={() => navigate(selectedActivityPath(unit.checkpoint.id))}
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

      {choiceBook && (
        <div className="study-choice-modal" role="presentation">
          <button
            type="button"
            className="study-choice-backdrop"
            aria-label="Fechar escolha de estudo"
            onClick={() => setStudyChoiceBookId(undefined)}
          />
          <section
            className="study-choice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="study-choice-title"
            aria-describedby="study-choice-description"
          >
            <button
              type="button"
              className="study-choice-close"
              aria-label="Fechar"
              onClick={() => setStudyChoiceBookId(undefined)}
            >
              ×
            </button>
            <span className="study-choice-icon" aria-hidden="true">{choiceBook.shortTitle}</span>
            <p className="eyebrow">Escolha seu caminho</p>
            <h2 id="study-choice-title">Como quer estudar {choiceBook.title}?</h2>
            <p id="study-choice-description">
              O progresso e o XP ficam salvos nos dois modos. A ordem recomendada só avança quando as etapas anteriores da jornada forem concluídas.
            </p>
            <div className="study-choice-actions">
              <button
                type="button"
                className="study-choice-option primary"
                autoFocus
                onClick={() => {
                  const bookActivities = activitiesForBook(choiceBook);
                  const firstPending =
                    nextBookActivityId(
                      bookActivities,
                      state.completedLessonIds,
                      state.completedCheckpointIds
                    ) ?? bookActivities[0];
                  setIndividualBookId(choiceBook.id);
                  setSelectedBookId(choiceBook.id);
                  setStudyChoiceBookId(undefined);
                  navigate(lessonPath(firstPending, choiceBook.id));
                }}
              >
                <span aria-hidden="true">▣</span>
                <span><strong>Estudar o livro individualmente</strong><small>Avance dentro de {choiceBook.title}, sem alterar sua posição na rota.</small></span>
              </button>
              <button
                type="button"
                className="study-choice-option"
                onClick={() => {
                  setStudyChoiceBookId(undefined);
                  setIndividualBookId(undefined);
                  setSelectedBookId(canonicalNextBook.id);
                  navigate("/lesson/" + canonicalNextId);
                }}
              >
                <span aria-hidden="true">→</span>
                <span><strong>Continuar pela jornada</strong><small>Retome o próximo passo recomendado em {canonicalNextBook.title}.</small></span>
              </button>
            </div>
            <button type="button" className="text-button" onClick={() => setStudyChoiceBookId(undefined)}>
              Agora não
            </button>
          </section>
        </div>
      )}

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
