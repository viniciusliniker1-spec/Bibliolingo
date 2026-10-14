import {describe,expect,it} from "vitest";
import {betaCodeToGreek,betaHeadword} from "./betaCode";
describe("conversão de Beta Code",()=>{
 it("converte letras e sinais diacríticos",()=>{
  expect(betaCodeToGreek("lo/gos")).toBe("λόγος");
  expect(betaHeadword("a)ga/ph, hs, h(")).toBe("ἀγάπη");
 });
 it("preserva maiúsculas e sigma final",()=>{expect(betaCodeToGreek("*i)hsou=s")).toBe("Ἰησοῦς");});
});
