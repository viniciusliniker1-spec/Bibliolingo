import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetSnapshot } from "../domain/lumiWidget";

const KEY = "@bibliolingo/lumi-widget/v1";

export const EMPTY_WIDGET_SNAPSHOT: WidgetSnapshot = { streak: 0, xpByDay: {}, dailyGoal: 100, updatedAt: "" };

export async function loadWidgetSnapshot(): Promise<WidgetSnapshot> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY_WIDGET_SNAPSHOT, ...(JSON.parse(raw) as Partial<WidgetSnapshot>) } : EMPTY_WIDGET_SNAPSHOT;
  } catch {
    return EMPTY_WIDGET_SNAPSHOT;
  }
}

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot) {
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}
