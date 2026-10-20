import { buildExpansionUnits, chapterRange, type ExpansionTopic, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
type T=[string,string,number,number,string]; type U=[string,string,string,number,number,string,[T,T,T,T]];
const data:U[]=[
["jeremiah-u02","Chamado para arrancar e plantar","Vocação e primeiras acusações em Jeremias 1–6",1,6,"A palavra profética revela infidelidade para abrir caminho ao retorno.",[
["Antes que te formasse","Jeremias 1",1,1,"Jeremias é chamado jovem, recebe palavras na boca e é enviado a arrancar, destruir, edificar e plantar."],
["Cisternas rachadas","Jeremias 2",2,2,"Judá abandona a fonte de água viva e cava fontes incapazes de reter água."],
["Volta, Israel","Jeremias 3–4",3,4,"A linguagem de aliança ferida sustenta um convite sincero ao retorno e à circuncisão do coração."],
["Paz quando não há paz","Jeremias 5–6",5,6,"Líderes tratam superficialmente a ferida do povo enquanto injustiça e invasão se aproximam."]
]],
["jeremiah-u03","O templo não é amuleto","Culto, aliança e lamento em Jeremias 7–10",7,10,"Símbolos religiosos não protegem uma comunidade que persiste em injustiça.",[
["O sermão do templo","Jeremias 7",7,7,"Jeremias confronta quem repete templo do Senhor enquanto oprime estrangeiro, órfão e viúva."],
["A colheita passou","Jeremias 8",8,8,"Falsa sabedoria e recusa de arrependimento levam o profeta a perguntar pelo bálsamo de Gileade."],
["Quem dera minha cabeça fosse água","Jeremias 9",9,9,"O profeta lamenta mentira e violência e chama o povo a gloriar-se em conhecer o Deus que pratica justiça."],
["Ídolos e o Deus vivo","Jeremias 10",10,10,"Objetos fabricados são contrastados com o Criador vivo e Rei das nações."]
]],
["jeremiah-u04","A aliança rejeitada","Conspiração, sinais e o oleiro em Jeremias 11–20",11,20,"Jeremias sofre por anunciar uma palavra que a comunidade prefere silenciar.",[
["Conspiração em Anatote","Jeremias 11–12",11,12,"A própria cidade de Jeremias planeja matá-lo, e o profeta pergunta por que perversos prosperam."],
["Cinto, seca e intercessão","Jeremias 13–15",13,15,"Sinais e crise mostram orgulho apodrecido; Jeremias intercede e também expressa profunda solidão."],
["Vida profética como sinal","Jeremias 16–17",16,17,"A vida pessoal do profeta comunica a crise, enquanto confiar em Deus é comparado a árvore junto às águas."],
["Na casa do oleiro","Jeremias 18–20",18,20,"O oleiro refaz o vaso, mas resistência endurece; Jeremias é ferido e lamenta ter nascido."]
]],
["jeremiah-u05","Reis, profetas e o Renovo","Liderança avaliada em Jeremias 21–25",21,25,"Poder político e religioso é medido por justiça, verdade e escuta.",[
["Pratica justiça pela manhã","Jeremias 21–22",21,22,"Reis de Judá são chamados a livrar o explorado, e luxo construído sem pagar trabalhadores é condenado."],
["Pastores e o Renovo justo","Jeremias 23",23,23,"Pastores dispersam o rebanho, mas Deus promete um descendente de Davi que governará com justiça."],
["Dois cestos de figos","Jeremias 24",24,24,"Exilados desprezados tornam-se sinal de futuro, enquanto a falsa segurança dos que ficaram é desfeita."],
["Setenta anos e o cálice","Jeremias 25",25,25,"Anos de recusa culminam em domínio babilônico, e as nações também responderão por sua violência."]
]],
["jeremiah-u06","O conflito pela palavra","Templo, jugo e carta aos exilados em Jeremias 26–29",26,29,"Discernir profecia exige verdade além da mensagem mais agradável.",[
["Jeremias quase é morto","Jeremias 26",26,26,"O sermão do templo provoca julgamento, mas anciãos recordam Miqueias e impedem a execução."],
["O jugo de Babilônia","Jeremias 27",27,27,"Jeremias usa um jugo para comunicar submissão temporária à Babilônia, contrariando nacionalismo religioso."],
["Jeremias e Hananias","Jeremias 28",28,28,"Hananias quebra o jugo e promete retorno rápido, mas sua palavra de paz não procede de Deus."],
["Buscai o bem da cidade","Jeremias 29",29,29,"A carta manda exilados construir, plantar e orar pela Babilônia enquanto esperam o tempo de Deus."]
]],
["jeremiah-u07","Consolação e nova aliança","Restauração em Jeremias 30–33",30,33,"Em meio ao cerco, Deus promete cura, retorno e uma aliança escrita no coração.",[
["Curarei tuas feridas","Jeremias 30",30,30,"O dia de angústia não é a palavra final; Deus promete quebrar jugos e restaurar seu povo."],
["Com amor eterno te amei","Jeremias 31:1–22",31,31,"A restauração reúne sobreviventes, consola o choro e conduz pessoas por caminhos seguros."],
["A nova aliança","Jeremias 31:23–40",31,31,"A instrução será escrita no coração, e perdão sustentará conhecimento de Deus."],
["Compra o campo","Jeremias 32–33",32,33,"Jeremias compra terra durante o cerco como sinal de futuro e ouve promessas de restauração davídica."]
]],
["jeremiah-u08","Palavras queimadas, promessas quebradas","Os últimos anos antes da queda em Jeremias 34–39",34,39,"A recusa da palavra aparece em decisões políticas, econômicas e pessoais.",[
["Escravos libertos e retomados","Jeremias 34",34,34,"Líderes libertam hebreus e depois os escravizam novamente, violando publicamente a aliança."],
["A fidelidade dos recabitas","Jeremias 35",35,35,"A obediência familiar dos recabitas contrasta com Judá, que repetidamente ignora profetas."],
["O rolo cortado","Jeremias 36",36,36,"Jeoaquim corta e queima o rolo, mas Jeremias dita novamente as palavras."],
["Na cisterna até a queda","Jeremias 37–39",37,39,"Jeremias é preso e resgatado por Ebede-Meleque; Zedequias hesita até Jerusalém cair."]
]],
["jeremiah-u09","Depois da catástrofe","Gedalias, fuga e palavra no Egito em Jeremias 40–45",40,45,"Sobreviventes continuam tomando decisões sob medo, violência e memória do desastre.",[
["Gedalias e o remanescente","Jeremias 40",40,40,"Gedalias organiza vida sob domínio babilônico e incentiva o povo a colher e permanecer."],
["Assassinato e medo","Jeremias 41",41,41,"Ismael mata Gedalias e outros, reacendendo instabilidade e temor de represália."],
["Perguntar sem obedecer","Jeremias 42–43",42,43,"O povo pede direção, promete obedecer e depois rejeita a ordem de permanecer, fugindo ao Egito."],
["A última palavra a Baruque","Jeremias 44–45",44,45,"Jeremias confronta idolatria no Egito, e Baruque aprende a não buscar grandeza durante juízo."]
]],
["jeremiah-u10","As nações também respondem","Oráculos internacionais em Jeremias 46–49",46,49,"Deus confronta impérios e povos sem tratar Babilônia como moralmente inocente.",[
["Egito derrotado","Jeremias 46",46,46,"O exército egípcio cai, mas uma promessa de disciplina limitada permanece para Israel."],
["Filístia e Moabe","Jeremias 47–48",47,48,"Guerra e orgulho recebem juízo, enquanto o profeta lamenta até pelo povo condenado."],
["Amom e Edom","Jeremias 49:1–22",49,49,"Apropriação de terra e confiança em sabedoria ou fortalezas não impedem prestação de contas."],
["Damasco, Quedar e Elão","Jeremias 49:23–39",49,49,"Oráculos alcançam cidades e povos distantes, terminando com promessa de futuro para Elão."]
]],
["jeremiah-u11","Babilônia cai, Jerusalém é lembrada","Juízo do império e apêndice histórico em Jeremias 50–52",50,52,"O instrumento de juízo também responde por arrogância, e a memória da queda preserva uma fresta de esperança.",[
["Fugi da Babilônia","Jeremias 50",50,50,"O império conquistador será julgado, e Israel e Judá buscarão novamente a aliança."],
["O martelo é quebrado","Jeremias 51",51,51,"Babilônia colhe a violência praticada e afunda simbolicamente com o rolo lançado no Eufrates."],
["Jerusalém e o templo destruídos","Jeremias 52:1–30",52,52,"O apêndice registra cerco, incêndio, exílio e perda dos utensílios sagrados."],
["Joaquim à mesa","Jeremias 52:31–34",52,52,"O rei exilado recebe libertação e lugar à mesa, pequena abertura para a continuidade davídica."]
]]
];
const units:ExpansionUnit[]=data.map(([id,title,subtitle,start,end,formation,topics])=>({id,title,subtitle,chapters:chapterRange(start,end),topics:topics.map(([t,l,s,e,i])=>[t,l,s,e,i,formation] as ExpansionTopic) as ExpansionUnit["topics"]}));
export const jeremiahExpandedUnits=buildExpansionUnits("jeremiah","Jeremias",units);
