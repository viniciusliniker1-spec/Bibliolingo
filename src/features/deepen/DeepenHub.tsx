import { useNavigate } from "react-router-dom";
import { ProgressBar } from "../../components/ProgressBar";
import {
  deepenActivityComplete,
  deepenActivityIds,
  deepenActivityUnlocked,
  deepenGenesisUnit,
  nextDeepenActivity
} from "../../content/deepen/catalog";
import { useApp } from "../../state/AppContext";

export function DeepenHub() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const advanced = state.profile.knowledgeLevel === "advanced";
  const completed = deepenActivityIds.filter((id) =>
    deepenActivityComplete(id, state.completedLessonIds, state.completedCheckpointIds)
  ).length;
  const nextId = nextDeepenActivity(state.completedLessonIds, state.completedCheckpointIds);

  if (!advanced) {
    return (
      <main className="page deepen-page">
        <section className="deepen-gate">
          <span className="deepen-mark" aria-hidden="true">⌁</span>
          <p className="eyebrow">Percurso avançado</p>
          <h1>Aprofundar</h1>
          <p>Estudos extensos, interpretação responsável, fontes e questões que exigem integração de conceitos.</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              dispatch({ type: "SET_KNOWLEDGE_LEVEL", level: "advanced" });
              navigate("/deepen");
            }}
          >
            Ativar nível avançado
          </button>
          <button type="button" className="text-button" onClick={() => navigate("/profile")}>Escolher no Perfil</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page deepen-page">
      <header className="deepen-hero">
        <span className="deepen-mark" aria-hidden="true">⌁</span>
        <div>
          <p className="eyebrow">Nível bíblico avançado</p>
          <h1>Aprofundar</h1>
          <p>Leia com atenção, diferencie texto e interpretação e demonstre domínio com questões mais complexas.</p>
        </div>
      </header>

      <section className="deepen-progress-card">
        <div className="card-heading"><strong>Jornada avançada</strong><span>{completed}/{deepenActivityIds.length}</span></div>
        <ProgressBar value={completed} max={deepenActivityIds.length} label="Progresso na jornada Aprofundar" tone="gold" />
        <button className="primary-button" type="button" onClick={() => navigate("/deepen/activity/" + nextId)}>
          {completed ? "Continuar aprofundamento" : "Começar aprofundamento"}
        </button>
      </section>

      <section className="deepen-unit-card">
        <header>
          <span>Gn</span>
          <div><p className="eyebrow">Unidade piloto</p><h2>{deepenGenesisUnit.title}</h2><p>{deepenGenesisUnit.subtitle}</p></div>
        </header>
        <div className="deepen-path">
          {deepenGenesisUnit.lessons.map((lesson, index) => {
            const complete = state.completedLessonIds.includes(lesson.id);
            const unlocked = deepenActivityUnlocked(lesson.id, state.completedLessonIds, state.completedCheckpointIds);
            const current = lesson.id === nextId && !complete;
            return (
              <button
                type="button"
                className={"deepen-node " + (complete ? "completed" : current ? "current" : unlocked ? "available" : "locked")}
                disabled={!unlocked}
                key={lesson.id}
                onClick={() => navigate("/deepen/activity/" + lesson.id)}
              >
                <span aria-hidden="true">{complete ? "✓" : unlocked ? index + 1 : "⌁"}</span>
                <span><small>Lição avançada · {lesson.estimatedMinutes} min</small><strong>{lesson.title}</strong><em>{lesson.subtitle}</em></span>
                <b aria-hidden="true">›</b>
              </button>
            );
          })}
          {(() => {
            const checkpoint = deepenGenesisUnit.checkpoint;
            const complete = state.completedCheckpointIds.includes(checkpoint.id);
            const unlocked = deepenActivityUnlocked(checkpoint.id, state.completedLessonIds, state.completedCheckpointIds);
            return (
              <button
                type="button"
                className={"deepen-node checkpoint " + (complete ? "completed" : unlocked ? "available" : "locked")}
                disabled={!unlocked}
                onClick={() => navigate("/deepen/activity/" + checkpoint.id)}
              >
                <span aria-hidden="true">★</span>
                <span><small>80% para aprovação</small><strong>{checkpoint.title}</strong><em>{checkpoint.subtitle}</em></span>
                <b aria-hidden="true">›</b>
              </button>
            );
          })()}
        </div>
      </section>

      <section className="deepen-roadmap" aria-label="Próximos conteúdos">
        <p className="eyebrow">Expansão editorial</p>
        <h2>Próximas unidades</h2>
        <p>Gênesis 3 e os demais capítulos serão liberados somente após redação, fontes e revisão humana. A engine já está preparada para recebê-los.</p>
      </section>
    </main>
  );
}
