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
 *
 * O humor brinca com as histórias, nunca com Deus, Jesus ou a fé de alguém.
 */
import type { LumiRuleSet } from "./lumiBehavior";

export const LUMI_RULES: LumiRuleSet = {
  abrir: {
    animation: "acenar",
    returnAfterMs: 4200,
    animations: ["acenar", "amanhecer", "joinha", "acenar"],
    phrases: [
      "Oi, {nome}! Que bom te ver de novo.",
      "Bom te ver, {nome}! Hoje é dia de “{licao}”.",
      "{nome}, sua sequência está em {dias} dias. Vamos manter?",
      "Shalom, {nome}! Hoje tem “{licao}” fresquinha."
    ]
  },
  idle: {
    animation: "ler",
    animations: ["ler", "estudando", "computador", "lanterna", "ler"],
    phrases: [
      "Vamos para “{licao}”? Leva {minutos} min.",
      "Estou lendo {caps}. Vem comigo?",
      "Faltam {faltam} lições para o checkpoint.",
      "Noé esperou 40 dias de chuva. Você só precisa de {minutos} minutinhos!",
      "Abraão saiu sem saber para onde ia. Você pelo menos tem a trilha!"
    ]
  },
  checkpoint: {
    animation: "ler",
    animations: ["guerreiro", "ler", "guerreiro"],
    phrases: [
      "Hora do checkpoint! Vamos revisar {caps} juntos.",
      "Respira: você já estudou tudo isso. Bora?",
      "Como Neemias: um tijolo de cada vez, e o muro fica pronto."
    ]
  },
  concluir: {
    animation: "pular",
    returnAfterMs: 3600,
    animations: ["pular", "joinha", "danca", "violao", "taca"],
    phrases: [
      "Muito bem! Próxima: “{licao}”.",
      "Isso aí, {nome}! Mais um passo em {livro}.",
      "Você está voando! Faltam {faltam} para o checkpoint.",
      "Mandou bem! Mais firme que casa construída na rocha.",
      "Davi venceu com uma pedrinha. Você vence uma lição de cada vez!"
    ]
  },
  unidade: {
    animation: "trofeu",
    returnAfterMs: 4200,
    animations: ["trofeu", "formatura", "taca"],
    phrases: [
      "Unidade concluída! Que conquista, {nome}!",
      "Checkpoint vencido! Vamos para a próxima unidade?",
      "Nem as muralhas de Jericó resistiram a tanta constância!"
    ]
  },
  sequencia: {
    animation: "trofeu",
    returnAfterMs: 4200,
    animations: ["trofeu", "lanterna", "taca"],
    phrases: [
      "{dias} dias seguidos! Você é constante, {nome}!",
      "Sequência de {dias} dias. Que orgulho!",
      "{dias} dias! Mais pontual que o maná de cada manhã."
    ]
  },
  erro: {
    animation: "ensinar",
    returnAfterMs: 4200,
    animations: ["ensinar", "pensando", "ideia", "pensando", "ensinar"],
    phrases: [
      "Errar faz parte de aprender. Vamos ver de novo?",
      "Quase! Revise comigo e tente outra vez.",
      "Boa tentativa, {nome}. Eu te explico.",
      "Até Pedro afundou um pouquinho. O segredo é estender a mão de novo!",
      "Tomé também precisou ver de perto. Vamos olhar outra vez?"
    ]
  },
  parado: {
    animation: "dormir",
    phrases: [
      "Zzz… toque em mim quando quiser continuar.",
      "Vou tirar um cochilo… me chama!",
      "Zzz… Êutico também cochilou num sermão comprido. Me acorda?"
    ]
  },
  acordar: {
    animation: "acenar",
    returnAfterMs: 4200,
    animations: ["amanhecer", "acenar", "joinha", "amanhecer"],
    phrases: [
      "Opa! Voltei. Bora para “{licao}”?",
      "Estou aqui! Que tal só {minutos} minutinhos?",
      "Oi, {nome}! Pronto para continuar?",
      "Acordei! Igual a Samuel: “Fala, que eu escuto!”"
    ]
  },
  concluido: {
    animation: "trofeu",
    animations: ["formatura", "taca"],
    phrases: [
      "Você concluiu {livro}! Escolha o próximo livro no topo.",
      "{livro} completo! Que caminhada, {nome}!"
    ]
  },
  toque: {
    animation: "pular",
    animations: ["amanhecer", "joinha", "futebol", "binoculos", "lanterna", "explorador", "danca", "pular", "ideia", "construtor", "violao", "plantando", "pintora", "abraco", "guerreiro"],
    returnAfterMs: 4200,
    phrases: [
      "Matusalém viveu 969 anos. Mesmo assim, melhor não deixar “{licao}” para depois!",
      "Até a jumenta de Balaão falou. Eu só falo uma coisa: você consegue!",
      "Elias correu mais que a carruagem de Acabe. Corre comigo até a próxima lição?",
      "Zaqueu subiu na árvore para enxergar melhor. Eu subo na trilha com você!",
      "Gideão pediu sinal duas vezes. Eu te dou um: é hora de estudar!",
      "O povo andou 40 anos no deserto. Esta trilha é bem mais curta, prometo.",
      "Sobraram doze cestos na multiplicação. Aqui sobra XP!",
      "Ei, cócegas não! Ainda bem que não sou o carneiro do Abraão.",
      "Salomão pediu sabedoria. Pedir mais uma lição também conta, né?",
      "Neemias reconstruiu o muro em 52 dias. Sua sequência está em {dias}!",
      "Davi tocava harpa para acalmar Saul. Eu toco violão para te animar!",
      "Quem semeia com lágrimas colhe com alegria. Bora plantar mais uma lição?",
      "Bezalel era cheio de talento artístico. Eu fico com as cores, você com as lições!",
      "O Bom Pastor vai atrás da ovelha perdida. Que bom que você está aqui!",
      "Vista a armadura de Deus! Hoje a missão é só uma lição."
    ]
  }
};
