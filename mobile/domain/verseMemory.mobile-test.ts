import { describe, expect, it } from "vitest";
import { bibleBookByOsis } from "../../src/content/bible/catalog";
import { firstLetters, gapIndexes, joinTokens, shuffledChunks, stageForBox, SUGGESTED_VERSES, tokenize, verseChunks, wordBank } from "./verseMemory";

const verse = "Porque Deus amou o mundo de tal maneira, que deu o seu Filho unigênito.";

describe("memorização ativa", () => {
  it("o exercício fica mais difícil a cada nível", () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(stageForBox)).toEqual(["gaps-light", "gaps", "order", "letters", "recite", "recite", "recite"]);
  });

  it("separa palavras e pontuação e reconstrói o texto", () => {
    const tokens = tokenize(verse);
    expect(tokens.filter((token) => token.word)).toHaveLength(14);
    expect(joinTokens(tokens.map((token) => token.text))).toBe(verse);
  });

  it("esconde palavras com 3+ letras de forma estável e embaralha o banco", () => {
    const tokens = tokenize(verse);
    const light = gapIndexes("v1", tokens, 0.25);
    const heavy = gapIndexes("v1", tokens, 0.5);
    expect(light.length).toBeLessThan(heavy.length);
    expect(gapIndexes("v1", tokens, 0.25)).toEqual(light);
    for (const index of heavy) expect(tokens[index].text.length).toBeGreaterThanOrEqual(3);
    const bank = wordBank("v1", tokens, heavy);
    expect(bank.map((item) => item.text).sort()).toEqual(heavy.map((index) => tokens[index].text).sort());
  });

  it("divide em partes que, juntas, formam o versículo, e embaralha", () => {
    const chunks = verseChunks(verse);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.join(" ")).toBe(verse);
    const shuffled = shuffledChunks("v1", chunks);
    expect(shuffled.map((item) => item.index)).not.toEqual(chunks.map((_, index) => index));
  });

  it("mostra só as iniciais", () => {
    expect(joinTokens(firstLetters("No princípio criou Deus."))).toBe("N_ p___ c___ D___.");
  });

  it("sugere versículos que existem no catálogo", () => {
    for (const item of SUGGESTED_VERSES) expect(bibleBookByOsis.get(item.osis)).toBeDefined();
  });
});
