import { KIDS_STORIES } from "../content/kids/stories";
import { stableHash } from "./lessonPlan";

/** Frases de incentivo do modo criança (cada uma tem áudio gravado). */
export const KIDS_PRAISE = ["Muito bem!", "Isso mesmo!", "Você acertou!", "Que legal!"];
export const KIDS_TRY_AGAIN = "Tente de novo!";
export const KIDS_TRUE_FALSE = "Certo ou errado?";

export function kidsCongrats(stars: number) {
  return `Parabéns! Você ganhou ${stars} ${stars === 1 ? "estrela" : "estrelas"}!`;
}

/** Nome do arquivo de áudio de uma fala (o mesmo no gerador e no app). */
export function narrationKey(text: string) {
  return "k" + stableHash(text.normalize("NFC").trim()).toString(36);
}

/** Todas as falas narradas do modo criança, sem repetição. */
export function kidsNarrationLines(): string[] {
  const lines = [...KIDS_PRAISE, KIDS_TRY_AGAIN, KIDS_TRUE_FALSE, kidsCongrats(1), kidsCongrats(2), kidsCongrats(3)];
  for (const story of KIDS_STORIES) {
    lines.push(story.title, story.verse.text);
    for (const scene of story.scenes) lines.push(scene.short, scene.text);
    for (const activity of story.activities) {
      if (activity.type === "pick") lines.push(activity.question, ...activity.options.map((option) => option.label));
      else if (activity.type === "order") lines.push(activity.question, ...activity.items.map((item) => item.label));
      else lines.push(activity.statement, activity.explain);
    }
  }
  return [...new Set(lines.map((line) => line.normalize("NFC").trim()))];
}
