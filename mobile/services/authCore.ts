export type MobileOAuthProvider = "google" | "facebook";

export interface ParsedAuthCallback {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  expiresIn?: number;
  type?: string;
  error?: string;
}

function decodePart(value: string | null) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

export function parseAuthCallback(url: string): ParsedAuthCallback {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const query = queryIndex >= 0
    ? url.slice(queryIndex + 1, hashIndex >= 0 && hashIndex > queryIndex ? hashIndex : undefined)
    : "";
  const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  const values = new URLSearchParams([query, fragment].filter(Boolean).join("&"));
  const expiresAt = Number(values.get("expires_at"));
  const expiresIn = Number(values.get("expires_in"));
  return {
    accessToken: decodePart(values.get("access_token")),
    refreshToken: decodePart(values.get("refresh_token")),
    expiresAt: Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : undefined,
    expiresIn: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : undefined,
    type: decodePart(values.get("type")),
    error: decodePart(values.get("error_description")) ?? decodePart(values.get("error"))
  };
}

export function assertPublicAuthConfig(url: string, publishableKey: string) {
  if (!url || !publishableKey) {
    throw new Error("A configuração de autenticação não foi incluída nesta versão do aplicativo.");
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("A URL do servidor de autenticação é inválida.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("A autenticação exige uma conexão HTTPS.");
  }
  if (/service_role/i.test(publishableKey)) {
    throw new Error("A APK não pode usar uma chave administrativa do servidor.");
  }
}

export function getOAuthScopes(provider: MobileOAuthProvider) {
  return provider === "google" ? "openid email profile" : "public_profile";
}

export function isEnabledFlag(value: unknown) {
  return String(value ?? "").trim().toLowerCase() === "true";
}
