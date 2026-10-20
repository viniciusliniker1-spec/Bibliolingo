import { describe, expect, it } from "vitest";
import { validatePrerequisiteGraph } from "./prerequisites";

describe("grafo curricular de pré-requisitos", () => {
  it("aceita grafo acíclico com referências conhecidas", () => {
    expect(validatePrerequisiteGraph({b:["a"],c:["b"]},new Set(["a","b","c"]))).toEqual({
      valid:true,cycles:[],unknownConceptIds:[],selfReferences:[]
    });
  });

  it("detecta ciclos, autorreferências e conceitos inexistentes", () => {
    const result=validatePrerequisiteGraph({a:["b"],b:["a"],c:["c","missing"]},new Set(["a","b","c"]));
    expect(result.valid).toBe(false);
    expect(result.cycles.length).toBeGreaterThan(0);
    expect(result.selfReferences).toContain("c");
    expect(result.unknownConceptIds).toContain("missing");
  });
});
