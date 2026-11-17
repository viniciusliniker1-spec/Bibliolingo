import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@bibliolingo/plan-promo-dismissed/v1";
const SNOOZE_MS = 7 * 86_400_000;

/** A pessoa dispensou o convite para começar um plano há menos de 7 dias? */
export async function isPlanPromoSnoozed(now = Date.now()): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? now - Number(raw) < SNOOZE_MS : false;
  } catch {
    return false;
  }
}

export async function snoozePlanPromo(now = Date.now()): Promise<void> {
  try { await AsyncStorage.setItem(KEY, String(now)); } catch { /* sem armazenamento, o convite volta */ }
}
