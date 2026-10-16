import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getLevelProgress } from "../../domain/gamification";
import { toLocalDateKey } from "../../domain/streak";
import { parseBackup, serializeBackup } from "../../storage/backup";
import { useApp } from "../../state/AppContext";
import { ProgressBar } from "../../components/ProgressBar";
import { DAILY_GOALS, KNOWLEDGE_LEVELS, STUDY_GOALS } from "../../config/profile";
import {
  downloadDailyReminderCalendar,
  requestNotificationPermission
} from "../../services/dailyReminder";

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

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatActivityDate(key: string, compact = false) {
  return new Intl.DateTimeFormat("pt-BR", compact
    ? { day: "2-digit", month: "short" }
    : { weekday: "long", day: "2-digit", month: "long" }
  ).format(dateFromKey(key));
}

export function Profile() {
  const { state, dispatch, importProgress } = useApp();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string>();
  const [selectedActivityDate, setSelectedActivityDate] = useState(() => toLocalDateKey(new Date()));
  const fileInput = useRef<HTMLInputElement>(null);
  const level = getLevelProgress(state.xp);
  const correct = state.attempts.filter((attempt) => attempt.correct).length;
  const accuracy = state.attempts.length ? Math.round((correct / state.attempts.length) * 100) : 0;
  const greekAttempts = state.attempts.filter((attempt) => attempt.mode === "greek");
  const greekCorrect = greekAttempts.filter((attempt) => attempt.correct).length;
  const greekAccuracy = greekAttempts.length ? Math.round(greekCorrect / greekAttempts.length * 100) : 0;
  const greekLessons = state.completedLessonIds.filter((id) => id.startsWith("greek-")).length;
  const greekWeakSkills = Object.entries(state.greekSkills).filter(([, skill]) => skill.incorrect > skill.correct).length;
  const seconds = Object.values(state.activity).reduce((total, day) => total + day.seconds, 0);
  const days = Array.from({ length: 28 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - offset));
    const key = toLocalDateKey(date);
    return state.activity[key] ?? { date: key, xp: 0, seconds: 0, lessons: 0 };
  });
  const firstDayOffset = dateFromKey(days[0].date).getDay();
  const selectedActivity = days.find((day) => day.date === selectedActivityDate) ?? days[days.length - 1];

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
      <section className="learning-preferences-card" id="learning-preferences">
        <div className="section-title"><div><p className="eyebrow">Seu plano</p><h2>Objetivo e meta diária</h2></div></div>
        <fieldset className="profile-preference-group">
          <legend>Objetivo de estudo</legend>
          <div className="profile-choice-grid">
            {STUDY_GOALS.map((item) => (
              <button type="button" key={item.id} className={"profile-choice " + (state.profile.goal === item.id ? "selected" : "")} aria-pressed={state.profile.goal === item.id} onClick={() => {
                dispatch({ type: "SET_PROFILE_PREFERENCES", goal: item.id, dailyGoal: state.profile.dailyGoal });
                setNotice("Objetivo atualizado para " + item.label + ".");
              }}>
                <span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="profile-preference-group">
          <legend>Meta diária de XP</legend>
          <div className="profile-goal-grid">
            {DAILY_GOALS.map((item) => (
              <button type="button" key={item.xp} className={"profile-goal-choice " + (state.profile.dailyGoal === item.xp ? "selected" : "")} aria-pressed={state.profile.dailyGoal === item.xp} onClick={() => {
                dispatch({ type: "SET_PROFILE_PREFERENCES", goal: state.profile.goal, dailyGoal: item.xp });
                setNotice("Meta diária alterada para " + item.xp + " XP.");
              }}>
                <strong>{item.title}</strong><span>{item.xp} XP</span><small>{item.note}</small>
              </button>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="knowledge-level-card" id="knowledge-level">
        <div className="section-title">
          <div><p className="eyebrow">Personalize o ensino</p><h2>Nível de conhecimento bíblico</h2></div>
        </div>
        <p>Isso muda o percurso recomendado; seu XP e progresso anterior continuam preservados.</p>
        <div className="knowledge-level-options">
          {KNOWLEDGE_LEVELS.map((item) => {
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
        <p className="activity-range">{formatActivityDate(days[0].date, true)} — {formatActivityDate(days[days.length - 1].date, true)}</p>
        <div className="activity-weekdays" aria-hidden="true">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="activity-calendar" role="grid" aria-label="Calendário de atividade dos últimos 28 dias">
          {Array.from({ length: firstDayOffset }, (_, index) => <span className="activity-cell-empty" key={"empty-" + index} aria-hidden="true" />)}
          {days.map((day) => (
            <button type="button" key={day.date} role="gridcell"
              className={"activity-cell intensity-" + Math.min(3, Math.ceil(day.xp / 50)) + (selectedActivity.date === day.date ? " selected" : "")}
              title={formatActivityDate(day.date) + ": " + day.xp + " XP"}
              aria-label={formatActivityDate(day.date) + ", " + day.xp + " XP, " + day.lessons + " lições"}
              aria-pressed={selectedActivity.date === day.date}
              onClick={() => setSelectedActivityDate(day.date)}
              onFocus={() => setSelectedActivityDate(day.date)}
            >
              <span aria-hidden="true">{dateFromKey(day.date).getDate()}</span>
              <span className="activity-tooltip" role="tooltip">{day.xp} XP · {day.lessons} {day.lessons === 1 ? "lição" : "lições"}</span>
            </button>
          ))}
        </div>
        <div className="activity-detail" role="status">
          <strong>{formatActivityDate(selectedActivity.date)}</strong>
          <span>{selectedActivity.xp} XP · {selectedActivity.lessons} {selectedActivity.lessons === 1 ? "lição" : "lições"} · {formatTime(selectedActivity.seconds)}</span>
        </div>
        <div className="activity-legend" aria-label="Legenda de intensidade">
          <span>Menos</span>
          {[0, 1, 2, 3].map((intensity) => <i key={intensity} className={"activity-legend-cell intensity-" + intensity} aria-hidden="true" />)}
          <span>Mais XP</span>
        </div>
      </section>
      <section className="settings-card">
        <div className="section-title"><h2>Preferências</h2></div>
        <label className="switch-row">
          <span><strong id="hearts-toggle-title">Usar corações</strong><small id="hearts-toggle-description">Erros incentivam revisão, nunca compra.</small></span>
          <input
            type="checkbox"
            aria-labelledby="hearts-toggle-title"
            aria-describedby="hearts-toggle-description"
            checked={state.settings.heartsEnabled}
            onChange={(event) => dispatch({ type: "TOGGLE_HEARTS", enabled: event.target.checked })}
          />
          <span className="switch-control" aria-hidden="true" />
        </label>
        <label className="switch-row">
          <span><strong id="sound-toggle-title">Sons de resposta</strong><small id="sound-toggle-description">Efeitos originais de acerto e erro durante os exercícios.</small></span>
          <input
            type="checkbox"
            aria-labelledby="sound-toggle-title"
            aria-describedby="sound-toggle-description"
            checked={state.settings.soundEnabled}
            onChange={(event) => dispatch({ type: "TOGGLE_SOUND", enabled: event.target.checked })}
          />
          <span className="switch-control" aria-hidden="true" />
        </label>
        <label className="switch-row">
          <span><strong id="haptics-toggle-title">Vibração de resposta</strong><small id="haptics-toggle-description">Pulsos breves em aparelhos compatíveis; movimento reduzido é respeitado.</small></span>
          <input
            type="checkbox"
            aria-labelledby="haptics-toggle-title"
            aria-describedby="haptics-toggle-description"
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
          <span><strong id="reminder-toggle-title">Lembrar todos os dias</strong><small id="reminder-toggle-description">O aviso interno usa o horário local deste aparelho.</small></span>
          <input
            type="checkbox"
            aria-labelledby="reminder-toggle-title"
            aria-describedby="reminder-toggle-description"
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
        <button type="button" className="secondary-button" onClick={() => navigate("/notifications")}>Configurar categorias e horário de silêncio</button>
        <p className="reminder-note">Navegadores podem suspender PWAs fechados. O calendário é a opção confiável para receber o aviso mesmo com o Bibliolingo encerrado.</p>
      </section>
      <section className="profile-greek-card">
        <div><p className="eyebrow">📊 Minha evolução no grego</p><h2>Da letra à leitura</h2></div>
        <div className="summary-grid">
          <div><span>α</span><strong>{greekLessons}</strong><small>lições</small></div>
          <div><span>◎</span><strong>{greekAccuracy}%</strong><small>precisão</small></div>
          <div><span>Λ</span><strong>{state.learnedGreekLexemeIds.length}</strong><small>verbetes</small></div>
          <div><span>↻</span><strong>{greekWeakSkills}</strong><small>habilidades a revisar</small></div>
        </div>
        <ProgressBar value={greekLessons} max={32} label="Progresso das lições de grego" tone="gold" />
        <button className="secondary-button" type="button" onClick={() => navigate("/greek")}>Abrir Grego Bíblico</button>
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
