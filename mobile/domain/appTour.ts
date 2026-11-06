/**
 * Tour guiado do primeiro acesso: a Lumi passa por cada tela funcional do app
 * e destaca o elemento real de cada recurso.
 *
 * `route` é a aba aberta no passo; `target` é o elemento destacado (registrado
 * com useTourTarget na tela). Sem alvo, o passo aparece centralizado.
 */
import type { LumiAnimationId } from "./lumiBehavior";
import type { LumiMoodId } from "./lumiMood";

export type TourRoute = "/(tabs)" | "/(tabs)/bible" | "/(tabs)/study" | "/(tabs)/achievements" | "/(tabs)/profile";

export interface TourStep {
  id: string;
  route: TourRoute;
  target?: string;
  /** Tela rolável onde o alvo está (registrada com useTourScroll). */
  scroll?: "study" | "profile";
  animation: LumiAnimationId;
  /** Pose estática da Lumi (substitui a animação no balão). */
  mood?: LumiMoodId;
  chapter: string;
  title: string;
  text: string;
}

export const APP_TOUR: TourStep[] = [
  { id: "welcome", route: "/(tabs)", animation: "acenar", chapter: "Boas-vindas", title: "Oi, {nome}! Eu sou a Lumi.", text: "Em dois minutinhos te mostro tudo o que dá para fazer aqui. Bem mais rápido que os 40 anos no deserto!" },
  { id: "trail-node", route: "/(tabs)", target: "trail-current", animation: "ler", chapter: "Trilha", title: "Sua próxima lição", text: "Cada círculo é uma lição de poucos minutos. O que brilha é o próximo: toque nele para ver o resumo e começar." },
  { id: "trail-cta", route: "/(tabs)", target: "trail-continue", animation: "ensinar", chapter: "Trilha", title: "Lições que variam", text: "Escolher, digitar, montar frases, ligar pares, ordenar acontecimentos… O formato combina com o conteúdo, e eu comento cada passo." },
  { id: "trail-stats", route: "/(tabs)", target: "trail-stats", animation: "pular", mood: "calendario", chapter: "Trilha", title: "Ofensiva, XP e corações", text: "Estude todo dia para a chama 🔥 crescer. Toque nela para ver o calendário. Cada erro custa um coração, e a revisão devolve." },
  { id: "trail-challenges", route: "/(tabs)", target: "trail-challenges", animation: "pular", mood: "checklist", chapter: "Trilha", title: "Missões e desafios", text: "No troféu ficam as 3 missões do dia, o desafio de ofensiva (7 a 100 dias) e o desafio do mês. Tudo rende moedas Lumi!" },
  { id: "trail-paths", route: "/(tabs)", target: "trail-paths", animation: "acenar", mood: "ideia", chapter: "Trilha", title: "Atalhos especiais", text: "O Modo criança tem 21 histórias narradas para os pequenos. Ω e א abrem o Leitor para ler a Bíblia em grego e em hebraico." },
  { id: "trail-book", route: "/(tabs)", target: "trail-book", animation: "ler", chapter: "Trilha", title: "Escolha o livro", text: "Siga a jornada na ordem da Bíblia ou estude separadamente o livro que quiser." },
  { id: "bible", route: "/(tabs)/bible", target: "bible-toolbar", animation: "ler", mood: "lupa", chapter: "Bíblia", title: "A Bíblia sempre aberta", text: "Troque livro, capítulo e versão. Toque num versículo para destacar, anotar, memorizar ou ver o original. O mapa mostra onde tudo aconteceu." },
  { id: "study-review", route: "/(tabs)/study", target: "study-review", animation: "ensinar", chapter: "Estudar", title: "Revisão no tempo certo", text: "O que você errou volta na hora certa para fixar de vez. É aqui também que se recuperam corações." },
  { id: "study-noah", route: "/(tabs)/study", target: "study-noah", animation: "estudar", chapter: "Estudar", title: "Professor Noah", text: "Ficou com dúvida? O Noah explica com a Bíblia aberta: contexto, palavras e por que a resposta está certa." },
  { id: "study-languages", route: "/(tabs)/study", target: "study-languages", scroll: "study", animation: "estudar", mood: "escrevendo", chapter: "Estudar", title: "Grego e hebraico de verdade", text: "Cada idioma tem trilha, alfabeto para traçar, léxico com áudio e o Leitor, que vai de palavras soltas até João 1 e Gênesis 1." },
  { id: "study-tools", route: "/(tabs)/study", target: "study-tools", scroll: "study", animation: "binoculo", chapter: "Estudar", title: "Ferramentas de estudo", text: "Memorizar versículos, busca bíblica, mapas, linha do tempo e o seu caderno de anotações ficam todos aqui." },
  { id: "achievements", route: "/(tabs)/achievements", target: "achievements-header", animation: "trofeu", chapter: "Conquistas", title: "Medalhas e missões", text: "As medalhas bloqueadas aparecem como silhueta: toque para ver o que falta. Logo abaixo, o resumo das missões do dia." },
  { id: "profile", route: "/(tabs)/profile", target: "profile-lumi", animation: "joinha", chapter: "Perfil", title: "Moedas e skins da Lumi", text: "Lições e missões rendem moedas. Troque por roupinhas na loja: a skin escolhida aparece aqui, no seu Perfil." },
  { id: "profile-calendar", route: "/(tabs)/profile", target: "profile-calendar", scroll: "profile", animation: "pular", mood: "progresso", chapter: "Perfil", title: "Calendário de constância", text: "Cada dia estudado acende o calendário. Eu fico mais feliz a cada dia seguido… e choro quando você some! 😅" },
  { id: "profile-settings", route: "/(tabs)/profile", target: "profile-settings", scroll: "profile", animation: "estudar", mood: "notebook", chapter: "Perfil", title: "Do seu jeito", text: "Em “Como quero estudar” você escolhe a meta diária e o desafio de ofensiva. Aqui também ficam lembretes, widget, modo criança e tema." },
  { id: "finish", route: "/(tabs)", animation: "trofeu", chapter: "Tudo pronto", title: "Bora começar, {nome}?", text: "Para rever este tour: Perfil › Rever tour da Lumi. Te espero na primeira lição!" }
];

/** Conta nova: ainda não estudou nada (o tour só abre sozinho nesse caso). */
export function isNewLearner(progress: { xp: number; completedLessonIds: readonly string[]; activity: Record<string, unknown>; lastStudyDate?: string }) {
  return progress.xp === 0 && progress.completedLessonIds.length === 0 && !progress.lastStudyDate && Object.keys(progress.activity).length === 0;
}

/** Chapéus de capítulo (para os pontinhos de progresso). */
export function tourChapters(steps: readonly TourStep[] = APP_TOUR) {
  return [...new Set(steps.map((step) => step.chapter))];
}

export type Rect = { x: number; y: number; width: number; height: number };

/** Posição do balão: abaixo do alvo quando cabe, senão acima; sem alvo, centralizado. */
export function calloutPlacement(target: Rect | undefined, screenHeight: number, cardHeight: number, margin = 14): { top: number; side: "below" | "above" | "center" } {
  if (!target) return { top: Math.max(margin, (screenHeight - cardHeight) / 2), side: "center" };
  const below = target.y + target.height + margin;
  if (below + cardHeight <= screenHeight - margin) return { top: below, side: "below" };
  return { top: Math.max(margin, target.y - margin - cardHeight), side: "above" };
}
