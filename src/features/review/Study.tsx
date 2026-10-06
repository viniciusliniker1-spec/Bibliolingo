import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExerciseView } from "../../components/ExerciseView";
import { ProgressBar } from "../../components/ProgressBar";
import {
  exerciseById,
  getBookForActivity,
  getUnitForActivity,
  orderedLessons
} from "../../content/catalog";
import {
  getReviewQueue,
  reviewReason,
  summarizeReviewQueue
} from "../../domain/review";
import { buildNoahPrompt, launchNoah, type NoahPromptType } from "../../services/noah";
import { useApp } from "../../state/AppContext";
import { calculateConceptMastery } from "../../domain/mastery";

const promptActions: { type: NoahPromptType; icon: string; title: string; note: string }[] = [
  { type: "deepen", icon: "⌁", title: "Aprofundar com Noah", note: "Contexto e implicações" },
  { type: "languages", icon: "א", title: "Entender grego/hebraico", note: "Termos e uso responsável" },
  { type: "connections", icon: "◎", title: "Encontrar conexões bíblicas", note: "Referências canônicas" },
  { type: "interpretations", icon: "≋", title: "Comparar interpretações", note: "Perspectivas cristãs" },
  { type: "sunday-school", icon: "◇", title: "Preparar aula de EBD", note: "Objetivos e dinâmica" },
  { type: "sermon", icon: "✦", title: "Criar esboço de pregação", note: "Estrutura e aplicações" },
  { type: "devotional", icon: "☀", title: "Criar devocional", note: "Reflexão e oração" }
];

interface ReviewCompletion {
  total: number;
  correct: number;
}

export function Study() {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const queue = useMemo(() => getReviewQueue(state.reviewItems), [state.reviewItems]);
  const queueSummary = useMemo(() => summarizeReviewQueue(queue), [queue]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [result, setResult] = useState<boolean>();
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [reviewCompletion, setReviewCompletion] = useState<ReviewCompletion>();
  const [notice, setNotice] = useState<string>();
  const requestedLesson = searchParams.get("lesson");
  const defaultLesson = orderedLessons.find((lesson) => !state.completedLessonIds.includes(lesson.id)) ?? orderedLessons[0];
  const selectedLesson = orderedLessons.find((lesson) => lesson.id === requestedLesson) ?? defaultLesson;
  const selectedUnit = getUnitForActivity(selectedLesson.id);
  const selectedBook = getBookForActivity(selectedLesson.id);
  const mastery = useMemo(
    () => calculateConceptMastery(state.attempts, (questionId) => exerciseById.get(questionId)?.conceptId),
    [state.attempts]
  );

  const currentId = reviewIds[reviewIndex];
  const exercise = currentId ? exerciseById.get(currentId) : undefined;
  const reviewItem = currentId
    ? state.reviewItems.find((item) => item.questionId === currentId)
    : undefined;

  const startReview = (limit?: number) => {
    const availableIds = queue
      .map((item) => item.questionId)
      .filter((id) => exerciseById.has(id));
    const selected = limit ? availableIds.slice(0, limit) : availableIds;
    setReviewIds(selected);
    setReviewIndex(0);
    setResult(undefined);
    setSessionResults([]);
    setReviewCompletion(undefined);
  };

  if (reviewCompletion) {
    const recovered = state.settings.heartsEnabled
      ? Math.min(reviewCompletion.correct, state.settings.maxHearts)
      : 0;
    return (
      <main className="page review-completion">
        <div className="completion-burst" aria-hidden="true">↻</div>
        <p className="eyebrow">Sessão concluída</p>
        <h1>Memória fortalecida</h1>
        <p>Você revisou conhecimento que poderia ser esquecido e transformou erros em prática.</p>
        <div className="summary-grid">
          <div><span>✓</span><strong>{reviewCompletion.correct}/{reviewCompletion.total}</strong><small>acertos</small></div>
          <div><span>◎</span><strong>{Math.round((reviewCompletion.correct / reviewCompletion.total) * 100)}%</strong><small>precisão</small></div>
          <div><span>⚡</span><strong>+{reviewCompletion.correct * 3}</strong><small>XP</small></div>
          <div><span>♥</span><strong>{state.settings.heartsEnabled ? "+" + recovered : "∞"}</strong><small>corações</small></div>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setReviewCompletion(undefined);
            setReviewIds([]);
          }}
        >
          Voltar ao estudo
        </button>
        {queue.length > 0 && (
          <button type="button" className="secondary-button" onClick={() => startReview(5)}>
            Revisar mais 5
          </button>
        )}
      </main>
    );
  }

  if (exercise) {
    return (
      <main className="page review-runner">
        <header className="review-header">
          <button
            className="icon-button"
            aria-label="Fechar revisão"
            onClick={() => {
              setReviewIds([]);
              setSessionResults([]);
              setResult(undefined);
            }}
          >
            ×
          </button>
          <div>
            <p className="eyebrow">Revisão inteligente</p>
            <strong>{reviewIndex + 1} de {reviewIds.length}</strong>
            <ProgressBar value={reviewIndex + (typeof result === "boolean" ? 1 : 0)} max={reviewIds.length} label="Progresso da revisão" />
          </div>
          <div className="heart-counter">♥ {state.settings.heartsEnabled ? state.hearts : "∞"}</div>
        </header>
        {reviewItem && (
          <aside className="review-reason">
            <span aria-hidden="true">◎</span>
            <div><strong>Por que esta questão apareceu?</strong><p>{reviewReason(reviewItem)}</p></div>
          </aside>
        )}
        <ExerciseView
          exercise={exercise}
          result={result}
          successXp={state.settings.heartsEnabled ? "+3 XP · +1 coração" : "+3 XP"}
          onAnswer={(correct) => {
            setResult(correct);
            setSessionResults((items) => [...items, correct]);
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
              setReviewCompletion({
                total: reviewIds.length,
                correct: sessionResults.filter(Boolean).length
              });
              setReviewIds([]);
              setReviewIndex(0);
            } else {
              setReviewIndex((value) => value + 1);
            }
            setResult(undefined);
          }}
          continueLabel={reviewIndex >= reviewIds.length - 1 ? "Ver resultado" : "Próxima"}
          soundEnabled={state.settings.soundEnabled}
          hapticsEnabled={state.settings.hapticsEnabled}
        />
      </main>
    );
  }

  const nextLesson = selectedLesson;
  const nextUnit = getUnitForActivity(nextLesson.id);
  const nextBook = getBookForActivity(nextLesson.id);
  const nextScheduled = [...state.reviewItems]
    .filter((item) => item.lastResult === "correct")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

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

      <section className="track-grid" aria-labelledby="tracks-title">
        <div className="section-title"><div><p className="eyebrow">Percursos independentes</p><h2 id="tracks-title">Escolha o que estudar</h2></div></div>
        <Link className="track-card active" to="/"><strong>Bíblia</strong><span>Jornada recomendada e acesso livre aos 66 livros</span></Link>
        {state.profile.knowledgeLevel === "advanced" ? (
          <Link className="track-card deepen-track" to="/deepen"><strong>Aprofundar</strong><span>Estudos completos e questões avançadas</span></Link>
        ) : (
          <Link className="track-card locked-track" to="/profile"><strong>Aprofundar</strong><span>Selecione o nível avançado no Perfil</span></Link>
        )}
        <article className="track-card"><strong>Teologia</strong><span>Percurso próprio em preparação</span></article>
        <article className="track-card"><strong>Formação Ministerial</strong><span>Competências para servir e ensinar</span></article>
        <Link className="track-card" to="/formation"><strong>Trilha Nazarena</strong><span>Identidade, doutrina e prática pastoral</span></Link>
      </section>

      <section className="complete-study" aria-labelledby="complete-study-title">
        <div className="section-title">
          <div><p className="eyebrow">Conteúdo completo · {selectedBook?.title}</p><h2 id="complete-study-title">{selectedLesson.title}</h2></div>
          {selectedLesson.study && <span className="free-badge">~{selectedLesson.study.estimatedWords} palavras</span>}
        </div>
        <p className="section-copy">{selectedLesson.study?.objective ?? "Este conteúdo ainda está na fila de revisão editorial. A lição curta continua disponível sem esconder o ensino essencial."}</p>
        <label className="study-selector">
          <span>Lição</span>
          <select value={selectedLesson.id} onChange={(event) => setSearchParams({ lesson: event.target.value })}>
            {orderedLessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
          </select>
        </label>
        {selectedLesson.study ? (
          <div className="study-blocks">
            {selectedLesson.study.blocks.map((block, index) => (
              <details key={block.id} open={index === 0}>
                <summary><span>{index + 1}</span>{block.title}</summary>
                <p>{block.body}</p>
              </details>
            ))}
          </div>
        ) : (
          <div className="study-pending"><strong>Revisão editorial pendente</strong><p>O schema já suporta estudo completo e blocos retomáveis; este conteúdo não será preenchido em massa sem fontes revisadas.</p></div>
        )}
        <div className="study-actions">
          <Link className="primary-button" to={`/lesson/${selectedLesson.id}`}>Abrir lição curta</Link>
          <span>{selectedLesson.references[0]?.label} · {selectedUnit?.title}</span>
        </div>
        {selectedLesson.study && selectedUnit && (
          <div className="source-ledger">
            <p className="eyebrow">Rastreabilidade</p>
            {selectedUnit.sources
              .filter((source) => selectedLesson.study?.blocks.some((block) => block.sourceIds?.includes(source.id)))
              .map((source) => <div key={source.id}><strong>{source.title}</strong><small>{source.author ?? source.institution ?? "Fonte primária"} · {source.status ?? "localizado"} · {source.license ?? "licença a verificar"}</small></div>)}
          </div>
        )}
      </section>

      <section className="mastery-overview">
        <div><p className="eyebrow">Domínio por assunto</p><h2>Aprendizagem, separada do XP</h2></div>
        <p>XP registra atividade. Domínio usa desempenho recente, questões diferentes, revisões posteriores e checkpoints.</p>
        <div>{mastery.slice().sort((a, b) => b.score - a.score).slice(0, 6).map((item) => <span key={item.conceptId}><strong>{item.score}%</strong>{item.conceptId} · {item.distinctQuestions} questões</span>)}</div>
        {!mastery.length && <small>Responda questões para formar evidências de domínio.</small>}
      </section>

      <section className="formation-study-banner">
        <span className="formation-entry-icon" aria-hidden="true">N</span>
        <div><p className="eyebrow">Formação estruturada</p><h2>Formação Pastoral Nazareno</h2><p>Estude seis matérias, faça provas objetivas e acompanhe seu progresso.</p></div>
        <button type="button" className="secondary-button" onClick={() => window.location.hash = "#/formation"}>Abrir formação</button>
      </section>

      <section className={"review-dashboard " + (!queue.length ? "empty" : "")}>
        <div className="review-dashboard-heading">
          <div className="review-orb" aria-hidden="true">{queue.length ? "↻" : "✓"}</div>
          <div>
            <p className="eyebrow">Revisão espaçada</p>
            <h2>{queue.length ? queue.length + " itens para fortalecer" : "Tudo em dia"}</h2>
            <p>
              {queue.length
                ? "A fila explica o motivo de cada item e prioriza erros ou conteúdo vencido."
                : nextScheduled
                  ? "Próxima revisão programada para " + new Date(nextScheduled.dueDate + "T12:00:00").toLocaleDateString("pt-BR") + "."
                  : "Quando você errar ou revisar um conceito, ele aparecerá aqui no momento certo."}
            </p>
          </div>
        </div>

        {queue.length > 0 && (
          <>
            <div className="review-metrics">
              <div><strong>{queueSummary.recentErrors}</strong><small>erros recentes</small></div>
              <div><strong>{queueSummary.overdue}</strong><small>revisões vencidas</small></div>
              <div><strong>{queueSummary.concepts}</strong><small>conceitos</small></div>
              <div><strong>~{queueSummary.estimatedMinutes} min</strong><small>fila completa</small></div>
            </div>
            <div className="review-actions">
              <button type="button" className="primary-button" onClick={() => startReview(5)}>
                Sessão rápida · até 5
              </button>
              {queue.length > 5 && (
                <button type="button" className="secondary-button" onClick={() => startReview()}>
                  Revisar todos os {queue.length} itens
                </button>
              )}
            </div>
          </>
        )}
      </section>

      <section className="noah-section">
        <div className="section-title">
          <div><p className="eyebrow">Assistente externo</p><h2>Estudar com Noah</h2></div>
          <span className="free-badge">sem API</span>
        </div>
        <p className="section-copy">O contexto atual vira um prompt, é copiado e abre o ChatGPT. O app não envia a mensagem automaticamente e não usa API, chave ou cobrança.</p>
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
