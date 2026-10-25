import {
  invalidQuestionAnswer,
  retrieveBibleGrounding,
  verifyAnswerReferences,
  type BibleGrounding
} from "./bible";
import {
  buildSystemPrompt,
  classifyTeachingIntent,
  deterministicLexicalAnswer,
  deterministicSourceLimitation,
  recommendedMaxTokens,
  type PolicyInput
} from "./policy";
import { applyGroundedSupplements, deterministicBiblicalCorrection } from "./supplements";

export interface Env {
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
  AI_ENABLED?: string;
  CONTEXTUAL_TUTOR_ENABLED?: string;
  PRIMARY_PROVIDER?: "groq" | "gemini";
  GROQ_MODEL?: string;
  GEMINI_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  MAX_REQUESTS_PER_DAY?: string;
  MAX_TOKENS_PER_REQUEST?: string;
  GLOBAL_DAILY_TOKEN_LIMIT?: string;
  REQUEST_TIMEOUT_MS?: string;
  TURNSTILE_SECRET_KEY?: string;
  USAGE: KVNamespace;
}

type Provider = "groq" | "gemini";

export interface TutorRequest extends PolicyInput {
  installationId: string;
  sessionId?: string;
  turnstileToken?: string;
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly fallbackEligible = true,
    readonly retryable = false
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });

function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.includes(origin) ? origin : "";
}

function isNativeMobileClient(request: Request) {
  return !request.headers.get("Origin") && request.headers.get("x-bibliolingo-client") === "mobile-v1";
}

function cors(origin: string): HeadersInit {
  return {
    ...(origin ? { "access-control-allow-origin": origin } : {}),
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-bibliolingo-client",
    "vary": "Origin"
  };
}

function cleanText(value: unknown, max: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max)
    : "";
}

function cleanStringList(value: unknown, maxItems: number, maxLength: number) {
  return Array.isArray(value)
    ? value.slice(0, maxItems).map((item) => cleanText(item, maxLength)).filter(Boolean)
    : undefined;
}

function cleanLexicalData(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const entries = Object.entries(value)
    .slice(0, 20)
    .flatMap(([rawKey, rawValue]) => {
      const key = cleanText(rawKey, 80);
      if (!key) return [];
      if (Array.isArray(rawValue)) {
        const items = rawValue.slice(0, 12).map((item) => cleanText(item, 500)).filter(Boolean);
        return items.length ? [[key, items] as const] : [];
      }
      const item = cleanText(rawValue, 1000);
      return item ? [[key, item] as const] : [];
    });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function validate(body: unknown): TutorRequest | undefined {
  if (!body || typeof body !== "object") return;
  const input = body as Partial<TutorRequest>;
  const modes = ["explain", "simple", "deepen", "example", "error", "practice", "ask", "pastoral-interview"];
  const levels = ["beginner", "intermediate", "advanced"];
  const areas = ["bible", "greek", "lexicon", "formation", "deepen"];
  if (
    !modes.includes(input.mode ?? "") ||
    !levels.includes(input.level ?? "") ||
    !input.context ||
    !areas.includes(input.context.area ?? "")
  ) return;

  const question = cleanText(input.question, 1200);
  const installationId = cleanText(input.installationId, 100);
  const title = cleanText(input.context.title, 200);
  if (!question || !installationId || !title) return;

  const history = Array.isArray(input.history)
    ? input.history
        .slice(-8)
        .map((message) => ({
          role: message?.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: cleanText(message?.content, 1500)
        }))
        .filter((message) => message.content)
    : [];

  const statuses = ["unanswered", "correct", "incorrect"];
  const difficulties = ["easy", "medium", "hard"];
  const editorialStatuses = ["reviewed", "pending"];
  return {
    question,
    mode: input.mode!,
    level: input.level!,
    installationId,
    sessionId: cleanText(input.sessionId, 100) || undefined,
    turnstileToken: cleanText(input.turnstileToken, 2048) || undefined,
    history,
    context: {
      area: input.context.area,
      title,
      objective: cleanText(input.context.objective, 600) || undefined,
      reference: cleanText(input.context.reference, 200) || undefined,
      content: cleanText(input.context.content, 6000) || undefined,
      currentQuestion: cleanText(input.context.currentQuestion, 1000) || undefined,
      selectedAnswer: cleanText(input.context.selectedAnswer, 500) || undefined,
      correctAnswer: cleanText(input.context.correctAnswer, 500) || undefined,
      options: cleanStringList(input.context.options, 12, 500),
      answerStatus: statuses.includes(input.context.answerStatus ?? "")
        ? input.context.answerStatus
        : undefined,
      difficulty: difficulties.includes(input.context.difficulty ?? "")
        ? input.context.difficulty
        : undefined,
      conceptId: cleanText(input.context.conceptId, 160) || undefined,
      lessonId: cleanText(input.context.lessonId, 160) || undefined,
      questionId: cleanText(input.context.questionId, 160) || undefined,
      learningProfile: cleanText(input.context.learningProfile, 1200) || undefined,
      sources: cleanStringList(input.context.sources, 8, 500),
      editorialStatus: editorialStatuses.includes(input.context.editorialStatus ?? "")
        ? input.context.editorialStatus
        : undefined,
      lexicalData: cleanLexicalData(input.context.lexicalData)
    }
  };
}

async function verifyTurnstile(request: Request, env: Env, token?: string) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  form.set("remoteip", request.headers.get("CF-Connecting-IP") ?? "");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  const result = await response.json<{ success?: boolean }>();
  return result.success === true;
}

const dayKey = () => new Date().toISOString().slice(0, 10);

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function issueSession(request: Request, env: Env, installationId: string) {
  const identity = await digest(
    (request.headers.get("CF-Connecting-IP") ?? "unknown") + ":" + installationId
  );
  const issueKey = "session-issue:" + dayKey() + ":" + identity;
  const issueCount = Number((await env.USAGE.get(issueKey)) ?? 0);
  if (issueCount >= 12) {
    return { ok: false as const, status: 429, message: "Muitas sessões iniciadas hoje nesta instalação." };
  }
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await digest(token);
  const installationHash = await digest(installationId);
  await Promise.all([
    env.USAGE.put(issueKey, String(issueCount + 1), { expirationTtl: 172800 }),
    env.USAGE.put("session:" + tokenHash, installationHash, { expirationTtl: 7200 })
  ]);
  return { ok: true as const, token, expiresAt: Date.now() + 7200 * 1000 };
}

async function authorized(request: Request, env: Env, installationId: string) {
  const header = request.headers.get("Authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const token = cleanText(header.slice(7), 200);
  if (!token) return false;
  const [stored, installationHash] = await Promise.all([
    digest(token).then((hash) => env.USAGE.get("session:" + hash)),
    digest(installationId)
  ]);
  return stored === installationHash;
}

export async function reserveUsage(request: Request, env: Env, input: TutorRequest) {
  const day = dayKey();
  const identity = await digest(
    (request.headers.get("CF-Connecting-IP") ?? "unknown") + ":" + input.installationId
  );
  const userKey = "user:" + day + ":" + identity;
  const globalKey = "global:" + day;
  const [userRaw, globalRaw] = await Promise.all([
    env.USAGE.get(userKey),
    env.USAGE.get(globalKey)
  ]);
  const userCount = Number(userRaw ?? 0);
  const globalTokens = Number(globalRaw ?? 0);
  const requestLimit = Math.max(1, Number(env.MAX_REQUESTS_PER_DAY ?? 30));
  const tokenLimit = Math.max(1000, Number(env.GLOBAL_DAILY_TOKEN_LIMIT ?? 200000));
  if (userCount >= requestLimit) {
    return { ok: false as const, status: 429, message: "Limite diário do Noah atingido nesta instalação." };
  }
  if (globalTokens >= tokenLimit) {
    return { ok: false as const, status: 503, message: "O limite global diário do Noah foi atingido." };
  }
  await env.USAGE.put(userKey, String(userCount + 1), { expirationTtl: 172800 });
  return { ok: true as const, globalKey, globalTokens };
}

export function systemPrompt(
  input: TutorRequest,
  grounding: BibleGrounding = { text: "", references: [], invalid: [], sourceAvailable: false }
) {
  return buildSystemPrompt(input, grounding);
}

async function withTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ProviderError(
      error instanceof DOMException && error.name === "AbortError" ? "provider-timeout" : "provider-network",
      error instanceof DOMException && error.name === "AbortError" ? 408 : undefined,
      true,
      true
    );
  } finally {
    clearTimeout(timeout);
  }
}

type ProviderResult = { answer: string; tokens: number; incomplete: boolean };

export function isFallbackEligibleStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function responseError(provider: Provider, status: number) {
  return new ProviderError(
    provider + "-" + status,
    status,
    isFallbackEligibleStatus(status),
    isFallbackEligibleStatus(status)
  );
}

async function callGroq(
  env: Env,
  input: TutorRequest,
  grounding: BibleGrounding,
  maxTokens: number
): Promise<ProviderResult> {
  if (!env.GROQ_API_KEY) throw new ProviderError("provider-not-configured", undefined, true, false);
  const messages = [
    { role: "system", content: systemPrompt(input, grounding) },
    ...(input.history ?? []),
    { role: "user", content: input.question }
  ];
  const response = await withTimeout(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: "Bearer " + env.GROQ_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        messages,
        temperature: 0.15,
        max_tokens: maxTokens
      })
    },
    Number(env.REQUEST_TIMEOUT_MS ?? 18000)
  );
  if (!response.ok) throw responseError("groq", response.status);
  const data = await response.json<{
    choices?: { message?: { content?: string }; finish_reason?: string }[];
    usage?: { total_tokens?: number };
  }>();
  const answer = cleanText(data.choices?.[0]?.message?.content, 16000);
  if (!answer) throw new ProviderError("empty-provider-response", 502, true, false);
  return {
    answer,
    tokens: data.usage?.total_tokens ?? maxTokens,
    incomplete: data.choices?.[0]?.finish_reason === "length"
  };
}

async function callGemini(
  env: Env,
  input: TutorRequest,
  grounding: BibleGrounding,
  maxTokens: number
): Promise<ProviderResult> {
  if (!env.GEMINI_API_KEY) throw new ProviderError("provider-not-configured", undefined, true, false);
  const model = env.GEMINI_MODEL ?? "gemini-3.8-flash";
  const contents = [
    ...(input.history ?? []),
    { role: "user" as const, content: input.question }
  ].map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }]
  }));
  const response = await withTimeout(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) +
      ":generateContent",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(input, grounding) }] },
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          thinkingConfig: { thinkingLevel: "low" }
        }
      })
    },
    Number(env.REQUEST_TIMEOUT_MS ?? 18000)
  );
  if (!response.ok) throw responseError("gemini", response.status);
  const data = await response.json<{
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    usageMetadata?: { totalTokenCount?: number };
  }>();
  const answer = cleanText(
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n"),
    16000
  );
  if (!answer) throw new ProviderError("empty-provider-response", 502, true, false);
  return {
    answer,
    tokens: data.usageMetadata?.totalTokenCount ?? maxTokens,
    incomplete: data.candidates?.[0]?.finishReason === "MAX_TOKENS"
  };
}

function configuredProvider(env: Env, provider: Provider) {
  return provider === "gemini" ? Boolean(env.GEMINI_API_KEY) : Boolean(env.GROQ_API_KEY);
}

async function affinityKey(input: TutorRequest) {
  return input.sessionId
    ? "provider-session:" + (await digest(input.installationId + ":" + input.sessionId))
    : undefined;
}

export async function answerWithFallback(
  env: Env,
  input: TutorRequest,
  grounding: BibleGrounding
) {
  const primary: Provider = env.PRIMARY_PROVIDER === "groq" ? "groq" : "gemini";
  const key = await affinityKey(input);
  const affinity = key ? ((await env.USAGE.get(key)) as Provider | null) : null;
  // A contingência resolve a requisição atual, mas não deve impedir a recuperação
  // automática do provedor principal nas mensagens seguintes.
  const first = affinity === primary && configuredProvider(env, affinity) ? affinity : primary;
  const providers: Provider[] = first === "gemini" ? ["gemini", "groq"] : ["groq", "gemini"];
  const configured = Math.min(2400, Math.max(100, Number(env.MAX_TOKENS_PER_REQUEST ?? 2400)));
  const maxTokens = recommendedMaxTokens(classifyTeachingIntent(input), configured);
  let lastError: ProviderError = new ProviderError("provider-unavailable", 503);

  for (let providerIndex = 0; providerIndex < providers.length; providerIndex++) {
    const provider = providers[providerIndex];
    if (!configuredProvider(env, provider)) continue;
    const maxAttempts = 1;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result =
          provider === "groq"
            ? await callGroq(env, input, grounding, maxTokens)
            : await callGemini(env, input, grounding, maxTokens);
        if (key && provider === primary) {
          await env.USAGE.put(key, provider, { expirationTtl: 7200 });
        }
        return {
          ...result,
          provider,
          fallbackReason: provider === primary ? undefined : lastError.message
        };
      } catch (error) {
        lastError =
          error instanceof ProviderError
            ? error
            : new ProviderError("provider-error", 503, true, true);
        if (!lastError.fallbackEligible) throw lastError;
        if (!lastError.retryable || attempt === maxAttempts - 1) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }
  throw lastError;
}

async function appendVerification(
  answer: string,
  incomplete: boolean,
  input: TutorRequest,
  grounding: BibleGrounding
) {
  const invalid = await verifyAnswerReferences(answer);
  let verified = applyGroundedSupplements(answer, input, grounding);
  if (invalid.length) {
    verified +=
      "\n\n> **Nota de verificação:** estas referências não passaram na validação canônica e não devem ser usadas como base: " +
      invalid.map((item) => item.label).join(", ") +
      ".";
  }
  if (incomplete) {
    verified +=
      "\n\n> **Resposta interrompida pelo limite de tamanho.** Peça ao Noah para continuar a partir deste ponto.";
  }
  return verified;
}

async function recordProviderUsage(env: Env, provider: Provider, tokens: number) {
  const key = "provider:" + provider + ":" + dayKey();
  const current = Number((await env.USAGE.get(key)) ?? 0);
  await env.USAGE.put(key, String(current + tokens), { expirationTtl: 172800 });
}

async function parseSmallJson(request: Request, maxBytes = 16000) {
  const rawText = await request.text();
  if (new TextEncoder().encode(rawText).byteLength > maxBytes) {
    throw new ProviderError("payload-too-large", 413, false, false);
  }
  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    throw new ProviderError("invalid-json", 400, false, false);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = allowedOrigin(request, env);
    const clientAllowed = Boolean(origin) || isNativeMobileClient(request);
    const pathname = new URL(request.url).pathname;
    if (request.method === "OPTIONS") {
      return origin
        ? new Response(null, { status: 204, headers: cors(origin) })
        : new Response(null, { status: 403 });
    }
    if (pathname === "/health") {
      return json({
        ok: true,
        aiEnabled: env.AI_ENABLED !== "false",
        contextualTutorEnabled: env.CONTEXTUAL_TUTOR_ENABLED !== "false",
        primaryProvider: env.PRIMARY_PROVIDER === "groq" ? "groq" : "gemini",
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        groqConfigured: Boolean(env.GROQ_API_KEY),
        grounding: "almeida-1819"
      });
    }
    if (request.method !== "POST") return json({ error: "not-found" }, 404);
    if (!clientAllowed) return json({ error: "client-not-allowed", message: "Cliente do Noah não autorizado." }, 403, cors(origin));

    if (pathname === "/v1/session") {
      let raw: unknown;
      try {
        raw = await parseSmallJson(request, 2000);
      } catch (error) {
        const status = error instanceof ProviderError ? error.status ?? 400 : 400;
        return json({ error: status === 413 ? "payload-too-large" : "invalid-json" }, status, cors(origin));
      }
      const installationId =
        raw && typeof raw === "object"
          ? cleanText((raw as { installationId?: unknown }).installationId, 100)
          : "";
      if (!installationId) return json({ error: "invalid-request" }, 400, cors(origin));
      const session = await issueSession(request, env, installationId);
      return session.ok
        ? json({ token: session.token, expiresAt: session.expiresAt }, 200, cors(origin))
        : json({ error: "session-limit", message: session.message }, session.status, cors(origin));
    }

    if (pathname !== "/v1/tutor") return json({ error: "not-found" }, 404);
    if (env.AI_ENABLED === "false") {
      return json(
        { error: "disabled", message: "O Noah está temporariamente desativado." },
        503,
        cors(origin)
      );
    }

    let raw: unknown;
    try {
      raw = await parseSmallJson(request);
    } catch (error) {
      const status = error instanceof ProviderError ? error.status ?? 400 : 400;
      return json(
        { error: status === 413 ? "payload-too-large" : "invalid-json" },
        status,
        cors(origin)
      );
    }
    const input = validate(raw);
    if (!input) {
      return json(
        { error: "invalid-request", message: "A pergunta ou o contexto não são válidos." },
        400,
        cors(origin)
      );
    }
    if (!(await authorized(request, env, input.installationId))) {
      return json({ error: "unauthorized-session", message: "A sessão do Noah expirou." }, 401, cors(origin));
    }
    if (!(await verifyTurnstile(request, env, input.turnstileToken))) {
      return json({ error: "challenge-failed" }, 403, cors(origin));
    }

    const grounding = await retrieveBibleGrounding(input.question, input.context.reference);
    const groundingResponse = {
      references: grounding.references.map((item) => item.label),
      sourceAvailable: grounding.sourceAvailable
    };
    const deterministic = invalidQuestionAnswer(grounding);
    if (deterministic) {
      return json(
        { answer: deterministic, provider: "verified-local", tokens: 0, grounding: groundingResponse },
        200,
        cors(origin)
      );
    }
    const biblicalCorrection = deterministicBiblicalCorrection(input, grounding);
    if (biblicalCorrection) {
      return json(
        { answer: biblicalCorrection, provider: "verified-local", tokens: 0, grounding: groundingResponse },
        200,
        cors(origin)
      );
    }
    const sourceLimitation = deterministicSourceLimitation(input);
    if (sourceLimitation) {
      return json(
        { answer: sourceLimitation, provider: "verified-local", tokens: 0, grounding: { references: [], sourceAvailable: false } },
        200,
        cors(origin)
      );
    }
    const lexicalAnswer = deterministicLexicalAnswer(input);
    if (lexicalAnswer) {
      return json(
        { answer: lexicalAnswer, provider: "verified-local", tokens: 0, grounding: { references: [], sourceAvailable: false } },
        200,
        cors(origin)
      );
    }

    const usage = await reserveUsage(request, env, input);
    if (!usage.ok) {
      return json({ error: "limit", message: usage.message }, usage.status, cors(origin));
    }
    try {
      const result = await answerWithFallback(env, input, grounding);
      const answer = await appendVerification(result.answer, result.incomplete, input, grounding);
      await Promise.all([
        env.USAGE.put(usage.globalKey, String(usage.globalTokens + result.tokens), {
          expirationTtl: 172800
        }),
        recordProviderUsage(env, result.provider, result.tokens)
      ]);
      return json(
        {
          answer,
          provider: result.provider,
          tokens: result.tokens,
          incomplete: result.incomplete,
          grounding: groundingResponse,
          fallbackReason: result.fallbackReason
        },
        200,
        cors(origin)
      );
    } catch {
      const focus = cleanText(input.context.content, 1800) || cleanText(input.context.objective, 700);
      const reference = cleanText(input.context.reference, 160);
      const question = cleanText(input.context.currentQuestion, 500);
      const correction = input.context.answerStatus === "incorrect"
        ? cleanText(input.context.correctAnswer, 500)
        : "";
      const parts = [
        "Os modelos online estão temporariamente indisponíveis, então vou usar somente o conteúdo verificado desta aula.",
        focus ? "**Ideia central:** " + focus : "**Caminho de estudo:** releia o trecho, identifique o argumento principal e compare-o com o contexto da unidade.",
        reference ? "**Texto para conferir:** " + reference + "." : "",
        question ? "**Questão em foco:** " + question : "",
        correction ? "**Correção já liberada pela atividade:** " + correction : "",
        "Quando a conexão for restabelecida, você poderá pedir exemplos ou aprofundar esta explicação."
      ].filter(Boolean);
      return json(
        {
          answer: parts.join("\n\n"),
          provider: "verified-local",
          tokens: 0,
          incomplete: false,
          grounding: groundingResponse,
          fallbackReason: "providers-unavailable"
        },
        200,
        cors(origin)
      );
    }
  }
};
