import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AppIcon } from "../../ui/icons";
import { Mascot } from "../../ui/Mascot";
import { useApp } from "../../state/AppContext";
import {
  askRemoteNoah,
  remoteNoahConfigured,
  type NoahContext,
  type NoahHistoryMessage,
  type NoahMode,
  type NoahTutorResponse
} from "../../services/noahRemote";
import {
  noahQuestionsRemaining,
  registerNoahQuestion
} from "../../services/noahUsage";
import { NoahMarkdown } from "./NoahMarkdown";

export interface NoahTutorTrigger {
  id: string;
  mode: NoahMode;
  question: string;
  context?: NoahContext;
  autoSend?: boolean;
  reason?: "incorrect" | "hint" | "correct";
}

interface NoahTutorProps {
  context: NoahContext;
  initialMode?: NoahMode;
  label?: string;
  inline?: boolean;
  contextKey?: string;
  trigger?: NoahTutorTrigger;
  onContinueLesson?: () => void;
  hideLauncher?: boolean;
}

interface TutorMessage extends NoahHistoryMessage {
  id: string;
}

const ACTIONS: { mode: NoahMode; label: string; prompt: string }[] = [
  {
    mode: "explain",
    label: "Explique de outra forma",
    prompt: "Explique este ponto por outro caminho, com clareza e sem inventar informações."
  },
  {
    mode: "deepen",
    label: "Mostre o contexto bíblico",
    prompt: "Mostre o contexto bíblico e literário desta questão, citando apenas referências verificáveis."
  },
  {
    mode: "example",
    label: "Dê um exemplo",
    prompt: "Dê um exemplo didático coerente com o texto e explique o vínculo com a questão."
  },
  {
    mode: "ask",
    label: "Tenho uma dúvida",
    prompt: ""
  }
];

const createId = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

export function NoahTutor({
  context,
  initialMode = "ask",
  label = "Perguntar ao Noah",
  inline = false,
  contextKey,
  trigger,
  onContinueLesson,
  hideLauncher = false
}: NoahTutorProps) {
  const { state, dispatch } = useApp();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<NoahMode>(initialMode);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const [remainingQuestions, setRemainingQuestions] = useState(noahQuestionsRemaining);
  const [activeContext, setActiveContext] = useState(context);
  const endRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(createId());
  const handledTriggerRef = useRef<string | undefined>(undefined);
  const dragStartRef = useRef<number | undefined>(undefined);
  const dragOffsetRef = useRef(0);
  const [sheetOffset, setSheetOffset] = useState(0);
  const configured = remoteNoahConfigured();

  const beginSheetDrag = (clientY: number) => {
    dragStartRef.current = clientY;
    dragOffsetRef.current = 0;
  };

  const moveSheetDrag = (clientY: number) => {
    if (dragStartRef.current === undefined) return;
    const offset = Math.max(0, clientY - dragStartRef.current);
    dragOffsetRef.current = offset;
    setSheetOffset(offset);
  };

  const endSheetDrag = () => {
    if (dragOffsetRef.current > 80) setOpen(false);
    dragStartRef.current = undefined;
    dragOffsetRef.current = 0;
    setSheetOffset(0);
  };

  useEffect(() => {
    setActiveContext(context);
  }, [context]);

  useEffect(() => {
    sessionIdRef.current = createId();
    handledTriggerRef.current = undefined;
    setMessages([]);
    setError(undefined);
    setDraft("");
    setOpen(false);
  }, [contextKey]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendQuestion = useCallback(
    async (question: string, nextMode: NoahMode, overrideContext?: NoahContext) => {
      if (!question.trim() || sending) return;
      if (noahQuestionsRemaining() <= 0) {
        setRemainingQuestions(0);
        setError("Você chegou ao limite diário de perguntas ao Noah. Amanhã haverá uma nova cota para continuar.");
        return;
      }
      const cleanQuestion = question.trim();
      const requestContext = overrideContext ?? activeContext;
      const user: TutorMessage = { id: createId(), role: "user", content: cleanQuestion };
      const history = messages.map(({ role, content }) => ({ role, content }));
      setMessages((items) => [...items, user]);
      setDraft("");
      setMode(nextMode);
      setSending(true);
      setError(undefined);
      try {
        const response = await askRemoteNoah({
          question: cleanQuestion,
          mode: nextMode,
          level: state.profile.knowledgeLevel,
          context: requestContext,
          history,
          sessionId: sessionIdRef.current
        });
        setMessages((items) => [
          ...items,
          {
            id: createId(),
            role: "assistant",
            content: response.answer
          }
        ]);
        registerNoahQuestion();
        setRemainingQuestions(noahQuestionsRemaining());
        dispatch({
          type: "PROMPT",
          promptType:
            requestContext.area === "formation"
              ? "pastoral"
              : requestContext.area === "greek"
                ? "greek-tutor"
                : "noah-tutor"
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Noah está indisponível agora.");
      } finally {
        setSending(false);
      }
    },
    [activeContext, dispatch, messages, sending, state.profile.knowledgeLevel]
  );

  useEffect(() => {
    if (!trigger || handledTriggerRef.current === trigger.id) return;
    handledTriggerRef.current = trigger.id;
    const nextContext = trigger.context ?? context;
    setActiveContext(nextContext);
    setMode(trigger.mode);
    setOpen(true);
    if (trigger.reason === "incorrect") {
      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: "Vamos entender essa questão?"
        }
      ]);
    }
    if (trigger.autoSend !== false) void sendQuestion(trigger.question, trigger.mode, nextContext);
  }, [context, sendQuestion, trigger]);

  const openWith = (nextMode: NoahMode, prompt?: string) => {
    setMode(nextMode);
    if (prompt) setDraft(prompt);
    setOpen(true);
  };

  const endConversation = () => {
    setOpen(false);
    setMessages([]);
    setError(undefined);
    setDraft("");
    sessionIdRef.current = createId();
  };

  return (
    <>
      {!hideLauncher && (inline ? (
        <button className="noah-tutor-inline" type="button" onClick={() => openWith(initialMode)}>
          <AppIcon name="noah" />
          {label}
        </button>
      ) : (
        <button
          className={"noah-tutor-fab " + (open ? "is-open" : "")}
          type="button"
          aria-label={open ? "Minimizar Professor Noah" : label}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <AppIcon name="noah" />
          <span>{open ? "Minimizar" : label}</span>
        </button>
      ))}

      {open && (
        <aside
          className={"noah-tutor-panel " + (trigger?.reason ? "contextual " + trigger.reason : "")}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          style={{ "--noah-sheet-offset": sheetOffset + "px" } as CSSProperties}
        >
          <button
            type="button"
            className="noah-sheet-handle"
            aria-label="Arraste para baixo ou toque para fechar"
            onClick={() => setOpen(false)}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              beginSheetDrag(event.clientY);
            }}
            onPointerMove={(event) => moveSheetDrag(event.clientY)}
            onPointerUp={endSheetDrag}
            onPointerCancel={endSheetDrag}
          >
            <span aria-hidden="true" />
          </button>
          <header>
            <div>
              <span className="noah-tutor-avatar"><Mascot mood="thinking" size={42} decorative /></span>
              <div>
                <p className="eyebrow">Tutor bíblico contextual</p>
                <h2 id={titleId}>Professor Noah</h2>
              </div>
            </div>
            <div className="noah-tutor-window-actions">
              <button
                className="icon-button"
                type="button"
                aria-label="Minimizar conversa"
                onClick={() => setOpen(false)}
              >
                −
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="Encerrar conversa"
                onClick={endConversation}
              >
                <AppIcon name="close" />
              </button>
            </div>
          </header>

          <div className="noah-context-chip">
            <strong>{activeContext.title}</strong>
            {activeContext.reference && <span>{activeContext.reference}</span>}
          </div>

          <div className="noah-tutor-suggestions" aria-label="Ações rápidas">
            {ACTIONS.map((action) => (
              <button
                type="button"
                key={action.label}
                onClick={() => openWith(action.mode, action.prompt)}
              >
                {action.label}
              </button>
            ))}
            {activeContext.area === "formation" && (
              <button
                type="button"
                onClick={() =>
                  openWith(
                    "pastoral-interview",
                    "Conduza uma simulação de entrevista pastoral com uma pergunta por vez e feedback formativo, sem atribuir aprovação oficial."
                  )
                }
              >
                Simular entrevista
              </button>
            )}
          </div>

          <section className="noah-tutor-history" aria-live="polite" aria-busy={sending}>
            {!messages.length && (
              <div className="noah-tutor-empty">
                <p>Posso oferecer uma pista, explicar o conteúdo ou ajudar você a raciocinar sobre um erro.</p>
                <small>
                  Antes da correção, não revelo o gabarito. Fontes insuficientes são identificadas com clareza.
                </small>
              </div>
            )}
            {messages.map((message) => (
              <article className={"noah-tutor-message " + message.role} key={message.id}>
                <strong>{message.role === "assistant" ? "Noah" : "Você"}</strong>
                {message.role === "assistant" ? (
                  <NoahMarkdown>{message.content}</NoahMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
              </article>
            ))}
            {sending && (
              <div className="noah-tutor-thinking" role="status">
                <span />
                <span />
                <span /> Noah está preparando uma explicação…
              </div>
            )}
            <div ref={endRef} />
          </section>

          {error && (
            <div className="noah-tutor-error" role="alert">
              <p>{error}</p>
              {!configured && <small>O administrador ainda precisa conectar o serviço seguro do Noah.</small>}
            </div>
          )}

          <form
            className="noah-tutor-form"
            onSubmit={(event) => {
              event.preventDefault();
              void sendQuestion(draft, mode);
            }}
          >
            <label htmlFor={titleId + "-question"}>Sua pergunta</label>
            <textarea
              id={titleId + "-question"}
              value={draft}
              maxLength={1200}
              rows={3}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="O que você quer compreender?"
              disabled={sending}
            />
            <div>
              <small>{draft.length}/1200 · {remainingQuestions} perguntas disponíveis hoje</small>
              <button className="primary-button" type="submit" disabled={sending || !draft.trim()}>
                Enviar
              </button>
            </div>
          </form>

          {onContinueLesson && (
            <button
              type="button"
              className="noah-continue-lesson"
              onClick={() => {
                setOpen(false);
                onContinueLesson();
              }}
            >
              Continuar lição
            </button>
          )}
        </aside>
      )}
    </>
  );
}
