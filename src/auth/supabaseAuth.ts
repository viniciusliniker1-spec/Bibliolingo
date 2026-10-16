import { normalizeAccountUsername } from "./accountIdentity";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: AuthUser;
  message?: string;
  error_description?: string;
  error?: string;
}

export interface AuthConfiguration {
  url: string;
  publishableKey: string;
  googleEnabled: boolean;
  facebookEnabled: boolean;
}

function envFlag(value: unknown) {
  return String(value ?? "").toLowerCase() === "true";
}

export function getWebAuthConfiguration(): AuthConfiguration | undefined {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
  const publishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");
  if (!url || !publishableKey) return undefined;
  return {
    url,
    publishableKey,
    googleEnabled: envFlag(import.meta.env.VITE_AUTH_GOOGLE_ENABLED),
    facebookEnabled: envFlag(import.meta.env.VITE_AUTH_FACEBOOK_ENABLED)
  };
}

async function parseResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json().catch(() => ({})) as AuthResponse;
  if (!response.ok) {
    throw new Error(
      data.error_description
      ?? data.message
      ?? data.error
      ?? "Não foi possível concluir a autenticação."
    );
  }
  return data;
}

function sessionFromResponse(data: AuthResponse): AuthSession {
  if (!data.access_token || !data.refresh_token || !data.user) {
    throw new Error("O servidor não devolveu uma sessão válida.");
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user: data.user
  };
}

export class SupabaseAuthApi {
  constructor(private readonly config: AuthConfiguration) {}

  private headers(token?: string) {
    return {
      apikey: this.config.publishableKey,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async signUp(email: string, password: string, displayName: string) {
    const data = await parseResponse(await fetch(`${this.config.url}/auth/v1/signup`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        email,
        password,
        data: {
          display_name: displayName.trim(),
          username: normalizeAccountUsername(displayName || email.split("@")[0])
        },
        email_redirect_to: window.location.origin + window.location.pathname + "#/account"
      })
    }));
    return data.access_token ? sessionFromResponse(data) : undefined;
  }

  async signIn(email: string, password: string) {
    const data = await parseResponse(await fetch(
      `${this.config.url}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ email, password })
      }
    ));
    return sessionFromResponse(data);
  }

  async refresh(refreshToken: string) {
    const data = await parseResponse(await fetch(
      `${this.config.url}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ refresh_token: refreshToken })
      }
    ));
    return sessionFromResponse(data);
  }

  async signOut(accessToken: string) {
    await fetch(`${this.config.url}/auth/v1/logout`, {
      method: "POST",
      headers: this.headers(accessToken)
    }).catch(() => undefined);
  }

  async sendRecovery(email: string) {
    await parseResponse(await fetch(`${this.config.url}/auth/v1/recover`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        email,
        redirect_to: window.location.origin + window.location.pathname + "#/account?recovery=1"
      })
    }));
  }

  async updateUser(session: AuthSession, values: {
    password?: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  }) {
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
    const data = await parseResponse(await fetch(`${this.config.url}/auth/v1/user`, {
      method: "PUT",
      headers: this.headers(session.access_token),
      body: JSON.stringify(body)
    }));
    if (!data.user) throw new Error("O perfil não foi atualizado.");
    if (values.displayName !== undefined || values.avatarUrl !== undefined) {
      await parseResponse(await fetch(
        `${this.config.url}/rest/v1/profiles?user_id=eq.${encodeURIComponent(session.user.id)}`,
        {
          method: "PATCH",
          headers: { ...this.headers(session.access_token), Prefer: "return=minimal" },
          body: JSON.stringify({
            ...(values.displayName !== undefined ? { display_name: values.displayName.trim() || null } : {}),
            ...(values.avatarUrl !== undefined ? { avatar_url: values.avatarUrl.trim() || null } : {})
          })
        }
      ));
    }
    return { ...session, user: data.user };
  }

  async deleteAccount(accessToken: string) {
    await parseResponse(await fetch(`${this.config.url}/rest/v1/rpc/delete_own_account`, {
      method: "POST",
      headers: {
        ...this.headers(accessToken),
        Prefer: "return=minimal"
      },
      body: "{}"
    }));
  }

  async sessionFromTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    const data = await parseResponse(await fetch(`${this.config.url}/auth/v1/user`, {
      headers: this.headers(accessToken)
    }));
    if (!data.user) throw new Error("Não foi possível recuperar o usuário da sessão.");
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      user: data.user
    };
  }

  async exchangeOAuthCode(code: string, verifier: string) {
    const data = await parseResponse(await fetch(
      `${this.config.url}/auth/v1/token?grant_type=pkce`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ auth_code: code, code_verifier: verifier })
      }
    ));
    return sessionFromResponse(data);
  }

  async oauthUrl(provider: "google" | "facebook") {
    const random = new Uint8Array(48);
    globalThis.crypto.getRandomValues(random);
    const verifier = Array.from(random, (value) => value.toString(16).padStart(2, "0")).join("");
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(verifier)
    );
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    window.sessionStorage.setItem("bibliolingo.auth.pkce", verifier);
    const redirect = window.location.origin + window.location.pathname + "?auth_callback=1";
    const params = new URLSearchParams({
      provider,
      redirect_to: redirect,
      code_challenge: challenge,
      code_challenge_method: "s256"
    });
    return `${this.config.url}/auth/v1/authorize?${params}`;
  }
}
