import { describe, expect, it } from "vitest";
import { journeyBooks, orderedActivityIds } from "../../src/content/catalog";
import { bibleBooks } from "../../src/content/bible/catalog";
import { greekActivityIds, greekUnits } from "../../src/content/greek/catalog";
import { orderedFormationActivityIds, formationContent } from "../../src/content/formation/catalog";
import { deepenActivityIds } from "../../src/content/deepen/catalog";
import { isBookActivityUnlocked, isJourneyActivityUnlocked, nextBookActivityId } from "../../src/domain/unlocks";
import { activityIdsForKind, resolveMobileActivity } from "./activityCatalog";

describe("catálogo integral do Mobile", () => {
  it("reutiliza os 66 livros e os 1.189 capítulos da Web", () => {
    expect(journeyBooks).toHaveLength(66);
    expect(bibleBooks).toHaveLength(66);
    expect(bibleBooks.reduce((total, book) => total + book.chapters, 0)).toBe(1189);
  });

  it("mantém todas as unidades, lições e checkpoints canônicos", () => {
    const units = journeyBooks.flatMap((book) => book.units);
    expect(units).toHaveLength(266);
    expect(units.flatMap((unit) => unit.lessons)).toHaveLength(1067);
    expect(orderedActivityIds).toHaveLength(1333);
    expect(activityIdsForKind("bible")).toEqual(orderedActivityIds);
  });

  it("resolve atividades reais de todos os percursos", () => {
    expect(greekUnits).toHaveLength(8);
    expect(resolveMobileActivity("greek", greekActivityIds[0])?.steps.length).toBeGreaterThan(0);
    expect(resolveMobileActivity("formation", orderedFormationActivityIds[0])?.steps.length).toBeGreaterThan(0);
    expect(resolveMobileActivity("deepen", deepenActivityIds[0])?.steps.length).toBeGreaterThan(0);
    expect(formationContent.subjects).toHaveLength(6);
  });

  it("isola progressão individual dos desbloqueios canônicos", () => {
    const secondBook = journeyBooks[1];
    const ids = secondBook.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
    expect(isJourneyActivityUnlocked(ids[0], orderedActivityIds, [], [])).toBe(false);
    expect(isBookActivityUnlocked(ids[0], ids, [], [])).toBe(true);
    expect(nextBookActivityId(ids, [], [])).toBe(ids[0]);
    expect(isJourneyActivityUnlocked(ids[0], orderedActivityIds, [ids[0]], [])).toBe(false);
  });
});