import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getActivity, orderedActivityIds } from "../content/catalog";
import { nextJourneyActivityId } from "../domain/unlocks";
import { toLocalDateKey } from "../domain/streak";
import {
  isReminderDue,
  millisecondsUntilReminder,
  showJourneyNotification
} from "../services/dailyReminder";
import { useApp } from "../state/AppContext";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const navigation = [
  { to: "/", icon: "⌁", label: "Jornada" },
  { to: "/bible", icon: "▤", label: "Bíblia" },
  { to: "/study", icon: "✦", label: "Estudar" },
  { to: "/achievements", icon: "★", label: "Conquistas" },
  { to: "/profile", icon: "◉", label: "Perfil" }
];

let reminderDateAttempted: string | undefined;

export function AppShell() {
  const { state, dispatch, ready } = useApp();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [reminderNotice, setReminderNotice] = useState<string>();

  const nextId = nextJourneyActivityId(
    orderedActivityIds,
    state.completedLessonIds,
    state.completedCheckpointIds
  );
  const nextTitle = getActivity(nextId)?.title ?? "continuar sua jornada";

  useEffect(() => {
    const handle = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handle);
    return () => window.removeEventListener("beforeinstallprompt", handle);
  }, []);

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  useEffect(() => {
    if (!ready || !state.settings.dailyReminderEnabled) return;
    let timer: number | undefined;
    let active = true;

    const checkAndSchedule = () => {
      if (!active) return;
      const now = new Date();
      const today = toLocalDateKey(now);
      if (isReminderDue(state.settings, now) && reminderDateAttempted !== today) {
        reminderDateAttempted = today;
        setReminderNotice("Hora de " + nextTitle + ". Sua sequência espera por você.");
        void showJourneyNotification(nextTitle).finally(() => {
          if (active) dispatch({ type: "MARK_REMINDER_SENT", date: today });
        });
      }
      timer = window.setTimeout(
        checkAndSchedule,
        millisecondsUntilReminder(state.settings.dailyReminderTime, now) + 250
      );
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") checkAndSchedule();
    };
    checkAndSchedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    dispatch,
    nextTitle,
    ready,
    state.settings.dailyReminderEnabled,
    state.settings.dailyReminderTime,
    state.settings.lastReminderDate
  ]);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(undefined);
  };

  return (
    <div className="app-shell">
      {!online && <div className="offline-banner" role="status"><span aria-hidden="true">◌</span> Você está offline · progresso continua salvo</div>}
      {reminderNotice && (
        <aside className="daily-reminder-banner" role="status" aria-live="polite">
          <span className="daily-reminder-icon" aria-hidden="true">🔔</span>
          <div><strong>Jornada do dia</strong><p>{reminderNotice}</p></div>
          <NavLink className="small-button" to={"/lesson/" + nextId} onClick={() => setReminderNotice(undefined)}>Continuar</NavLink>
          <button type="button" className="reminder-dismiss" aria-label="Fechar lembrete" onClick={() => setReminderNotice(undefined)}>×</button>
        </aside>
      )}
      <header className="app-topbar">
        <NavLink to="/" className="brand-lockup small" aria-label="Bibliolingo, página inicial">
          <div className="brand-mark" aria-hidden="true">B</div><span>Bibliolingo</span>
        </NavLink>
        {installPrompt && <button className="install-button" onClick={install}>Instalar</button>}
      </header>
      <Outlet />
      <nav className="bottom-nav" aria-label="Navegação principal">
        {navigation.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}>
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
