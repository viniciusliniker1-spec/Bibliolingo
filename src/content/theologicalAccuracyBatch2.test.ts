import { describe, expect, it } from "vitest";
import { journeyBooks } from "./catalog";

const content = JSON.stringify(journeyBooks);

describe("editorial accuracy safeguards — batch 2", () => {
  it("keeps Romans 1 inside Paul's universal argument", () => {
    expect(content).toContain("O argumento continua em Romanos 2");
    expect(content).toContain("todos à necessidade da graça");
  });

  it("adds context and pastoral limits to disputed household and sexuality passages", () => {
    expect(content).toContain("Termos gregos debatidos exigem cuidado lexical e histórico");
    expect(content).toContain("não legitimam escravidão, abuso ou coerção");
    expect(content).toContain("não pode sustentar hostilidade contra o povo judeu");
  });

  it("does not sanitize slavery in Philemon", () => {
    expect(content).toContain("sistema escravista romano");
    expect(content).toContain("não contém uma abolição jurídica explícita");
    expect(content).toContain("não é retorno forçado a uma relação opressiva");
  });

  it("gives every enriched lesson traceable source identifiers", () => {
    for (const book of journeyBooks) {
      for (const unit of book.units) {
        const ids = new Set(unit.sources.map((source) => source.id));
        expect(ids.has("sbl-bible-odyssey")).toBe(true);
        expect(ids.has("wesley-center-online")).toBe(true);
        for (const lesson of unit.lessons) {
          for (const step of lesson.steps) {
            if (step.type !== "learn") continue;
            expect(step.sourceIds?.length).toBeGreaterThan(0);
            expect(step.sourceIds?.every((id) => ids.has(id))).toBe(true);
          }
        }
      }
    }
  });
});
