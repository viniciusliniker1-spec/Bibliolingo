import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NoahUnavailableError,
  validateNoahQuestion,
  type NoahContext,
  type NoahHistoryMessage,
  type NoahKnowledgeLevel,
  type NoahMode,
  type NoahTutorResponse
} from "../domain/noah";

const DEFAULT_API_URL = "https://bibliolingo-noah.vinicius-liniker1.workers.dev";
const WEB_ORIGIN = "https://viniciusliniker1-spec.github.io";
const INSTALLATION_KEY = "bibliolingo:mobile:noah-installation";
const REQUEST_TIMEOUT_MS = 24_000;

export const NOAH_API_URL = (process.env.EXPO_PUBLIC_NOAH_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

let sessionCache: { token: string; expiresAt: number } | undefined;

function randomId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export async function noahInstallationId() {
  const stored = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (stored) return stored;
  const created = randomId();
  await AsyncStorage.setItem(INSTALLATION_KEY, created);
  return created;
}

async function request(
  pathname: string,
  init: RequestInit,
  controller: AbortController
) {
  try {
    return await fetch(NOAH_API_URL + pathname, {
      ...init,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        // O Worker mantém CORS restrito à origem web. Em React Native este
        // cabeçalho apenas identifica o cliente; a autorização real é o token curto.
        Origin: WEB_ORIGIN,
        ...init.headers
      }
    });
  } catch (error) {
    const name = error && typeof error === "object" && "name" in error
      ? String((error as { name?: unknown }).name)
      : "";
    if (name === "AbortError") {
      throw new NoahUnavailableError("A resposta demorou demais. Tente novamente.", "timeout");
    }
    throw new NoahUnavailableError(
      "Sem conexão com o Professor Noah. A lição continua disponível.",
      "network"
    );
  }
}

async function readResponse(response: Response) {
  return (await response.json().catch(() => ({}))) as {
    token?: string;
    expiresAt?: number;
    answer?: string;
    tokens?: number;
    incomplete?: boolean;
    grounding?: { references: string[]; sourceAvailable: boolean };
    message?: string;
    error?: string;
  };
}

async function createSession(
  installationId: string,
  controller: AbortController
) {
  const response = await request(
    "/v1/session",
    {
      method: "POST",
      body: JSON.stringify({ installationId })
    },
    controller
  );
  const data = await readResponse(response);
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
  return data.token;
}

async function sessionToken(
  installationId: string,
  controller: AbortController
) {
  if (sessionCache && sessionCache.expiresAt > Date.now() + 30_000) {
    return sessionCache.token;
  }
  return createSession(installationId, controller);
}

export async function askRemoteNoah(input: {
  question: string;
  mode: NoahMode;
  level?: NoahKnowledgeLevel;
  context: NoahContext;
  history?: NoahHistoryMessage[];
  sessionId: string;
}): Promise<NoahTutorResponse> {
  const question = validateNoahQuestion(input.question);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const installationId = await noahInstallationId();
    const send = async (token: string) => request(
      "/v1/tutor",
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          mode: input.mode,
          level: input.level ?? "beginner",
          context: input.context,
          history: input.history?.slice(-8),
          sessionId: input.sessionId,
          installationId
        })
      },
      controller
    );

    let token = await sessionToken(installationId, controller);
    let response = await send(token);
    if (response.status === 401) {
      sessionCache = undefined;
      token = await createSession(installationId, controller);
      response = await send(token);
    }

    const data = await readResponse(response);
    if (!response.ok || !data.answer) {
      throw new NoahUnavailableError(
        data.message ?? "Noah está indisponível agora. Tente novamente mais tarde.",
        data.error ?? "request-failed",
        response.status
      );
    }

    return {
      answer: data.answer,
      tokens: Number(data.tokens ?? 0),
      incomplete: Boolean(data.incomplete),
      grounding: data.grounding
    };
  } finally {
    clearTimeout(timeout);
  }
}
