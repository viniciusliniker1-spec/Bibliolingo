import { buildHistoricalUnits, type HistoricalLessonSeed, type HistoricalUnitSeed } from "../historical/buildHistoricalUnits";
import type { Unit } from "../../types/content";

export type ExpansionTopic = [
  title: string,
  label: string,
  startChapter: number,
  endChapter: number,
  teaching: string,
  formation: string
];

export interface ExpansionUnit {
  id: string;
  title: string;
  subtitle: string;
  chapters: number[];
  topics: [ExpansionTopic, ExpansionTopic, ExpansionTopic, ExpansionTopic];
}

export function chapterRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function buildExpansionUnits(
  bookId: string,
  bookTitle: string,
  units: ExpansionUnit[]
): Unit[] {
  const seeds: HistoricalUnitSeed[] = units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    subtitle: unit.subtitle,
    chapters: unit.chapters,
    lessons: unit.topics.map((topic, index): HistoricalLessonSeed => {
      const [title, label, startChapter, endChapter, teaching, formation] = topic;
      const distractors = unit.topics.filter((_, topicIndex) => topicIndex !== index).map((item) => item[0]);
      const [d1, d2, d3] = distractors;
      return {
        title,
        reference: [label, startChapter, 1, endChapter],
        concept: [unit.id + "-c" + String(index + 1).padStart(2, "0"), title],
        teaching,
        formation,
        question: [
          "Qual é a ênfase central de " + label + "?",
          title,
          d1,
          d2,
          d3,
          teaching
        ],
        fill: [
          "A passagem estudada destaca ",
          title,
          ".",
          d1,
          d2,
          d3,
          formation
        ]
      };
    })
  }));

  return buildHistoricalUnits(bookId, bookTitle, seeds);
}
