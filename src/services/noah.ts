import type { Exercise } from "../types/content";

export type NoahPromptType =
  | "deepen"
  | "languages"
  | "connections"
  | "interpretations"
  | "sunday-school"
  | "sermon"
  | "devotional";

const directions: Record<NoahPromptType, string> = {
  deepen: "Aprofunde o tema, destacando estrutura, palavras-chave e implicações.",
  languages: "Explique termos relevantes no hebraico ou grego, sem exagerar o significado lexical.",
  connections: "Mostre conexões canônicas e indique passagens bíblicas relacionadas.",
  interpretations: "Compare interpretações cristãs relevantes de maneira justa.",
  "sunday-school": "Ajude a preparar uma aula de Escola Bíblica Dominical com objetivos e perguntas objetivas.",
  sermon: "Crie um esboço de pregação fiel ao texto, com ideia central, divisões e aplicações.",
  devotional: "Crie um devocional breve, fiel ao texto, com reflexão e oração."
};

export function buildNoahPrompt(
  type: NoahPromptType,
  context: { title: string; reference: string; exercise?: Exercise }
): string {
  const question = context.exercise ? " A questão em foco é: “" + context.exercise.prompt + "”." : "";
  return (
    "Estou estudando " +
    context.reference +
    " na lição “" +
    context.title +
    "” de um aplicativo de formação bíblica." +
    question +
    " " +
    directions[type] +
    " Considere o contexto literário, histórico e bíblico. Apresente a perspectiva wesleyana/arminiana e, quando houver divergências relevantes, compare de maneira justa com outras interpretações cristãs. Diferencie claramente texto bíblico, informação histórica e interpretação teológica. Use linguagem clara, não invente fontes e indique passagens relacionadas."
  );
}

async function copyFallback(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (!copied) throw new Error("copy-failed");
}

export async function launchNoah(prompt: string): Promise<void> {
  const opened = window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(prompt);
    else await copyFallback(prompt);
  } catch {
    if (opened) opened.close();
    throw new Error("Não foi possível copiar o prompt. Verifique a permissão da área de transferência.");
  }
}
