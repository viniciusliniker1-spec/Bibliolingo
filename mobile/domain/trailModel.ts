import type { Unit } from "../../src/types/content";
import { isBookActivityUnlocked, isJourneyActivityUnlocked } from "../../src/domain/unlocks";

export type TrailMode = "canonical" | "individual";
export type TrailNodeState = "done" | "current" | "available" | "locked";

export interface TrailNode {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  checkpoint: boolean;
  state: TrailNodeState;
  unitIndex: number;
  /** Número da lição dentro da unidade (checkpoint = 0). */
  lessonNumber: number;
  referenceLabel?: string;
  x: number;
  y: number;
  size: number;
  /** Lado em que a Lumi deve ficar quando este for o nó atual. */
  companionSide: "left" | "right";
}

export interface TrailUnitCard {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  chaptersLabel: string;
  y: number;
  completed: number;
  total: number;
  locked: boolean;
  /** A 1ª unidade é apresentada pelo cartão do topo; as demais ganham divisor no caminho. */
  inline: boolean;
}

export interface TrailModel {
  bookId: string;
  bookTitle: string;
  shortTitle: string;
  mode: TrailMode;
  nodes: TrailNode[];
  units: TrailUnitCard[];
  height: number;
  width: number;
  completed: number;
  total: number;
  current?: TrailNode;
  currentUnit?: TrailUnitCard;
  pathAll: string;
  pathDone: string;
}

export interface TrailBook {
  id: string;
  title: string;
  shortTitle: string;
  units: Unit[];
}

export interface TrailInput {
  book: TrailBook;
  orderedActivityIds: string[];
  completedLessonIds: string[];
  completedCheckpointIds: string[];
  mode: TrailMode;
  width: number;
}

export const TRAIL_LAYOUT = {
  /** Espaço acima do 1º nó: a Lumi (balão + animação) fica ao lado dele. */
  top: 196,
  unitCardHeight: 92,
  /** Espaço entre um divisor de unidade e o 1º nó, para a Lumi não cobrir o divisor. */
  gapAfterCard: 200,
  nodeGap: 96,
  gapAfterUnit: 36,
  lessonSize: 68,
  checkpointSize: 78,
  bottom: 120
} as const;

const WAVE = [0, -0.68, -1, -0.68, 0, 0.68, 1, 0.68];

function chaptersLabel(bookTitle: string, chapters: number[]) {
  if (!chapters.length) return bookTitle;
  const first = Math.min(...chapters);
  const last = Math.max(...chapters);
  return first === last ? `${bookTitle} ${first}` : `${bookTitle} ${first}–${last}`;
}

/** Curva suave passando por todos os pontos (mesma forma usada no protótipo). */
export function trailPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const my = (a.y + b.y) / 2;
    d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  return d;
}

export function buildTrailModel(input: TrailInput): TrailModel {
  const { book, orderedActivityIds, completedLessonIds, completedCheckpointIds, mode, width } = input;
  const completed = new Set([...completedLessonIds, ...completedCheckpointIds]);
  const bookIds = book.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
  const center = width / 2;
  const amplitude = Math.min(96, width * 0.24);
  const isUnlocked = (id: string) => mode === "canonical"
    ? isJourneyActivityUnlocked(id, orderedActivityIds, completedLessonIds, completedCheckpointIds)
    : isBookActivityUnlocked(id, bookIds, completedLessonIds, completedCheckpointIds);

  const nodes: TrailNode[] = [];
  const units: TrailUnitCard[] = [];
  let cursor = TRAIL_LAYOUT.top;
  let waveIndex = 0;
  let currentAssigned = false;

  book.units.forEach((unit, unitIndex) => {
    const activities = [...unit.lessons, unit.checkpoint];
    const unitCompleted = activities.filter((activity) => completed.has(activity.id)).length;
    const unitCard: TrailUnitCard = {
      id: unit.id,
      index: unitIndex + 1,
      title: unit.title,
      subtitle: unit.subtitle,
      chaptersLabel: chaptersLabel(book.title, unit.chapters),
      y: cursor,
      completed: unitCompleted,
      total: activities.length,
      locked: false,
      inline: unitIndex > 0
    };
    units.push(unitCard);
    if (unitCard.inline) cursor += TRAIL_LAYOUT.unitCardHeight + TRAIL_LAYOUT.gapAfterCard;

    activities.forEach((activity, activityIndex) => {
      const checkpoint = !("steps" in activity);
      const size = checkpoint ? TRAIL_LAYOUT.checkpointSize : TRAIL_LAYOUT.lessonSize;
      const offset = WAVE[waveIndex % WAVE.length];
      waveIndex += 1;
      let state: TrailNodeState;
      if (completed.has(activity.id)) state = "done";
      else if (!isUnlocked(activity.id)) state = "locked";
      else if (!currentAssigned) { state = "current"; currentAssigned = true; }
      else state = "available";
      nodes.push({
        id: activity.id,
        title: activity.title,
        subtitle: activity.subtitle,
        minutes: "estimatedMinutes" in activity ? activity.estimatedMinutes : 10,
        checkpoint,
        state,
        unitIndex,
        lessonNumber: checkpoint ? 0 : activityIndex + 1,
        referenceLabel: "references" in activity ? activity.references[0]?.label : chaptersLabel(book.title, unit.chapters),
        x: Math.round(center + offset * amplitude),
        y: cursor,
        size,
        companionSide: offset > 0 ? "left" : "right"
      });
      cursor += TRAIL_LAYOUT.nodeGap;
    });
    unitCard.locked = activities.every((activity) => {
      const node = nodes.find((item) => item.id === activity.id);
      return node?.state === "locked";
    });
    cursor += TRAIL_LAYOUT.gapAfterUnit;
  });

  const current = nodes.find((node) => node.state === "current");
  let doneUntil = 0;
  while (doneUntil < nodes.length && nodes[doneUntil].state === "done") doneUntil += 1;
  const donePoints = nodes.slice(0, Math.min(nodes.length, doneUntil + 1));

  return {
    bookId: book.id,
    bookTitle: book.title,
    shortTitle: book.shortTitle,
    mode,
    nodes,
    units,
    height: cursor + TRAIL_LAYOUT.bottom,
    width,
    completed: bookIds.filter((id) => completed.has(id)).length,
    total: bookIds.length,
    current,
    currentUnit: current ? units[current.unitIndex] : undefined,
    pathAll: trailPath(nodes),
    pathDone: doneUntil > 0 ? trailPath(donePoints) : ""
  };
}
