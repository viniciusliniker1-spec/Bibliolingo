import { useMemo, useState } from "react";
import { ExerciseView } from "../../components/ExerciseView";
import { exerciseById, getBookForActivity, getUnitForActivity, orderedLessons } from "../../content/catalog";
import { getReviewQueue } from "../../domain/review";
import { buildNoahPrompt, launchNoah, type NoahPromptType } from "../../services/noah";
import { useApp } from "../../state/AppContext";

const promptActions: { type: NoahPromptType; icon: string; title: string; note: string }[] = [
  { type: "deepen", icon: "⌁", title: "Aprofundar com Noah", note: "Contexto e implicações" },
  { type: "languages", icon: "א", title: "Entender grego/hebraico", note: "Termos e uso responsável" },
  { type: "connections", icon: "◎", title: "Encontrar conexões bíblicas", note: "Referências canônicas" },
  { type: "interpretations", icon: "≋", title: "Comparar interpretações", note: "Perspectivas cristãs" },
  { type: "sunday-school", icon: "◇", title: "Preparar aula de EBD", note: "Objetivos e dinâmica" },
  { type: "sermon", icon: "✦", title: "Criar esboço de pregação", note: "Estrutura e aplicações" },
  { type: "devotional", icon: "☀", title: "Criar devocional", note: "Reflexão e oração" }
];

export function Study() {
  const { state, dispatch } = useApp();
  const queue = useMemo(() => getReviewQueue(state.reviewItems), [state.reviewItems]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [result, setResult] = useState<boolean>();
  const [notice, setNotice] = useState<string>();

  const currentId = reviewIds[reviewIndex];
  const exercise = currentId ? exerciseById.get(currentId) : undefined;

  if (exercise) {
    return (
      <main className="page review-runner">
        <header className="review-header">
          <button className="icon-button" aria-label="Fechar revisão" onClick={() => setReviewIds([])}>×</button>
          <div><p className="eyebrow">Revisão inteligente</p><strong>{reviewIndex + 1} de {reviewIds.length}</strong></div>
          <div className="heart-counter">♥ {state.settings.heartsEnabled ? state.hearts : "∞"}</div>
        </header>
        <ExerciseView
          exercise={exercise}
          result={result}
          successXp="+3 XP · +1 coração"
          onAnswer={(correct) => {
            setResult(correct);
            dispatch({
              type: "ANSWER",
              questionId: exercise.id,
              lessonId: "review",
              conceptId: exercise.conceptId,
              difficulty: exercise.difficulty,
              correct,
              mode: "review"
            });
          }}
          onContinue={() => {
            if (reviewIndex >= reviewIds.length - 1) {
              setReviewIds([]);
              setReviewIndex(0);
            } else {
              setReviewIndex((value) => value + 1);
            }
            setResult(undefined);
          }}
          continueLabel={reviewIndex >= reviewIds.length - 1 ? "Concluir revisão" : "Próxima"}
          soundEnabled={state.settings.soundEnabled}
        />
      </main>
    );
  }

  const nextLesson = orderedLessons.find((lesson) => !state.completedLessonIds.includes(lesson.id)) ?? orderedLessons[0];
  const nextUnit = getUnitForActivity(nextLesson.id);
  const nextBook = getBookForActivity(nextLesson.id);

  const useNoah = async (type: NoahPromptType) => {
    const prompt = buildNoahPrompt(type, {
      title: nextLesson.title,
      reference: nextLesson.references[0]?.label ?? nextBook?.title ?? "Bíblia"
    });
    try {
      await launchNoah(prompt);
      dispatch({ type: "PROMPT", promptType: type });
      setNotice("Prompt copiado. O ChatGPT foi aberto.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível copiar o prompt.");
    }
  };

  return (
    <main className="page study-page">
      <header className="page-header">
        <p className="eyebrow">Aprender novamente também é avançar</p>
        <h1>Estudar</h1>
      </header>

      <section className="review-hero">
        <div className="review-orb" aria-hidden="true">↻</div>
        <div>
          <p className="eyebrow">Revisar</p>
          <h2>{queue.length ? queue.length + " itens pedem atenção" : "Tudo em dia"}</h2>
          <p>{queue.length ? "Priorizamos erros recentes e conceitos com menor domínio." : "Erros futuros aparecerão aqui no momento certo."}</p>
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={!queue.length}
          onClick={() => {
            setReviewIds(queue.map((item) => item.questionId));
            setReviewIndex(0);
          }}
        >
          {queue.length ? "Começar revisão" : "Sem revisões pendentes"}
        </button>
      </section>

      <section className="noah-section">
        <div className="section-title">
          <div><p className="eyebrow">Assistente externo</p><h2>Estudar com Noah</h2></div>
          <span className="free-badge">sem API</span>
        </div>
        <p className="section-copy">O contexto atual vira um prompt, é copiado e abre o ChatGPT. Nenhuma chave ou cobrança é necessária no app.</p>
        <div className="noah-grid">
          {promptActions.map((action) => (
            <button className="noah-card" type="button" key={action.type} onClick={() => useNoah(action.type)}>
              <span className="noah-icon" aria-hidden="true">{action.icon}</span>
              <span><strong>{action.title}</strong><small>{action.note}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="context-card">
        <p className="eyebrow">Contexto usado por Noah</p>
        <h3>{nextLesson.title}</h3>
        <p>{nextLesson.references[0]?.label} · {nextBook?.title ?? "Bíblia"} · {nextUnit?.title}</p>
      </section>

      {notice && <div className="toast" role="status">{notice}<button aria-label="Fechar aviso" onClick={() => setNotice(undefined)}>×</button></div>}
    </main>
  );
}
