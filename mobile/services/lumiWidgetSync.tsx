import { Platform } from "react-native";
import { compactXpByDay, widgetView, type WidgetSnapshot } from "../domain/lumiWidget";
import type { ReminderContext } from "../domain/notificationSchedule";
import type { MobileProgress } from "../types/progress";
import { saveWidgetSnapshot } from "./widgetSnapshot";

export function widgetSnapshotFrom(progress: MobileProgress, context: ReminderContext, now = new Date()): WidgetSnapshot {
  return {
    name: context.name,
    streak: progress.streak,
    lastStudyDate: progress.lastStudyDate,
    xpByDay: compactXpByDay(progress.activity, now),
    dailyGoal: progress.profile.dailyGoal,
    nextLessonTitle: context.nextLessonTitle,
    updatedAt: now.toISOString()
  };
}

/** Salva o estado para o widget e pede ao Android para redesenhá-lo. */
export async function syncLumiWidget(progress: MobileProgress, context: ReminderContext) {
  if (Platform.OS !== "android") return;
  try {
    const snapshot = widgetSnapshotFrom(progress, context);
    await saveWidgetSnapshot(snapshot);
    const [{ requestWidgetUpdate }, { LumiWidget, LUMI_WIDGET_NAME }] = await Promise.all([
      import("react-native-android-widget"),
      import("../widgets/LumiWidget")
    ]);
    await requestWidgetUpdate({
      widgetName: LUMI_WIDGET_NAME,
      renderWidget: (info) => <LumiWidget view={widgetView(snapshot)} width={info.width} height={info.height} />,
      widgetNotFound: () => undefined
    });
  } catch {
    // Widget é um extra: nunca pode atrapalhar o app.
  }
}
