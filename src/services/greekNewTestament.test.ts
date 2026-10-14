import {describe,expect,it} from "vitest";
import {parseGreekNewTestamentBook} from "./greekNewTestament";
describe("texto grego por versículo",()=>{
 it("separa palavras, Strong e morfologia",()=>{
  const verses=parseGreekNewTestamentBook("1:1 en 1722 {PREP} arch 746 {N-DSF} hn 1510 5707 {V-IAI-3S}\n1:2 outov 3778 {D-NSM}");
  expect(verses.get("1:1")).toEqual([
   {position:1,form:"εν",transliteration:"en",strong:"G1722",morphology:"PREP"},
   {position:2,form:"αρχη",transliteration:"arch",strong:"G0746",morphology:"N-DSF"},
   {position:3,form:"ην",transliteration:"hn",strong:"G1510",morphology:"V-IAI-3S"}
  ]);
  expect(verses.get("1:2")?.[0].strong).toBe("G3778");
 });
});
