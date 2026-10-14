import {describe,expect,it} from "vitest";
import {parseDodsonCsv} from "./completeLexicon";
describe("importação Dodson",()=>{
 it("converte uma linha real e preserva licença",()=>{
  const csv='"Strong\'s"\t"Goodrick-Kohlenberger"\t"Greek Word"\t"English Definition (brief)"\t"English Definition (longer)"\n"3056"\t"3364"\t"lo/gos, ou, o("\t"a word"\t"a word, speech."';
  const [entry]=parseDodsonCsv(csv);
  expect(entry.lemma).toBe("λόγος");
  expect(entry.strong).toBe("G3056");
  expect(entry.source.license).toContain("domínio público");
 });
});
