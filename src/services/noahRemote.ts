import type { KnowledgeLevel } from "../types/progress";

export type NoahMode = "explain" | "simple" | "deepen" | "example" | "error" | "practice" | "ask" | "pastoral-interview";
export type NoahArea = "bible" | "greek" | "lexicon" | "formation" | "deepen";

export interface NoahContext {
  area: NoahArea;
  title: string;
  objective?: string;
  reference?: string;
  content?: string;
  currentQuestion?: string;
  selectedAnswer?: string;
  correctAnswer?: string;
  lexicalData?: Record<string, string | string[] | undefined>;
}

export interface NoahHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface NoahTutorResponse {
  answer: string;
  provider: "groq" | "gemini";
  tokens: number;
}

export class NoahUnavailableError extends Error {
  constructor(message: string, public readonly code: string, public readonly status?: number) {
    super(message);
    this.name = "NoahUnavailableError";
  }
}

const API_URL = (import.meta.env.VITE_NOAH_API_URL as string | undefined)?.replace(/\/$/, "");

export function remoteNoahConfigured() {
  return Boolean(API_URL);
}

export function noahInstallationId() {
  const key = "bibliolingo:noah-installation";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, value);
  }
  return value;
}

export function validateNoahQuestion(question: string) {
  const clean = question.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (!clean) throw new NoahUnavailableError("Escreva uma pergunta para o Noah.", "empty-question");
  if (clean.length > 1200) throw new NoahUnavailableError("Reduza a pergunta para até 1.200 caracteres.", "question-too-long");
  return clean;
}

export async function askRemoteNoah(input: {
  question: string;
  mode: NoahMode;
  level: KnowledgeLevel;
  context: NoahContext;
  history?: NoahHistoryMessage[];
  turnstileToken?: string;
}): Promise<NoahTutorResponse> {
  if (!API_URL) throw new NoahUnavailableError("O professor online ainda não foi configurado. A lição continua disponível.", "not-configured");
  if (!navigator.onLine) throw new NoahUnavailableError("Você está offline. Reconecte-se para conversar com o Noah; o curso continua funcionando.", "offline");
  const question = validateNoahQuestion(input.question);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 22000);
  try {
    const response = await fetch(API_URL + "/v1/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        ...input,
        question,
        history: input.history?.slice(-8),
        installationId: noahInstallationId()
      })
    });
    const data = await response.json().catch(() => ({})) as Partial<NoahTutorResponse> & { message?: string; error?: string };
    if (!response.ok || !data.answer) {
      throw new NoahUnavailableError(data.message ?? "Noah está indisponível agora. Tente novamente mais tarde.", data.error ?? "request-failed", response.status);
    }
    return { answer: data.answer, provider: data.provider === "gemini" ? "gemini" : "groq", tokens: Number(data.tokens ?? 0) };
  } catch (error) {
    if (error instanceof NoahUnavailableError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new NoahUnavailableError("A resposta demorou demais. Tente uma pergunta menor.", "timeout");
    throw new NoahUnavailableError("Não foi possível falar com o Noah. A atividade continua funcionando normalmente.", "network");
  } finally {
    window.clearTimeout(timer);
  }
}
