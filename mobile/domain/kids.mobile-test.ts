import { describe, expect, it } from "vitest";
import { KIDS_STORIES } from "../content/kids/stories";
import { bestStars, parentGateQuestion, planFor, starsFor } from "./kids";

describe("modo criança", () => {
  it("cada história tem cenas, atividades válidas, versículo e pergunta para a família", () => {
    expect(KIDS_STORIES).toHaveLength(21);
    expect(KIDS_STORIES.every(Boolean)).toBe(true);
    expect(new Set(KIDS_STORIES.map((story) => story.id)).size).toBe(21);
    for (const story of KIDS_STORIES) {
      expect(story.scenes.length).toBeGreaterThanOrEqual(5);
      for (const scene of story.scenes) {
        expect(scene.short.length).toBeLessThanOrEqual(40);
        expect(scene.text.length).toBeLessThanOrEqual(110);
        expect(scene.art.emoji.length).toBeGreaterThan(0);
      }
      for (const activity of story.activities) {
        if (activity.type === "pick") { expect(activity.options).toHaveLength(3); expect(activity.answer).toBeLessThan(3); }
        if (activity.type === "order") expect(activity.items).toHaveLength(3);
      }
      expect(story.verse.ref).toMatch(/\d/);
      expect(story.family.length).toBeGreaterThan(20);
    }
  });

  it("adapta à idade", () => {
    const story = KIDS_STORIES[0];
    expect(planFor(story, "3-5")).toMatchObject({ sceneText: "short", autoNarrate: true });
    expect(planFor(story, "3-5").activities.some((a) => a.type === "order")).toBe(false);
    expect(planFor(story, "6-8").activities).toHaveLength(3);
    expect(planFor(story, "9-11").autoNarrate).toBe(false);
  });

  it("toda criança termina com estrela e guarda a melhor", () => {
    expect([0, 1, 2, 5].map(starsFor)).toEqual([3, 2, 1, 1]);
    expect(bestStars(3, 1)).toBe(3);
    expect(bestStars(undefined, 2)).toBe(2);
  });

  it("portão dos pais tem a resposta entre 3 opções distintas", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const q = parentGateQuestion(seed);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(3);
      expect(q.answer).toBeGreaterThanOrEqual(13);
    }
  });
});

import { kidsReport } from "./kidsReport";
import { kidsNarrationLines, narrationKey } from "./kidsNarration";

describe("relatório dos pais", () => {
  it("conta histórias, estrelas e sugere a próxima", () => {
    const report = kidsReport(KIDS_STORIES, { criacao: 3, noe: 2 });
    expect(report.done).toBe(2);
    expect(report.stars).toBe(5);
    expect(report.maxStars).toBe(63);
    expect(report.next?.id).toBe("abraao");
    expect(report.talks[0].title).toBe(KIDS_STORIES[1].title);
  });
});

describe("narração gravada", () => {
  it("tem chave única por fala e cobre as cenas", () => {
    const lines = kidsNarrationLines();
    expect(new Set(lines.map(narrationKey)).size).toBe(lines.length);
    expect(lines).toContain(KIDS_STORIES[0].scenes[0].text);
    expect(lines).toContain("Tente de novo!");
  });
});
