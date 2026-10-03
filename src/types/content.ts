export type Difficulty = "easy" | "medium" | "hard";
export type ContentLayer = "biblical-text" | "history" | "theology" | "application";
export type Testament = "old" | "new";

export interface BibleReference {
  bookId: string;
  startChapter: number;
  startVerse?: number;
  endChapter?: number;
  endVerse?: number;
  label: string;
}

export interface SourceReference {
  id: string;
  title: string;
  author?: string;
  locator?: string;
  url?: string;
}

export interface Concept {
  id: string;
  title: string;
  importance: 1 | 2 | 3;
}

export interface LearningStep {
  id: string;
  type: "learn";
  title: string;
  body: string;
  layer: ContentLayer;
  keyPoints?: string[];
  reference?: BibleReference;
  sourceIds?: string[];
}

interface ExerciseBase {
  id: string;
  type: "multiple-choice" | "fill-choice" | "word-blocks";
  prompt: string;
  objective: string;
  explanation: string;
  reference: BibleReference;
  conceptId: string;
  difficulty: Difficulty;
  xp?: number;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multiple-choice";
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface FillChoiceExercise extends ExerciseBase {
  type: "fill-choice";
  sentenceBefore: string;
  sentenceAfter: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface WordBlocksExercise extends ExerciseBase {
  type: "word-blocks";
  blocks: { id: string; text: string }[];
  correctOrder: string[];
}

export type Exercise = MultipleChoiceExercise | FillChoiceExercise | WordBlocksExercise;
export type LessonStep = LearningStep | Exercise;

export interface Lesson {
  id: string;
  contentVersion: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  references: BibleReference[];
  conceptIds: string[];
  steps: LessonStep[];
}

export interface Checkpoint {
  id: string;
  contentVersion: number;
  title: string;
  subtitle: string;
  passAccuracy: number;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  contentVersion: number;
  title: string;
  subtitle: string;
  bookId: string;
  chapters: number[];
  concepts: Concept[];
  lessons: Lesson[];
  checkpoint: Checkpoint;
  sources: SourceReference[];
}

export interface Book {
  id: string;
  contentVersion: number;
  title: string;
  testament: Testament;
  order: number;
  unitLoader: () => Promise<Unit[]>;
}
