import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { LumiAccountState, LumiCategory } from "../../src/domain/lumi";
import {
  equipMobileLumiItem,
  fetchMobileLumiState,
  getMobileProfilePhotoUrl,
  purchaseMobileLumiItem,
  removeMobileProfilePhoto,
  unequipMobileLumiCategory,
  uploadMobileProfilePhoto
} from "../services/lumiRemote";
import {
  addPendingLumiCredit,
  clearPendingLumiCredits,
  loadPendingLumiCredits,
  pendingLumiTotal
} from "../services/lumiLocalLedger";
import { useMobileAuth } from "./MobileAuthProvider";

const EMPTY: LumiAccountState = {
  balance: 0, items: [], inventory: [], equipment: [], transactions: []
};

interface MobileLumiValue {
  state: LumiAccountState;
  loading: boolean;
  error?: string;
  profilePhotoUrl?: string;
  refresh: () => Promise<void>;
  purchase: (itemId: string) => Promise<void>;
  equip: (itemId: string) => Promise<void>;
  unequip: (category: LumiCategory) => Promise<void>;
  uploadPhoto: (uri: string) => Promise<void>;
  removePhoto: () => Promise<void>;
  creditOffline: (sourceId: string, amount: number) => Promise<void>;
  settleOfflineCredits: () => Promise<void>;
}

const MobileLumiContext = createContext<MobileLumiValue | null>(null);

export function MobileLumiProvider({ children }: PropsWithChildren) {
  const auth = useMobileAuth();
  const [state, setState] = useState<LumiAccountState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>();
  const [pendingCredit, setPendingCredit] = useState(0);

  const refresh = useCallback(async () => {
    if (!auth.session) {
      setState(EMPTY);
      setProfilePhotoUrl(undefined);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const next = await fetchMobileLumiState(auth.session);
      setState(next);
      setProfilePhotoUrl(await getMobileProfilePhotoUrl(auth.session, next.profilePhotoPath));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a Loja Lumi.");
    } finally {
      setLoading(false);
    }
  }, [auth.session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let active = true;
    void loadPendingLumiCredits(auth.session?.user.id).then((ledger) => {
      if (active) setPendingCredit(pendingLumiTotal(ledger));
    });
    return () => { active = false; };
  }, [auth.session?.user.id]);

  const requireSession = useCallback(() => {
    if (!auth.session) throw new Error("Entre na sua conta para usar a Loja Lumi.");
    return auth.session;
  }, [auth.session]);

  const value = useMemo<MobileLumiValue>(() => ({
    state: { ...state, balance: state.balance + pendingCredit },
    loading,
    error,
    profilePhotoUrl,
    refresh,
    purchase: async (itemId) => {
      await purchaseMobileLumiItem(requireSession(), itemId);
      await refresh();
    },
    equip: async (itemId) => {
      await equipMobileLumiItem(requireSession(), itemId);
      await refresh();
    },
    unequip: async (category) => {
      await unequipMobileLumiCategory(requireSession(), category);
      await refresh();
    },
    uploadPhoto: async (uri) => {
      const session = requireSession();
      await uploadMobileProfilePhoto(session, uri);
      await refresh();
    },
    removePhoto: async () => {
      const session = requireSession();
      await removeMobileProfilePhoto(session, state.profilePhotoPath);
      await refresh();
    },
    creditOffline: async (sourceId, amount) => {
      const ledger = await addPendingLumiCredit(auth.session?.user.id, sourceId, amount);
      setPendingCredit(pendingLumiTotal(ledger));
    },
    settleOfflineCredits: async () => {
      await clearPendingLumiCredits(auth.session?.user.id);
      setPendingCredit(0);
    }
  }), [auth.session?.user.id, error, loading, pendingCredit, profilePhotoUrl, refresh, requireSession, state]);

  return <MobileLumiContext.Provider value={value}>{children}</MobileLumiContext.Provider>;
}

export function useMobileLumi() {
  const value = useContext(MobileLumiContext);
  if (!value) throw new Error("useMobileLumi deve estar dentro de MobileLumiProvider");
  return value;
}
