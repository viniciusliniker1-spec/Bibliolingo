/** Regras do modo criança: o que muda por idade e quantas estrelas cada história rende. */
import type { KidsActivity, KidsAge, KidsStory } from "../content/kids/stories";

export interface KidsPlan {
  sceneText: "short" | "full";
  autoNarrate: boolean;
  activities: KidsActivity[];
}

/** 3–5: frases curtas, narração sempre, sem a atividade de ordenar (exige leitura e memória de sequência). */
export function planFor(story: KidsStory, age: KidsAge): KidsPlan {
  if (age === "3-5") return { sceneText: "short", autoNarrate: true, activities: story.activities.filter((a) => a.type !== "order") };
  if (age === "6-8") return { sceneText: "full", autoNarrate: true, activities: story.activities };
  return { sceneText: "full", autoNarrate: false, activities: story.activities };
}

/** Estrelas: 3 sem erros, 2 com um erro, 1 por terminar. Criança nunca sai sem estrela. */
export function starsFor(mistakes: number) {
  if (mistakes <= 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

export function bestStars(previous: number | undefined, now: number) {
  return Math.max(previous ?? 0, now);
}

/** Pergunta do portão dos pais (soma de dois números que uma criança pequena ainda não resolve de cabeça). */
export function parentGateQuestion(seed: number) {
  const a = 6 + (seed % 7);
  const b = 7 + ((seed >> 3) % 6);
  const answer = a + b;
  const options = [answer, answer + 2, answer - 3].sort((x, y) => ((x * 7 + seed) % 5) - ((y * 7 + seed) % 5));
  return { text: `${a} + ${b}`, answer, options };
}
