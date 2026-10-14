import { useState } from "react";
import { useApp } from "../../state/AppContext";
import type { StudyGoal } from "../../types/progress";
import { DAILY_GOALS, STUDY_GOALS } from "../../config/profile";
import { ProgressBar } from "../../components/ProgressBar";

export function Onboarding() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<StudyGoal>("daily-habit");
  const [dailyGoal, setDailyGoal] = useState<50 | 100 | 150 | 200>(100);

  return (
    <main className="onboarding">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">B</div>
        <span>Bibliolingo</span>
      </div>
      <ProgressBar value={step + 1} max={2} label={"Etapa " + (step + 1) + " de 2"} tone="gold" />

      {step === 0 ? (
        <section className="onboarding-panel">
          <div className="eyebrow">Sua jornada</div>
          <h1>O que você busca agora?</h1>
          <p>Isso nos ajuda a destacar o próximo passo certo.</p>
          <div className="choice-list">
            {STUDY_GOALS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={"choice-card " + (goal === item.id ? "selected" : "")}
                aria-pressed={goal === item.id}
                onClick={() => setGoal(item.id)}
              >
                <span className="choice-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="choice-radio" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={() => setStep(1)}>Continuar</button>
        </section>
      ) : (
        <section className="onboarding-panel">
          <div className="eyebrow">Ritmo diário</div>
          <h1>Escolha sua meta</h1>
          <p>Você poderá alterar isso depois no perfil.</p>
          <div className="goal-grid">
            {DAILY_GOALS.map((item) => (
              <button
                type="button"
                key={item.xp}
                className={"goal-card " + (dailyGoal === item.xp ? "selected" : "")}
                aria-pressed={dailyGoal === item.xp}
                onClick={() => setDailyGoal(item.xp)}
              >
                <strong>{item.title}</strong>
                <span>{item.xp} XP</span>
                <small>{item.note}</small>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => dispatch({ type: "ONBOARD", goal, dailyGoal })}
          >
            Começar jornada
          </button>
          <button type="button" className="text-button" onClick={() => setStep(0)}>Voltar</button>
        </section>
      )}
    </main>
  );
}
