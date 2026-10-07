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

function copyFallback(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.setAttribute("aria-hidden", "true");
  area.style.position = "fixed";
  area.style.left = "0";
  area.style.top = "0";
  area.style.width = "1px";
  area.style.height = "1px";
  area.style.opacity = "0.01";
  area.style.fontSize = "16px";
  document.body.appendChild(area);
  area.focus({ preventScroll: true });
  area.select();
  area.setSelectionRange(0, area.value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    area.remove();
  }
  return copied;
}

export async function copyNoahPrompt(prompt: string): Promise<void> {
  if (copyFallback(prompt)) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(prompt);
    return;
  }
  throw new Error("copy-failed");
}

export async function launchNoah(prompt: string): Promise<void> {
  sessionStorage.setItem("bibliolingo:noah-prompt", prompt);
  window.location.hash = "#/noah";
}
