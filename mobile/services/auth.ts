import * as Linking from "expo-linking";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { normalizeAccountUsername } from "../../src/auth/accountIdentity";
import {
  assertPublicAuthConfig,
  getOAuthScopes,
  isEnabledFlag,
  parseAuthCallback,
  isMobileAuthCallback,
  MOBILE_AUTH_CALLBACK_URL,
  type MobileOAuthProvider
} from "./authCore";

import { authCallbackInbox } from "./authCallbackInbox";

WebBrowser.maybeCompleteAuthSession();

const SESSION_KEY = "bibliolingo.auth.session.v1";
const BIOMETRIC_KEY = "bibliolingo.auth.biometric.v1";

export interface MobileAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

export interface MobileAuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: MobileAuthUser;
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: MobileAuthUser;
  id?: string;
  email?: string;
  user_metadata?: MobileAuthUser["user_metadata"];
  message?: string;
  msg?: string;
  error_description?: string;
  error?: string;
  error_code?: string;
  code?: string;
}

export class MobileAuthError extends Error {
  constructor(message: string, readonly status?: number, readonly code?: string) {
    super(message);
    this.name = "MobileAuthError";
  }
}

export function getMobileAuthConfig() {
  const url = String(process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const publishableKey = String(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
  if (!url || !publishableKey) return undefined;
  try {
    assertPublicAuthConfig(url, publishableKey);
    return {
      url,
      publishableKey,
      googleEnabled: isEnabledFlag(process.env.EXPO_PUBLIC_AUTH_GOOGLE_ENABLED),
      facebookEnabled: isEnabledFlag(process.env.EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED)
    };
  } catch {
    return undefined;
  }
}

export function getMobileAuthRedirectUrl() {
  return MOBILE_AUTH_CALLBACK_URL;
}

function friendlyAuthError(data: AuthResponse, status: number) {
  const raw = data.error_description ?? data.message ?? data.msg ?? data.error ?? "Falha na autenticação.";
  if (/invalid api key/i.test(raw)) {
    return "Esta versão do aplicativo foi compilada com uma chave de autenticação inválida. Atualize o aplicativo ou contate o suporte.";
  }
  if (/invalid login credentials/i.test(raw)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(raw)) return "Confirme seu e-mail antes de entrar.";
  if (/user already registered/i.test(raw)) return "Este e-mail já possui uma conta.";
  if (status === 429) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  return raw;
}

async function request(
  config: { url: string; publishableKey: string },
  path: string,
  options: RequestInit,
  accessToken?: string
): Promise<AuthResponse> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    response = await fetch(config.url + path, {
      ...options,
      signal: controller.signal,
      headers: {
        apikey: config.publishableKey,
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new MobileAuthError(controller.signal.aborted
      ? "O servidor demorou para confirmar sua conta. Tente novamente."
      : "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.");
  } finally {
    clearTimeout(timeout);
  }
  const data = await response.json().catch(() => ({})) as AuthResponse;
  if (!response.ok) {
    throw new MobileAuthError(
      friendlyAuthError(data, response.status),
      response.status,
      data.error_code ?? data.code ?? data.error
    );
  }
  return data;
}

function authConfigOrThrow() {
  const config = getMobileAuthConfig();
  if (!config) {
    throw new MobileAuthError("A autenticação online não foi configurada corretamente nesta versão.");
  }
  return config;
}

function userFromResponse(data: AuthResponse) {
  if (data.user?.id) return data.user;
  if (data.id) {
    return { id: data.id, email: data.email, user_metadata: data.user_metadata } satisfies MobileAuthUser;
  }
  return undefined;
}

function toSession(data: AuthResponse, fallbackUser?: MobileAuthUser): MobileAuthSession {
  const user = userFromResponse(data) ?? fallbackUser;
  if (!data.access_token || !data.refresh_token || !user) {
    throw new MobileAuthError("O servidor não devolveu uma sessão válida.");
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user
  };
}

async function getAuthenticatedUser(accessToken: string) {
  const config = authConfigOrThrow();
  const data = await request(config, "/auth/v1/user", { method: "GET" }, accessToken);
  const user = userFromResponse(data);
  if (!user) throw new MobileAuthError("O servidor não confirmou o usuário autenticado.");
  return user;
}

export function isSessionRejected(error: unknown) {
  return error instanceof MobileAuthError && (error.status === 400 || error.status === 401 || error.status === 403);
}

export async function loadSecureSession() {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as MobileAuthSession;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return undefined;
  }
}

export async function saveSecureSession(session?: MobileAuthSession) {
  if (session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    });
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export async function verifyMobileSession(session: MobileAuthSession) {
  const user = await getAuthenticatedUser(session.access_token);
  return { ...session, user };
}

export async function signInWithPassword(email: string, password: string) {
  const config = authConfigOrThrow();
  return toSession(await request(config, "/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  }));
}

export async function signUpWithPassword(email: string, password: string, displayName: string) {
  const config = authConfigOrThrow();
  const data = await request(config, "/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      data: {
        display_name: displayName.trim(),
        username: normalizeAccountUsername(displayName || email.split("@")[0])
      },
      email_redirect_to: getMobileAuthRedirectUrl()
    })
  });
  return data.access_token ? toSession(data) : undefined;
}

export async function refreshMobileSession(refreshToken: string) {
  const config = authConfigOrThrow();
  return toSession(await request(config, "/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken })
  }));
}

export async function sendMobileRecovery(email: string) {
  const config = authConfigOrThrow();
  await request(config, "/auth/v1/recover", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      redirect_to: getMobileAuthRedirectUrl()
    })
  });
}

export async function completeMobileAuthCallback(url: string) {
  if (!isMobileAuthCallback(url)) throw new MobileAuthError("O link de autenticação não pertence a este aplicativo.");
  const parsed = parseAuthCallback(url);
  if (parsed.error) throw new MobileAuthError(parsed.error);
  if (parsed.code && !parsed.accessToken) {
    throw new MobileAuthError("Este retorno pertence a outro fluxo de login. Volte ao login e inicie novamente pelo aplicativo.");
  }
  if (!parsed.accessToken || !parsed.refreshToken) {
    throw new MobileAuthError("O retorno da autenticação não contém uma sessão válida.");
  }
  const user = await getAuthenticatedUser(parsed.accessToken);
  return {
    session: toSession({
      access_token: parsed.accessToken,
      refresh_token: parsed.refreshToken,
      expires_at: parsed.expiresAt,
      expires_in: parsed.expiresIn
    }, user),
    type: parsed.type
  };
}

let socialRequest: Promise<string> | undefined;

export function signInWithOAuth(provider: MobileOAuthProvider): Promise<string> {
  // A double tap must not open two browser sessions or clear an active callback.
  if (socialRequest) return socialRequest;
  socialRequest = openSocialLogin(provider).finally(() => { socialRequest = undefined; });
  return socialRequest;
}

async function openSocialLogin(provider: MobileOAuthProvider): Promise<string> {
  const config = authConfigOrThrow();
  const enabled = provider === "google" ? config.googleEnabled : config.facebookEnabled;
  if (!enabled) throw new MobileAuthError(`O login com ${provider === "google" ? "Google" : "Facebook"} ainda não está habilitado.`);
  authCallbackInbox.clear();
  Linking.clearInitialURL();
  const redirectUrl = getMobileAuthRedirectUrl();
  const params = new URLSearchParams({
    provider,
    redirect_to: redirectUrl,
    scopes: getOAuthScopes(provider)
  });
  const result = await WebBrowser.openAuthSessionAsync(
    `${config.url}/auth/v1/authorize?${params.toString()}`,
    redirectUrl
  );

  if (result.type === "success" && result.url) {
    if (!authCallbackInbox.capture(result.url)) {
      throw new MobileAuthError("O provedor retornou sem os dados necessários para entrar. Tente novamente.");
    }
    return result.url;
  }

  // On Android AppState can resolve the browser as "dismiss" before the URL
  // event. The native cache/inbox remains authoritative for this attempt.
  authCallbackInbox.capture(Linking.getLinkingURL());
  const returned = await authCallbackInbox.wait(1_500);
  if (returned) return returned.url;
  if (result.type === "cancel" || result.type === "dismiss") {
    throw new MobileAuthError("Login cancelado ou retorno não recebido. Abra o Google novamente para tentar entrar.");
  }
  throw new MobileAuthError("O provedor não concluiu o login.");
}

export async function updateMobileProfile(
  session: MobileAuthSession,
  values: { displayName?: string; username?: string; avatarUrl?: string; password?: string }
) {
  const config = authConfigOrThrow();
  const body: Record<string, unknown> = {};
  if (values.password) body.password = values.password;
  if (values.displayName !== undefined || values.username !== undefined || values.avatarUrl !== undefined) {
    body.data = {
      ...session.user.user_metadata,
      ...(values.displayName !== undefined ? { display_name: values.displayName.trim() } : {}),
      ...(values.username !== undefined ? { username: normalizeAccountUsername(values.username) } : {}),
      ...(values.avatarUrl !== undefined ? { avatar_url: values.avatarUrl.trim() } : {})
    };
  }
  const data = await request(config, "/auth/v1/user", {
    method: "PUT",
    body: JSON.stringify(body)
  }, session.access_token);
  const user = userFromResponse(data);
  if (!user) throw new MobileAuthError("O perfil não foi atualizado.");
  if (values.displayName !== undefined || values.avatarUrl !== undefined) {
    await request(
      config,
      `/rest/v1/profiles?user_id=eq.${encodeURIComponent(session.user.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          ...(values.displayName !== undefined ? { display_name: values.displayName.trim() || null } : {}),
          ...(values.avatarUrl !== undefined ? { avatar_url: values.avatarUrl.trim() || null } : {})
        })
      },
      session.access_token
    );
  }
  return { ...session, user };
}

export async function signOutMobile(session: MobileAuthSession) {
  const config = getMobileAuthConfig();
  if (config) {
    await request(config, "/auth/v1/logout", { method: "POST" }, session.access_token)
      .catch(() => undefined);
  }
}

export async function deleteMobileAccount(session: MobileAuthSession) {
  const config = authConfigOrThrow();
  await request(config, "/rest/v1/rpc/delete_own_account", {
    method: "POST",
    body: "{}",
    headers: { Prefer: "return=minimal" }
  }, session.access_token);
}

export type { MobileOAuthProvider };


export async function canUseBiometrics() {
  try {
    return await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function authenticateWithBiometrics() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Entrar no Bibliolingo",
    cancelLabel: "Cancelar",
    fallbackLabel: "Usar bloqueio do aparelho",
    disableDeviceFallback: false,
    biometricsSecurityLevel: "strong"
  });
  return result.success;
}

export async function loadBiometricPreference() {
  return (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === "true";
}

export async function saveBiometricPreference(enabled: boolean) {
  if (enabled) await SecureStore.setItemAsync(BIOMETRIC_KEY, "true");
  else await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
}
