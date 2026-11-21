import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { BUNDLED_DEVOTIONALS } from "../content/devotionals";
import { devotionalSources, fetchDevotionalFromSources } from "../domain/devotionalSources";
import {
  emptyDevotionalState, mergeDevotionals, parseDevotional, parseDevotionalState,
  type Devotional, type DevotionalState
} from "../domain/devotional";

const CACHE_KEY = "@bibliolingo/devotionals/cache/v1";
const STATE_KEY = "@bibliolingo/devotionals/state/v1";
const MAX_CACHED = 120;
/** No site web, a própria origem entra como última reserva. */
const sources = () => devotionalSources(process.env.EXPO_PUBLIC_DEVOTIONAL_BASE_URL, Platform.OS === "web" ? "/devotionals" : undefined);

async function loadCache(): Promise<Devotional[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.map(parseDevotional).filter((item): item is Devotional => Boolean(item)) : [];
  } catch { return []; }
}

async function saveCache(list: Devotional[]) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list.slice(0, MAX_CACHED))).catch(() => undefined);
}

/** Tenta baixar o devocional de uma data. Falhas de rede/formato viram undefined (nunca quebram a tela). */
export const fetchDevotional = (date: string, timeoutMs = 6000) => fetchDevotionalFromSources(date, sources(), fetch as never, timeoutMs);

/** Devocionais locais (embutidos + já baixados), sem rede. */
export async function loadKnownDevotionals(): Promise<Devotional[]> {
  return mergeDevotionals(BUNDLED_DEVOTIONALS, await loadCache());
}

/** Garante o devocional de hoje: usa o que já existe e, se faltar, baixa e guarda. */
export async function refreshDevotionals(today: string): Promise<Devotional[]> {
  const known = await loadKnownDevotionals();
  if (known.some((item) => item.date === today)) return known;
  const fresh = await fetchDevotional(today);
  if (!fresh) return known;
  const cached = mergeDevotionals(await loadCache(), [fresh]);
  await saveCache(cached);
  return mergeDevotionals(known, [fresh]);
}

export async function loadDevotionalState(): Promise<DevotionalState> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    return raw ? parseDevotionalState(JSON.parse(raw)) : emptyDevotionalState();
  } catch { return emptyDevotionalState(); }
}

export async function saveDevotionalState(state: DevotionalState) {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state)).catch(() => undefined);
}
