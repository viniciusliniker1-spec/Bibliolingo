import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { copyNoahPrompt } from "../../services/noah";
import { getLocalNoah, prepareLocalNoah, supportsLocalNoah } from "../../services/noahLocal";

interface NoahMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Você é Noah, assistente de estudo bíblico do Bibliolingo. Responda em português claro e acolhedor. Diferencie texto bíblico, contexto histórico e interpretação teológica. Não invente citações, fontes, palavras hebraicas ou gregas. Quando não tiver certeza, diga isso e recomende conferir o texto bíblico e as fontes da lição. Apresente a perspectiva wesleyana-arminiana como perspectiva, nunca como se fosse a única leitura cristã. Não substitua aconselhamento pastoral, médico, jurídico ou psicológico profissional.`;

function nextId() {
  return crypto.randomUUID?.() ?? String(Date.now() + Math.random());
}

export function NoahChat() {
  const navigate = useNavigate();
  const initialPrompt = sessionStorage.getItem("bibliolingo:noah-prompt") ?? "Quero aprofundar o conteúdo desta lição.";
  const [draft, setDraft] = useState(initialPrompt);
  const [messages, setMessages] = useState<NoahMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "generating" | "error">(
    getLocalNoah() ? "ready" : "idle"
  );
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Aguardando início");
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);
  const compatible = supportsLocalNoah();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const prepare = async () => {
    setStatus("loading");
    setError(undefined);
    try {
      await prepareLocalNoah((report) => {
        setProgress(Math.round(report.progress * 100));
        setProgressText(report.text || "Preparando modelo local…");
      });
      setProgress(100);
      setProgressText("Noah está pronto neste aparelho.");
      setStatus("ready");
    } catch (cause) {
      console.error("Local Noah initialization failed", cause);
      setError("Não foi possível preparar a IA local. Verifique o espaço livre, a conexão do primeiro download e se o navegador oferece WebGPU.");
      setStatus("error");
    }
  };

  const send = async () => {
    const prompt = draft.trim();
    if (!prompt || status === "generating") return;
    let localEngine = getLocalNoah();
    if (!localEngine) {
      await prepare();
      localEngine = getLocalNoah();
    }
    if (!localEngine) return;

    const userMessage: NoahMessage = { id: nextId(), role: "user", content: prompt };
    const assistantId = nextId();
    const history = [...messages, userMessage];
    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setDraft("");
    setStatus("generating");
    setError(undefined);

    const requestMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((message) => ({ role: message.role, content: message.content } as ChatCompletionMessageParam))
    ];

    try {
      const stream = await localEngine.chat.completions.create({
        messages: requestMessages,
        temperature: 0.35,
        max_tokens: 600,
        stream: true
      });
      let answer = "";
      for await (const chunk of stream) {
        answer += chunk.choices[0]?.delta.content ?? "";
        setMessages((items) => items.map((item) => item.id === assistantId ? { ...item, content: answer } : item));
      }
      setStatus("ready");
      sessionStorage.removeItem("bibliolingo:noah-prompt");
    } catch (cause) {
      console.error("Local Noah generation failed", cause);
      setMessages((items) => items.filter((item) => item.id !== assistantId));
      setError("Noah não conseguiu concluir a resposta. Tente uma pergunta menor ou recarregue o modelo.");
      setStatus("error");
    }
  };

  return (
    <main className="noah-chat-page">
      <header className="noah-chat-header">
        <button className="icon-button" type="button" aria-label="Voltar" onClick={() => navigate(-1)}>←</button>
        <div><p className="eyebrow">IA no próprio aparelho</p><h1>Estudar com Noah</h1></div>
        <span className="local-badge">local</span>
      </header>

      {!compatible ? (
        <section className="noah-setup-card noah-incompatible">
          <span aria-hidden="true">!</span>
          <div><h2>Este navegador ainda não oferece WebGPU</h2><p>A IA local precisa dessa tecnologia. O restante do Bibliolingo continua funcionando normalmente. Tente uma versão recente do Chrome, Edge ou outro navegador compatível.</p></div>
        </section>
      ) : messages.length === 0 && status !== "ready" && status !== "generating" ? (
        <section className="noah-setup-card">
          <div className="noah-orb" aria-hidden="true">N</div>
          <p className="eyebrow">Sem API e sem mensalidade</p>
          <h2>Prepare a IA local</h2>
          <p>Na primeira vez, o navegador baixa um modelo de aproximadamente 400 MB e precisa de cerca de 1 GB de memória gráfica disponível. Depois ele fica armazenado neste aparelho e as conversas são processadas aqui.</p>
          <div className="noah-privacy-list"><span>✓ Não exige chave de API</span><span>✓ Não abre outro aplicativo</span><span>✓ Pode funcionar após o download</span></div>
          {status === "loading" ? (
            <div className="noah-download" aria-live="polite">
              <div><span style={{ width: `${progress}%` }} /></div>
              <strong>{progress}%</strong><p>{progressText}</p>
            </div>
          ) : (
            <button className="primary-button" type="button" onClick={() => void prepare()}>Preparar IA neste aparelho</button>
          )}
          {error && <p className="noah-error" role="alert">{error}</p>}
          <small>Modelos locais podem errar. Confira referências e interpretações no texto bíblico e nas fontes da lição.</small>
        </section>
      ) : (
        <>
          <section className="noah-conversation" aria-live="polite">
            {!messages.length && <div className="noah-welcome"><div className="noah-orb">N</div><h2>Pronto para estudar</h2><p>O contexto da lição já está no campo abaixo. Você pode editar antes de enviar.</p></div>}
            {messages.map((message) => (
              <article className={`noah-message ${message.role}`} key={message.id}>
                <strong>{message.role === "user" ? "Você" : "Noah"}</strong>
                <p>{message.content || "Pensando…"}</p>
                {message.role === "assistant" && message.content && <button type="button" onClick={() => void copyNoahPrompt(message.content)}>Copiar resposta</button>}
              </article>
            ))}
            <div ref={endRef} />
          </section>
          {error && <p className="noah-error" role="alert">{error}</p>}
        </>
      )}

      {compatible && (status === "ready" || status === "generating" || messages.length > 0) && (
        <form className="noah-composer" onSubmit={(event) => { event.preventDefault(); void send(); }}>
          <label htmlFor="noah-question">Pergunte ao Noah</label>
          <textarea id="noah-question" value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} placeholder="Escreva sua pergunta…" disabled={status === "generating"} />
          <div><small>Resposta local · confira fontes</small><button className="primary-button" type="submit" disabled={!draft.trim() || status === "generating"}>{status === "generating" ? "Respondendo…" : "Enviar"}</button></div>
        </form>
      )}
    </main>
  );
}
