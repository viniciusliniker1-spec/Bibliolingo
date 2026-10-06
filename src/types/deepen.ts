import type { BibleReference, Exercise, StudyBlock } from "./content";

export interface DeepenLesson {
  id: string;
  contentVersion: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  objective: string;
  baseText: BibleReference;
  blocks: StudyBlock[];
  exercises: Exercise[];
}

export interface DeepenCheckpoint {
  id: string;
  contentVersion: number;
  title: string;
  subtitle: string;
  passAccuracy: number;
  exercises: Exercise[];
}

export interface DeepenUnit {
  id: string;
  contentVersion: number;
  title: string;
  subtitle: string;
  bookId: string;
  lessons: DeepenLesson[];
  checkpoint: DeepenCheckpoint;
}
