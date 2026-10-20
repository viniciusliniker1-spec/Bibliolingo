import type {
  BibleReference,
  Exercise,
  LearningStep,
  Lesson,
  MultipleChoiceExercise,
  Unit
} from "../../types/content";

export type RefSeed = [
  label: string,
  startChapter: number,
  startVerse?: number,
  endChapter?: number,
  endVerse?: number
];

export type QuizSeed = [
  prompt: string,
  options: [string, string, string, string],
  correct: number,
  explanation: string
];

export type FillSeed = [
  before: string,
  after: string,
  options: [string, string, string, string],
  correct: number,
  explanation: string
];

export interface PentateuchLessonSeed {
  title: string;
  subtitle: string;
  reference: RefSeed;
  concept: [id: string, title: string];
  teaching: string;
  application: string;
  keyPoints: [string, string];
  quiz: QuizSeed;
  fill: FillSeed;
}

export interface PentateuchUnitSeed {
  id: string;
  title: string;
  subtitle: string;
  chapters: number[];
  lessons: PentateuchLessonSeed[];
}

function makeReference(bookId: string, seed: RefSeed): BibleReference {
  const [label, startChapter, startVerse, endChapter, endVerse] = seed;
  return { bookId, label, startChapter, startVerse, endChapter, endVerse };
}

export function buildPentateuchUnits(
  bookId: string,
  bookTitle: string,
  seeds: PentateuchUnitSeed[]
): Unit[] {
  return seeds.map((seed, unitIndex) => {
    const difficulty: Exercise["difficulty"] =
      unitIndex < 2 ? "easy" : unitIndex < 4 ? "medium" : "hard";
    const lessons: Lesson[] = seed.lessons.map((item, lessonIndex) => {
      const id = seed.id + "-l" + String(lessonIndex + 1).padStart(2, "0");
      const reference = makeReference(bookId, item.reference);
      const firstLearning: LearningStep = {
        id: id + "-s01",
        type: "learn",
        title: item.subtitle,
        body: item.teaching,
        layer: "biblical-text",
        keyPoints: item.keyPoints,
        reference
      };
      const [prompt, optionTexts, correct, explanation] = item.quiz;
      const quizId = id + "-q01";
      const quiz: MultipleChoiceExercise = {
        id: quizId,
        type: "multiple-choice",
        prompt,
        options: optionTexts.map((text, index) => ({
          id: quizId + "-a" + (index + 1),
          text
        })),
        correctOptionId: quizId + "-a" + (correct + 1),
        explanation,
        reference,
        conceptId: item.concept[0],
        difficulty,
        objective: "Compreender " + item.concept[1].toLocaleLowerCase("pt-BR")
      };
      const secondLearning: LearningStep = {
        id: id + "-s02",
        type: "learn",
        title: "Do texto para a formação",
        body:
          item.application +
          " Antes de responder, diferencie a prática de Israel antigo, o princípio teológico comunicado no contexto e uma aplicação cristã responsável.",
        layer: "application",
        keyPoints: [
          "Conceito central: " + item.concept[1],
          "Base textual: " + reference.label
        ],
        reference
      };
      const [before, after, fillOptions, fillCorrect, fillExplanation] = item.fill;
      const fillId = id + "-q02";
      const fill: Exercise = {
        id: fillId,
        type: "fill-choice",
        prompt: "Complete a ideia conforme a passagem",
        sentenceBefore: before,
        sentenceAfter: after,
        options: fillOptions.map((text, index) => ({
          id: fillId + "-a" + (index + 1),
          text
        })),
        correctOptionId: fillId + "-a" + (fillCorrect + 1),
        explanation: fillExplanation,
        reference,
        conceptId: item.concept[0],
        difficulty,
        objective: "Consolidar o princípio estudado no contexto bíblico"
      };

      return {
        id,
        contentVersion: 1,
        title: item.title,
        subtitle: item.subtitle,
        estimatedMinutes: 8,
        references: [reference],
        conceptIds: [item.concept[0]],
        steps: [firstLearning, quiz, secondLearning, fill]
      };
    });

    const checkpointExercises: Exercise[] = lessons.map((lesson, index) => {
      const source = lesson.steps.find(
        (step): step is MultipleChoiceExercise => step.type === "multiple-choice"
      );
      if (!source) throw new Error("Lição sem questão objetiva: " + lesson.id);
      const id = seed.id + "-checkpoint-q" + String(index + 1).padStart(2, "0");
      const correctIndex = source.options.findIndex(
        (option) => option.id === source.correctOptionId
      );
      return {
        ...source,
        id,
        options: source.options.map((option, optionIndex) => ({
          id: id + "-a" + (optionIndex + 1),
          text: option.text
        })),
        correctOptionId: id + "-a" + (correctIndex + 1),
        difficulty: "hard",
        objective: "Demonstrar domínio da unidade: " + source.objective
      };
    });

    return {
      id: seed.id,
      contentVersion: 1,
      title: seed.title,
      subtitle: seed.subtitle,
      bookId,
      chapters: seed.chapters,
      concepts: seed.lessons.map((lesson) => ({
        id: lesson.concept[0],
        title: lesson.concept[1],
        importance: 3
      })),
      lessons,
      checkpoint: {
        id: seed.id + "-checkpoint",
        contentVersion: 1,
        title: "Checkpoint: " + seed.title,
        subtitle: "Integre os conceitos desta unidade de " + bookTitle + ".",
        passAccuracy: 0.75,
        exercises: checkpointExercises
      },
      sources: [
        {
          id: seed.id + "-biblical-text",
          title: "Livro de " + bookTitle,
          locator: seed.lessons.map((lesson) => lesson.reference[0]).join("; ")
        }
      ]
    };
  });
}
