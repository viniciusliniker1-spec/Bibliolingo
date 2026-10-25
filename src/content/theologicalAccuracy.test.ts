import { describe, expect, it } from "vitest";
import { journeyBooks } from "./catalog";

function lessonText(bookId: string, title: string) {
  const book = journeyBooks.find((item) => item.id === bookId);
  const lesson = book?.units.flatMap((unit) => unit.lessons).find((item) => item.title === title);
  if (!lesson) throw new Error(`Lição não encontrada: ${bookId} / ${title}`);
  return lesson.steps.filter((step) => step.type === "learn").map((step) => step.body).join(" ");
}

describe("salvaguardas da revisão teológica", () => {
  it("não transforma controvérsias judaicas em hostilidade contra judeus", () => {
    expect(lessonText("matthew", "Ai dos líderes hipócritas")).toContain("não autoriza condenar todo fariseu nem o povo judeu");
    expect(lessonText("john", "Luz, liberdade e verdade")).toContain("não autoriza hostilidade contra judeus");
    expect(lessonText("romans", "Remanescente e oliveira")).toContain("contra arrogância");
  });

  it("nomeia divergências interpretativas sem fabricar consenso", () => {
    expect(lessonText("romans", "A Lei e o conflito humano")).toContain("Cristãos divergem");
    expect(lessonText("romans", "Angústia de Paulo por Israel")).toContain("Leituras cristãs divergem");
    expect(lessonText("1-timothy", "Homens e mulheres no culto")).toContain("Leituras cristãs divergem");
    expect(lessonText("revelation", "O milênio e suas interpretações")).toContain("pré-milenista");
  });

  it("não legitima abuso, escravidão ou violência religiosa", () => {
    expect(lessonText("ephesians", "Relações transformadas pela submissão a Cristo")).toContain("não legitima abuso");
    expect(lessonText("1-peter", "Testemunho entre as nações")).toContain("não torna escravidão ou abuso moralmente bons");
    expect(lessonText("joshua", "Jericó cai")).toContain("não autoriza a igreja a praticar conquista");
    expect(lessonText("joshua", "Ai e uma nova oportunidade")).toContain("não autoriza violência contemporânea");
  });

  it("não romantiza vulnerabilidade na oferta da viúva", () => {
    expect(lessonText("mark", "Debates e o maior mandamento")).toContain("intérpretes divergem");
    expect(lessonText("luke", "Oferta da viúva e sinais do fim")).toContain("sem romantizar vulnerabilidade");
  });
});
