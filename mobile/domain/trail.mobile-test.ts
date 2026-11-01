import { describe, expect, it } from "vitest";
import { journeyBooks, orderedActivityIds } from "../../src/content/catalog";
import { buildTrailModel } from "./trailModel";
import { detectProgressEvent, fillPhrase, nextReaction } from "./lumiBehavior";
import { LUMI_RULES } from "./lumiPhrases";

const genesis = journeyBooks[0];
const exodus = journeyBooks[1];
const genesisIds = genesis.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);

function model(completed: string[], book = genesis, mode: "canonical" | "individual" = "canonical") {
  const lessons = completed.filter((id) => !id.endsWith("checkpoint"));
  const checkpoints = completed.filter((id) => id.endsWith("checkpoint"));
  return buildTrailModel({ book, orderedActivityIds, completedLessonIds: lessons, completedCheckpointIds: checkpoints, mode, width: 390 });
}

describe("trilha do livro", () => {
  it("marca concluídas, a atual e as bloqueadas na jornada", () => {
    const trail = model(genesisIds.slice(0, 2));
    expect(trail.nodes.slice(0, 2).every((node) => node.state === "done")).toBe(true);
    expect(trail.current?.id).toBe(genesisIds[2]);
    expect(trail.nodes.slice(3).every((node) => node.state === "locked")).toBe(true);
    expect(trail.completed).toBe(2);
    expect(trail.total).toBe(genesisIds.length);
    expect(trail.currentUnit?.index).toBe(1);
  });

  it("não inventa próxima atividade em livro fora da posição da jornada", () => {
    const trail = model([], exodus);
    expect(trail.current).toBeUndefined();
    expect(trail.nodes.every((node) => node.state === "locked")).toBe(true);
    expect(trail.units.every((unit) => unit.locked)).toBe(true);
  });

  it("no estudo individual libera o início do livro escolhido", () => {
    const trail = model([], exodus, "individual");
    expect(trail.current?.id).toBe(exodus.units[0].lessons[0].id);
    expect(trail.nodes.filter((node) => node.state === "current")).toHaveLength(1);
  });

  it("posiciona os nós em ordem, dentro da tela, e desenha os caminhos", () => {
    const trail = model(genesisIds.slice(0, 3));
    for (let i = 1; i < trail.nodes.length; i += 1) expect(trail.nodes[i].y).toBeGreaterThan(trail.nodes[i - 1].y);
    expect(trail.nodes.every((node) => node.x - node.size / 2 >= 0 && node.x + node.size / 2 <= 390)).toBe(true);
    expect(trail.height).toBeGreaterThan(trail.nodes[trail.nodes.length - 1].y);
    expect(trail.pathAll.startsWith("M")).toBe(true);
    expect(trail.pathDone.startsWith("M")).toBe(true);
    expect(model([]).pathDone).toBe("");
  });

  it("identifica checkpoints e numera as lições da unidade", () => {
    const trail = model([]);
    const firstUnit = trail.nodes.filter((node) => node.unitIndex === 0);
    expect(firstUnit[firstUnit.length - 1].checkpoint).toBe(true);
    expect(firstUnit[0].lessonNumber).toBe(1);
    expect(trail.units[0].chaptersLabel).toMatch(/^Gênesis 1/);
    expect(trail.units[0].inline).toBe(false);
    expect(trail.units.slice(1).every((unit) => unit.inline)).toBe(true);
    // a Lumi (≈180 px acima do nó) cabe entre cada divisor e o 1º nó da unidade
    for (const unit of trail.units.slice(1)) {
      const firstNode = trail.nodes.find((node) => node.unitIndex === unit.index - 1)!;
      expect(firstNode.y - 180).toBeGreaterThan(unit.y + 92);
    }
    expect(trail.nodes[0].y - 180).toBeGreaterThanOrEqual(0);
  });
});

describe("motor de comportamento da Lumi", () => {
  it("preenche variáveis e mantém as desconhecidas visíveis", () => {
    expect(fillPhrase("Oi, {nome}! {x}", { nome: "Ana" })).toBe("Oi, Ana! {x}");
  });

  it("alterna as frases de cada evento e escolhe a animação da regra", () => {
    const vars = { nome: "Ana", licao: "Caim e Abel", livro: "Gênesis", dias: 3, faltam: 2, caps: "Gênesis 4–11", minutos: 8 };
    const first = nextReaction("concluir", {}, vars, LUMI_RULES);
    const second = nextReaction("concluir", first.rotation, vars, LUMI_RULES);
    expect(first.animation).toBe("pular");
    expect(first.text).not.toBe(second.text);
    expect(first.text).not.toMatch(/\{\w+\}/);
    expect(nextReaction("parado", {}, vars, LUMI_RULES).animation).toBe("dormir");
    expect(nextReaction("parado", {}, vars, LUMI_RULES).returnAfterMs).toBeUndefined();
  });

  it("remove variáveis ausentes sem deixar marcadores na fala", () => {
    const reaction = nextReaction("abrir", {}, {}, LUMI_RULES);
    expect(reaction.text).not.toMatch(/[{}]/);
  });

  it("todas as regras têm frases e animações conhecidas", () => {
    const known = ["acenar", "pular", "trofeu", "dormir", "ler", "ensinar"];
    for (const rule of Object.values(LUMI_RULES)) {
      expect(rule.phrases.length).toBeGreaterThan(0);
      expect(known).toContain(rule.animation);
    }
  });

  it("converte mudanças de progresso em eventos", () => {
    const base = { lessons: 3, checkpoints: 0, streak: 6 };
    expect(detectProgressEvent(undefined, base)).toBeUndefined();
    expect(detectProgressEvent(base, base)).toBeUndefined();
    expect(detectProgressEvent(base, { ...base, lessons: 4 })).toBe("concluir");
    expect(detectProgressEvent(base, { ...base, checkpoints: 1 })).toBe("unidade");
    expect(detectProgressEvent(base, { ...base, lessons: 4, streak: 7 })).toBe("sequencia");
  });
});
