import type { KnowledgeLevel } from "../types/progress";

export type NoahMode =
  | "explain"
  | "simple"
  | "deepen"
  | "example"
  | "error"
  | "practice"
  | "ask"
  | "pastoral-interview";
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
  options?: string[];
  answerStatus?: "unanswered" | "correct" | "incorrect";
  difficulty?: "easy" | "medium" | "hard";
  conceptId?: string;
  lessonId?: string;
  questionId?: string;
  learningProfile?: string;
  sources?: string[];
  editorialStatus?: "reviewed" | "pending";
  lexicalData?: Record<string, string | string[] | undefined>;
}

export interface NoahHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface NoahTutorResponse {
  answer: string;
  provider: "groq" | "gemini" | "verified-local";
  tokens: number;
  incomplete?: boolean;
  grounding?: { references: string[]; sourceAvailable: boolean };
}

export class NoahUnavailableError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "NoahUnavailableError";
  }
}

const API_URL = (import.meta.env.VITE_NOAH_API_URL as string | undefined)?.replace(/\/$/, "");
const SESSION_KEY = "bibliolingo:noah-session";
let sessionCache: { token: string; expiresAt: number } | undefined;

export const remoteNoahConfigured = () => Boolean(API_URL);

export function noahInstallationId() {
  const key = "bibliolingo:noah-installation";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, value);
  }
  return value;
}

function readSession(): { token: string; expiresAt: number } | undefined {
  if (sessionCache?.expiresAt && sessionCache.expiresAt > Date.now() + 30_000) return sessionCache;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as { token?: string; expiresAt?: number };
    if (parsed.token && Number(parsed.expiresAt) > Date.now() + 30_000) {
      sessionCache = { token: parsed.token, expiresAt: Number(parsed.expiresAt) };
      return sessionCache;
    }
  } catch {
    // A sessão em memória continua disponível quando o armazenamento do navegador é bloqueado.
  }
  return undefined;
}

function clearSession() {
  sessionCache = undefined;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Sem efeito fora da sessão atual.
  }
}

async function createSession(signal: AbortSignal): Promise<string> {
  if (!API_URL) throw new NoahUnavailableError("O professor online ainda não foi configurado.", "not-configured");
  const response = await fetch(API_URL + "/v1/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal,
    body: JSON.stringify({ installationId: noahInstallationId() })
  });
  if (response.status === 404 || response.status === 405) {
    sessionCache = { token: "legacy", expiresAt: Date.now() + 5 * 60 * 1000 };
    return sessionCache.token;
  }
  const data = (await response.json().catch(() => ({}))) as {
    token?: string;
    expiresAt?: number;
    message?: string;
    error?: string;
  };
  if (!response.ok || !data.token) {
    throw new NoahUnavailableError(
      data.message ?? "Não foi possível iniciar uma sessão segura com o Noah.",
      data.error ?? "session-failed",
      response.status
    );
  }
  sessionCache = {
    token: data.token,
    expiresAt: Number(data.expiresAt ?? Date.now() + 60 * 60 * 1000)
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionCache));
  } catch {
    // O token permanece apenas em memória.
  }
  return sessionCache.token;
}

async function sessionToken(signal: AbortSignal): Promise<string> {
  return readSession()?.token ?? createSession(signal);
}

export function validateNoahQuestion(question: string) {
  const clean = question.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (!clean) throw new NoahUnavailableError("Escreva uma pergunta para o Noah.", "empty-question");
  if (clean.length > 1200) {
    throw new NoahUnavailableError("Reduza a pergunta para até 1.200 caracteres.", "question-too-long");
  }
  return clean;
}

export async function askRemoteNoah(input: {
  question: string;
  mode: NoahMode;
  level: KnowledgeLevel;
  context: NoahContext;
  history?: NoahHistoryMessage[];
  sessionId?: string;
  turnstileToken?: string;
}): Promise<NoahTutorResponse> {
  if (!API_URL) {
    throw new NoahUnavailableError(
      "O professor online ainda não foi configurado. A lição continua disponível.",
      "not-configured"
    );
  }
  if (!navigator.onLine) {
    throw new NoahUnavailableError(
      "Sem conexão. Reconecte-se para conversar com o Noah; o curso continua funcionando.",
      "offline"
    );
  }

  const question = validateNoahQuestion(input.question);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 24_000);

  const request = async (token: string) =>
    fetch(API_URL + "/v1/tutor", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token === "legacy" ? {} : { authorization: "Bearer " + token })
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...input,
        question,
        history: input.history?.slice(-8),
        installationId: noahInstallationId()
      })
    });

  try {
    let token = await sessionToken(controller.signal);
    let response = await request(token);
    if (response.status === 401) {
      clearSession();
      token = await createSession(controller.signal);
      response = await request(token);
    }
    const data = (await response.json().catch(() => ({}))) as Partial<NoahTutorResponse> & {
      message?: string;
      error?: string;
    };
    if (!response.ok || !data.answer) {
      throw new NoahUnavailableError(
        data.message ?? "Noah está indisponível agora. Tente novamente mais tarde.",
        data.error ?? "request-failed",
        response.status
      );
    }
    const provider =
      data.provider === "gemini" ? "gemini" : data.provider === "verified-local" ? "verified-local" : "groq";
    return {
      answer: data.answer,
      provider,
      tokens: Number(data.tokens ?? 0),
      incomplete: Boolean(data.incomplete),
      grounding: data.grounding
    };
  } catch (error) {
    if (error instanceof NoahUnavailableError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new NoahUnavailableError("A resposta demorou demais. Tente uma pergunta menor.", "timeout");
    }
    throw new NoahUnavailableError(
      "Não foi possível falar com o Noah. A atividade continua funcionando normalmente.",
      "network"
    );
  } finally {
    window.clearTimeout(timer);
  }
}
