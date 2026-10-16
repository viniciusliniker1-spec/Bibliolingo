import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  getWebAuthConfiguration,
  SupabaseAuthApi,
  type AuthSession
} from "./supabaseAuth";

const SESSION_KEY = "bibliolingo.auth.session.v1";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session?: AuthSession;
  googleEnabled: boolean;
  facebookEnabled: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<"signed-in" | "confirm-email">;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendRecovery: (email: string) => Promise<void>;
  updateProfile: (values: { displayName?: string; avatarUrl?: string; password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  beginOAuth: (provider: "google" | "facebook") => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readSession(): AuthSession | undefined {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AuthSession : undefined;
  } catch {
    return undefined;
  }
}

function persistSession(session?: AuthSession) {
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const config = getWebAuthConfiguration();
  const api = useMemo(() => config ? new SupabaseAuthApi(config) : undefined, [
    config?.url,
    config?.publishableKey
  ]);
  const [session, setSessionState] = useState<AuthSession | undefined>(() => readSession());
  const [loading, setLoading] = useState(Boolean(session));

  const setSession = useCallback((next?: AuthSession) => {
    setSessionState(next);
    persistSession(next);
  }, []);

  const refreshIfNeeded = useCallback(async () => {
    if (!api || !session) return;
    if (session.expires_at * 1000 - Date.now() > 90_000) return;
    try {
      setSession(await api.refresh(session.refresh_token));
    } catch {
      setSession(undefined);
    }
  }, [api, session, setSession]);

  useEffect(() => {
    refreshIfNeeded().finally(() => setLoading(false));
    const timer = window.setInterval(() => void refreshIfNeeded(), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshIfNeeded();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshIfNeeded]);

  const value = useMemo<AuthContextValue>(() => ({
    configured: Boolean(api),
    loading,
    session,
    googleEnabled: Boolean(config?.googleEnabled),
    facebookEnabled: Boolean(config?.facebookEnabled),
    signUp: async (email, password, displayName) => {
      if (!api) throw new Error("A conta online ainda não foi configurada.");
      const created = await api.signUp(email, password, displayName);
      if (created) {
        setSession(created);
        return "signed-in";
      }
      return "confirm-email";
    },
    signIn: async (email, password) => {
      if (!api) throw new Error("A conta online ainda não foi configurada.");
      setSession(await api.signIn(email, password));
    },
    signOut: async () => {
      if (api && session) await api.signOut(session.access_token);
      setSession(undefined);
    },
    sendRecovery: async (email) => {
      if (!api) throw new Error("A conta online ainda não foi configurada.");
      await api.sendRecovery(email);
    },
    updateProfile: async (values) => {
      if (!api || !session) throw new Error("Entre na conta para editar o perfil.");
      setSession(await api.updateUser(session, values));
    },
    deleteAccount: async () => {
      if (!api || !session) throw new Error("Entre na conta para excluí-la.");
      await api.deleteAccount(session.access_token);
      setSession(undefined);
    },
    beginOAuth: (provider) => {
      if (!api) throw new Error("A conta online ainda não foi configurada.");
      window.location.assign(api.oauthUrl(provider));
    }
  }), [api, config?.facebookEnabled, config?.googleEnabled, loading, session, setSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
