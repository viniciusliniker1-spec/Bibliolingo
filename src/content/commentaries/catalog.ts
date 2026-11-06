export type CommentarySourceId = "calvin" | "keil-delitzsch" | "catena-aurea";
export type CommentaryAvailability = "awaiting-licensed-portuguese-source" | "active";

export interface CommentarySource {
  id: CommentarySourceId;
  author: string;
  work: string;
  tradition: string;
  testament: "old" | "new" | "both";
  availability: CommentaryAvailability;
  edition?: string;
  translator?: string;
  sourceUrl?: string;
  license?: string;
  attribution?: string;
}

export interface CommentaryUnit {
  id: string;
  sourceId: CommentarySourceId;
  bookOsis: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
  edition: string;
  translator: string;
  sourceUrl: string;
  license: string;
  attribution: string;
}

export const commentarySources: CommentarySource[] = [
  {
    id: "calvin",
    author: "João Calvino",
    work: "Comentários bíblicos",
    tradition: "Reformada",
    testament: "both",
    availability: "awaiting-licensed-portuguese-source"
  },
  {
    id: "keil-delitzsch",
    author: "C. F. Keil e F. Delitzsch",
    work: "Commentary on the Old Testament",
    tradition: "Luterana",
    testament: "old",
    availability: "awaiting-licensed-portuguese-source"
  },
  {
    id: "catena-aurea",
    author: "Tomás de Aquino (compilador)",
    work: "Catena Aurea",
    tradition: "Patrística/Católica",
    testament: "new",
    availability: "awaiting-licensed-portuguese-source"
  }
];

/**
 * O catálogo distribuído começa vazio de propósito. Textos só entram depois que
 * edição, tradução, URL de origem, atribuição e licença forem verificadas.
 */
export const commentaryUnits: CommentaryUnit[] = [];

export function validateCommentaryUnit(unit: CommentaryUnit) {
  const source = commentarySources.find((item) => item.id === unit.sourceId);
  if (!source || source.availability !== "active") return false;
  if (!unit.id || !unit.bookOsis || unit.chapter < 1 || unit.verseStart < 1 || unit.verseEnd < unit.verseStart) return false;
  return [unit.text, unit.edition, unit.translator, unit.sourceUrl, unit.license, unit.attribution]
    .every((value) => value.trim().length > 0);
}

export function commentariesForVerse(bookOsis: string, chapter: number, verse: number) {
  return commentaryUnits
    .filter(validateCommentaryUnit)
    .filter((unit) => unit.bookOsis === bookOsis && unit.chapter === chapter && verse >= unit.verseStart && verse <= unit.verseEnd);
}
