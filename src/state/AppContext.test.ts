import { describe, expect, it } from "vitest";
import { appReducer } from "./AppContext";
import { initialState } from "./initialState";
import { createBookReadingPlan, createEnrollment } from "../domain/studyPlans";

describe("estado do leitor bíblico", () => {
  it("salva e remove notas e marcações de forma determinística", () => {
    const annotation = {
      id: "almeida-1819:John:3:16",
      translationId: "almeida-1819",
      bookOsis: "John",
      bookName: "João",
      chapter: 3,
      verse: 16,
      note: "Nota de estudo",
      bookmarked: true,
      updatedAt: "2026-10-03T00:00:00.000Z"
    };
    const saved = appReducer(initialState, { type: "UPSERT_BIBLE_ANNOTATION", annotation });
    expect(saved.bibleAnnotations[annotation.id]).toEqual(annotation);

    const removed = appReducer(saved, {
      type: "UPSERT_BIBLE_ANNOTATION",
      annotation: { ...annotation, note: "", bookmarked: false }
    });
    expect(removed.bibleAnnotations[annotation.id]).toBeUndefined();
  });

  it("permite alterar objetivo e meta diária depois do onboarding", () => {
    const next = appReducer(initialState, {
      type: "SET_PROFILE_PREFERENCES",
      goal: "teach",
      dailyGoal: 150
    });
    expect(next.profile.goal).toBe("teach");
    expect(next.profile.dailyGoal).toBe(150);
  });

  it("persiste o nível de conhecimento bíblico", () => {
    const next = appReducer(initialState, { type: "SET_KNOWLEDGE_LEVEL", level: "advanced" });
    expect(next.profile.knowledgeLevel).toBe("advanced");
  });

  it("lembra a última referência lida", () => {
    const next = appReducer(initialState, {
      type: "SET_BIBLE_LOCATION",
      location: {
        translationId: "almeida-1819",
        bookOsis: "Ps",
        chapter: 23,
        verse: 1
      }
    });
    expect(next.bibleLocation).toMatchObject({ bookOsis: "Ps", chapter: 23, verse: 1 });
  });
  it("registra desempenho e vocabulário grego sem criar XP paralelo", () => {
    const answered = appReducer(initialState, {
      type: "ANSWER",
      questionId: "greek-u01-l01-q01",
      lessonId: "greek-u01-l01",
      conceptId: "greek-alphabet",
      difficulty: "easy",
      correct: true,
      mode: "greek"
    });
    const marked = appReducer(answered, { type: "MARK_GREEK_LEXEME", lexemeId: "g3056" });
    expect(marked.greekSkills["greek-alphabet"]?.correct).toBe(1);
    expect(marked.learnedGreekLexemeIds).toEqual(["g3056"]);
    expect(marked.xp).toBeGreaterThan(initialState.xp);
  });
  it("persiste inscrição e evita evento de conclusão duplicado", () => {
    const enrollment=createEnrollment(createBookReadingPlan("Phlm",1),{id:"plan-1",startDate:"2026-10-18",studyWeekdays:[0]});
    const enrolled=appReducer(initialState,{type:"UPSERT_PLAN_ENROLLMENT",enrollment});
    const event={id:"completion-1",enrollmentId:enrollment.id,stepId:enrollment.stepsSnapshot[0].id,completed:true,
      occurredAt:"2026-10-18T12:00:00.000Z",localDate:"2026-10-18",timezone:"UTC"};
    const once=appReducer(enrolled,{type:"RECORD_PLAN_COMPLETION",event});
    const twice=appReducer(once,{type:"RECORD_PLAN_COMPLETION",event});
    expect(twice.planEnrollments).toHaveLength(1);
    expect(twice.planCompletionEvents).toHaveLength(1);
  });

});
