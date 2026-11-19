import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { BUNDLED_DEVOTIONALS } from "../content/devotionals";
import {
  emptyDevotionalState, mergeDevotionals, parseDevotional, parseDevotionalState,
  type Devotional, type DevotionalState
} from "../domain/devotional";

const CACHE_KEY = "@bibliolingo/devotionals/cache/v1";
const STATE_KEY = "@bibliolingo/devotionals/state/v1";
const MAX_CACHED = 120;
const DEFAULT_BASE = "https://bibliolingo-mobile.vercel.app";

/** No site web os arquivos saem da mesma origem; no app, do endereço publicado. */
const baseUrl = () => (Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_DEVOTIONAL_BASE_URL ?? DEFAULT_BASE)).replace(/\/$/, "");

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
export async function fetchDevotional(date: string, timeoutMs = 6000): Promise<Devotional | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl()}/devotionals/${date}.json`, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!response.ok) return undefined;
    const parsed = parseDevotional(await response.json());
    return parsed && parsed.date === date ? parsed : undefined;
  } catch { return undefined; } finally { clearTimeout(timer); }
}

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
