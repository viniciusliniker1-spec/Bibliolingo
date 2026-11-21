import { describe, expect, it } from "vitest";
import type { LumiContext, LumiRuleSet } from "./lumiBehavior";
import { bookGroup, matches, newMemory, quickReplies, think, TAP_WINDOW_MS, type LumiMemory } from "./lumiBrain";
import { LUMI_RULES } from "./lumiPhrases";

/** Gerador pseudoaleatório determinístico para os testes. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const context: LumiContext = { streak: 3, gap: 0, bookId: "genesis" };
const vars = { nome: "Ana", licao: "A criação", livro: "Gênesis", caps: "Gênesis 1–3", dias: 3, faltam: 2, minutos: 8 };
const at = (hour: number, day = 3) => new Date(2026, 10, 15 + day, hour, 0, 0); // 15/nov/2026 é domingo

const tiny = (phrases: LumiRuleSet["toque"]["phrases"]): LumiRuleSet => ({ ...LUMI_RULES, toque: { animation: "pular", phrases } });

describe("sacola de falas", () => {
  it("não repete a mesma fala duas vezes seguidas e usa todas antes de repetir", () => {
    const rules = tiny(["A", "B", "C", "D"]);
    const rng = seeded(1);
    let memory: LumiMemory = newMemory();
    let previous = "";
    for (let round = 0; round < 3; round += 1) {
      const seen = new Set<string>();
      for (let i = 0; i < 4; i += 1) {
        const result = think({ event: "toque", memory, vars, context, rules, rng, now: new Date(2026, 10, 18, 12, 0, round * 60 + i * 30) });
        memory = result.memory;
        expect(result.reaction.text).not.toBe(previous);
        previous = result.reaction.text;
        seen.add(result.reaction.text);
      }
      expect(seen.size).toBe(4);
    }
  });

  it("com uma única fala possível, repete sem travar", () => {
    const rules = tiny(["Só eu"]);
    let memory = newMemory();
    for (let i = 0; i < 3; i += 1) {
      const result = think({ event: "toque", memory, vars, context, rules, now: new Date(2026, 10, 18, 12, 0, i * 30) });
      memory = result.memory;
      expect(result.reaction.text).toBe("Só eu");
    }
  });
});

describe("contexto", () => {
  it("avalia hora (com virada de dia), dia da semana, ofensiva, tempo fora, livro e grupo", () => {
    expect(matches({ hours: [5, 12] }, context, at(8))).toBe(true);
    expect(matches({ hours: [5, 12] }, context, at(14))).toBe(false);
    expect(matches({ hours: [22, 5] }, context, at(23))).toBe(true);
    expect(matches({ hours: [22, 5] }, context, at(3))).toBe(true);
    expect(matches({ hours: [22, 5] }, context, at(12))).toBe(false);
    expect(matches({ weekdays: [0] }, context, new Date(2026, 10, 15, 10))).toBe(true);
    expect(matches({ weekdays: [0] }, context, new Date(2026, 10, 16, 10))).toBe(false);
    expect(matches({ streak: [7, 99] }, context, at(8))).toBe(false);
    expect(matches({ streak: [2, 99] }, context, at(8))).toBe(true);
    expect(matches({ gap: [2, 99] }, { ...context, gap: 3 }, at(8))).toBe(true);
    expect(matches({ books: ["genesis"] }, context, at(8))).toBe(true);
    expect(matches({ books: ["exodus"] }, context, at(8))).toBe(false);
    expect(matches({ groups: ["pentateuco"] }, context, at(8))).toBe(true);
    expect(matches({ groups: ["cartas"] }, context, at(8))).toBe(false);
    expect(matches({ lowHearts: true }, { ...context, hearts: 1, maxHearts: 5 }, at(8))).toBe(true);
    expect(matches({ lowHearts: true }, { ...context, hearts: 4, maxHearts: 5 }, at(8))).toBe(false);
    expect(matches({ lowHearts: true }, context, at(8))).toBe(false);
    expect(matches({ goalDone: true }, { ...context, goalRatio: 1 }, at(8))).toBe(true);
    expect(matches(undefined, context, at(8))).toBe(true);
  });

  it("classifica os 66 livros em grupos", () => {
    expect(bookGroup("psalms")).toBe("poeticos");
    expect(bookGroup("matthew")).toBe("evangelhos");
    expect(bookGroup("acts")).toBe("atos");
    expect(bookGroup("revelation")).toBe("apocalipse");
    expect(bookGroup("naoexiste")).toBeUndefined();
  });

  it("prefere a fala que combina com o momento", () => {
    const rules = tiny([{ text: "Bom dia!", when: { hours: [5, 12] } }, "Genérica 1", "Genérica 2"]);
    let morning = 0;
    for (let i = 0; i < 60; i += 1) {
      const result = think({ event: "toque", memory: newMemory(), vars, context, rules, rng: seeded(i + 7), now: at(8) });
      if (result.reaction.text === "Bom dia!") morning += 1;
    }
    expect(morning).toBeGreaterThan(30); // peso 3 contra 1 + 1: ~60%
    for (let i = 0; i < 20; i += 1) {
      expect(think({ event: "toque", memory: newMemory(), vars, context, rules, rng: seeded(i), now: at(15) }).reaction.text).not.toBe("Bom dia!");
    }
  });

  it("só usa falas cujas variáveis existem (nunca deixa frase quebrada)", () => {
    const rules = tiny(["Hoje é dia de “{licao}”.", "Oi, {nome}!"]);
    for (let i = 0; i < 20; i += 1) {
      const result = think({ event: "toque", memory: newMemory(), vars: { nome: "Ana" }, context, rules, rng: seeded(i), now: at(12) });
      expect(result.reaction.text).toBe("Oi, Ana!");
    }
    // se nada for resolvível, ainda responde sem deixar chaves
    const broken = think({ event: "toque", memory: newMemory(), vars: {}, context, rules: tiny(["Dia de {licao}."]), now: at(12) });
    expect(broken.reaction.text).not.toMatch(/[{}]/);
  });

  it("volta depois de dias fora vira “saudade”", () => {
    const result = think({ event: "abrir", memory: newMemory(), vars: { ...vars, foradias: 4 }, context: { ...context, gap: 4 }, rules: LUMI_RULES, now: at(10) });
    expect(result.reaction.event).toBe("saudade");
    expect(think({ event: "abrir", memory: newMemory(), vars, context, rules: LUMI_RULES, now: at(10) }).reaction.event).toBe("abrir");
  });

  it("a curiosidade do livro atual aparece com prioridade", () => {
    let own = 0;
    for (let i = 0; i < 40; i += 1) {
      const result = think({ event: "curiosidade", memory: newMemory(), vars, context: { ...context, bookId: "esther" }, rules: LUMI_RULES, rng: seeded(i), now: at(12) });
      if (result.reaction.text.includes("Ester")) own += 1;
    }
    expect(own).toBeGreaterThan(20);
  });
});

describe("toques repetidos", () => {
  it("cutucar demais vira cócegas e depois tontura, que zera a contagem", () => {
    let memory = newMemory();
    const events: string[] = [];
    for (let i = 0; i < 9; i += 1) {
      const result = think({ event: "toque", memory, vars, context, rules: LUMI_RULES, rng: seeded(i), now: new Date(2026, 10, 18, 12, 0, 0, i * 400) });
      memory = result.memory;
      events.push(result.reaction.event);
    }
    expect(events.slice(0, 3)).toEqual(["toque", "toque", "toque"]);
    expect(events[3]).toBe("cocegas");
    expect(events[6]).toBe("tonta");
    expect(events[7]).toBe("toque");
  });

  it("toques espaçados não contam como cutucada", () => {
    let memory = newMemory();
    for (let i = 0; i < 8; i += 1) {
      const result = think({ event: "toque", memory, vars, context, rules: LUMI_RULES, now: new Date(2026, 10, 18, 12, 0, 0, i * (TAP_WINDOW_MS + 500)) });
      memory = result.memory;
      expect(result.reaction.event).toBe("toque");
    }
  });
});

describe("respostas rápidas", () => {
  it("oferecem conversa depois de um toque e sugerem estudar quando dá", () => {
    expect(quickReplies("toque", { canStudy: false }).map((reply) => reply.label)).toEqual(["Me anima", "Curiosidade", "Piada"]);
    const withStudy = quickReplies("piada", { canStudy: true });
    expect(withStudy.map((reply) => reply.label)).toEqual(["Me anima", "Curiosidade", "Piada", "Bora estudar"]);
    expect(withStudy[3].action).toEqual({ kind: "study" });
    expect(withStudy[0].action).toEqual({ kind: "event", event: "anima" });
  });

  it("não aparecem em celebrações, erros ou no sono", () => {
    for (const event of ["concluir", "unidade", "sequencia", "erro", "parado", "tonta", "abrir"] as const) {
      expect(quickReplies(event, { canStudy: true })).toEqual([]);
    }
  });
});
