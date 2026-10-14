import { describe, expect, it } from "vitest";
import { appReducer } from "./AppContext";
import { initialState } from "./initialState";

describe("contexto da sessão de jornada", () => {
  it("persiste livro e modo ao iniciar estudo avulso", () => {
    const state = appReducer(initialState, {
      type: "START_SESSION",
      lessonId: "isaiah-u01-l01",
      journeyMode: "individual",
      journeyBookId: "isaiah"
    });

    expect(state.activeSession).toMatchObject({
      lessonId: "isaiah-u01-l01",
      journeyMode: "individual",
      journeyBookId: "isaiah",
      stepIndex: 0
    });
  });

  it("não reaproveita uma sessão avulsa como sessão canônica", () => {
    const individual = appReducer(initialState, {
      type: "START_SESSION",
      lessonId: "genesis-u01-l01",
      journeyMode: "individual",
      journeyBookId: "genesis"
    });
    const canonical = appReducer(individual, {
      type: "START_SESSION",
      lessonId: "genesis-u01-l01",
      journeyMode: "canonical"
    });

    expect(canonical.activeSession?.journeyMode).toBe("canonical");
    expect(canonical.activeSession?.journeyBookId).toBeUndefined();
  });
});
