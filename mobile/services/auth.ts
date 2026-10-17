import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as LocalAuthentication from "expo-local-authentication";
import { normalizeAccountUsername } from "../../src/auth/accountIdentity";

const SESSION_KEY = "bibliolingo.auth.session.v1";
const BIOMETRIC_KEY = "bibliolingo.auth.biometric.v1";
WebBrowser.maybeCompleteAuthSession();

export type MobileOAuthProvider = "google" | "facebook";

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
  message?: string;
  error_description?: string;
  error?: string;
}

export function getMobileAuthConfig() {
  const url = String(process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const publishableKey = String(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
  return url && publishableKey ? {
    url,
    publishableKey,
    googleEnabled: process.env.EXPO_PUBLIC_AUTH_GOOGLE_ENABLED === "true",
    facebookEnabled: process.env.EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED === "true"
  } : undefined;
}

async function request(
  config: { url: string; publishableKey: string },
  path: string,
  options: RequestInit,
  accessToken?: string
): Promise<AuthResponse> {
  const response = await fetch(config.url + path, {
    ...options,
    headers: {
      apikey: config.publishableKey,
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({})) as AuthResponse;
  if (!response.ok) throw new Error(data.error_description ?? data.message ?? data.error ?? "Falha na autenticação.");
  return data;
}

function toSession(data: AuthResponse): MobileAuthSession {
  if (!data.access_token || !data.refresh_token || !data.user) throw new Error("O servidor não devolveu uma sessão válida.");
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user: data.user
  };
}

export async function loadSecureSession() {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return undefined;
  try { return JSON.parse(raw) as MobileAuthSession; }
  catch { await SecureStore.deleteItemAsync(SESSION_KEY); return undefined; }
}

export async function saveSecureSession(session?: MobileAuthSession) {
  if (session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    });
  } else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function signInWithPassword(email: string, password: string) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
  return toSession(await request(config, "/auth/v1/token?grant_type=password", {
    method: "POST", body: JSON.stringify({ email, password })
  }));
}

export async function signUpWithPassword(email: string, password: string, displayName: string) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
  const data = await request(config, "/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      data: {
        display_name: displayName.trim(),
        username: normalizeAccountUsername(displayName || email.split("@")[0])
      },
      email_redirect_to: process.env.EXPO_PUBLIC_AUTH_WEB_URL ?? "https://viniciusliniker1-spec.github.io/Bibliolingo/#/account"
    })
  });
  return data.access_token ? toSession(data) : undefined;
}

function callbackValues(url: string) {
  const hash = url.includes("#") ? url.slice(url.indexOf("#") + 1) : "";
  const query = url.includes("?") ? url.slice(url.indexOf("?") + 1).split("#")[0] : "";
  return new URLSearchParams(hash || query);
}

export async function signInWithOAuth(provider: MobileOAuthProvider) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
  if (provider === "google" && !config.googleEnabled) throw new Error("Google ainda não foi habilitado neste ambiente.");
  if (provider === "facebook" && !config.facebookEnabled) throw new Error("Facebook ainda não foi habilitado neste ambiente.");

  const redirectTo = Linking.createURL("auth/callback");
  const authorize = `${config.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}&skip_http_redirect=true`;
  const result = await WebBrowser.openAuthSessionAsync(authorize, redirectTo, {
    showInRecents: true,
    preferEphemeralSession: false
  });
  if (result.type !== "success" || !("url" in result)) throw new Error("Login cancelado.");
  const params = callbackValues(result.url);
  const error = params.get("error_description") ?? params.get("error");
  if (error) throw new Error(error);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) throw new Error("O provedor não devolveu uma sessão válida.");
  const data = await request(config, "/auth/v1/user", { method: "GET" }, accessToken);
  if (!data.user) throw new Error("Não foi possível carregar a conta autenticada.");
  return toSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: Number(params.get("expires_in") ?? 3600),
    user: data.user
  });
}

export async function refreshMobileSession(refreshToken: string) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
  return toSession(await request(config, "/auth/v1/token?grant_type=refresh_token", {
    method: "POST", body: JSON.stringify({ refresh_token: refreshToken })
  }));
}

export async function sendMobileRecovery(email: string) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
  await request(config, "/auth/v1/recover", {
    method: "POST",
    body: JSON.stringify({
      email,
      redirect_to: process.env.EXPO_PUBLIC_AUTH_WEB_URL ?? "https://viniciusliniker1-spec.github.io/Bibliolingo/#/account"
    })
  });
}

export async function updateMobileProfile(
  session: MobileAuthSession,
  values: { displayName?: string; username?: string; avatarUrl?: string; password?: string }
) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
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
  const data = await request(config, "/auth/v1/user", { method: "PUT", body: JSON.stringify(body) }, session.access_token);
  if (!data.user) throw new Error("O perfil não foi atualizado.");
  if (values.displayName !== undefined || values.avatarUrl !== undefined) {
    await request(config, `/rest/v1/profiles?user_id=eq.${encodeURIComponent(session.user.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        ...(values.displayName !== undefined ? { display_name: values.displayName.trim() || null } : {}),
        ...(values.avatarUrl !== undefined ? { avatar_url: values.avatarUrl.trim() || null } : {})
      })
    }, session.access_token);
  }
  return { ...session, user: data.user };
}

export async function signOutMobile(session: MobileAuthSession) {
  const config = getMobileAuthConfig();
  if (config) await request(config, "/auth/v1/logout", { method: "POST" }, session.access_token).catch(() => undefined);
}

export async function deleteMobileAccount(session: MobileAuthSession) {
  const config = getMobileAuthConfig();
  if (!config) throw new Error("A conta online ainda não foi configurada neste build.");
  await request(config, "/rest/v1/rpc/delete_own_account", {
    method: "POST", body: "{}", headers: { Prefer: "return=minimal" }
  }, session.access_token);
}

export async function canUseBiometrics() {
  try {
    return await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
  } catch { return false; }
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
