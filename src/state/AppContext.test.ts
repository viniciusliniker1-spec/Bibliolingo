import { describe, expect, it } from "vitest";
import { appReducer } from "./AppContext";
import { initialState } from "./initialState";

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
});
