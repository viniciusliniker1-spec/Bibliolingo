import { describe, expect, it } from "vitest";
import { journeyBooks } from "../../src/content/catalog";
import type { Exercise, LessonStep } from "../../src/types/content";
import { buildLessonPlan, buildMatchPairs, comboLevel, NARRATIVE_BOOKS, shuffledRights, stableHash, typedAnswerMatches, type PlayStep } from "./lessonPlan";

const units = journeyBooks.flatMap((book) => book.units);
const lessons = units.flatMap((unit) => unit.lessons);
const planUnit = (bookId: string, unit: (typeof units)[number]) => {
  const pool: Exercise[] = [];
  return unit.lessons.map((lesson, index) => {
    const plan = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false, reviewPool: [...pool], unit: { index, lessonTitles: unit.lessons.map((item) => item.title), narrative: NARRATIVE_BOOKS.has(bookId) } });
    pool.push(...lesson.steps.filter((step): step is Exercise => step.type !== "learn"));
    return plan;
  });
};
const allPlans = journeyBooks.flatMap((book) => book.units.flatMap((unit) => planUnit(book.id, unit)));
const BONUS = new Set<PlayStep["kind"]>(["match", "order", "passage"]);
const exercisesOf = (steps: readonly LessonStep[]) => steps.filter((step): step is Exercise => step.type !== "learn");

describe("roteiro de jogo das lições", () => {
  it("preserva todas as etapas originais, na mesma ordem", () => {
    const lesson = lessons[0];
    const plan = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false });
    const original = plan.filter((step) => !BONUS.has(step.kind));
    expect(original.map((step) => step.id)).toEqual(lesson.steps.map((step) => step.id));
  });

  it("varia os formatos ao longo do currículo, mas nunca em checkpoints", () => {
    const presentations = new Set<string>();
    let trueFalse = 0;
    let total = 0;
    for (const plan of allPlans) {
      for (const step of plan) {
        if (step.kind !== "exercise") continue;
        presentations.add(step.presentation);
        total += 1;
        if (step.presentation === "true-false") trueFalse += 1;
      }
    }
    expect(presentations).toEqual(new Set(["choice", "true-false", "type", "fill", "blocks"]));
    expect(trueFalse / total).toBeGreaterThan(0.1);
    expect(trueFalse / total).toBeLessThan(0.4);
    // No máximo um "Certo ou errado" por lição.
    for (const plan of allPlans) expect(plan.filter((step) => step.kind === "exercise" && step.presentation === "true-false").length).toBeLessThanOrEqual(1);
    for (const unit of units) {
      const plan = buildLessonPlan({ lessonId: unit.checkpoint.id, steps: unit.checkpoint.exercises, checkpoint: true });
      expect(plan.some((step) => step.kind === "exercise" && step.presentation === "true-false")).toBe(false);
      expect(plan.some((step) => BONUS.has(step.kind))).toBe(false);
      expect(plan.some((step) => step.kind === "exercise" && step.presentation === "type")).toBe(false);
    }
  });

  it("monta Certo ou errado com uma alternativa real e o gabarito certo", () => {
    for (const lesson of lessons) {
      for (const step of buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false })) {
        if (step.kind !== "exercise" || !step.trueFalse || step.step.type !== "multiple-choice") continue;
        const option = step.step.options.find((item) => item.id === step.trueFalse!.optionId);
        expect(option?.text).toBe(step.trueFalse.optionText);
        expect(step.trueFalse.isTrue).toBe(step.trueFalse.optionId === step.step.correctOptionId);
      }
    }
  });

  it("não usa Certo ou errado em perguntas de raciocínio", () => {
    for (const plan of allPlans) for (const step of plan) {
      if (step.kind === "exercise" && step.presentation === "true-false" && step.step.type === "multiple-choice") expect(step.step.prompt).not.toMatch(/^por qu/i);
    }
  });

  it("escolhe no máximo uma etapa bônus e varia entre ligar, ordenar e passagem", () => {
    const kinds = new Set<string>();
    for (const plan of allPlans) {
      const bonus = plan.filter((step) => BONUS.has(step.kind));
      expect(bonus.length).toBeLessThanOrEqual(1);
      bonus.forEach((step) => kinds.add(step.kind));
    }
    expect(kinds).toEqual(BONUS);
  });

  it("ordena acontecimentos só em livros narrativos, com gabarito na ordem da unidade", () => {
    for (const book of journeyBooks) for (const unit of book.units) {
      for (const plan of planUnit(book.id, unit)) {
        const order = plan.find((step) => step.kind === "order");
        if (!order || order.kind !== "order") continue;
        expect(NARRATIVE_BOOKS.has(book.id)).toBe(true);
        const titles = order.correctOrder.map((id) => order.items.find((item) => item.id === id)!.text);
        expect(titles).toEqual(unit.lessons.map((lesson) => lesson.title).filter((title) => title.length <= 60).slice(0, 5));
        expect(order.items.map((item) => item.id)).not.toEqual(order.correctOrder);
      }
    }
  });

  it("monta Em qual passagem com a referência certa entre as opções", () => {
    for (const plan of allPlans) {
      const passage = plan.find((step) => step.kind === "passage");
      if (!passage || passage.kind !== "passage") continue;
      expect(passage.options).toHaveLength(3);
      expect(new Set(passage.options.map((option) => option.label)).size).toBe(3);
      expect(passage.options.some((option) => option.id === passage.correctId)).toBe(true);
    }
  });

  it("aceita resposta digitada sem acento, maiúsculas ou um erro de digitação", () => {
    expect(typedAnswerMatches("  moises ", "Moisés")).toBe(true);
    expect(typedAnswerMatches("JERUSALÉM", "Jerusalém")).toBe(true);
    expect(typedAnswerMatches("jerusalen", "Jerusalém")).toBe(true);
    expect(typedAnswerMatches("Abel", "Adão")).toBe(false);
    expect(typedAnswerMatches("fe", "fé")).toBe(true);
    expect(typedAnswerMatches("fa", "fé")).toBe(false);
    expect(typedAnswerMatches("", "fé")).toBe(false);
  });

  it("é determinístico para retomar a lição no mesmo formato", () => {
    const lesson = lessons[5];
    const a = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false });
    const b = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false });
    expect(a).toEqual(b);
  });

  it("adiciona Ligue os pares com questões da unidade quando há pares suficientes", () => {
    const unit = units[1];
    const [first, second] = unit.lessons;
    const plan = buildLessonPlan({ lessonId: second.id, steps: second.steps, checkpoint: false, reviewPool: exercisesOf(first.steps) });
    const match = plan.find((step) => step.kind === "match");
    expect(match).toBeDefined();
    if (match?.kind !== "match") return;
    expect(match.pairs.length).toBeGreaterThanOrEqual(3);
    expect(new Set(match.pairs.map((pair) => pair.right.toLowerCase())).size).toBe(match.pairs.length);
    expect(plan[plan.length - 1].kind).toBe("match");
  });

  it("ignora pares longos, genéricos ou repetidos", () => {
    const base = { objective: "", explanation: "", reference: { bookId: "Gen", startChapter: 1, label: "Gn 1" }, conceptId: "c", difficulty: "easy" as const };
    const mk = (id: string, prompt: string, answer: string): Exercise => ({ ...base, id, type: "multiple-choice", prompt, options: [{ id: "a", text: answer }, { id: "b", text: "x" }], correctOptionId: "a" });
    const pairs = buildMatchPairs([mk("1", "Quem criou?", "Deus"), mk("2", "Quem fez?", "Deus"), mk("3", "Complete a ideia", "luz"), mk("4", "x".repeat(200), "y")]);
    expect(pairs.map((pair) => pair.id)).toEqual(["1"]);
  });

  it("embaralha a coluna de respostas de forma estável", () => {
    const pairs = [{ id: "a", left: "1", right: "A" }, { id: "b", left: "2", right: "B" }, { id: "c", left: "3", right: "C" }, { id: "d", left: "4", right: "D" }];
    expect(shuffledRights(pairs, "s")).toEqual(shuffledRights(pairs, "s"));
    expect(shuffledRights(pairs, "s").map((pair) => pair.id)).not.toEqual(["a", "b", "c", "d"]);
    expect(stableHash("abc")).toBe(stableHash("abc"));
  });

  it("calcula o nível do combo", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 9].map(comboLevel)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
});
