import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../state/AppContext";
import {
  askRemoteNoah,
  remoteNoahConfigured,
  type NoahContext,
  type NoahHistoryMessage,
  type NoahMode
} from "../../services/noahRemote";

interface NoahTutorProps {
  context: NoahContext;
  initialMode?: NoahMode;
  label?: string;
  inline?: boolean;
}

const ACTIONS: { mode: NoahMode; label: string; prompt: string }[] = [
  { mode: "simple", label: "Explicar simples", prompt: "Explique novamente de forma simples, em etapas curtas." },
  { mode: "deepen", label: "Aprofundar", prompt: "Aprofunde este assunto e mostre os limites da interpretação." },
  { mode: "example", label: "Mostrar exemplo", prompt: "Mostre um exemplo adicional e explique como ele se relaciona ao conteúdo." },
  { mode: "error", label: "Explicar meu erro", prompt: "Ajude-me a entender meu erro sem apenas entregar a resposta." },
  { mode: "practice", label: "Praticar comigo", prompt: "Pratique comigo usando uma pergunta guiada, sem conceder XP." }
];

function id() {
  return crypto.randomUUID?.() ?? String(Date.now() + Math.random());
}

export function NoahTutor({ context, initialMode = "ask", label = "Perguntar ao Noah", inline = false }: NoahTutorProps) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<NoahMode>(initialMode);
  const [messages, setMessages] = useState<(NoahHistoryMessage & { id: string })[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);
  const configured = remoteNoahConfigured();

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const openWith = (nextMode: NoahMode, prompt?: string) => {
    setMode(nextMode);
    if (prompt) setDraft(prompt);
    setOpen(true);
  };

  const send = async () => {
    if (!draft.trim() || sending) return;
    const question = draft.trim();
    const user = { id: id(), role: "user" as const, content: question };
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((items) => [...items, user]);
    setDraft("");
    setSending(true);
    setError(undefined);
    try {
      const response = await askRemoteNoah({
        question,
        mode,
        level: state.profile.knowledgeLevel,
        context,
        history
      });
      setMessages((items) => [...items, { id: id(), role: "assistant", content: response.answer }]);
      dispatch({ type: "PROMPT", promptType: context.area === "formation" ? "pastoral" : context.area === "greek" ? "greek-tutor" : "noah-tutor" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Noah está indisponível agora.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {inline ? (
        <button className="noah-tutor-inline" type="button" onClick={() => openWith(initialMode)}>
          <span aria-hidden="true">N</span>{label}
        </button>
      ) : (
        <button className="noah-tutor-fab" type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen(true)}>
          <span aria-hidden="true">N</span><span>{label}</span>
        </button>
      )}

      {open && (
        <aside className="noah-tutor-panel" role="dialog" aria-modal="false" aria-labelledby={titleId}>
          <header>
            <div><span className="noah-tutor-avatar" aria-hidden="true">N</span><div><p className="eyebrow">Professor contextual</p><h2 id={titleId}>Noah</h2></div></div>
            <button className="icon-button" type="button" aria-label="Encerrar conversa" onClick={() => { setOpen(false); setMessages([]); setError(undefined); }}>×</button>
          </header>

          <div className="noah-context-chip"><strong>{context.title}</strong>{context.reference && <span>{context.reference}</span>}</div>

          <div className="noah-tutor-suggestions" aria-label="Modos de ajuda">
            {ACTIONS.map((action) => <button type="button" key={action.mode} onClick={() => openWith(action.mode, action.prompt)}>{action.label}</button>)}
          </div>

          <section className="noah-tutor-history" aria-live="polite" aria-busy={sending}>
            {!messages.length && <div className="noah-tutor-empty"><p>Posso explicar o conteúdo, ajudar a raciocinar sobre um erro ou praticar com você.</p><small>Minimize dados pessoais. Respostas de IA podem conter erros; confira as fontes da lição.</small></div>}
            {messages.map((message) => (
              <article className={"noah-tutor-message " + message.role} key={message.id}>
                <strong>{message.role === "assistant" ? "Noah" : "Você"}</strong>
                <p>{message.content}</p>
              </article>
            ))}
            {sending && <div className="noah-tutor-thinking" role="status"><span /><span /><span /> Noah está preparando uma explicação…</div>}
            <div ref={endRef} />
          </section>

          {error && <div className="noah-tutor-error" role="alert"><p>{error}</p>{!configured && <button type="button" onClick={() => navigate("/noah")}>Usar Noah local opcional</button>}</div>}

          <form className="noah-tutor-form" onSubmit={(event) => { event.preventDefault(); void send(); }}>
            <label htmlFor={titleId + "-question"}>Sua pergunta</label>
            <textarea id={titleId + "-question"} value={draft} maxLength={1200} rows={3} onChange={(event) => setDraft(event.target.value)} placeholder="O que você quer compreender?" disabled={sending} />
            <div><small>{draft.length}/1200</small><button className="primary-button" type="submit" disabled={sending || !draft.trim()}>Enviar</button></div>
          </form>
        </aside>
      )}
    </>
  );
}
