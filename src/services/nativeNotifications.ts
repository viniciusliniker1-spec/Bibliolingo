import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const JOURNEY_REMINDER_ID = 701;

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function configureNativeDailyReminder(enabled: boolean, time: string) {
  if (!isNativeApp()) return false;
  await LocalNotifications.cancel({ notifications: [{ id: JOURNEY_REMINDER_ID }] });
  if (!enabled) return true;

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted") {
    permission = await LocalNotifications.requestPermissions();
  }
  if (permission.display !== "granted") return false;

  const [hour, minute] = time.split(":").map(Number);
  await LocalNotifications.schedule({
    notifications: [
      {
        id: JOURNEY_REMINDER_ID,
        title: "Sua jornada bíblica espera",
        body: "Reserve alguns minutos para continuar aprendendo hoje.",
        schedule: {
          on: { hour, minute },
          repeats: true,
          allowWhileIdle: true
        }
      }
    ]
  });
  return true;
}
