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
  deleteMobileAccount,
  getMobileAuthConfig,
  loadSecureSession,
  refreshMobileSession,
  saveSecureSession,
  sendMobileRecovery,
  signInWithPassword,
  signOutMobile,
  signUpWithPassword,
  updateMobileProfile,
  type MobileAuthSession
} from "../services/auth";

const GUEST_MODE_KEY = "bibliolingo.auth.guest.v1";

interface MobileAuthValue {
  configured: boolean;
  loading: boolean;
  guestMode: boolean;
  session?: MobileAuthSession;
  continueAsGuest: () => Promise<void>;
  requireAuthentication: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<"signed-in" | "confirm-email">;
  recover: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (values: { displayName?: string; avatarUrl?: string; password?: string }) => Promise<void>;
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

  const refreshIfNeeded = useCallback(async (current?: MobileAuthSession) => {
    if (!current || current.expires_at * 1000 - Date.now() > 90_000) return current;
    try {
      const next = await refreshMobileSession(current.refresh_token);
      await setSession(next);
      return next;
    } catch {
      await setSession(undefined);
      return undefined;
    }
  }, [setSession]);

  useEffect(() => {
    let active = true;
    Promise.all([loadSecureSession(), SecureStore.getItemAsync(GUEST_MODE_KEY)])
      .then(async ([stored, storedGuest]) => {
        const next = await refreshIfNeeded(stored);
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
  }, [refreshIfNeeded]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshIfNeeded(session);
    });
    return () => subscription.remove();
  }, [refreshIfNeeded, session]);

  const value = useMemo<MobileAuthValue>(() => ({
    configured: Boolean(getMobileAuthConfig()),
    loading,
    guestMode,
    session,
    continueAsGuest: () => setGuestMode(true),
    requireAuthentication: () => setGuestMode(false),
    signIn: async (email, password) => {
      await setSession(await signInWithPassword(email, password));
      await setGuestMode(false);
    },
    signUp: async (email, password, name) => {
      const next = await signUpWithPassword(email, password, name);
      if (!next) return "confirm-email";
      await setSession(next);
      await setGuestMode(false);
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
  }), [guestMode, loading, session, setGuestMode, setSession]);

  return <MobileAuthContext.Provider value={value}>{children}</MobileAuthContext.Provider>;
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) throw new Error("useMobileAuth deve estar dentro de MobileAuthProvider");
  return context;
}
