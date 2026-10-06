export interface FormationOption {
  id: string;
  text: string;
}

export interface FormationQuestion {
  id: string;
  lessonId: string;
  prompt: string;
  type: "multiple-choice" | "fill-choice";
  options: FormationOption[];
  correctOptionId: string;
  explanation: string;
}

export interface FormationSource {
  title: string;
  url?: string;
  locator: string;
}

export interface FormationLesson {
  id: string;
  subjectId: string;
  title: string;
  minutes: number;
  understand: string[];
  bibleReferences: string[];
  application: string;
  confusion: string;
  summary: string;
  source: FormationSource;
  questions: FormationQuestion[];
}

export interface FormationSubject {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  lessonIds: string[];
  examId: string;
  examQuestionIds: string[];
}

export interface FormationFinalExam {
  id: string;
  title: string;
  questionIds: string[];
}

export interface FormationContent {
  contentVersion: number;
  title: string;
  edition: string;
  updatedAt: string;
  passAccuracy: number;
  disclaimer: string;
  subjects: FormationSubject[];
  lessons: FormationLesson[];
  finalExam: FormationFinalExam;
}
