import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getLevelProgress } from "../../domain/gamification";
import { toLocalDateKey } from "../../domain/streak";
import { parseBackup, serializeBackup } from "../../storage/backup";
import { useApp } from "../../state/AppContext";
import { ProgressBar } from "../../components/ProgressBar";
import type { KnowledgeLevel } from "../../types/progress";
import {
  downloadDailyReminderCalendar,
  requestNotificationPermission
} from "../../services/dailyReminder";

const knowledgeLevels: { id: KnowledgeLevel; title: string; note: string; icon: string }[] = [
  { id: "beginner", title: "Iniciante", note: "Mais orientação e fundamentos", icon: "○" },
  { id: "intermediate", title: "Intermediário", note: "Jornada bíblica equilibrada", icon: "◉" },
  { id: "advanced", title: "Avançado", note: "Libera a jornada Aprofundar", icon: "⌁" }
];

function downloadJson(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatTime(seconds: number) {
  if (seconds < 3600) return Math.round(seconds / 60) + " min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours + "h " + minutes + "min";
}

export function Profile() {
  const { state, dispatch, importProgress } = useApp();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);
  const level = getLevelProgress(state.xp);
  const correct = state.attempts.filter((attempt) => attempt.correct).length;
  const accuracy = state.attempts.length ? Math.round((correct / state.attempts.length) * 100) : 0;
  const seconds = Object.values(state.activity).reduce((total, day) => total + day.seconds, 0);
  const days = Array.from({ length: 28 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - offset));
    const key = toLocalDateKey(date);
    return state.activity[key] ?? { date: key, xp: 0, seconds: 0, lessons: 0 };
  });

  const exportProgress = () => {
    downloadJson(serializeBackup(state), "bibliolingo-backup-" + toLocalDateKey(new Date()) + ".json");
    setNotice("Backup exportado com sucesso.");
  };

  const configureReminder = async (enabled: boolean) => {
    if (!enabled) {
      dispatch({ type: "SET_DAILY_REMINDER", enabled: false, time: state.settings.dailyReminderTime });
      setNotice("Lembrete diário desativado.");
      return;
    }
    const permission = await requestNotificationPermission();
    dispatch({ type: "SET_DAILY_REMINDER", enabled: true, time: state.settings.dailyReminderTime });
    setNotice(
      permission === "granted"
        ? "Lembrete ativado. Para máxima confiabilidade, adicione-o também ao calendário."
        : permission === "denied"
          ? "Lembrete interno ativado. O navegador bloqueou notificações; o calendário continua disponível."
          : "Lembrete interno ativado. Este navegador não oferece notificações; use o calendário."
    );
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const next = parseBackup(await file.text());
      const confirmed = window.confirm(
        "Importar este backup substituirá o progresso atual. Uma cópia de segurança será baixada antes da troca. Deseja continuar?"
      );
      if (!confirmed) return;
      downloadJson(serializeBackup(state), "bibliolingo-antes-da-importacao.json");
      await importProgress(next);
      setNotice("Backup validado e importado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível importar o backup.");
    }
  };

  return (
    <main className="page profile-page">
      <header className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">V</div>
        <div><p className="eyebrow">Sua caminhada</p><h1>Perfil</h1><p>Nível {level.level} · {state.xp} XP</p></div>
      </header>
      <section className="level-card">
        <div className="card-heading"><strong>Nível {level.level}</strong><span>{level.xpIntoLevel} / {level.xpNeeded} XP</span></div>
        <ProgressBar value={level.xpIntoLevel} max={level.xpNeeded} label="Progresso para o próximo nível" tone="gold" />
      </section>
      <section className="knowledge-level-card" id="knowledge-level">
        <div className="section-title">
          <div><p className="eyebrow">Personalize o ensino</p><h2>Nível de conhecimento bíblico</h2></div>
        </div>
        <p>Isso muda o percurso recomendado; seu XP e progresso anterior continuam preservados.</p>
        <div className="knowledge-level-options">
          {knowledgeLevels.map((item) => {
            const selected = state.profile.knowledgeLevel === item.id;
            return (
              <button
                type="button"
                className={"knowledge-level-option " + (selected ? "selected" : "")}
                aria-pressed={selected}
                key={item.id}
                onClick={() => {
                  dispatch({ type: "SET_KNOWLEDGE_LEVEL", level: item.id });
                  if (item.id === "advanced") navigate("/deepen");
                  else setNotice("Nível bíblico alterado para " + item.title + ".");
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span><strong>{item.title}</strong><small>{item.note}</small></span>
                <i aria-hidden="true">{selected ? "✓" : ""}</i>
              </button>
            );
          })}
        </div>
        {state.profile.knowledgeLevel === "advanced" && (
          <button type="button" className="primary-button" onClick={() => navigate("/deepen")}>Abrir jornada Aprofundar</button>
        )}
      </section>
      <section className="stats-grid">
        <div><span>🔥</span><strong>{state.streak}</strong><small>sequência atual</small></div>
        <div><span>◈</span><strong>{state.bestStreak}</strong><small>melhor sequência</small></div>
        <div><span>✓</span><strong>{state.completedLessonIds.length}</strong><small>lições</small></div>
        <div><span>◎</span><strong>{accuracy}%</strong><small>precisão</small></div>
        <div><span>◷</span><strong>{formatTime(seconds)}</strong><small>tempo estudado</small></div>
        <div><span>★</span><strong>{state.earnedAchievementIds.length}</strong><small>conquistas</small></div>
      </section>
      <section className="activity-card">
        <div className="section-title"><div><p className="eyebrow">Últimos 28 dias</p><h2>Atividade</h2></div></div>
        <div className="activity-calendar" aria-label="Calendário de atividade dos últimos 28 dias">
          {days.map((day) => (
            <span
              key={day.date}
              className={"activity-cell intensity-" + Math.min(3, Math.ceil(day.xp / 50))}
              title={day.date + ": " + day.xp + " XP"}
              aria-label={day.date + ", " + day.xp + " XP"}
            />
          ))}
        </div>
      </section>
      <section className="settings-card">
        <div className="section-title"><h2>Preferências</h2></div>
        <label className="switch-row">
          <span><strong>Usar corações</strong><small>Erros incentivam revisão, nunca compra.</small></span>
          <input
            type="checkbox"
            checked={state.settings.heartsEnabled}
            onChange={(event) => dispatch({ type: "TOGGLE_HEARTS", enabled: event.target.checked })}
          />
          <span className="switch-control" aria-hidden="true" />
        </label>
        <label className="switch-row">
          <span><strong>Sons de resposta</strong><small>Efeitos originais de acerto e erro durante os exercícios.</small></span>
          <input
            type="checkbox"
            checked={state.settings.soundEnabled}
            onChange={(event) => dispatch({ type: "TOGGLE_SOUND", enabled: event.target.checked })}
          />
          <span className="switch-control" aria-hidden="true" />
        </label>
        <label className="switch-row">
          <span><strong>Vibração de resposta</strong><small>Pulsos breves em aparelhos compatíveis; movimento reduzido é respeitado.</small></span>
          <input
            type="checkbox"
            checked={state.settings.hapticsEnabled}
            onChange={(event) => dispatch({ type: "TOGGLE_HAPTICS", enabled: event.target.checked })}
          />
          <span className="switch-control" aria-hidden="true" />
        </label>
      </section>
      <section className="reminder-card" id="daily-reminder">
        <div className="reminder-heading">
          <span className="reminder-bell" aria-hidden="true">🔔</span>
          <div><p className="eyebrow">Crie constância</p><h2>Lembrete da jornada</h2><p>Escolha um horário para receber seu chamado diário de estudo.</p></div>
        </div>
        <label className="switch-row">
          <span><strong>Lembrar todos os dias</strong><small>O aviso interno usa o horário local deste aparelho.</small></span>
          <input
            type="checkbox"
            checked={state.settings.dailyReminderEnabled}
            onChange={(event) => void configureReminder(event.target.checked)}
          />
          <span className="switch-control" aria-hidden="true" />
        </label>
        <label className="reminder-time-row">
          <span><strong>Horário</strong><small>Quando sua jornada costuma caber melhor?</small></span>
          <input
            type="time"
            value={state.settings.dailyReminderTime}
            disabled={!state.settings.dailyReminderEnabled}
            onChange={(event) => dispatch({
              type: "SET_DAILY_REMINDER",
              enabled: state.settings.dailyReminderEnabled,
              time: event.target.value
            })}
            aria-label="Horário do lembrete diário"
          />
        </label>
        <button
          type="button"
          className="secondary-button calendar-button"
          onClick={() => {
            downloadDailyReminderCalendar(state.settings.dailyReminderTime);
            setNotice("Arquivo de calendário criado. Abra-o para confirmar o lembrete diário.");
          }}
        >
          Adicionar ao calendário
        </button>
        <p className="reminder-note">Navegadores podem suspender PWAs fechados. O calendário é a opção confiável para receber o aviso mesmo com o Bibliolingo encerrado.</p>
      </section>
      <section className="backup-card">
        <div><p className="eyebrow">Seus dados</p><h2>Backup do progresso</h2><p>O arquivo fica com você e pode restaurar esta jornada em outro dispositivo.</p></div>
        <button className="secondary-button" onClick={exportProgress}>Exportar progresso</button>
        <button className="secondary-button" onClick={() => fileInput.current?.click()}>Importar progresso</button>
        <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={importFile} />
      </section>
      {notice && <div className="toast" role="status">{notice}<button aria-label="Fechar aviso" onClick={() => setNotice(undefined)}>×</button></div>}
    </main>
  );
}
