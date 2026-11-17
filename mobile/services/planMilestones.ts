import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@bibliolingo/plan-milestones/v1";

type Celebrated = Record<string, number[]>;

/** Marcos já comemorados por plano (id da inscrição) neste aparelho. */
export async function loadCelebratedPlanMilestones(): Promise<Celebrated> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).map(([id, value]) => [id, Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : []]));
  } catch {
    return {};
  }
}

export async function markPlanMilestoneCelebrated(enrollmentId: string, percent: number): Promise<void> {
  try {
    const current = await loadCelebratedPlanMilestones();
    const marks = new Set([...(current[enrollmentId] ?? []), ...[25, 50, 75, 100].filter((value) => value <= percent)]);
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, [enrollmentId]: [...marks] }));
  } catch {
    // No pior caso, o cartão é oferecido de novo.
  }
}
