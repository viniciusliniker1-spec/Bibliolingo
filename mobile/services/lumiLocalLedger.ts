import AsyncStorage from "@react-native-async-storage/async-storage";

interface LumiPendingLedger {
  credits: Record<string, number>;
}

const PREFIX = "bibliolingo.lumi.pending.v1";
const GUEST = "guest";

function key(ownerId?: string) {
  return `${PREFIX}:${ownerId ?? GUEST}`;
}

async function read(ownerId?: string): Promise<LumiPendingLedger> {
  const raw = await AsyncStorage.getItem(key(ownerId));
  if (!raw) return { credits: {} };
  try {
    const parsed = JSON.parse(raw) as LumiPendingLedger;
    return {
      credits: Object.fromEntries(
        Object.entries(parsed.credits ?? {})
          .filter(([source, amount]) => source && Number.isFinite(amount) && amount > 0)
          .map(([source, amount]) => [source, Math.round(amount)])
      )
    };
  } catch {
    return { credits: {} };
  }
}

async function write(ownerId: string | undefined, ledger: LumiPendingLedger) {
  await AsyncStorage.setItem(key(ownerId), JSON.stringify(ledger));
}

export function pendingLumiTotal(ledger: LumiPendingLedger) {
  return Object.values(ledger.credits).reduce((sum, amount) => sum + amount, 0);
}

export async function loadPendingLumiCredits(ownerId?: string) {
  if (!ownerId) return read();
  const [account, guest] = await Promise.all([read(ownerId), read()]);
  if (Object.keys(guest.credits).length === 0) return account;
  const merged = { credits: { ...guest.credits, ...account.credits } };
  await Promise.all([write(ownerId, merged), AsyncStorage.removeItem(key())]);
  return merged;
}

export async function addPendingLumiCredit(ownerId: string | undefined, sourceId: string, amount: number) {
  const ledger = await read(ownerId);
  if (!ledger.credits[sourceId] && amount > 0) {
    ledger.credits[sourceId] = Math.round(amount);
    await write(ownerId, ledger);
  }
  return ledger;
}

export async function clearPendingLumiCredits(ownerId?: string) {
  await AsyncStorage.removeItem(key(ownerId));
  return { credits: {} } satisfies LumiPendingLedger;
}
