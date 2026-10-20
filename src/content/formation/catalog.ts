import rawContent from "./formationData.json";
import { bibleBooks } from "../bible/catalog";
import type { BibleReference, Exercise } from "../../types/content";
import type {
  FormationContent,
  FormationLesson,
  FormationQuestion,
  FormationSubject
} from "../../types/formation";

export const formationContent = rawContent as FormationContent;
export const formationLessonById = new Map(
  formationContent.lessons.map((lesson) => [lesson.id, lesson])
);
export const formationQuestionById = new Map(
  formationContent.lessons.flatMap((lesson) =>
    lesson.questions.map((question) => [question.id, question] as const)
  )
);
export const formationSubjectById = new Map(
  formationContent.subjects.map((subject) => [subject.id, subject])
);

export const orderedFormationActivityIds = [
  ...formationContent.subjects.flatMap((subject) => [...subject.lessonIds, subject.examId]),
  formationContent.finalExam.id
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[.ªº]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formationActivityTitle(activityId: string): string {
  const lesson = formationLessonById.get(activityId);
  if (lesson) return lesson.title;
  const subject = formationContent.subjects.find((item) => item.examId === activityId);
  if (subject) return "Prova · " + subject.shortTitle;
  if (activityId === formationContent.finalExam.id) return formationContent.finalExam.title;
  return "Atividade";
}

export function formationSubjectForActivity(activityId: string): FormationSubject | undefined {
  const lesson = formationLessonById.get(activityId);
  return lesson
    ? formationSubjectById.get(lesson.subjectId)
    : formationContent.subjects.find(
        (subject) => subject.examId === activityId || subject.examQuestionIds.includes(activityId)
      );
}

export function formationQuestionsForActivity(activityId: string): FormationQuestion[] {
  const lesson = formationLessonById.get(activityId);
  if (lesson) return lesson.questions;
  const subject = formationContent.subjects.find((item) => item.examId === activityId);
  const ids =
    subject?.examQuestionIds ??
    (activityId === formationContent.finalExam.id ? formationContent.finalExam.questionIds : []);
  return ids
    .map((id) => formationQuestionById.get(id))
    .filter((question): question is FormationQuestion => Boolean(question));
}

export function formationReference(label: string): BibleReference | undefined {
  const first = label.split("|")[0].trim();
  const match = first.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)/);
  if (!match) return undefined;
  const bookName = normalize(match[1]);
  const book = bibleBooks.find((item) =>
    [item.name, item.abbreviation, item.id, item.osis]
      .map(normalize)
      .includes(bookName)
  );
  if (!book) return undefined;
  return {
    bookId: book.id,
    startChapter: Number(match[2]),
    startVerse: Number(match[3]),
    label
  };
}

export function formationQuestionToExercise(
  question: FormationQuestion,
  lesson: FormationLesson,
  exam = false
): Exercise {
  const reference =
    formationReference(lesson.bibleReferences[0] ?? "") ?? {
      bookId: "genesis",
      startChapter: 1,
      startVerse: 1,
      label: lesson.bibleReferences.join(" · ") || "Referências da lição"
    };
  const difficulty = exam ? "hard" : "medium";
  const base = {
    id: question.id,
    prompt: question.prompt,
    objective: "Demonstrar compreensão de " + lesson.title,
    explanation: question.explanation,
    reference,
    conceptId: lesson.id,
    difficulty
  } as const;
  if (question.type === "fill-choice") {
    const [sentenceBefore, sentenceAfter = ""] = question.prompt.split("____");
    return {
      ...base,
      type: "fill-choice",
      prompt: "Complete a frase",
      sentenceBefore,
      sentenceAfter,
      options: question.options,
      correctOptionId: question.correctOptionId
    };
  }
  return {
    ...base,
    type: "multiple-choice",
    options: question.options,
    correctOptionId: question.correctOptionId
  };
}

export function formationActivityUnlocked(
  activityId: string,
  completedLessonIds: string[],
  completedCheckpointIds: string[]
): boolean {
  const index = orderedFormationActivityIds.indexOf(activityId);
  if (index < 0) return false;
  if (index === 0) return true;
  const completed = new Set([...completedLessonIds, ...completedCheckpointIds]);
  return completed.has(orderedFormationActivityIds[index - 1]);
}

export function nextFormationActivityId(
  completedLessonIds: string[],
  completedCheckpointIds: string[]
): string {
  const completed = new Set([...completedLessonIds, ...completedCheckpointIds]);
  return (
    orderedFormationActivityIds.find((id) => !completed.has(id)) ??
    formationContent.finalExam.id
  );
}
