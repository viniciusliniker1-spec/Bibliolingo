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
  ensinar: require("./lumi-animations/ensinar.webp"),
  joinha: require("./lumi-animations/joinha.webp"),
  lanterna: require("./lumi-animations/lanterna.webp"),
  binoculos: require("./lumi-animations/binoculos.webp"),
  explorador: require("./lumi-animations/explorador.webp"),
  formatura: require("./lumi-animations/formatura.webp"),
  computador: require("./lumi-animations/computador.webp"),
  estudando: require("./lumi-animations/estudando.webp"),
  danca: require("./lumi-animations/danca.webp"),
  pensando: require("./lumi-animations/pensando.webp"),
  ideia: require("./lumi-animations/ideia.webp"),
  orando: require("./lumi-animations/orando.webp"),
  violao: require("./lumi-animations/violao.webp"),
  taca: require("./lumi-animations/taca.webp"),
  guerreiro: require("./lumi-animations/guerreiro.webp"),
  abraco: require("./lumi-animations/abraco.webp"),
  plantando: require("./lumi-animations/plantando.webp"),
  construtor: require("./lumi-animations/construtor.webp"),
  pintora: require("./lumi-animations/pintora.webp"),
  futebol: require("./lumi-animations/futebol.webp"),
  amanhecer: require("./lumi-animations/amanhecer.webp")
};

export const lumiAnimationLabels: Record<LumiAnimationId, string> = {
  acenar: "Lumi acenando",
  pular: "Lumi pulando de alegria",
  trofeu: "Lumi erguendo um troféu",
  dormir: "Lumi bocejando e dormindo",
  ler: "Lumi lendo a Bíblia",
  ensinar: "Lumi ensinando outros cordeirinhos",
  joinha: "Lumi fazendo joinha",
  lanterna: "Lumi com uma lanterna acesa",
  binoculos: "Lumi olhando com binóculos",
  explorador: "Lumi exploradora com chapéu e cajado",
  formatura: "Lumi formada com capelo e diploma",
  computador: "Lumi estudando no computador",
  estudando: "Lumi escrevendo e estudando",
  danca: "Lumi dançando de alegria",
  pensando: "Lumi pensando até ter uma ideia",
  ideia: "Lumi com uma lâmpada de ideia",
  orando: "Lumi orando",
  violao: "Lumi tocando violão",
  taca: "Lumi comemorando com uma taça",
  guerreiro: "Lumi com a armadura de Deus",
  abraco: "Lumi abraçando uma ovelhinha",
  plantando: "Lumi regando uma plantinha",
  construtor: "Lumi construtora com capacete",
  pintora: "Lumi pintando",
  futebol: "Lumi jogando bola",
  amanhecer: "Lumi espreguiçando ao nascer do sol"
};
