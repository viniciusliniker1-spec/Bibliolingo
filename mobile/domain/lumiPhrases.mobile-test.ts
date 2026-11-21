import { describe, expect, it } from "vitest";
import { LUMI_WELCOME_ONLY_ANIMATIONS, type LumiEvent, type PhraseEntry } from "./lumiBehavior";
import { LUMI_FACTS, LUMI_GENERAL_FACTS } from "./lumiFacts";
import { LUMI_RULES } from "./lumiPhrases";

const lines = (entries: PhraseEntry[]) => entries.map((entry) => (typeof entry === "string" ? { text: entry } : entry));
const KNOWN_VARS = new Set(["nome", "licao", "livro", "caps", "dias", "faltam", "minutos", "foradias"]);
const ANIMATIONS = ["pular", "trofeu", "dormir", "ler", "ensinar", "joinha", "lanterna", "binoculo", "estudar"];

describe("repertório de falas da Lumi", () => {
  it("toda fala cabe no balão e só usa variáveis conhecidas", () => {
    for (const rule of Object.values(LUMI_RULES)) {
      expect(rule.phrases.length).toBeGreaterThan(0);
      for (const { text } of lines(rule.phrases)) {
        expect(text.length, text).toBeLessThanOrEqual(110);
        for (const [, key] of text.matchAll(/\{(\w+)\}/g)) expect(KNOWN_VARS.has(key), `${key} em “${text}”`).toBe(true);
      }
    }
  });

  it("todo evento tem ao menos uma fala sem condição (nunca fica sem o que dizer)", () => {
    const withoutSafeLine = Object.entries(LUMI_RULES)
      .filter(([, rule]) => !lines(rule.phrases).some((line) => !line.when && !/\{\w+\}/.test(line.text)))
      .map(([event]) => event);
    expect(withoutSafeLine).toEqual([]);
  });

  it("só usa animações conhecidas e nunca a reservada a saudações (vinda de vídeo)", () => {
    const reserved = new Set<string>(LUMI_WELCOME_ONLY_ANIMATIONS);
    for (const rule of Object.values(LUMI_RULES)) {
      const used = [rule.animation, ...(rule.animations ?? []), ...lines(rule.phrases).flatMap((line) => (line.animation ? [line.animation] : []))];
      for (const animation of used) {
        expect(reserved.has(animation), animation).toBe(false);
        expect(ANIMATIONS).toContain(animation);
      }
    }
  });

  it("os eventos de conversa têm repertório variado", () => {
    const minimum: Partial<Record<LumiEvent, number>> = { toque: 15, anima: 10, piada: 10, abrir: 10, idle: 12, erro: 6, concluir: 8, saudade: 4 };
    for (const [event, count] of Object.entries(minimum)) expect(LUMI_RULES[event as LumiEvent].phrases.length, event).toBeGreaterThanOrEqual(count);
  });

  it("todos os 66 livros têm uma curiosidade que cabe no balão", () => {
    const ids = "genesis exodus leviticus numbers deuteronomy joshua judges ruth 1-samuel 2-samuel 1-kings 2-kings 1-chronicles 2-chronicles ezra nehemiah esther job psalms proverbs ecclesiastes song-of-songs isaiah jeremiah lamentations ezekiel daniel hosea joel amos obadiah jonah micah nahum habakkuk zephaniah haggai zechariah malachi matthew mark luke john acts romans 1-corinthians 2-corinthians galatians ephesians philippians colossians 1-thessalonians 2-thessalonians 1-timothy 2-timothy titus philemon hebrews james 1-peter 2-peter 1-john 2-john 3-john jude revelation".split(" ");
    expect(ids).toHaveLength(66);
    expect(Object.keys(LUMI_FACTS).sort()).toEqual([...ids].sort());
    for (const text of [...Object.values(LUMI_FACTS).flat(), ...LUMI_GENERAL_FACTS]) expect(text.length, text).toBeLessThanOrEqual(110);
  });
});
