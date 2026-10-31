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
  acknowledgePendingLumiPurchase,
  addPendingLumiCredit,
  clearPendingLumiCredits,
  loadPendingLumiCredits,
  pendingLumiSpend,
  pendingLumiTotal,
  queuePendingLumiPurchase,
  setPendingLumiEquipment,
  type LumiPendingLedger
} from "../services/lumiLocalLedger";
import { useMobileAuth } from "./MobileAuthProvider";

const EMPTY: LumiAccountState = {
  balance: 0, items: [], inventory: [], equipment: [], transactions: []
};

interface MobileLumiValue {
  state: LumiAccountState;
  confirmedBalance: number;
  pendingBalance: number;
  loading: boolean;
  error?: string;
  profilePhotoUrl?: string;
  refresh: () => Promise<boolean>;
  purchase: (itemId: string) => Promise<void>;
  equip: (itemId: string) => Promise<void>;
  unequip: (category: LumiCategory) => Promise<void>;
  uploadPhoto: (uri: string) => Promise<void>;
  removePhoto: () => Promise<void>;
  creditOffline: (sourceId: string, amount: number) => Promise<void>;
  settleOfflineCredits: (sources?: readonly string[]) => Promise<void>;
}

const MobileLumiContext = createContext<MobileLumiValue | null>(null);

export function MobileLumiProvider({ children }: PropsWithChildren) {
  const auth = useMobileAuth();
  const [state, setState] = useState<LumiAccountState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>();
  const [pendingLedger, setPendingLedger] = useState<LumiPendingLedger>({ credits: {}, purchases: {}, equipment: {} });
  const owner = useRef(auth.session?.user.id);
  owner.current = auth.session?.user.id;
  const version = useRef(0);
  const purchasing = useRef(false);

  const refresh = useCallback(async () => {
    const requestVersion = ++version.current;
    const userId = auth.session?.user.id;
    if (!auth.session) {
      setState(EMPTY);
      setProfilePhotoUrl(undefined);
      return true;
    }
    setLoading(true);
    setError(undefined);
    try {
      const next = await fetchMobileLumiState(auth.session);
      if (owner.current !== userId || requestVersion !== version.current) return false;
      setState(next);
      // A photo URL failure must not invalidate a confirmed wallet/inventory.
      const photo = await getMobileProfilePhotoUrl(auth.session, next.profilePhotoPath).catch(() => undefined);
      if (owner.current === userId && requestVersion === version.current) setProfilePhotoUrl(photo);
      return true;
    } catch (cause) {
      if (owner.current === userId && requestVersion === version.current) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a Loja Lumi.");
      return false;
    } finally {
      if (owner.current === userId && requestVersion === version.current) setLoading(false);
    }
  }, [auth.session]);

  useEffect(() => {
    setState(EMPTY);
    setProfilePhotoUrl(undefined);
    setPendingLedger({ credits: {}, purchases: {}, equipment: {} });
  }, [auth.session?.user.id]);
  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    let active = true;
    void loadPendingLumiCredits(auth.session?.user.id).then((ledger) => {
      if (active) setPendingLedger(ledger);
    });
    return () => { active = false; };
  }, [auth.session?.user.id]);

  const requireSession = useCallback(() => {
    if (!auth.session) throw new Error("Entre na sua conta para usar a Loja Lumi.");
    return auth.session;
  }, [auth.session]);

  const creditOffline = useCallback(async (sourceId: string, amount: number) => {
    const userId = auth.session?.user.id;
    const ledger = await addPendingLumiCredit(userId, sourceId, amount);
    if (owner.current === userId) setPendingLedger(ledger);
  }, [auth.session?.user.id]);

  const settleOfflineCredits = useCallback(async (sources?: readonly string[]) => {
    const userId = auth.session?.user.id;
    const ledger = await clearPendingLumiCredits(userId, sources);
    if (owner.current === userId) setPendingLedger(ledger);
  }, [auth.session?.user.id]);

  const purchase = useCallback(async (itemId: string) => {
    if (purchasing.current) throw new Error("Aguarde a confirmação da compra em andamento.");
    const session = requireSession();
    purchasing.current = true;
    ++version.current;
    try {
      const receipt = await purchaseMobileLumiItem(session, itemId);
      if (owner.current !== session.user.id) throw new Error("A conta mudou durante a compra. Entre novamente para conferir seu inventário.");
      ++version.current;
      // Use confirmed server ownership immediately; no full catalog/photo reload
      // is needed to switch the button from Comprar to Equipar.
      setState((current) => ({
        ...current,
        balance: receipt.balance,
        inventory: [...current.inventory.filter((entry) => entry.itemId !== itemId), receipt.inventoryEntry]
      }));
      setError(undefined);
    } finally {
      purchasing.current = false;
      if (owner.current === session.user.id) setLoading(false);
    }
  }, [requireSession]);

  const value = useMemo<MobileLumiValue>(() => ({
    state: { ...state, balance: state.balance + pendingCredit },
    confirmedBalance: state.balance,
    pendingBalance: pendingCredit,
    loading,
    error,
    profilePhotoUrl,
    refresh,
    purchase,
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
    creditOffline,
    settleOfflineCredits
  }), [auth.session?.user.id, error, loading, pendingCredit, profilePhotoUrl, refresh, requireSession, state, purchase, creditOffline, settleOfflineCredits]);

  return <MobileLumiContext.Provider value={value}>{children}</MobileLumiContext.Provider>;
}

export function useMobileLumi() {
  const value = useContext(MobileLumiContext);
  if (!value) throw new Error("useMobileLumi deve estar dentro de MobileLumiProvider");
  return value;
}
