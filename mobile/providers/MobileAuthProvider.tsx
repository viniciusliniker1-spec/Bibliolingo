import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  completeMobileAuthCallback,
  deleteMobileAccount,
  getMobileAuthConfig,
  isSessionRejected,
  loadSecureSession,
  refreshMobileSession,
  saveSecureSession,
  sendMobileRecovery,
  signInWithOAuth,
  signInWithPassword,
  signOutMobile,
  signUpWithPassword,
  updateMobileProfile,
  verifyMobileSession,
  type MobileAuthSession,
  type MobileOAuthProvider
} from "../services/auth";

const GUEST_MODE_KEY = "bibliolingo.auth.guest.v1";

interface MobileAuthValue {
  configured: boolean;
  googleEnabled: boolean;
  facebookEnabled: boolean;
  loading: boolean;
  guestMode: boolean;
  session?: MobileAuthSession;
  continueAsGuest: () => Promise<void>;
  requireAuthentication: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInSocial: (provider: MobileOAuthProvider) => Promise<void>;
  completeAuthCallback: (url: string) => Promise<string | undefined>;
  signUp: (email: string, password: string, name: string) => Promise<"signed-in" | "confirm-email">;
  recover: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (values: { displayName?: string; username?: string; avatarUrl?: string; password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthValue | null>(null);

export function MobileAuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<MobileAuthSession>();
  const [guestMode, setGuestModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback(async (next?: MobileAuthSession) => {
    setSessionState(next);
    await saveSecureSession(next);
  }, []);

  const setGuestMode = useCallback(async (enabled: boolean) => {
    setGuestModeState(enabled);
    if (enabled) {
      await SecureStore.setItemAsync(GUEST_MODE_KEY, "true");
    } else {
      await SecureStore.deleteItemAsync(GUEST_MODE_KEY);
    }
  }, []);

  const restoreSession = useCallback(async (current?: MobileAuthSession) => {
    if (!current) return undefined;
    try {
      const next = current.expires_at * 1000 - Date.now() <= 90_000
        ? await refreshMobileSession(current.refresh_token)
        : await verifyMobileSession(current);
      await setSession(next);
      return next;
    } catch (error) {
      if (isSessionRejected(error)) {
        try {
          const refreshed = await refreshMobileSession(current.refresh_token);
          await setSession(refreshed);
          return refreshed;
        } catch (refreshError) {
          if (isSessionRejected(refreshError)) {
            await setSession(undefined);
            return undefined;
          }
        }
      }
      // Falhas de rede/servidor não apagam uma sessão válida armazenada.
      setSessionState(current);
      return current;
    }
  }, [setSession]);

  useEffect(() => {
    let active = true;
    Promise.all([loadSecureSession(), SecureStore.getItemAsync(GUEST_MODE_KEY)])
      .then(async ([stored, storedGuest]) => {
        const next = await restoreSession(stored);
        if (active) {
          setSessionState(next);
          setGuestModeState(!next && storedGuest === "true");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [restoreSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void restoreSession(session);
    });
    return () => subscription.remove();
  }, [restoreSession, session]);

  const config = useMemo(() => getMobileAuthConfig(), []);
  const authenticate = useCallback(async (next: MobileAuthSession) => {
    // A conta substitui apenas o modo visitante; o progresso é preservado e
    // continua sendo conciliado pelos serviços existentes, sem vincular contas.
    await setSession(next);
    await setGuestMode(false);
  }, [setGuestMode, setSession]);

  const value = useMemo<MobileAuthValue>(() => ({
    configured: Boolean(config),
    googleEnabled: Boolean(config?.googleEnabled),
    facebookEnabled: Boolean(config?.facebookEnabled),
    loading,
    guestMode,
    session,
    continueAsGuest: () => setGuestMode(true),
    requireAuthentication: () => setGuestMode(false),
    signIn: async (email, password) => authenticate(await signInWithPassword(email, password)),
    signInSocial: async (provider) => authenticate(await signInWithOAuth(provider)),
    completeAuthCallback: async (url) => {
      const completed = await completeMobileAuthCallback(url);
      await authenticate(completed.session);
      return completed.type;
    },
    signUp: async (email, password, name) => {
      const next = await signUpWithPassword(email, password, name);
      if (!next) return "confirm-email";
      await authenticate(next);
      return "signed-in";
    },
    recover: sendMobileRecovery,
    signOut: async () => {
      if (session) await signOutMobile(session);
      await setSession(undefined);
      await setGuestMode(false);
    },
    updateProfile: async (values) => {
      if (!session) throw new Error("Entre na conta para editar o perfil.");
      await setSession(await updateMobileProfile(session, values));
    },
    deleteAccount: async () => {
      if (!session) throw new Error("Entre na conta para excluir a conta.");
      await deleteMobileAccount(session);
      await setSession(undefined);
      await setGuestMode(false);
    }
  }), [authenticate, config, guestMode, loading, session, setGuestMode, setSession]);

  return <MobileAuthContext.Provider value={value}>{children}</MobileAuthContext.Provider>;
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) throw new Error("useMobileAuth deve estar dentro de MobileAuthProvider");
  return context;
}
