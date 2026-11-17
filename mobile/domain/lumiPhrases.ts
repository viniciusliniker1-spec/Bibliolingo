/**
 * Falas e reações da Lumi.
 *
 * Cada evento tem um conjunto de falas. O cérebro (lumiBrain.ts) sorteia sem repetir
 * até esgotar o conjunto e prefere as falas que combinam com o momento da pessoa.
 *
 * Uma fala pode ser só um texto ou { text, when, weight, animation }:
 *   when  condições para valer: hours [início, fim), weekdays (0 = domingo),
 *         streak [mín, máx], gap [mín, máx] (dias sem estudar), books, groups,
 *         lowHearts, goalDone. Falas com condição têm prioridade sobre as genéricas.
 *
 * Variáveis (uma fala só é usada se todas as suas variáveis existirem):
 *   {nome} quem estuda · {licao} próxima lição · {livro} livro atual
 *   {caps} capítulos da unidade · {dias} dias seguidos · {faltam} lições até o checkpoint
 *   {minutos} duração da próxima lição · {foradias} dias sem estudar
 *
 * Animações: pular, trofeu, dormir, ler, ensinar, joinha, lanterna, binoculo, estudar.
 * A `acenar` (vinda de vídeo, traço diferente) é reservada a saudações únicas e não
 * pode ser usada aqui (há teste).
 *
 * Personalidade: animada, carinhosa, bem-humorada e curiosa. O humor brinca com as
 * histórias, nunca com Deus, Jesus ou a fé de alguém. Cada fala cabe em 110 caracteres.
 */
import type { LumiRuleSet, PhraseEntry } from "./lumiBehavior";
import { LUMI_FACTS, LUMI_GENERAL_FACTS } from "./lumiFacts";

const factLines: PhraseEntry[] = [
  ...Object.entries(LUMI_FACTS).flatMap(([book, facts]) => facts.map((text) => ({ text, when: { books: [book] }, weight: 4 }))),
  ...LUMI_GENERAL_FACTS
];

export const LUMI_RULES: LumiRuleSet = {
  abrir: {
    animation: "joinha",
    animations: ["joinha", "pular"],
    returnAfterMs: 4200,
    phrases: [
      "Oi! Que bom te ver por aqui.",
      "Shalom! Vamos estudar um pouquinho hoje?",
      "Oi, {nome}! Que bom te ver de novo.",
      "Bom te ver, {nome}! Hoje é dia de “{licao}”.",
      "{nome}, sua sequência está em {dias} dias. Vamos manter?",
      "Shalom, {nome}! Hoje tem “{licao}” fresquinha.",
      "Olha quem chegou! Eu estava te esperando, {nome}.",
      "Separei a lanterna para {caps}. Vamos?",
      { text: "Bom dia, {nome}! Começar o dia com a Palavra muda o tom de tudo.", when: { hours: [5, 12] } },
      { text: "Bom dia! Café na mão e “{licao}” na tela, {nome}?", when: { hours: [5, 12] } },
      { text: "Boa tarde, {nome}! Um intervalinho para a Palavra?", when: { hours: [12, 18] } },
      { text: "Boa noite, {nome}! Uma lição antes de descansar?", when: { hours: [18, 24] } },
      { text: "Madrugada de estudo, {nome}? Eu faço companhia, mas depois vamos dormir!", when: { hours: [0, 5] } },
      { text: "Domingo, {nome}! Dia bom para estudar com calma.", when: { weekdays: [0] } },
      { text: "Sábado de estudo? Gostei da disposição, {nome}!", when: { weekdays: [6] } },
      { text: "{dias} dias seguidos, {nome}! Hoje a gente continua a lenda.", when: { streak: [7, 9999] } },
      { text: "Sua sequência de {dias} dias depende de hoje, {nome}. Bora?", when: { gap: [1, 1], streak: [2, 9999] } },
      { text: "Estou lendo {livro} com você. Que livro bom, {nome}!", when: { gap: [0, 0] } }
    ]
  },
  saudade: {
    animation: "joinha",
    animations: ["joinha", "pular"],
    returnAfterMs: 5200,
    phrases: [
      "Que saudade, {nome}! Faz {foradias} dias. Vamos recomeçar devagar?",
      "Você sumiu! Mas a trilha continua aqui. Bora retomar?",
      "Voltou! Até o filho pródigo foi bem recebido. Senti sua falta!",
      "{nome}! Eu estava de olho na porta. Uma lição curtinha para esquentar?",
      { text: "Dois dias sem você, {nome}… Estava tudo muito quieto por aqui.", when: { gap: [2, 2] } },
      { text: "Uma semana! Sem cobrança: começamos com uma lição só, combinado?", when: { gap: [7, 9999] } }
    ]
  },
  idle: {
    animation: "ler",
    animations: ["binoculo", "ler", "estudar", "lanterna"],
    phrases: [
      "Vamos para “{licao}”? Leva {minutos} min.",
      "Estou lendo {caps}. Vem comigo?",
      "Faltam {faltam} lições para o checkpoint.",
      "Noé esperou 40 dias de chuva. Você só precisa de {minutos} minutinhos!",
      "Abraão saiu sem saber para onde ia. Você pelo menos tem a trilha!",
      "Tem lição esperando por você. Eu fico aqui, de olho!",
      { text: "O Pentateuco é a base de tudo. Vamos com calma e firmeza, {nome}.", when: { groups: ["pentateuco"] } },
      { text: "Histórias, batalhas e reis: {livro} é cheio de ação!", when: { groups: ["historicos"] } },
      { text: "Poesia pede leitura lenta: leia {caps} como quem saboreia.", when: { groups: ["poeticos"] } },
      { text: "Os profetas falam forte, mas sempre apontam para a esperança.", when: { groups: ["profetas"] } },
      { text: "Estamos caminhando com Jesus em {livro}. Que privilégio!", when: { groups: ["evangelhos"] } },
      { text: "Atos: a Palavra ganhando o mundo, uma cidade de cada vez.", when: { groups: ["atos"] } },
      { text: "Cartas escritas a gente de verdade, com problemas de verdade. E servem para nós!", when: { groups: ["cartas"] } },
      { text: "Apocalipse é cheio de símbolos. Vamos devagar, com a lanterna acesa!", when: { groups: ["apocalipse"] } },
      { text: "Boa noite de estudo! Uma lição agora e você dorme com a cabeça tranquila.", when: { hours: [20, 24] } },
      { text: "Manhã é ótimo horário para aprender. A cabeça está fresquinha!", when: { hours: [5, 11] } },
      { text: "Corações baixos? Uma revisão devolve a energia e fixa o que errou.", when: { lowHearts: true } },
      { text: "Meta do dia batida! Cada lição agora é bônus para sua sequência.", when: { goalDone: true } }
    ]
  },
  checkpoint: {
    animation: "ler",
    animations: ["lanterna", "ler"],
    phrases: [
      "Hora do checkpoint! Vamos revisar {caps} juntos.",
      "Respira: você já estudou tudo isso. Bora?",
      "Como Neemias: um tijolo de cada vez, e o muro fica pronto.",
      "Checkpoint é só uma conversa sobre o que você já sabe. Eu confio em você!",
      "Pode vir, {nome}! Eu seguro a lanterna e você manda ver.",
      { text: "Uma revisão ainda no mesmo dia? Memória agradece, {nome}!", when: { goalDone: true } },
      { text: "Com {dias} dias de sequência, esse checkpoint é moleza.", when: { streak: [5, 9999] } }
    ]
  },
  concluir: {
    animation: "pular",
    animations: ["joinha", "pular"],
    returnAfterMs: 3600,
    phrases: [
      "Muito bem! Próxima: “{licao}”.",
      "Isso aí, {nome}! Mais um passo em {livro}.",
      "Você está voando! Faltam {faltam} para o checkpoint.",
      "Mandou bem! Mais firme que casa construída na rocha.",
      "Davi venceu com uma pedrinha. Você vence uma lição de cada vez!",
      "Mais uma! Se continuar assim, vou ter que comprar mais lanterna.",
      "Lição na conta! Seu cérebro está agradecendo, {nome}.",
      { text: "Meta do dia batida! Agora tudo é bônus, {nome}.", when: { goalDone: true } },
      { text: "{dias} dias seguidos e mais uma lição. Constância é o seu nome!", when: { streak: [5, 9999] } },
      { text: "Ótima escolha estudar hoje. Amanhã vai agradecer!", when: { hours: [18, 24] } },
      { text: "Manhã produtiva! Já pode contar essa para o resto do dia.", when: { hours: [5, 12] } },
      { text: "Voltou com tudo! Pé ante pé a gente recupera o ritmo.", when: { gap: [1, 9999] } }
    ]
  },
  unidade: {
    animation: "trofeu",
    returnAfterMs: 4200,
    phrases: [
      "Unidade concluída! Que conquista, {nome}!",
      "Checkpoint vencido! Vamos para a próxima unidade?",
      "Nem as muralhas de Jericó resistiram a tanta constância!",
      "Mais uma unidade na bagagem. Eu já estava comemorando por dentro!",
      "Isso merece um troféu! Cuidado que ele é pesado, hein.",
      { text: "Unidade vencida com {dias} dias de sequência. Impressionante!", when: { streak: [7, 9999] } }
    ]
  },
  sequencia: {
    animation: "trofeu",
    returnAfterMs: 4200,
    phrases: [
      "{dias} dias seguidos! Você é constante, {nome}!",
      "Sequência de {dias} dias. Que orgulho!",
      "{dias} dias! Mais pontual que o maná de cada manhã.",
      "{dias} dias de estudo! Já posso te chamar de veterano?",
      "Olha o fogo: {dias} dias seguidos. Não deixa apagar!",
      "Que sequência linda! A constância é o segredo de quem aprende de verdade."
    ]
  },
  erro: {
    animation: "ensinar",
    animations: ["ensinar", "joinha"],
    returnAfterMs: 4200,
    phrases: [
      "Errar faz parte de aprender. Vamos ver de novo?",
      "Quase! Revise comigo e tente outra vez.",
      "Boa tentativa, {nome}. Eu te explico.",
      "Até Pedro afundou um pouquinho. O segredo é estender a mão de novo!",
      "Tomé também precisou ver de perto. Vamos olhar outra vez?",
      "Sem drama: o erro de agora é o acerto de amanhã.",
      "Respira e tenta de novo. O texto tem a resposta, só precisa de uma segunda olhada.",
      { text: "Seus corações estão acabando. Calma: errar aqui não é pecado, é prática!", when: { lowHearts: true } }
    ]
  },
  parado: {
    animation: "dormir",
    phrases: [
      "Zzz… toque em mim quando quiser continuar.",
      "Vou tirar um cochilo… me chama!",
      "Zzz… Êutico também cochilou num sermão comprido. Me acorda?",
      "Hoaaam… vou contar ovelhinhas. Me chama quando voltar!",
      "Zzz… sonhando com “{licao}”. Toque aqui para continuar!"
    ]
  },
  acordar: {
    animation: "joinha",
    animations: ["joinha", "pular"],
    returnAfterMs: 4200,
    phrases: [
      "Opa! Voltei. Bora para “{licao}”?",
      "Estou aqui! Que tal só {minutos} minutinhos?",
      "Oi, {nome}! Pronto para continuar?",
      "Acordei! Igual a Samuel: “Fala, que eu escuto!”",
      "Que soneca boa! E você, já fez a sua lição hoje?",
      { text: "Bom dia! Dormi bem. E você, quer começar o dia estudando?", when: { hours: [5, 11] } }
    ]
  },
  concluido: {
    animation: "trofeu",
    phrases: [
      "Você concluiu {livro}! Escolha o próximo livro no topo.",
      "{livro} completo! Que caminhada, {nome}!",
      "Fim de {livro}! Um livro inteiro estudado. Orgulho define.",
      "Livro concluído! Agora é escolher a próxima aventura lá em cima.",
      { text: "{livro} completo e {dias} dias de sequência. Você é incrível!", when: { streak: [5, 9999] } }
    ]
  },
  toque: {
    animation: "pular",
    animations: ["pular", "joinha", "binoculo", "lanterna", "estudar"],
    returnAfterMs: 9000,
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
      "Josué deu sete voltas em Jericó. Eu dou sete pulinhos de alegria!",
      "Noé passou 40 dias na arca com todos os bichos. Eu aqui só tenho você!",
      "Moisés começou a missão aos 80 anos. Nunca é tarde para aprender!",
      "Abraão tinha 100 anos quando Isaque nasceu. Paciência rende!",
      "Naamã mergulhou sete vezes no Jordão. Persistência dá resultado!",
      "O maná vinha uma porção por dia. Estudo também rende assim.",
      "Estou de olho na trilha, {nome}! Tem lição fresquinha esperando.",
      "Sabia que {livro} tem muito a dizer? Vem comigo!",
      { text: "{dias} dias de sequência. Isso merece um joinha!", when: { streak: [2, 9999] } },
      { text: "Noite estrelada… Abraão contou estrelas. Você conta lições!", when: { hours: [19, 24] } },
      { text: "Bom dia! Até o maná chegava cedinho.", when: { hours: [5, 11] } },
      { text: "Ontem você estudou e hoje voltou. É assim que a sequência cresce!", when: { gap: [1, 1] } }
    ]
  },
  cocegas: {
    animation: "pular",
    animations: ["pular", "joinha"],
    returnAfterMs: 9000,
    phrases: [
      "Hihi! Cócegas, não!",
      "Para, para! Minha lã é sensível!",
      "Se continuar assim, vou rir até a próxima lição!",
      "Já entendi: você quer conversar! Toca nos botões aí embaixo.",
      "Gosto de atenção, mas gosto mais de lição concluída, hein!",
      "Tá bom, tá bom! Você me pegou. Hihi!"
    ]
  },
  tonta: {
    animation: "dormir",
    phrases: [
      "Uuuf… fiquei tonta de tanto cutucar. Vou cochilar um pouquinho!",
      "Nossa, girei mais que a muralha de Jericó. Vou me deitar um minuto…"
    ]
  },
  anima: {
    animation: "joinha",
    animations: ["joinha", "pular", "estudar"],
    returnAfterMs: 9000,
    phrases: [
      "Você já chegou até aqui, {nome}. O próximo passo é só “{licao}”.",
      "Um passo de cada vez: até o Jordão foi atravessado pé ante pé.",
      "Errou? Aprendeu. Acertou? Fixou. Em qualquer caso você ganha!",
      "Estudar um pouquinho todo dia vale mais que muito de vez em quando.",
      "Eu acredito em você, {nome}! E olha que sou só uma ovelhinha de olho bom.",
      "Cada lição é um tijolo, como no muro de Neemias. O seu já está subindo!",
      "Respire fundo. Você sabe mais do que imagina.",
      { text: "Faltam só {faltam} lições para o checkpoint. Você dá conta!", when: { gap: [0, 9999] } },
      { text: "Recomeçar também é avançar, {nome}. Uma lição hoje e a gente se ajeita!", when: { gap: [2, 9999] } },
      { text: "Corações baixos? Revisar devolve força e fixa o que errou. Bora?", when: { lowHearts: true } },
      { text: "Meta do dia batida! Agora tudo é bônus, {nome}.", when: { goalDone: true } },
      { text: "{dias} dias seguidos! Quem faz isso tem constância de verdade.", when: { streak: [7, 9999] } },
      { text: "Dia cansativo? Uma lição curtinha acalma a cabeça antes de dormir.", when: { hours: [20, 24] } },
      { text: "Começar o dia com a Palavra muda o tom de tudo. Vai fundo!", when: { hours: [5, 11] } },
      { text: "Madrugada é para descansar, mas se está aqui, vamos com calma e carinho.", when: { hours: [0, 5] } }
    ]
  },
  curiosidade: {
    animation: "binoculo",
    animations: ["binoculo", "ler", "lanterna", "estudar"],
    returnAfterMs: 9000,
    phrases: factLines
  },
  piada: {
    animation: "pular",
    animations: ["pular", "joinha"],
    returnAfterMs: 9000,
    phrases: [
      "Quem foi o melhor construtor da Bíblia? Noé: a obra dele flutuou!",
      "Moisés é craque em mapas: abriu o Mar Vermelho em dois!",
      "Os magos tinham o primeiro GPS: uma estrela!",
      "Zaqueu foi o primeiro a subir de nível: subiu até na árvore!",
      "Davi levou 5 pedras e só usou 1. Sabe planejar!",
      "Qual foi a primeira maratona? 40 anos no deserto. E ainda reclamaram do caminho!",
      "Matusalém nunca chegava atrasado: tinha 969 anos para se organizar!",
      "Por que Jonas não gosta de peixaria? Teve uma experiência de três dias.",
      "O que Adão disse na primeira lição? “Não tenho nada para vestir.” Brincadeira, hein!",
      "Josué foi o melhor demolidor: derrubou uma muralha sem martelo!",
      "Daniel nunca reclamou de trânsito: já tinha passado a noite com leões!",
      "O melhor guia do deserto? A coluna de nuvem: nunca perdeu o sinal!"
    ]
  }
};
