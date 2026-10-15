import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../components/ProgressBar";
import {
  formationActivityTitle,
  formationActivityUnlocked,
  formationContent,
  formationLessonById,
  nextFormationActivityId,
  orderedFormationActivityIds
} from "../../content/formation/catalog";
import { useApp } from "../../state/AppContext";

export function FormationHub() {
  const { state } = useApp();
  const navigate = useNavigate();
  const calculatedNext = nextFormationActivityId(
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const activeId =
    state.activeSession && orderedFormationActivityIds.includes(state.activeSession.lessonId)
      ? state.activeSession.lessonId
      : calculatedNext;
  const [openSubjectId, setOpenSubjectId] = useState(
    formationLessonById.get(activeId)?.subjectId ??
      formationContent.subjects.find((subject) => subject.examId === activeId)?.id ??
      formationContent.subjects[0].id
  );
  const completed = new Set([
    ...state.completedLessonIds,
    ...state.completedCheckpointIds
  ]);
  const completedCount = orderedFormationActivityIds.filter((id) => completed.has(id)).length;
  const courseComplete = completed.has(formationContent.finalExam.id);

  return (
    <main className="page formation-page">
      <header className="formation-hero">
        <div className="formation-hero-mark" aria-hidden="true">N</div>
        <div>
          <p className="eyebrow">Segunda jornada</p>
          <h1>Formação Pastoral</h1>
          <p>Preparação introdutória nazarena com doutrina, história, Bíblia e prática ministerial.</p>
        </div>
      </header>

      <section className="formation-progress-card">
        <div className="card-heading">
          <div><p className="eyebrow">Progresso geral</p><h2>{completedCount} de {orderedFormationActivityIds.length} etapas</h2></div>
          <strong>{Math.round((completedCount / orderedFormationActivityIds.length) * 100)}%</strong>
        </div>
        <ProgressBar
          value={completedCount}
          max={orderedFormationActivityIds.length}
          label="Progresso da Formação Pastoral"
          tone="gold"
        />
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/formation/activity/" + activeId)}
        >
          {state.activeSession?.lessonId === activeId ? "Continuar formação" : courseComplete ? "Revisitar simulado" : "Continuar formação"}
        </button>
      </section>

      <aside className="formation-disclaimer" role="note">
        <span aria-hidden="true">i</span>
        <p>{formationContent.disclaimer}</p>
      </aside>

      <section className="formation-subjects">
        <div className="section-title">
          <div><p className="eyebrow">Percurso completo</p><h2>6 matérias</h2></div>
          <span>{formationContent.lessons.length} lições</span>
        </div>

        {formationContent.subjects.map((subject, subjectIndex) => {
          const ids = [...subject.lessonIds, subject.examId];
          const done = ids.filter((id) => completed.has(id)).length;
          const unlocked = formationActivityUnlocked(
            subject.lessonIds[0],
            state.completedLessonIds,
            state.completedCheckpointIds
          );
          const open = openSubjectId === subject.id;
          return (
            <article className={"formation-subject-card " + (!unlocked ? "locked" : "")} key={subject.id}>
              <button
                type="button"
                className="formation-subject-heading"
                aria-expanded={open}
                onClick={() => setOpenSubjectId(open ? "" : subject.id)}
              >
                <span className="formation-subject-icon" aria-hidden="true">{subject.icon}</span>
                <span>
                  <small>Matéria {subjectIndex + 1}</small>
                  <strong>{subject.title}</strong>
                  <em>{done}/{ids.length} etapas</em>
                </span>
                <span className="formation-chevron" aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="formation-subject-body">
                  <p>{subject.description}</p>
                  <ProgressBar value={done} max={ids.length} label={"Progresso em " + subject.title} />
                  <div className="formation-lesson-list">
                    {subject.lessonIds.map((lessonId, lessonIndex) => {
                      const lesson = formationLessonById.get(lessonId)!;
                      const lessonUnlocked = formationActivityUnlocked(
                        lessonId,
                        state.completedLessonIds,
                        state.completedCheckpointIds
                      );
                      const lessonDone = completed.has(lessonId);
                      return (
                        <button
                          type="button"
                          key={lessonId}
                          disabled={!lessonUnlocked}
                          className={"formation-lesson-row " + (lessonDone ? "completed" : lessonId === activeId ? "current" : !lessonUnlocked ? "locked" : "")}
                          onClick={() => navigate("/formation/activity/" + lessonId)}
                        >
                          <span aria-hidden="true">{lessonDone ? "✓" : lessonUnlocked ? lessonIndex + 1 : "⌁"}</span>
                          <span><strong>{lesson.title}</strong><small>{lesson.minutes} min · 3 questões</small></span>
                          <em aria-hidden="true">→</em>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={!formationActivityUnlocked(subject.examId, state.completedLessonIds, state.completedCheckpointIds)}
                      className={"formation-lesson-row exam " + (completed.has(subject.examId) ? "completed" : subject.examId === activeId ? "current" : "")}
                      onClick={() => navigate("/formation/activity/" + subject.examId)}
                    >
                      <span aria-hidden="true">{completed.has(subject.examId) ? "✓" : "★"}</span>
                      <span><strong>Prova da matéria</strong><small>{subject.examQuestionIds.length} questões · mínimo 80%</small></span>
                      <em aria-hidden="true">→</em>
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className={"formation-final-card " + (!formationActivityUnlocked(formationContent.finalExam.id, state.completedLessonIds, state.completedCheckpointIds) ? "locked" : "")}>
        <span className="formation-final-medal" aria-hidden="true">{courseComplete ? "✓" : "★"}</span>
        <div><p className="eyebrow">Etapa final</p><h2>{formationContent.finalExam.title}</h2><p>30 questões das seis matérias · critério pedagógico de 80%.</p></div>
        <button
          type="button"
          className="secondary-button"
          disabled={!formationActivityUnlocked(formationContent.finalExam.id, state.completedLessonIds, state.completedCheckpointIds)}
          onClick={() => navigate("/formation/activity/" + formationContent.finalExam.id)}
        >
          {courseComplete ? "Refazer" : "Começar"}
        </button>
      </section>
    </main>
  );
}
