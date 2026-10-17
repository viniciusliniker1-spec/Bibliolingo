import { useState } from "react";
import { Link } from "react-router-dom";
import {
  defaultStudyNotificationPreferences,
  type StudyNotificationPreferences
} from "../../services/notificationPolicy";
import {
  loadWebNotificationPreferences,
  saveWebNotificationPreferences
} from "../../services/notificationPreferences";
import { requestNotificationPermission } from "../../services/dailyReminder";

const categories: Array<{ key: "daily" | "streak" | "inactivity" | "review"; title: string; note: string }> = [
  { key: "daily", title: "Lembrete diário", note: "Somente quando a meta do dia ainda não foi cumprida." },
  { key: "streak", title: "Sequência", note: "Somente quando você ainda não estudou naquele dia." },
  { key: "inactivity", title: "Retomar os estudos", note: "Após pelo menos três dias sem atividade, sem linguagem de culpa." },
  { key: "review", title: "Revisões pendentes", note: "Quando a fila inteligente tiver conteúdos vencidos ou erros recentes." }
];

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<StudyNotificationPreferences>(() => loadWebNotificationPreferences());
  const [notice, setNotice] = useState("");

  const update = <K extends keyof StudyNotificationPreferences>(key: K, value: StudyNotificationPreferences[K]) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  const save = async () => {
    let next = preferences;
    if (preferences.enabled) {
      const permission = await requestNotificationPermission();
      if (permission === "denied") {
        next = { ...preferences, enabled: false };
        setPreferences(next);
        setNotice("O navegador bloqueou as notificações. Você pode liberar a permissão nas configurações do site.");
      } else if (permission === "unsupported") {
        setNotice("Este navegador não entrega notificações. As preferências foram preservadas.");
      } else {
        setNotice("Preferências salvas. Os avisos respeitarão sua atividade e o horário de silêncio.");
      }
    } else {
      setNotice("Notificações desativadas.");
    }
    saveWebNotificationPreferences(next);
  };

  return (
    <main className="page notification-settings-page">
      <header className="page-header"><p className="eyebrow">LEMBRETES SEM PRESSÃO</p><h1>Notificações</h1><p>Você controla quando e por que o Bibliolingo pode lembrar seus estudos.</p></header>
      <section className="notification-settings-card">
        <label className="switch-row"><span><strong>Permitir lembretes</strong><small>Desative para interromper todas as categorias.</small></span><input type="checkbox" checked={preferences.enabled} onChange={(event) => update("enabled", event.target.checked)} /><span className="switch-control" aria-hidden="true" /></label>
        {categories.map((item) => <label className="switch-row" key={item.key}><span><strong>{item.title}</strong><small>{item.note}</small></span><input type="checkbox" disabled={!preferences.enabled} checked={preferences[item.key]} onChange={(event) => update(item.key, event.target.checked)} /><span className="switch-control" aria-hidden="true" /></label>)}
        <div className="notification-time-grid">
          <label>Horário principal<input type="time" value={preferences.time} onChange={(event) => update("time", event.target.value)} /></label>
          <label>Silêncio a partir de<input type="time" value={preferences.quietStart} onChange={(event) => update("quietStart", event.target.value)} /></label>
          <label>Silêncio até<input type="time" value={preferences.quietEnd} onChange={(event) => update("quietEnd", event.target.value)} /></label>
        </div>
        <button className="primary-button" type="button" onClick={() => void save()}>Salvar preferências</button>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
      </section>
      <p className="reminder-note">Na Web, o navegador pode suspender notificações quando o PWA está fechado. Nenhum push remoto foi ativado.</p>
      <Link className="text-button" to="/profile">Voltar ao perfil</Link>
    </main>
  );
}
