/**
 * Tour guiado do primeiro acesso: a Lumi passa por cada tela funcional do app
 * e destaca o elemento real de cada recurso.
 *
 * `route` é a aba aberta no passo; `target` é o elemento destacado (registrado
 * com useTourTarget na tela). Sem alvo, o passo aparece centralizado.
 */
import type { LumiAnimationId } from "./lumiBehavior";

export type TourRoute = "/(tabs)" | "/(tabs)/bible" | "/(tabs)/study" | "/(tabs)/achievements" | "/(tabs)/profile";

export interface TourStep {
  id: string;
  route: TourRoute;
  target?: string;
  animation: LumiAnimationId;
  chapter: string;
  title: string;
  text: string;
}

export const APP_TOUR: TourStep[] = [
  { id: "welcome", route: "/(tabs)", animation: "acenar", chapter: "Boas-vindas", title: "Oi, {nome}! Eu sou a Lumi.", text: "Vou te mostrar cada canto do app. Prometo ser bem mais rápida que os 40 anos no deserto!" },
  { id: "trail-node", route: "/(tabs)", target: "trail-current", animation: "ler", chapter: "Trilha", title: "Sua próxima lição", text: "Cada círculo é uma lição de poucos minutos. O que brilha é o próximo: toque nele para ver o resumo e começar." },
  { id: "trail-cta", route: "/(tabs)", target: "trail-continue", animation: "ensinar", chapter: "Trilha", title: "Lições que variam", text: "Escolher, certo ou errado, digitar, montar frases, ligar pares, ordenar acontecimentos… o formato combina com o conteúdo." },
  { id: "trail-stats", route: "/(tabs)", target: "trail-stats", animation: "pular", chapter: "Trilha", title: "Sequência, XP e corações", text: "Cada erro custa um coração. Se acabarem, a revisão devolve um por acerto. Até Pedro afundou um pouquinho!" },
  { id: "trail-book", route: "/(tabs)", target: "trail-book", animation: "ler", chapter: "Trilha", title: "Escolha o livro", text: "Siga a jornada na ordem da Bíblia ou estude separadamente o livro que quiser." },
  { id: "bible", route: "/(tabs)/bible", target: "bible-toolbar", animation: "ler", chapter: "Bíblia", title: "A Bíblia sempre aberta", text: "Troque livro, capítulo e versão aqui em cima. Toque em um versículo para destacar, anotar, memorizar ou ver o original." },
  { id: "study-review", route: "/(tabs)/study", target: "study-review", animation: "ensinar", chapter: "Estudar", title: "Revisão no tempo certo", text: "O que você errou volta na hora certa para fixar de vez. É aqui também que se recuperam corações." },
  { id: "study-noah", route: "/(tabs)/study", target: "study-noah", animation: "ensinar", chapter: "Estudar", title: "Professor Noah", text: "Ficou com dúvida? O Noah explica com a Bíblia aberta: contexto, palavras e por que a resposta está certa." },
  { id: "achievements", route: "/(tabs)/achievements", target: "achievements-header", animation: "trofeu", chapter: "Conquistas", title: "Medalhas para colecionar", text: "As bloqueadas aparecem só como silhueta. Toque em uma para ver o que falta para ganhar." },
  { id: "profile", route: "/(tabs)/profile", target: "profile-lumi", animation: "pular", chapter: "Perfil", title: "Moedas e skins da Lumi", text: "Cada lição rende moedas. Troque por roupinhas na loja: a skin escolhida aparece aqui, no seu Perfil." },
  { id: "finish", route: "/(tabs)", animation: "trofeu", chapter: "Tudo pronto", title: "Bora começar, {nome}?", text: "Você pode rever este tour quando quiser em Perfil › Rever tour da Lumi. Te espero na primeira lição!" }
];

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
