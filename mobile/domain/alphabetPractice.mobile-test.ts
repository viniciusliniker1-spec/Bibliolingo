import { describe, expect, it } from "vitest";
import { ALPHABETS } from "../content/alphabet";
import { applyAnswer, buildAlphabetSession, groupMastery, masteryOf, suggestedGroup } from "./alphabetPractice";

describe("alfabeto", () => {
  it("tem as 24 letras gregas e as 22 hebraicas, cada uma em um grupo", () => {
    expect(ALPHABETS.grc.letters).toHaveLength(24);
    expect(ALPHABETS.hbo.letters).toHaveLength(22);
    for (const alphabet of Object.values(ALPHABETS)) {
      const grouped = alphabet.groups.flatMap((group) => group.letters);
      expect(new Set(grouped).size).toBe(alphabet.letters.length);
      expect(grouped.sort()).toEqual(alphabet.letters.map((letter) => letter.id).sort());
    }
    expect(ALPHABETS.hbo.letters.filter((letter) => letter.alt)).toHaveLength(5);
  });

  it("monta perguntas com 4 opções e a resposta certa entre elas", () => {
    for (const id of ["grc", "hbo"] as const) {
      for (let group = 0; group < ALPHABETS[id].groups.length; group += 1) {
        const session = buildAlphabetSession(id, group, {}, `s${group}`);
        expect(session).toHaveLength(10);
        for (const q of session) {
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
          expect(q.options.some((o) => o.id === q.answerId)).toBe(true);
          if (q.kind === "final") expect(q.letter.alt).toBeTruthy();
        }
        for (let i = 1; i < session.length; i += 1) expect(session[i].letter.id).not.toBe(session[i - 1].letter.id);
      }
    }
  });

  it("acertos dominam a letra, erros tiram e o grupo sugerido avança", () => {
    let progress = {};
    for (const id of ALPHABETS.grc.groups[0].letters) for (let i = 0; i < 3; i += 1) progress = applyAnswer(progress, id, true);
    expect(groupMastery("grc", 0, progress)).toBe(1);
    expect(suggestedGroup("grc", progress)).toBe(1);
    progress = applyAnswer(progress, "alpha", false);
    expect(masteryOf(progress, "alpha")).toBe(2);
  });
});
