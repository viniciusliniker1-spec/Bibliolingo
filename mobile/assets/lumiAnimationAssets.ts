import type { LumiAnimationId } from "../domain/lumiBehavior";

/**
 * Animações da Lumi (WebP animado com transparência), geradas por
 * mobile/scripts/lumi-animations/build.py a partir das folhas de poses originais.
 * O Metro só empacota arquivos citados em require estático.
 */
export const lumiAnimationAssets: Record<LumiAnimationId, number> = {
  acenar: require("./lumi-animations/acenar.webp"),
  pular: require("./lumi-animations/pular.webp"),
  trofeu: require("./lumi-animations/trofeu.webp"),
  dormir: require("./lumi-animations/dormir.webp"),
  ler: require("./lumi-animations/ler.webp"),
  ensinar: require("./lumi-animations/ensinar.webp")
};

export const lumiAnimationLabels: Record<LumiAnimationId, string> = {
  acenar: "Lumi acenando",
  pular: "Lumi pulando de alegria",
  trofeu: "Lumi erguendo um troféu",
  dormir: "Lumi bocejando e dormindo",
  ler: "Lumi lendo a Bíblia",
  ensinar: "Lumi ensinando outros cordeirinhos"
};
