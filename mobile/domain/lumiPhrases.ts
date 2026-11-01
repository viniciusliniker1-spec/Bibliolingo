/**
 * Falas e reações da Lumi.
 *
 * Para mudar o que a Lumi fala, edite somente as frases abaixo. Cada evento
 * alterna entre as suas frases, uma por vez. Variáveis disponíveis:
 *   {nome}    nome de quem estuda
 *   {licao}   título da próxima lição
 *   {livro}   livro atual (ex.: Gênesis)
 *   {caps}    capítulos da unidade atual (ex.: Gênesis 1–3)
 *   {dias}    dias seguidos de estudo
 *   {faltam}  lições que faltam até o checkpoint
 *   {minutos} duração estimada da próxima lição
 *
 * Animações disponíveis: acenar, pular, trofeu, dormir, ler, ensinar.
 */
import type { LumiRuleSet } from "./lumiBehavior";

export const LUMI_RULES: LumiRuleSet = {
  abrir: {
    animation: "acenar",
    returnAfterMs: 4200,
    phrases: [
      "Oi, {nome}! Que bom te ver de novo.",
      "Bom te ver, {nome}! Hoje é dia de “{licao}”.",
      "{nome}, sua sequência está em {dias} dias. Vamos manter?"
    ]
  },
  idle: {
    animation: "ler",
    phrases: [
      "Vamos para “{licao}”? Leva {minutos} min.",
      "Estou lendo {caps}. Vem comigo?",
      "Faltam {faltam} lições para o checkpoint."
    ]
  },
  checkpoint: {
    animation: "ler",
    phrases: [
      "Hora do checkpoint! Vamos revisar {caps} juntos.",
      "Respira: você já estudou tudo isso. Bora?"
    ]
  },
  concluir: {
    animation: "pular",
    returnAfterMs: 3600,
    phrases: [
      "Muito bem! Próxima: “{licao}”.",
      "Isso aí, {nome}! Mais um passo em {livro}.",
      "Você está voando! Faltam {faltam} para o checkpoint."
    ]
  },
  unidade: {
    animation: "trofeu",
    returnAfterMs: 4200,
    phrases: [
      "Unidade concluída! Que conquista, {nome}!",
      "Checkpoint vencido! Vamos para a próxima unidade?"
    ]
  },
  sequencia: {
    animation: "trofeu",
    returnAfterMs: 4200,
    phrases: [
      "{dias} dias seguidos! Você é constante, {nome}!",
      "Sequência de {dias} dias. Que orgulho!"
    ]
  },
  erro: {
    animation: "ensinar",
    returnAfterMs: 4200,
    phrases: [
      "Errar faz parte de aprender. Vamos ver de novo?",
      "Quase! Revise comigo e tente outra vez.",
      "Boa tentativa, {nome}. Eu te explico."
    ]
  },
  parado: {
    animation: "dormir",
    phrases: [
      "Zzz… toque em mim quando quiser continuar.",
      "Vou tirar um cochilo… me chama!"
    ]
  },
  acordar: {
    animation: "acenar",
    returnAfterMs: 4200,
    phrases: [
      "Opa! Voltei. Bora para “{licao}”?",
      "Estou aqui! Que tal só {minutos} minutinhos?",
      "Oi, {nome}! Pronto para continuar?"
    ]
  },
  concluido: {
    animation: "trofeu",
    phrases: [
      "Você concluiu {livro}! Escolha o próximo livro no topo.",
      "{livro} completo! Que caminhada, {nome}!"
    ]
  }
};
