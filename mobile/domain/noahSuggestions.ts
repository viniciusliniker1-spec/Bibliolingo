import type { IconName } from "../components/navigation/Icons";
import type { NoahContext, NoahMode } from "./noah";

export interface NoahSuggestion {
  id: string;
  label: string;
  icon: IconName;
  mode: NoahMode;
  question: string;
}

/** Atalhos que fazem sentido para o momento do aluno (antes, depois de errar, depois de acertar ou fora da lição). */
export function noahSuggestions(context: NoahContext): NoahSuggestion[] {
  const list: NoahSuggestion[] = [];
  const inQuestion = Boolean(context.currentQuestion);
  if (inQuestion && context.answerStatus === "unanswered") {
    list.push({ id: "hint", label: "Dê uma pista", icon: "bulb", mode: "practice", question: "Dê uma pista progressiva para eu raciocinar sobre esta questão sem revelar a resposta correta." });
  }
  if (inQuestion && context.answerStatus === "incorrect") {
    list.push({ id: "why-wrong", label: "Por que errei?", icon: "heart", mode: "error", question: "Explique por que minha resposta está errada usando a correção editorial e o fundamento bíblico." });
  }
  if (inQuestion && context.answerStatus === "correct") {
    list.push({ id: "why-right", label: "Por que está certo?", icon: "check", mode: "explain", question: "Explique por que a resposta está correta e o que ela ensina sobre o texto." });
  }
  if (context.reference || context.content) {
    list.push({ id: "context", label: "Contexto bíblico", icon: "book", mode: "deepen", question: "Explique o contexto bíblico necessário para compreender este trecho, usando referências verificáveis." });
    list.push({ id: "simple", label: "Explique simples", icon: "study", mode: "simple", question: "Explique este conteúdo de forma simples, em poucas frases, como para quem está começando." });
    list.push({ id: "example", label: "Exemplo para hoje", icon: "star", mode: "example", question: "Dê um exemplo prático de como este ensino se aplica à vida hoje, sem forçar o texto." });
  }
  if (context.learningProfile) {
    list.push({ id: "review", label: "O que revisar?", icon: "memory", mode: "practice", question: "Com base somente no meu perfil pedagógico autorizado, indique uma prioridade de revisão e explique por quê. Não altere XP ou progresso." });
  }
  if (!inQuestion && !context.reference && !context.content) {
    list.push({ id: "plan", label: "Monte um plano de leitura", icon: "trail", mode: "practice", question: "Monte um plano curto de leitura bíblica para esta semana, adequado ao meu nível." });
    list.push({ id: "hard", label: "Uma passagem difícil", icon: "book", mode: "ask", question: "Quero entender uma passagem difícil. Como você pode me ajudar a ler com contexto?" });
  }
  return list;
}

export type NoahSegment = { text: string; bold: boolean };
export type NoahBlock = { kind: "paragraph" | "bullet"; marker?: string; segments: NoahSegment[] };

/** Formatação leve das respostas: parágrafos, listas e **negrito**. */
export function parseNoahAnswer(answer: string): NoahBlock[] {
  return answer
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bullet = line.match(/^([-•*]|\d+[.)])\s+(.*)$/);
      const body = (bullet ? bullet[2] : line).replace(/^#+\s*/, "");
      const segments = body.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => part.startsWith("**") && part.endsWith("**") && part.length > 4 ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false });
      return bullet ? { kind: "bullet" as const, marker: /\d/.test(bullet[1]) ? bullet[1].replace(")", ".") : "•", segments } : { kind: "paragraph" as const, segments: /^#+\s/.test(line) ? segments.map((segment) => ({ ...segment, bold: true })) : segments };
    });
}
