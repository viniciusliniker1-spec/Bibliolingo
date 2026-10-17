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
import * as SecureStore from "expo-secure-store";
import {
  authenticateWithBiometrics,
  canUseBiometrics,
  deleteMobileAccount,
  getMobileAuthConfig,
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
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  biometricLocked: boolean;
  continueAsGuest: () => Promise<void>;
  requireAuthentication: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInSocial: (provider: MobileOAuthProvider) => Promise<void>;
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
  const config = getMobileAuthConfig();
  const [session, setSessionState] = useState<MobileAuthSession>();
  const [guestMode, setGuestModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const pendingSession = useRef<MobileAuthSession | undefined>(undefined);

  const setSession = useCallback(async (next?: MobileAuthSession) => {
    setSessionState(next);
    pendingSession.current = undefined;
    await saveSecureSession(next);
  }, []);

  const setGuestMode = useCallback(async (enabled: boolean) => {
    setGuestModeState(enabled);
    if (enabled) await SecureStore.setItemAsync(GUEST_MODE_KEY, "true");
    else await SecureStore.deleteItemAsync(GUEST_MODE_KEY);
  }, []);

  const refreshIfNeeded = useCallback(async (current?: MobileAuthSession) => {
    if (!current || current.expires_at * 1000 - Date.now() > 90_000) return current;
    try {
      const next = await refreshMobileSession(current.refresh_token);
      await saveSecureSession(next);
      return next;
    } catch {
      await saveSecureSession(undefined);
      return undefined;
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
    setSessionState(next);
    setBiometricLocked(false);
    setGuestModeState(false);
    return true;
  }, [refreshIfNeeded]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [stored, storedGuest, preference, available] = await Promise.all([
        loadSecureSession(),
        SecureStore.getItemAsync(GUEST_MODE_KEY),
        loadBiometricPreference(),
        canUseBiometrics()
      ]);
      if (!active) return;
      setBiometricAvailable(available);
      setBiometricEnabled(preference && available);
      if (stored && preference && available) {
        pendingSession.current = stored;
        setBiometricLocked(true);
        const unlocked = await authenticateWithBiometrics();
        if (!active) return;
        if (unlocked) {
          const next = await refreshIfNeeded(stored);
          if (!active) return;
          setSessionState(next);
          pendingSession.current = undefined;
          setBiometricLocked(false);
        }
      } else {
        const next = await refreshIfNeeded(stored);
        if (!active) return;
        setSessionState(next);
      }
      setGuestModeState(!stored && storedGuest === "true");
      setLoading(false);
    })().catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [refreshIfNeeded]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && session) {
        void refreshIfNeeded(session).then(setSessionState);
      }
    });
    return () => subscription.remove();
  }, [refreshIfNeeded, session]);

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
      await setSession(await signInWithOAuth(socialProvider));
      setBiometricLocked(false);
      await setGuestMode(false);
    },
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
      setSessionState(undefined);
      setBiometricLocked(false);
      await saveSecureSession(undefined);
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
      await disableBiometrics();
      await setSession(undefined);
      await setGuestMode(false);
    }
  }), [
    config, loading, guestMode, session, biometricAvailable, biometricEnabled, biometricLocked,
    setGuestMode, setSession, unlockWithBiometrics, disableBiometrics
  ]);

  return <MobileAuthContext.Provider value={value}>{children}</MobileAuthContext.Provider>;
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) throw new Error("useMobileAuth deve estar dentro de MobileAuthProvider");
  return context;
}
