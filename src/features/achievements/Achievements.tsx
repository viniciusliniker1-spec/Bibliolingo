import { ACHIEVEMENTS } from "../../domain/achievements";
import { useApp } from "../../state/AppContext";

export function Achievements() {
  const { state } = useApp();
  return (
    <main className="page achievements-page">
      <header className="page-header">
        <p className="eyebrow">Marcos da caminhada</p>
        <h1>Conquistas</h1>
        <p>{state.earnedAchievementIds.length} de {ACHIEVEMENTS.length} desbloqueadas</p>
      </header>
      <div className="achievement-list">
        {ACHIEVEMENTS.map((achievement) => {
          const earned = state.earnedAchievementIds.includes(achievement.id);
          return (
            <article className={"achievement-card " + (earned ? "earned" : "locked")} key={achievement.id}>
              <div className="achievement-medal" aria-hidden="true">{earned ? achievement.icon : "◇"}</div>
              <div><h2>{achievement.title}</h2><p>{achievement.description}</p><small>{earned ? "Desbloqueada" : "Em progresso"}</small></div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
