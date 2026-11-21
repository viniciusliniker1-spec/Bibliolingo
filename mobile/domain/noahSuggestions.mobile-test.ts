import { describe, expect, it } from "vitest";
import { noahSuggestions, parseNoahAnswer } from "./noahSuggestions";

describe("Professor Noah", () => {
  it("sugere pista antes de responder e explicação do erro depois de errar", () => {
    const base = { area: "bible" as const, title: "Gênesis", reference: "Gn 1", currentQuestion: "Quem criou?" };
    expect(noahSuggestions({ ...base, answerStatus: "unanswered" }).map((item) => item.id)).toContain("hint");
    const wrong = noahSuggestions({ ...base, answerStatus: "incorrect" }).map((item) => item.id);
    expect(wrong[0]).toBe("why-wrong");
    expect(wrong).not.toContain("hint");
  });

  it("fora da lição oferece planos e passagens difíceis", () => {
    expect(noahSuggestions({ area: "bible", title: "Geral" }).map((item) => item.id)).toEqual(["plan", "hard"]);
  });

  it("formata listas e negrito sem perder texto", () => {
    const blocks = parseNoahAnswer("**Contexto:** Moisés lidera.\n\n- Primeiro ponto\n2) Segundo **forte**");
    expect(blocks[0]).toEqual({ kind: "paragraph", segments: [{ text: "Contexto:", bold: true }, { text: " Moisés lidera.", bold: false }] });
    expect(blocks[1]).toMatchObject({ kind: "bullet", marker: "•" });
    expect(blocks[2]).toMatchObject({ kind: "bullet", marker: "2.", segments: [{ text: "Segundo ", bold: false }, { text: "forte", bold: true }] });
  });
});
