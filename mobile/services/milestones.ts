import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@bibliolingo/streak-milestones/v1";

/** Marcos de ofensiva cujo cartão já foi mostrado neste aparelho. */
export async function loadCelebratedMilestones(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === "number") : [];
  } catch {
    return [];
  }
}

export async function markMilestoneCelebrated(days: number): Promise<void> {
  try {
    const current = await loadCelebratedMilestones();
    if (!current.includes(days)) await AsyncStorage.setItem(KEY, JSON.stringify([...current, days]));
  } catch {
    // No pior caso, o cartão é oferecido de novo.
  }
}
