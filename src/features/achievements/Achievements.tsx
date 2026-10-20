import { achievementProgress, isApprovedAchievementMet, visibleApprovedAchievements } from "../../domain/achievements";
import { webAchievementAssets } from "../../assets/achievementAssets";
import { useApp } from "../../state/AppContext";

export function Achievements() {
  const { state } = useApp();
  const achievements = visibleApprovedAchievements();
  const earnedCount = achievements.filter((item)=>isApprovedAchievementMet(state,item)).length;
  return (
    <main className="page achievements-page">
      <header className="page-header">
        <p className="eyebrow">Marcos da caminhada</p>
        <h1>Conquistas</h1>
        <p>{earnedCount} de {achievements.length} conquistas regulares</p>
      </header>
      <div className="achievement-list">
        {achievements.map((achievement) => {
          const progress = achievementProgress(state,achievement);
          const earned = isApprovedAchievementMet(state,achievement);
          const artwork = webAchievementAssets[achievement.id];
          return (
            <article className={"achievement-card " + (earned ? "earned" : "locked")} key={achievement.id}>
              <div className="achievement-medal achievement-medal-art" aria-hidden="true">
                {artwork ? <img src={artwork} alt="" loading="lazy" /> : <span>{earned ? "✦" : "◇"}</span>}
              </div>
              <div>
                <h2>{achievement.title}</h2>
                <p>{achievement.description}</p>
                <small>{earned ? "Desbloqueada" : progress.supported ? `${Math.min(progress.current,progress.target)} de ${progress.target}` : "Aguardando registro confiável"}</small>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
