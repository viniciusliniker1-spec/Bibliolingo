import AsyncStorage from "@react-native-async-storage/async-storage";
import { bestStars } from "../domain/kids";

const KEY = "@bibliolingo/kids/v1";
export type KidsStars = Record<string, number>;

export async function loadKidsStars(): Promise<KidsStars> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? (JSON.parse(raw) as KidsStars) : {}; } catch { return {}; }
}

export async function saveKidsStars(storyId: string, stars: number) {
  const current = await loadKidsStars();
  const next = { ...current, [storyId]: bestStars(current[storyId], stars) };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
