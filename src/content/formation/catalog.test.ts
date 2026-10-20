import { describe, expect, it } from "vitest";
import {
  formationActivityUnlocked,
  formationContent,
  formationLessonById,
  formationQuestionById,
  formationQuestionsForActivity,
  nextFormationActivityId,
  orderedFormationActivityIds
} from "./catalog";

describe("conteúdo de formação pastoral", () => {
  it("preserva as seis matérias, 58 lições e 174 questões únicas", () => {
    expect(formationContent.subjects).toHaveLength(6);
    expect(formationContent.lessons).toHaveLength(58);
    expect(formationQuestionById.size).toBe(174);
    expect(new Set(formationContent.lessons.map((lesson) => lesson.id)).size).toBe(58);
    expect(formationContent.subjects.map((subject) => subject.lessonIds.length)).toEqual([
      8, 16, 10, 6, 8, 10
    ]);
  });

  it("mantém ensino, resposta inequívoca, explicação e fonte em cada lição", () => {
    for (const lesson of formationContent.lessons) {
      expect(lesson.understand.length).toBeGreaterThan(0);
      expect(lesson.application.length).toBeGreaterThan(10);
      expect(lesson.confusion.length).toBeGreaterThan(10);
      expect(lesson.summary.length).toBeGreaterThan(10);
      expect(lesson.questions).toHaveLength(3);
      expect(lesson.source.title.length).toBeGreaterThan(3);
      for (const question of lesson.questions) {
        expect(question.options.some((option) => option.id === question.correctOptionId)).toBe(true);
        expect(question.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it("liga provas e simulado ao banco sem duplicar conteúdo", () => {
    for (const subject of formationContent.subjects) {
      expect(formationQuestionsForActivity(subject.examId)).toHaveLength(
        subject.examQuestionIds.length
      );
      expect(subject.examQuestionIds.length).toBeGreaterThanOrEqual(10);
    }
    expect(formationContent.finalExam.questionIds).toHaveLength(30);
    expect(formationQuestionsForActivity(formationContent.finalExam.id)).toHaveLength(30);
  });

  it("desbloqueia a segunda jornada sequencialmente", () => {
    const first = orderedFormationActivityIds[0];
    const second = orderedFormationActivityIds[1];
    expect(formationActivityUnlocked(first, [], [])).toBe(true);
    expect(formationActivityUnlocked(second, [], [])).toBe(false);
    expect(formationActivityUnlocked(second, [first], [])).toBe(true);
    expect(nextFormationActivityId([], [])).toBe(first);
    expect(formationLessonById.has(first)).toBe(true);
  });
});
