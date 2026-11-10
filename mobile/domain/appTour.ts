/**
 * Tutorial do primeiro acesso, em três momentos:
 *  1. A Lumi dá as boas-vindas ao aluno.
 *  2. Pergunta “O que você quer estudar?” (rota bíblica, grego ou hebraico).
 *  3. Mostra brevemente os recursos da rota escolhida e já leva o aluno até ela.
 *
 * `kind` define o tipo de passo: mensagem, pergunta ou destaque de um elemento real da tela.
 * Nos destaques, `route` é a aba aberta e `target` o elemento marcado com useTourTarget.
 */
import type { LumiAnimationId } from "./lumiBehavior";
import type { LumiMoodId } from "./lumiMood";

export type TourRoute = "/(tabs)" | "/(tabs)/study";
export type TourRouteChoice = "bible" | "greek" | "hebrew";
export type TourDestination = "/(tabs)" | "/greek" | "/hebrew";

export interface TourStep {
  id: string;
  kind: "message" | "choice" | "spot";
  route: TourRoute;
  target?: string;
  /** Tela rolável onde o alvo está (registrada com useTourScroll). */
  scroll?: "study";
  animation: LumiAnimationId;
  /** Pose estática da Lumi (substitui a animação no balão). */
  mood?: LumiMoodId;
  /** Texto pequeno acima do título. */
  eyebrow: string;
  title: string;
  text: string;
  button?: string;
}

export interface TourRouteOption {
  id: TourRouteChoice;
  glyph: string;
  title: string;
  note: string;
  destination: TourDestination;
  /** Como a Lumi reage quando o aluno escolhe esta rota. */
  animation: LumiAnimationId;
  mood: LumiMoodId;
}

export const TOUR_ROUTES: TourRouteOption[] = [
  { id: "bible", glyph: "📖", title: "Rota bíblica", note: "De Gênesis a Apocalipse, lição por lição", destination: "/(tabs)", animation: "ler", mood: "lupa" },
  { id: "greek", glyph: "Ω", title: "Grego bíblico", note: "Leia o Novo Testamento no original", destination: "/greek", animation: "estudar", mood: "escrevendo" },
  { id: "hebrew", glyph: "א", title: "Hebraico e aramaico", note: "Leia o Antigo Testamento no original", destination: "/hebrew", animation: "ensinar", mood: "notebook" }
];

const WELCOME: TourStep = {
  id: "welcome", kind: "message", route: "/(tabs)", animation: "acenar", eyebrow: "BOAS-VINDAS",
  title: "Que bom ter você aqui, {nome}!",
  text: "Não foi por acaso: foi propósito de Deus você chegar até aqui. Eu sou a Lumi e vou te conduzir, passo a passo, no estudo da Palavra de Deus.",
  button: "Vamos começar"
};

const CHOICE: TourStep = {
  id: "choice", kind: "choice", route: "/(tabs)", animation: "ler", mood: "ideia", eyebrow: "SUA ROTA",
  title: "O que você quer estudar?",
  text: "Escolha por onde começar. As outras rotas ficam sempre disponíveis na aba Estudar."
};

/** Três destaques curtos por rota (sempre três, para o progresso ter o mesmo tamanho). */
const ROUTE_STEPS: Record<TourRouteChoice, TourStep[]> = {
  bible: [
    { id: "bible-lesson", kind: "spot", route: "/(tabs)", target: "trail-current", animation: "ler", eyebrow: "ROTA BÍBLICA", title: "Sua primeira lição", text: "Toque no círculo que brilha. Cada lição leva poucos minutos e eu comento cada passo." },
    { id: "bible-stats", kind: "spot", route: "/(tabs)", target: "trail-stats", animation: "pular", mood: "calendario", eyebrow: "ROTA BÍBLICA", title: "Ofensiva, XP e corações", text: "Estude todo dia para a chama 🔥 crescer. Cada erro custa um coração, e a revisão devolve." },
    { id: "bible-challenges", kind: "spot", route: "/(tabs)", target: "trail-challenges", animation: "joinha", mood: "checklist", eyebrow: "ROTA BÍBLICA", title: "Missões e desafios", text: "No troféu ficam as missões do dia e os desafios de ofensiva. Tudo rende moedas para a Lumi." }
  ],
  greek: [
    { id: "greek-trail", kind: "spot", route: "/(tabs)/study", target: "study-greek", scroll: "study", animation: "estudar", mood: "escrevendo", eyebrow: "GREGO BÍBLICO", title: "Sua trilha de grego", text: "Do alfabeto aos textos do Novo Testamento, em lições curtas. Toque em Começar trilha." },
    { id: "greek-alphabet", kind: "spot", route: "/(tabs)/study", target: "study-greek-alphabet", scroll: "study", animation: "estudar", mood: "ideia", eyebrow: "GREGO BÍBLICO", title: "Comece pelo alfabeto", text: "Ouça, trace com o dedo e treine as 24 letras. É a porta para ler o original." },
    { id: "greek-reader", kind: "spot", route: "/(tabs)/study", target: "study-greek-reader", scroll: "study", animation: "ler", mood: "lupa", eyebrow: "GREGO BÍBLICO", title: "Leia o original", text: "O Leitor vai de palavras soltas até João 1, com som e tradução palavra por palavra." }
  ],
  hebrew: [
    { id: "hebrew-trail", kind: "spot", route: "/(tabs)/study", target: "study-hebrew", scroll: "study", animation: "ensinar", mood: "notebook", eyebrow: "HEBRAICO E ARAMAICO", title: "Sua trilha de hebraico", text: "Do alfabeto aos textos da Bíblia Hebraica, em lições curtas. Toque em Começar trilha." },
    { id: "hebrew-alphabet", kind: "spot", route: "/(tabs)/study", target: "study-hebrew-alphabet", scroll: "study", animation: "estudar", mood: "ideia", eyebrow: "HEBRAICO E ARAMAICO", title: "Comece pelo alfabeto", text: "Ouça, trace e treine as 22 letras. O hebraico se lê da direita para a esquerda." },
    { id: "hebrew-reader", kind: "spot", route: "/(tabs)/study", target: "study-hebrew-reader", scroll: "study", animation: "ler", mood: "lupa", eyebrow: "HEBRAICO E ARAMAICO", title: "Leia o original", text: "O Leitor vai de palavras soltas até Gênesis 1 e o Shemá, com som e tradução." }
  ]
};

const FINISH_TEXT: Record<TourRouteChoice, string> = {
  bible: "Vou te levar para a sua trilha. O Professor Noah tira dúvidas na aba Estudar, e no Perfil você vê o ranking com outros alunos.",
  greek: "Vou te levar para a sua trilha de grego. A rota bíblica, o Professor Noah e o ranking estão sempre à mão.",
  hebrew: "Vou te levar para a sua trilha de hebraico. A rota bíblica, o Professor Noah e o ranking estão sempre à mão."
};

function finishStep(route: TourRouteChoice): TourStep {
  return {
    id: "finish", kind: "message", route: "/(tabs)", animation: "trofeu", eyebrow: "TUDO PRONTO",
    title: "Bora estudar, {nome}!", text: FINISH_TEXT[route], button: "Começar a estudar"
  };
}

/** Passos do tutorial: sem rota escolhida só existem as boas-vindas e a pergunta. */
export function tourStepsFor(route?: TourRouteChoice): TourStep[] {
  return route ? [WELCOME, CHOICE, ...ROUTE_STEPS[route], finishStep(route)] : [WELCOME, CHOICE];
}

/** Quantos passos o tutorial tem no total (igual para todas as rotas). */
export const TOUR_STEP_COUNT = tourStepsFor("bible").length;

export function destinationFor(route: TourRouteChoice): TourDestination {
  return TOUR_ROUTES.find((option) => option.id === route)!.destination;
}

/** Conta nova: ainda não estudou nada (o tutorial só abre sozinho nesse caso). */
export function isNewLearner(progress: { xp: number; completedLessonIds: readonly string[]; activity: Record<string, unknown>; lastStudyDate?: string }) {
  return progress.xp === 0 && progress.completedLessonIds.length === 0 && !progress.lastStudyDate && Object.keys(progress.activity).length === 0;
}

export type Rect = { x: number; y: number; width: number; height: number };

/** Posição do balão: abaixo do alvo quando cabe, senão acima; sem alvo, centralizado. */
export function calloutPlacement(target: Rect | undefined, screenHeight: number, cardHeight: number, margin = 14): { top: number; side: "below" | "above" | "center" } {
  if (!target) return { top: Math.max(margin, (screenHeight - cardHeight) / 2), side: "center" };
  const below = target.y + target.height + margin;
  if (below + cardHeight <= screenHeight - margin) return { top: below, side: "below" };
  return { top: Math.max(margin, target.y - margin - cardHeight), side: "above" };
}

/** Trecho do texto a mostrar no efeito de digitação (nunca corta no meio de um emoji). */
export function typedText(text: string, shown: number) {
  return Array.from(text).slice(0, Math.max(0, shown)).join("");
}
