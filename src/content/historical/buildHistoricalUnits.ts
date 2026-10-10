import type { BibleReference, Exercise, LearningStep, Lesson, MultipleChoiceExercise, Unit } from "../../types/content";

export type HistoricalRefSeed = [label: string, startChapter: number, startVerse?: number, endChapter?: number, endVerse?: number];
export type HistoricalQuestionSeed = [prompt: string, correct: string, distractor1: string, distractor2: string, distractor3: string, explanation: string];
export type HistoricalFillSeed = [before: string, correct: string, after: string, distractor1: string, distractor2: string, distractor3: string, explanation: string];

export interface HistoricalLessonSeed {
  title: string;
  reference: HistoricalRefSeed;
  concept: [id: string, title: string];
  teaching: string;
  formation: string;
  question: HistoricalQuestionSeed;
  fill: HistoricalFillSeed;
}

export interface HistoricalUnitSeed {
  id: string;
  title: string;
  subtitle: string;
  chapters: number[];
  lessons: HistoricalLessonSeed[];
}

function reference(bookId: string, seed: HistoricalRefSeed): BibleReference {
  const [label, startChapter, startVerse, endChapter, endVerse] = seed;
  return { bookId, label, startChapter, startVerse, endChapter, endVerse };
}

function choices(id: string, values: string[]) {
  return values.map((text, index) => ({ id: id + "-a" + (index + 1), text }));
}

export function buildHistoricalUnits(bookId: string, bookTitle: string, seeds: HistoricalUnitSeed[]): Unit[] {
  return seeds.map((unitSeed, unitIndex) => {
    const difficulty: Exercise["difficulty"] = unitIndex < 2 ? "easy" : unitIndex < 4 ? "medium" : "hard";
    const lessons: Lesson[] = unitSeed.lessons.map((seed, lessonIndex) => {
      const id = unitSeed.id + "-l" + String(lessonIndex + 1).padStart(2, "0");
      const ref = reference(bookId, seed.reference);
      const [prompt, correct, d1, d2, d3, explanation] = seed.question;
      const quizId = id + "-q01";
      const quiz: MultipleChoiceExercise = {
        id: quizId,
        type: "multiple-choice",
        prompt,
        options: choices(quizId, [correct, d1, d2, d3]),
        correctOptionId: quizId + "-a1",
        explanation,
        reference: ref,
        conceptId: seed.concept[0],
        difficulty,
        objective: "Compreender " + seed.concept[1].toLocaleLowerCase("pt-BR")
      };
      const [before, fillCorrect, after, fd1, fd2, fd3, fillExplanation] = seed.fill;
      const fillId = id + "-q02";
      const fill: Exercise = {
        id: fillId,
        type: "fill-choice",
        prompt: "Complete a síntese conforme a passagem",
        sentenceBefore: before,
        sentenceAfter: after,
        options: choices(fillId, [fillCorrect, fd1, fd2, fd3]),
        correctOptionId: fillId + "-a1",
        explanation: fillExplanation,
        reference: ref,
        conceptId: seed.concept[0],
        difficulty,
        objective: "Consolidar o princípio estudado em seu contexto bíblico"
      };
      const firstLearning: LearningStep = {
        id: id + "-s01",
        type: "learn",
        title: seed.title,
        body: seed.teaching,
        layer: "biblical-text",
        keyPoints: [seed.concept[1], "Base textual: " + ref.label],
        reference: ref
      };
      const secondLearning: LearningStep = {
        id: id + "-s02",
        type: "learn",
        title: "Compreender antes de aplicar",
        body: seed.formation + " A narrativa descreve pessoas reais com virtudes e falhas; descrição não significa aprovação automática de cada atitude.",
        layer: "application",
        keyPoints: ["Leia o episódio no fluxo do livro", "Diferencie texto, interpretação e aplicação"],
        reference: ref
      };
      return {
        id,
        contentVersion: 1,
        title: seed.title,
        subtitle: seed.concept[1],
        estimatedMinutes: 8,
        references: [ref],
        conceptIds: [seed.concept[0]],
        steps: [firstLearning, quiz, secondLearning, fill]
      };
    });

    const checkpointExercises: Exercise[] = lessons.map((lesson, index) => {
      const source = lesson.steps.find((step): step is MultipleChoiceExercise => step.type === "multiple-choice");
      if (!source) throw new Error("Lição sem questão objetiva: " + lesson.id);
      const id = unitSeed.id + "-checkpoint-q" + String(index + 1).padStart(2, "0");
      return {
        ...source,
        id,
        options: source.options.map((option, optionIndex) => ({ id: id + "-a" + (optionIndex + 1), text: option.text })),
        correctOptionId: id + "-a1",
        difficulty: "hard",
        objective: "Demonstrar domínio da unidade: " + source.objective
      };
    });

    return {
      id: unitSeed.id,
      contentVersion: 1,
      title: unitSeed.title,
      subtitle: unitSeed.subtitle,
      bookId,
      chapters: unitSeed.chapters,
      concepts: unitSeed.lessons.map((lesson) => ({ id: lesson.concept[0], title: lesson.concept[1], importance: 3 })),
      lessons,
      checkpoint: {
        id: unitSeed.id + "-checkpoint",
        contentVersion: 1,
        title: "Checkpoint: " + unitSeed.title,
        subtitle: "Integre os conceitos desta unidade de " + bookTitle + ".",
        passAccuracy: 0.8,
        exercises: checkpointExercises
      },
      sources: [{
        id: unitSeed.id + "-biblical-text",
        title: "Livro de " + bookTitle,
        locator: unitSeed.lessons.map((lesson) => lesson.reference[0]).join("; "),
        license: "Referências ao texto bíblico; leitor usa Almeida 1819 em domínio público",
        status: "catalogued",
        applicableUnitIds: [unitSeed.id]
      }]
    };
  });
}
