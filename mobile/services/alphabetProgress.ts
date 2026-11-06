import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AlphabetId } from "../content/alphabet";
import type { AlphabetProgress } from "../domain/alphabetPractice";

const KEY = "@bibliolingo/alphabet/v1";
type Stored = Partial<Record<AlphabetId, AlphabetProgress>> & { traced?: Partial<Record<AlphabetId, string[]>> };

async function read(): Promise<Stored> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Stored) : {}; } catch { return {}; }
}

export async function loadAlphabetProgress(id: AlphabetId) {
  const data = await read();
  return { mastery: data[id] ?? {}, traced: data.traced?.[id] ?? [] };
}

export async function saveAlphabetMastery(id: AlphabetId, mastery: AlphabetProgress) {
  const data = await read();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...data, [id]: mastery }));
}

export async function markLetterTraced(id: AlphabetId, letterId: string) {
  const data = await read();
  const traced = new Set(data.traced?.[id] ?? []);
  traced.add(letterId);
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...data, traced: { ...data.traced, [id]: [...traced] } }));
  return [...traced];
}
