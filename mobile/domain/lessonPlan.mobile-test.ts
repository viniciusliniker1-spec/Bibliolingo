import { describe, expect, it } from "vitest";
import { journeyBooks } from "../../src/content/catalog";
import type { Exercise, LessonStep } from "../../src/types/content";
import { buildLessonPlan, buildMatchPairs, comboLevel, CREATIVE_ROTATION, NARRATIVE_BOOKS, shuffledRights, stableHash, typedAnswerMatches, type PlayStep } from "./lessonPlan";

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
const CREATIVE = new Set<PlayStep["kind"]>(CREATIVE_ROTATION);
const exercisesOf = (steps: readonly LessonStep[]) => steps.filter((step): step is Exercise => step.type !== "learn");

describe("roteiro de jogo das lições", () => {
  it("preserva todas as etapas originais, na mesma ordem", () => {
    const lesson = lessons[0];
    const plan = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false });
    const original = plan.filter((step) => !BONUS.has(step.kind) && !CREATIVE.has(step.kind));
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
      expect(plan.some((step) => BONUS.has(step.kind) || CREATIVE.has(step.kind))).toBe(false);
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

  describe("etapas criativas", () => {
    const creativeOf = (plan: PlayStep[]) => plan.filter((step) => CREATIVE.has(step.kind));

    it("cada lição tem no máximo uma, no meio dela, e todas as três aparecem no currículo", () => {
      const kinds = new Set<string>();
      let withCreative = 0;
      for (const plan of allPlans) {
        const creative = creativeOf(plan);
        expect(creative.length).toBeLessThanOrEqual(1);
        if (!creative.length) continue;
        withCreative += 1;
        kinds.add(creative[0].kind);
        const position = plan.indexOf(creative[0]);
        const exercisesBefore = plan.slice(0, position).filter((step) => step.kind === "exercise").length;
        const exercisesAfter = plan.slice(position + 1).filter((step) => step.kind === "exercise").length;
        expect(exercisesBefore).toBeGreaterThan(0);
        expect(exercisesAfter).toBeGreaterThanOrEqual(0);
      }
      expect(kinds).toEqual(CREATIVE);
      // A maioria das lições recebe uma etapa criativa.
      expect(withCreative / allPlans.length).toBeGreaterThan(0.9);
    });

    it("o rodízio alterna os formatos entre lições seguidas da mesma unidade", () => {
      let alternating = 0;
      let pairs = 0;
      for (const book of journeyBooks) for (const unit of book.units) {
        const kinds = planUnit(book.id, unit).map((plan) => creativeOf(plan)[0]?.kind);
        for (let i = 1; i < kinds.length; i += 1) if (kinds[i] && kinds[i - 1]) { pairs += 1; if (kinds[i] !== kinds[i - 1]) alternating += 1; }
      }
      expect(alternating / pairs).toBeGreaterThan(0.4);
    });

    it("desembaralhar: as letras formam a palavra certa e não vêm na ordem", () => {
      for (const plan of allPlans) {
        const step = plan.find((item) => item.kind === "scramble");
        if (!step || step.kind !== "scramble") continue;
        expect(step.letters.map((letter) => letter.ch).sort().join("")).toBe([...step.answer].sort().join(""));
        expect(step.letters.map((letter) => letter.ch).join("")).not.toBe(step.answer);
        expect(step.answer.length).toBeGreaterThanOrEqual(3);
        expect(new Set(step.letters.map((letter) => letter.id)).size).toBe(step.letters.length);
      }
    });

    it("ache o erro: exatamente uma palavra (ou trecho) trocada, que não é a resposta certa", () => {
      for (const plan of allPlans) {
        const step = plan.find((item) => item.kind === "spot");
        if (!step || step.kind !== "spot") continue;
        const wrong = step.tokens.filter((token) => token.wrong);
        expect(wrong.length).toBeGreaterThan(0);
        expect(wrong.map((token) => token.text).join(" ").toLocaleLowerCase("pt-BR")).not.toBe(step.answer.toLocaleLowerCase("pt-BR"));
        // Os tokens errados são vizinhos: um único trecho trocado.
        const indexes = step.tokens.map((token, index) => (token.wrong ? index : -1)).filter((index) => index >= 0);
        expect(indexes[indexes.length - 1] - indexes[0]).toBe(indexes.length - 1);
        expect(step.tokens.length).toBeGreaterThanOrEqual(4);
      }
    });

    it("deslize: de 3 a 5 cartas, com certas e erradas e o gabarito consistente", () => {
      for (const plan of allPlans) {
        const step = plan.find((item) => item.kind === "swipe");
        if (!step || step.kind !== "swipe") continue;
        expect(step.cards.length).toBeGreaterThanOrEqual(3);
        expect(step.cards.length).toBeLessThanOrEqual(5);
        expect(step.cards.some((card) => card.isTrue)).toBe(true);
        expect(step.cards.some((card) => !card.isTrue)).toBe(true);
        expect(new Set(step.cards.map((card) => card.question)).size).toBe(step.cards.length);
        for (const card of step.cards) {
          if (card.isTrue) expect(card.claim).toBe(card.truth);
          else expect(card.claim.toLocaleLowerCase("pt-BR")).not.toBe(card.truth.toLocaleLowerCase("pt-BR"));
        }
      }
    });

    it("é determinístico: a mesma lição gera as mesmas etapas", () => {
      const lesson = lessons[3];
      const a = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false });
      const b = buildLessonPlan({ lessonId: lesson.id, steps: lesson.steps, checkpoint: false });
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });
  });
});

describe("ache o erro: posição da palavra trocada", () => {
  it("na maioria das frases a palavra trocada não é a última", () => {
    let spots = 0;
    let atEnd = 0;
    let atStart = 0;
    for (const book of journeyBooks) for (const unit of book.units) {
      for (const plan of planUnit(book.id, unit)) {
        const spot = plan.find((step) => step.kind === "spot");
        if (!spot || spot.kind !== "spot") continue;
        spots += 1;
        const wrong = spot.tokens.map((token, index) => (token.wrong ? index : -1)).filter((index) => index >= 0);
        if (wrong[wrong.length - 1] === spot.tokens.length - 1) atEnd += 1;
        if (wrong[0] === 0) atStart += 1;
      }
    }
    expect(spots).toBeGreaterThan(300);
    expect(atEnd / spots).toBeLessThan(0.15);
    expect(atStart / spots).toBeLessThan(0.15);
  });
});
