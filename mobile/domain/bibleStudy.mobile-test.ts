import { describe, expect, it } from "vitest";
import { createInitialProgress } from "./progress";
import { normalizeProgress } from "../services/progressStorage";

describe("caderno bíblico persistente", () => {
  it("abre progresso antigo sem exigir notas", () => {
    const legacy = createInitialProgress() as unknown as Record<string, unknown>;
    delete legacy.bibleStudyNotes;
    expect(normalizeProgress(legacy).bibleStudyNotes).toEqual([]);
  });

  it("preserva blocos, comentários e fixação na hidratação", () => {
    const progress = createInitialProgress();
    progress.bibleStudyNotes = [{
      id: "note-1",
      title: "João 3",
      bookOsis: "John",
      bookName: "João",
      chapter: 3,
      pinned: true,
      blocks: [{
        id: "block-1",
        type: "passage",
        content: "Amor e graça",
        reference: "João 3:16",
        createdAt: "2026-10-30T12:00:00.000Z",
        updatedAt: "2026-10-30T12:00:00.000Z"
      }],
      comments: [{
        id: "comment-1",
        anchorBlockId: "block-1",
        body: "Preparar para a célula",
        createdAt: "2026-10-30T12:01:00.000Z",
        updatedAt: "2026-10-30T12:01:00.000Z"
      }],
      createdAt: "2026-10-30T12:00:00.000Z",
      updatedAt: "2026-10-30T12:01:00.000Z"
    }];
    const restored = normalizeProgress(JSON.parse(JSON.stringify(progress)));
    expect(restored.bibleStudyNotes[0]?.pinned).toBe(true);
    expect(restored.bibleStudyNotes[0]?.blocks[0]?.reference).toBe("João 3:16");
    expect(restored.bibleStudyNotes[0]?.comments[0]?.anchorBlockId).toBe("block-1");
  });
});
