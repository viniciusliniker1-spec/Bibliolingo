import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LumiCategory } from "../../src/domain/lumi";

export interface LumiPendingPurchase {
  requestId: string;
  itemId: string;
  price: number;
  createdAt: string;
}

export interface LumiPendingLedger {
  credits: Record<string, number>;
  purchases: Record<string, LumiPendingPurchase>;
  equipment: Partial<Record<LumiCategory, string>>;
}

const PREFIX = "bibliolingo.lumi.pending.v2";
const LEGACY_PREFIX = "bibliolingo.lumi.pending.v1";
const GUEST = "guest";
let writes: Promise<void> = Promise.resolve();

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = writes.then(operation);
  writes = result.then(() => undefined, () => undefined);
  return result;
}

function key(ownerId?: string) {
  return `${PREFIX}:${ownerId ?? GUEST}`;
}

function legacyKey(ownerId?: string) {
  return `${LEGACY_PREFIX}:${ownerId ?? GUEST}`;
}

function empty(): LumiPendingLedger {
  return { credits: {}, purchases: {}, equipment: {} };
}

function normalize(parsed: Partial<LumiPendingLedger> | undefined): LumiPendingLedger {
  const credits = Object.fromEntries(
    Object.entries(parsed?.credits ?? {})
      .filter(([source, amount]) => source && Number.isFinite(amount) && Number(amount) > 0)
      .map(([source, amount]) => [source, Math.round(Number(amount))])
  );
  const purchases = Object.fromEntries(
    Object.entries(parsed?.purchases ?? {}).filter(([, purchase]) =>
      Boolean(purchase?.requestId && purchase.itemId && Number.isInteger(purchase.price) && purchase.price >= 0)
    )
  );
  const equipment = Object.fromEntries(
    Object.entries(parsed?.equipment ?? {}).filter(([, itemId]) => typeof itemId === "string" && itemId.length > 0)
  ) as LumiPendingLedger["equipment"];
  return { credits, purchases, equipment };
}

async function read(ownerId?: string): Promise<LumiPendingLedger> {
  const raw = await AsyncStorage.getItem(key(ownerId));
  if (raw) {
    try { return normalize(JSON.parse(raw) as LumiPendingLedger); }
    catch { return empty(); }
  }
  const legacy = await AsyncStorage.getItem(legacyKey(ownerId));
  if (!legacy) return empty();
  try {
    const migrated = normalize(JSON.parse(legacy) as Partial<LumiPendingLedger>);
    await write(ownerId, migrated);
    await AsyncStorage.removeItem(legacyKey(ownerId));
    return migrated;
  } catch {
    return empty();
  }
}

async function write(ownerId: string | undefined, ledger: LumiPendingLedger) {
  await AsyncStorage.setItem(key(ownerId), JSON.stringify(ledger));
}

export function pendingLumiTotal(ledger: LumiPendingLedger) {
  return Object.values(ledger.credits).reduce((sum, amount) => sum + amount, 0);
}

export function pendingLumiSpend(ledger: LumiPendingLedger) {
  return Object.values(ledger.purchases).reduce((sum, purchase) => sum + purchase.price, 0);
}

export function loadPendingLumiCredits(ownerId?: string) {
  return serialize(async () => {
    if (!ownerId) return read();
    const [account, guest] = await Promise.all([read(ownerId), read()]);
    if (!Object.keys(guest.credits).length && !Object.keys(guest.purchases).length && !Object.keys(guest.equipment).length) return account;
    const merged = {
      credits: { ...guest.credits, ...account.credits },
      purchases: { ...guest.purchases, ...account.purchases },
      equipment: { ...guest.equipment, ...account.equipment }
    };
    await Promise.all([write(ownerId, merged), AsyncStorage.removeItem(key())]);
    return merged;
  });
}

export function addPendingLumiCredit(ownerId: string | undefined, sourceId: string, amount: number) {
  return serialize(async () => {
    const ledger = await read(ownerId);
    if (!ledger.credits[sourceId] && amount > 0) {
      ledger.credits[sourceId] = Math.round(amount);
      await write(ownerId, ledger);
    }
    return ledger;
  });
}

export function clearPendingLumiCredits(ownerId?: string, acknowledgedSources?: readonly string[]) {
  return serialize(async () => {
    const ledger = await read(ownerId);
    if (!acknowledgedSources) ledger.credits = {};
    else for (const source of acknowledgedSources) delete ledger.credits[source];
    await write(ownerId, ledger);
    return ledger;
  });
}

export function queuePendingLumiPurchase(ownerId: string, itemId: string, price: number, availableBalance: number) {
  return serialize(async () => {
    const ledger = await read(ownerId);
    const existing = Object.values(ledger.purchases).find((purchase) => purchase.itemId === itemId);
    if (existing) return ledger;
    const normalizedPrice = Math.max(0, Math.round(price));
    if (availableBalance - pendingLumiSpend(ledger) < normalizedPrice) throw new Error("Saldo insuficiente de moedas Lumi.");
    const requestId = globalThis.crypto?.randomUUID?.() ?? `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
    ledger.purchases[requestId] = { requestId, itemId, price: normalizedPrice, createdAt: new Date().toISOString() };
    await write(ownerId, ledger);
    return ledger;
  });
}

export function acknowledgePendingLumiPurchase(ownerId: string, requestId: string) {
  return serialize(async () => {
    const ledger = await read(ownerId);
    delete ledger.purchases[requestId];
    await write(ownerId, ledger);
    return ledger;
  });
}

export function setPendingLumiEquipment(ownerId: string, category: LumiCategory, itemId?: string) {
  return serialize(async () => {
    const ledger = await read(ownerId);
    if (itemId) ledger.equipment[category] = itemId;
    else delete ledger.equipment[category];
    await write(ownerId, ledger);
    return ledger;
  });
}
