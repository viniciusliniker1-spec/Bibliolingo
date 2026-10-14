import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";

const units:ExpansionUnit[]=[
{id:"2-kings-u02",title:"Elias parte, Eliseu serve",subtitle:"Transição profética e sinais de misericórdia em 2 Reis 1–6",chapters:chapterRange(1,6),topics:[
["Fogo, autoridade e partida","2 Reis 1–2",1,2,"Elias confronta Acazias, atravessa o Jordão e é levado; Eliseu recebe o manto e inicia seu ministério.","Autoridade profética procede do chamado de Deus, não de autopromoção."],
["Água, azeite e vida","2 Reis 3–4",3,4,"Eliseu participa de uma crise militar, multiplica o azeite de uma viúva e intercede pelo filho da sunamita.","A ação divina alcança crises nacionais e necessidades domésticas."],
["Naamã aprende humildade","2 Reis 5",5,5,"O comandante sírio é curado ao abandonar expectativas grandiosas; Geazi tenta transformar graça em lucro.","Graça não pode ser comprada, e orgulho pode impedir uma resposta simples."],
["Machado, cerco e olhos abertos","2 Reis 6",6,6,"Eliseu recupera um machado, revela estratégias e impede vingança contra soldados sírios capturados.","Poder espiritual pode servir à vida e interromper ciclos de violência."]
]},
{id:"2-kings-u03",title:"Reviravoltas e dinastias",subtitle:"Livramento de Samaria e queda da casa de Acabe em 2 Reis 7–10",chapters:chapterRange(7,10),topics:[
["Boas-novas no acampamento","2 Reis 7",7,7,"Quatro leprosos descobrem que o exército sírio fugiu e levam a notícia à cidade faminta.","Pessoas marginalizadas podem tornar-se mensageiras de vida para toda a comunidade."],
["A sunamita e Hazael","2 Reis 8",8,8,"A mulher recupera sua terra, enquanto Eliseu chora ao prever a violência que Hazael praticará.","Discernir o futuro não torna o sofrimento humano indiferente ao profeta."],
["Jeú executa o juízo","2 Reis 9",9,9,"Jeú é ungido e elimina Jorão, Acazias e Jezabel, cumprindo palavras contra a casa de Acabe.","O texto narra juízo político violento sem transformá-lo em modelo para a missão cristã."],
["Zelo misturado","2 Reis 10",10,10,"Jeú destrói a casa de Acabe e o culto de Baal, mas conserva os bezerros de Jeroboão.","Uma reforma seletiva pode combater um mal enquanto preserva outro conveniente."]
]},
{id:"2-kings-u04",title:"Reis, templo e palavra",subtitle:"Atalia, Joás e os últimos dias de Eliseu em 2 Reis 11–13",chapters:chapterRange(11,13),topics:[
["Atalia e o menino escondido","2 Reis 11",11,11,"Atalia tenta eliminar a linhagem real, mas Joás é preservado no templo e apresentado ao povo por Joiada.","A esperança pode sobreviver silenciosamente enquanto o poder parece absoluto."],
["Joás repara o templo","2 Reis 12",12,12,"O rei organiza recursos para reparos e cria prestação de contas aos trabalhadores, embora seu reinado termine em conspiração.","Boa administração importa, mas uma obra concluída não garante fidelidade vitalícia."],
["Eliseu e a flecha","2 Reis 13:1–19",13,13,"Em meio à opressão síria, Eliseu orienta Joás a disparar a flecha de vitória e o confronta por sua resposta limitada.","Esperança recebida pede perseverança, não participação hesitante."],
["Vida junto aos ossos","2 Reis 13:20–25",13,13,"Mesmo após a morte de Eliseu, um homem revive ao tocar seus ossos, e Israel recebe alívio por causa da aliança.","A fidelidade divina ultrapassa a vida de um líder e sustenta seu propósito."]
]},
{id:"2-kings-u05",title:"Samaria cai, Judá permanece",subtitle:"Declínio do Norte e fé de Ezequias em 2 Reis 14–20",chapters:chapterRange(14,20),topics:[
["Prosperidade sem cura","2 Reis 14–16",14,16,"Vitórias e expansão coexistem com orgulho, golpes e a idolatria de Acaz, que remodela o templo segundo Damasco.","Crescimento político não deve ser confundido com saúde espiritual."],
["A queda de Samaria","2 Reis 17",17,17,"A Assíria conquista o reino do Norte; o narrador relaciona o exílio à longa rejeição da aliança e dos profetas.","Consequências históricas podem amadurecer após muitas advertências ignoradas."],
["Ezequias sob ameaça","2 Reis 18–19",18,19,"Rabsaqué usa propaganda para destruir confiança, mas Ezequias leva a carta ao templo e Isaías anuncia livramento.","Fé enfrenta mensagens de medo examinando-as diante de Deus."],
["Doença e embaixadores","2 Reis 20",20,20,"Ezequias recebe cura, mas exibe seus tesouros aos babilônios e ouve que um exílio futuro se aproxima.","Uma vitória pessoal não elimina a necessidade de humildade e visão para a próxima geração."]
]},
{id:"2-kings-u06",title:"Da reforma ao exílio",subtitle:"Manassés, Josias e a queda de Jerusalém em 2 Reis 21–25",chapters:chapterRange(21,25),topics:[
["Manassés e a medida cheia","2 Reis 21",21,21,"Manassés promove idolatria e derrama sangue inocente; sua influência é apresentada como parte decisiva da crise de Judá.","Liderança prolongada pode normalizar práticas que ferem gerações."],
["O livro reencontrado","2 Reis 22–23",22,23,"Josias ouve o livro da Lei, humilha-se e realiza ampla reforma, removendo altares e celebrando a Páscoa.","Renovação começa quando a Palavra ouvida produz arrependimento e mudanças concretas."],
["Os últimos reis","2 Reis 24",24,24,"Judá passa entre o domínio egípcio e babilônico; Joaquim é levado e Zedequias se rebela contra Babilônia.","Decisões tardias acontecem dentro de consequências acumuladas por muito tempo."],
["Jerusalém destruída","2 Reis 25",25,25,"A cidade e o templo são destruídos, o povo vai ao exílio e o livro termina com Joaquim recebendo lugar à mesa babilônica.","A pequena abertura final preserva esperança sem minimizar a catástrofe."]
]}
];
export const secondKingsExpandedUnits=buildExpansionUnits("2-kings","2 Reis",units);
