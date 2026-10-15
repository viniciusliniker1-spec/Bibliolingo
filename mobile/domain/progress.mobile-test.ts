import { describe, expect, it } from "vitest";
import { GAMIFICATION } from "../../src/config/gamification";
import {
  createInitialProgress,
  createLessonSession,
  finishActivity,
  recordAnswer
} from "./progress";

describe("progresso mobile", () => {
  it("inicia sem XP e sem progresso concluído", () => {
    expect(createInitialProgress()).toMatchObject({
      schemaVersion: 1,
      xp: 0,
      streak: 0,
      completedLessonIds: [],
      completedCheckpointIds: []
    });
  });

  it("não conta a mesma questão duas vezes", () => {
    const session = createLessonSession("genesis-u01-l01");
    const answered = recordAnswer(session, "q01", true);
    const duplicate = recordAnswer(answered, "q01", false);

    expect(duplicate.correct).toBe(1);
    expect(duplicate.incorrect).toBe(0);
    expect(duplicate.answeredQuestionIds).toEqual(["q01"]);
  });

  it("conclui uma lição perfeita com os valores centrais de XP", () => {
    const result = finishActivity(
      createInitialProgress(),
      "genesis-u01-l01",
      2,
      2,
      false,
      0.8,
      new Date(2026, 9, 15, 12)
    );

    expect(result.passed).toBe(true);
    expect(result.xpEarned).toBe(
      2 * GAMIFICATION.xp.exercise
      + GAMIFICATION.xp.lesson
      + GAMIFICATION.xp.perfectLesson
    );
    expect(result.progress.completedLessonIds).toContain("genesis-u01-l01");
    expect(result.progress.streak).toBe(1);
  });

  it("só desbloqueia a conclusão do checkpoint ao atingir a precisão mínima", () => {
    const failed = finishActivity(
      createInitialProgress(),
      "genesis-u01-cp",
      5,
      3,
      true,
      0.8,
      new Date(2026, 9, 15, 12)
    );
    const passed = finishActivity(
      createInitialProgress(),
      "genesis-u01-cp",
      5,
      4,
      true,
      0.8,
      new Date(2026, 9, 15, 12)
    );

    expect(failed.passed).toBe(false);
    expect(failed.progress.completedCheckpointIds).not.toContain("genesis-u01-cp");
    expect(passed.passed).toBe(true);
    expect(passed.progress.completedCheckpointIds).toContain("genesis-u01-cp");
  });

  it("mantém a sequência quando há atividade no mesmo dia", () => {
    const first = finishActivity(
      createInitialProgress(),
      "genesis-u01-l01",
      1,
      1,
      false,
      0.8,
      new Date(2026, 9, 15, 8)
    );
    const second = finishActivity(
      first.progress,
      "genesis-u01-l02",
      1,
      1,
      false,
      0.8,
      new Date(2026, 9, 15, 20)
    );

    expect(second.progress.streak).toBe(1);
    expect(second.progress.bestStreak).toBe(1);
  });
});
