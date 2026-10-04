import { toLocalDateKey } from "../domain/streak";

export interface DailyReminderPreferences {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  lastReminderDate?: string;
}

export function isValidReminderTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function reminderMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isReminderDue(settings: DailyReminderPreferences, now = new Date()): boolean {
  if (!settings.dailyReminderEnabled || !isValidReminderTime(settings.dailyReminderTime)) {
    return false;
  }
  const today = toLocalDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return settings.lastReminderDate !== today && nowMinutes >= reminderMinutes(settings.dailyReminderTime);
}

export function millisecondsUntilReminder(time: string, now = new Date()): number {
  if (!isValidReminderTime(time)) return 60 * 60 * 1000;
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function formatLocalIcsDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    "00"
  );
}

export function createDailyReminderCalendar(
  time: string,
  now = new Date(),
  appUrl = "https://viniciusliniker1-spec.github.io/Bibliolingo/#/"
): string {
  const safeTime = isValidReminderTime(time) ? time : "19:00";
  const [hours, minutes] = safeTime.split(":").map(Number);
  const start = new Date(now);
  start.setHours(hours, minutes, 0, 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bibliolingo//Jornada diária//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:bibliolingo-daily-journey@bibliolingo.app",
    "DTSTART:" + formatLocalIcsDate(start),
    "RRULE:FREQ=DAILY",
    "SUMMARY:Continuar jornada no Bibliolingo",
    "DESCRIPTION:Reserve alguns minutos para aprender\, responder e manter sua sequência.",
    "URL:" + appUrl,
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Sua jornada bíblica de hoje está pronta.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n");
}

export function downloadDailyReminderCalendar(time: string): void {
  const calendar = createDailyReminderCalendar(time);
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bibliolingo-lembrete-diario.ics";
  link.click();
  URL.revokeObjectURL(url);
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export async function showJourneyNotification(activityTitle: string): Promise<boolean> {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  const options: NotificationOptions = {
    body: "Seu próximo passo é “" + activityTitle + "”. Alguns minutos hoje mantêm sua sequência viva.",
    icon: "./icon.svg",
    badge: "./icon.svg",
    tag: "bibliolingo-daily-journey"
  };
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Sua jornada de hoje está pronta", options);
    return true;
  }
  new Notification("Sua jornada de hoje está pronta", options);
  return true;
}
