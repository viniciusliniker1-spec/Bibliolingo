import { hebrewUnits } from "../../../src/content/hebrew/catalog";
import { LanguageTrail } from "../../components/LanguageTrail";

/** Trilha do hebraico e aramaico: pergaminho, rolos da Torá e oliveira; caminho da direita para a esquerda. */
export default function HebrewScreen() {
  return <LanguageTrail language="hebrew" units={hebrewUnits} dictionaryRoute="/hebrew/dictionary" />;
}
