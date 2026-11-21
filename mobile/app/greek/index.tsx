import { greekUnits } from "../../../src/content/greek/catalog";
import { LanguageTrail } from "../../components/LanguageTrail";
import { useMobileProgress } from "../../providers/MobileProgressProvider";

/** Trilha do grego koiné: azul do Egeu, mármore e meandro grego. */
export default function GreekHubScreen() {
  const { progress } = useMobileProgress();
  const learned = (progress as typeof progress & { learnedGreekLexemeIds?: string[] }).learnedGreekLexemeIds?.length ?? 0;
  return <LanguageTrail language="greek" units={greekUnits} dictionaryRoute="/greek/dictionary" stat={learned ? `${learned} ${learned === 1 ? "palavra aprendida" : "palavras aprendidas"} no léxico` : undefined} />;
}
