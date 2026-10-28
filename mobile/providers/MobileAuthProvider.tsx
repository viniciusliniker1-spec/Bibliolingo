import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import {
  authenticateWithBiometrics,
  canUseBiometrics,
  completeMobileAuthCallback,
  deleteMobileAccount,
  getMobileAuthConfig,
  isSessionRejected,
  loadBiometricPreference,
  loadSecureSession,
  refreshMobileSession,
  saveBiometricPreference,
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

import { authCallbackInbox, type AuthCallbackEntry } from "../services/authCallbackInbox";

const GUEST_MODE_KEY = "bibliolingo.auth.guest.v1";

interface MobileAuthValue {
  configured: boolean;
  googleEnabled: boolean;
  facebookEnabled: boolean;
  loading: boolean;
  guestMode: boolean;
  session?: MobileAuthSession;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  biometricLocked: boolean;
  continueAsGuest: () => Promise<void>;
  requireAuthentication: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInSocial: (provider: MobileOAuthProvider) => Promise<void>;
  completeAuthCallback: (url: string) => Promise<string | undefined>;
  signUp: (email: string, password: string, name: string) => Promise<"signed-in" | "confirm-email">;
  recover: (email: string) => Promise<void>;
  unlockWithBiometrics: () => Promise<boolean>;
  usePasswordInstead: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (values: { displayName?: string; username?: string; avatarUrl?: string; password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthValue | null>(null);

export function MobileAuthProvider({ children }: PropsWithChildren) {
  const config = useMemo(() => getMobileAuthConfig(), []);
  const [session, setSessionState] = useState<MobileAuthSession>();
  const [guestMode, setGuestModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const pendingSession = useRef<MobileAuthSession | undefined>(undefined);
  const sessionVersion = useRef(0);
  const sessionWrites = useRef<Promise<void>>(Promise.resolve());
  const nativeUrl = Linking.useLinkingURL();

  const setSession = useCallback(async (next?: MobileAuthSession) => {
    const version = ++sessionVersion.current;
    const write = sessionWrites.current.catch(() => undefined).then(() => saveSecureSession(next));
    sessionWrites.current = write;
    await write;
    if (version !== sessionVersion.current) return;
    setSessionState(next);
    pendingSession.current = undefined;
  }, []);

  const setGuestMode = useCallback(async (enabled: boolean) => {
    setGuestModeState(enabled);
    if (enabled) await SecureStore.setItemAsync(GUEST_MODE_KEY, "true");
    else await SecureStore.deleteItemAsync(GUEST_MODE_KEY);
  }, []);

  const completeAuthCallback = useCallback((url: string) => authCallbackInbox.complete(url, async (callbackUrl) => {
    const entryId = authCallbackInbox.get()?.id;
    const completed = await completeMobileAuthCallback(callbackUrl);
    if (authCallbackInbox.get()?.id !== entryId) {
      throw new Error("Esta tentativa de login foi substituída. Inicie novamente.");
    }
    await setSession(completed.session);
    setBiometricLocked(false);
    await setGuestMode(false);
    return completed.type;
  }), [setSession, setGuestMode]);

  useEffect(() => {
    authCallbackInbox.capture(nativeUrl);
  }, [nativeUrl]);

  useEffect(() => {
    // Bootstrap must finish before a new OAuth session can replace it.
    if (loading) return;
    const accept = (entry?: AuthCallbackEntry) => {
      if (entry) void completeAuthCallback(entry.url).catch(() => {
        // The callback screen presents the error. Never log credentials/URLs.
        console.warn("[BibliolingoAuth] callback_failed");
      });
    };
    const unsubscribe = authCallbackInbox.subscribe(accept);
    accept(authCallbackInbox.get());
    return unsubscribe;
  }, [loading, completeAuthCallback]);

  const refreshIfNeeded = useCallback(async (current?: MobileAuthSession) => {
    if (!current) return undefined;
    try {
      const next = current.expires_at * 1000 - Date.now() <= 90_000
        ? await refreshMobileSession(current.refresh_token)
        : await verifyMobileSession(current);
      return next;
    } catch (error) {
      if (isSessionRejected(error)) {
        try {
          const refreshed = await refreshMobileSession(current.refresh_token);
          return refreshed;
        } catch (refreshError) {
          if (isSessionRejected(refreshError)) {
            return undefined;
          }
        }
      }
      // Indisponibilidade de rede/servidor não apaga uma sessão armazenada.
      return current;
    }
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const stored = pendingSession.current ?? await loadSecureSession();
    if (!stored) {
      setBiometricLocked(false);
      return false;
    }
    if (!await authenticateWithBiometrics()) return false;
    const next = await refreshIfNeeded(stored);
    if (!next) {
      setBiometricLocked(false);
      return false;
    }
    pendingSession.current = undefined;
    await setSession(next);
    setBiometricLocked(false);
    await setGuestMode(false);
    return true;
  }, [refreshIfNeeded, setSession, setGuestMode]);

  useEffect(() => {
    let active = true;
    const restoringVersion = sessionVersion.current;
    void (async () => {
      const [stored, storedGuest, preference, available] = await Promise.all([
        loadSecureSession(),
        SecureStore.getItemAsync(GUEST_MODE_KEY),
        loadBiometricPreference(),
        canUseBiometrics()
      ]);
      if (!active || sessionVersion.current !== restoringVersion) return;
      setBiometricAvailable(available);
      setBiometricEnabled(preference && available);
      if (stored && preference && available) {
        pendingSession.current = stored;
        setBiometricLocked(true);
        const unlocked = await authenticateWithBiometrics();
        if (!active || sessionVersion.current !== restoringVersion) return;
        if (unlocked) {
          const next = await refreshIfNeeded(stored);
          if (!active || sessionVersion.current !== restoringVersion) return;
          await setSession(next);
          pendingSession.current = undefined;
          setBiometricLocked(false);
        }
      } else {
        const next = await refreshIfNeeded(stored);
        if (!active || sessionVersion.current !== restoringVersion) return;
        await setSession(next);
      }
      setGuestModeState(!stored && storedGuest === "true");
      setLoading(false);
    })().catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [refreshIfNeeded, setSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && session && !loading && !biometricLocked) {
        const version = sessionVersion.current;
        void refreshIfNeeded(session).then(async (next) => {
          if (version === sessionVersion.current) await setSession(next);
        }).catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [refreshIfNeeded, session, loading, biometricLocked, setSession]);

  const disableBiometrics = useCallback(async () => {
    await saveBiometricPreference(false);
    setBiometricEnabled(false);
    setBiometricLocked(false);
  }, []);

  const value = useMemo<MobileAuthValue>(() => ({
    configured: Boolean(config),
    googleEnabled: Boolean(config?.googleEnabled),
    facebookEnabled: Boolean(config?.facebookEnabled),
    loading,
    guestMode,
    session,
    biometricAvailable,
    biometricEnabled,
    biometricLocked,
    continueAsGuest: () => setGuestMode(true),
    requireAuthentication: () => setGuestMode(false),
    signIn: async (email, password) => {
      await setSession(await signInWithPassword(email, password));
      setBiometricLocked(false);
      await setGuestMode(false);
    },
    signInSocial: async (socialProvider) => {
      const callbackUrl = await signInWithOAuth(socialProvider);
      await completeAuthCallback(callbackUrl);
    },
    completeAuthCallback,
    signUp: async (email, password, name) => {
      const next = await signUpWithPassword(email, password, name);
      if (!next) return "confirm-email";
      await setSession(next);
      setBiometricLocked(false);
      await setGuestMode(false);
      return "signed-in";
    },
    recover: sendMobileRecovery,
    unlockWithBiometrics,
    usePasswordInstead: async () => {
      pendingSession.current = undefined;
      await setSession(undefined);
      setBiometricLocked(false);
      await disableBiometrics();
    },
    enableBiometrics: async () => {
      if (!session) throw new Error("Entre na conta antes de ativar a biometria.");
      if (!await canUseBiometrics()) throw new Error("Cadastre uma digital ou biometria nas configurações do aparelho.");
      if (!await authenticateWithBiometrics()) throw new Error("A biometria não foi confirmada.");
      await saveBiometricPreference(true);
      setBiometricAvailable(true);
      setBiometricEnabled(true);
    },
    disableBiometrics,
    signOut: async () => {
      authCallbackInbox.clear();
      if (session) await signOutMobile(session);
      await disableBiometrics();
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
      authCallbackInbox.clear();
      await disableBiometrics();
      await setSession(undefined);
      await setGuestMode(false);
    }
  }), [
    config, loading, guestMode, session, biometricAvailable, biometricEnabled, biometricLocked,
    setGuestMode, setSession, completeAuthCallback, unlockWithBiometrics, disableBiometrics
  ]);

  return <MobileAuthContext.Provider value={value}>{children}</MobileAuthContext.Provider>;
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) throw new Error("useMobileAuth deve estar dentro de MobileAuthProvider");
  return context;
}
