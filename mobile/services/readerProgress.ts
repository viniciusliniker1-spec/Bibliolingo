import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReaderLanguage } from "../content/reader/types";

const KEY = "@bibliolingo/reader/v1";
export interface ReaderResult { doneAt: string; solo: "ok" | "review"; mistakes: number }
export type ReaderProgress = Record<string, ReaderResult>;

async function loadAll(): Promise<Record<ReaderLanguage, ReaderProgress>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { grc: parsed.grc ?? {}, hbo: parsed.hbo ?? {} };
  } catch {
    return { grc: {}, hbo: {} };
  }
}

export async function loadReaderProgress(language: ReaderLanguage) {
  return (await loadAll())[language];
}

export async function saveReaderResult(language: ReaderLanguage, id: string, result: ReaderResult) {
  const all = await loadAll();
  all[language] = { ...all[language], [id]: result };
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
  return all[language];
}
