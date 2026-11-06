import type { KidsStory } from "../content/kids/stories";

export interface KidsReport {
  done: number;
  total: number;
  stars: number;
  maxStars: number;
  next?: KidsStory;
  /** Perguntas para conversar em família das histórias já ouvidas (mais recentes na trilha primeiro). */
  talks: { title: string; family: string; verse: string }[];
}

/** Resumo para a área dos pais a partir das estrelas por história. */
export function kidsReport(stories: KidsStory[], stars: Record<string, number>): KidsReport {
  const finished = stories.filter((story) => (stars[story.id] ?? 0) > 0);
  return {
    done: finished.length,
    total: stories.length,
    stars: finished.reduce((sum, story) => sum + (stars[story.id] ?? 0), 0),
    maxStars: stories.length * 3,
    next: stories.find((story) => !stars[story.id]),
    talks: [...finished].reverse().map((story) => ({ title: story.title, family: story.family, verse: `${story.verse.text} (${story.verse.ref})` }))
  };
}
