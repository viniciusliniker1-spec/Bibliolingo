import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[
{id:"proverbs-u02",title:"A escola da sabedoria",subtitle:"Convites, advertências e escolhas em Provérbios 1–4",chapters:chapterRange(1,4),topics:[
["O temor do Senhor","Provérbios 1",1,1,"O livro começa ligando conhecimento ao temor do Senhor e alertando contra grupos que prometem ganho pela violência.","Sabedoria escolhe a quem ouvir antes de escolher o que fazer."],
["Buscar como tesouro","Provérbios 2",2,2,"A busca perseverante por sabedoria protege de caminhos perversos e relações destrutivas.","Discernimento é cultivado; não aparece apenas no momento da tentação."],
["Confiar de todo o coração","Provérbios 3",3,3,"Confiança em Deus, generosidade, disciplina e cuidado do próximo formam um caminho integrado.","Reconhecer Deus em todos os caminhos inclui dinheiro, relações e correção."],
["Guarda o coração","Provérbios 4",4,4,"O ensino compara sabedoria a herança e chama a guardar o coração, os olhos, a boca e os passos.","O rumo da vida é formado por atenções e hábitos repetidos."]
]},
{id:"proverbs-u03",title:"Desejo, compromisso e vozes",subtitle:"Fidelidade e o chamado público da sabedoria em Provérbios 5–9",chapters:chapterRange(5,9),topics:[
["Fidelidade conjugal","Provérbios 5",5,5,"A advertência contra adultério valoriza alegria e fidelidade na própria aliança.","Desejo precisa de verdade, consentimento e compromisso, não segredo destrutivo."],
["Dívida, preguiça e engano","Provérbios 6",6,6,"Garantias impensadas, falta de trabalho, mentira e adultério são apresentados como caminhos de perda.","Sabedoria prática percebe riscos antes que virem crises."],
["A sedução encenada","Provérbios 7",7,7,"Uma narrativa observa o jovem sem discernimento aproximar-se deliberadamente do perigo.","Evitar queda inclui reconhecer rotas, horários e escolhas que a preparam."],
["Dois banquetes","Provérbios 8–9",8,9,"Sabedoria e insensatez fazem convites públicos; uma conduz à vida, a outra oculta morte.","Toda formação oferece uma mesa; discernimento pergunta que vida ela produz."]
]},
{id:"proverbs-u04",title:"Palavras que constroem",subtitle:"Contrastes cotidianos em Provérbios 10–14",chapters:chapterRange(10,14),topics:[
["Boca e trabalho","Provérbios 10",10,10,"Diligência, palavras e integridade aparecem em contrastes breves entre o sábio e o insensato.","Pequenas escolhas de fala e trabalho acumulam consequências."],
["Generosidade e conselho","Provérbios 11",11,11,"Balanças honestas, conselhos e generosidade ligam caráter pessoal ao bem da cidade.","Justiça econômica e sabedoria relacional pertencem à mesma fé."],
["Correção e domínio da língua","Provérbios 12–13",12,13,"Aceitar disciplina, falar verdade e adiar impulsos distinguem o caminho sábio.","Crescimento exige ouvir correção e considerar efeitos das palavras."],
["Caminhos que parecem certos","Provérbios 14",14,14,"Aparências podem enganar; compaixão pelo pobre honra o Criador, e temor de Deus oferece refúgio.","Sinceridade não basta sem discernimento e justiça."]
]},
{id:"proverbs-u05",title:"Coração, fala e relações",subtitle:"Sabedoria social em Provérbios 15–19",chapters:chapterRange(15,19),topics:[
["A resposta branda","Provérbios 15",15,15,"Palavras podem acalmar ou incendiar, e Deus vê tanto culto quanto trato cotidiano.","Comunicação sábia une verdade, oportunidade e tom responsável."],
["Planos e orgulho","Provérbios 16",16,16,"Humanos planejam, mas dependem de Deus; orgulho antecede queda e poder deve servir à justiça.","Planejar com humildade reconhece limites sem abandonar responsabilidade."],
["Amizade e conflito","Provérbios 17–18",17,18,"Amigos, irmãos, fofoca, escuta e discussão mostram como relações são preservadas ou destruídas.","Ouvir antes de responder protege contra julgamentos apressados."],
["Pobreza, desejo e disciplina","Provérbios 19",19,19,"O capítulo confronta falso testemunho, pressa, negligência e desprezo ao pobre.","Sabedoria não mede dignidade por riqueza nem confunde desejo com direção."]
]},
{id:"proverbs-u06",title:"Justiça, vinho e liderança",subtitle:"Responsabilidade pública em Provérbios 20–24",chapters:chapterRange(20,24),topics:[
["Pesos honestos","Provérbios 20",20,20,"Comércio, bebida, conselho e julgamento revelam caráter em situações ordinárias.","Integridade é visível quando ninguém parece fiscalizar."],
["Justiça vale mais que ritual","Provérbios 21",21,21,"O coração do rei está sob Deus, e praticar justiça é preferível a sacrifício sem obediência.","Poder e religião permanecem sujeitos ao exame moral."],
["Boa reputação e limites","Provérbios 22",22,22,"Nome, educação, dívidas e cuidado do pobre mostram que decisões privadas têm dimensão social.","Formação sábia considera consequências para si e para o vulnerável."],
["Dizeres dos sábios","Provérbios 23–24",23,24,"Mesa de governantes, inveja, álcool, disciplina e justiça nos tribunais recebem advertências.","Sabedoria resiste tanto a excessos pessoais quanto à parcialidade pública."]
]},
{id:"proverbs-u07",title:"Sabedoria na corte e na comunidade",subtitle:"Coleções de Ezequias em Provérbios 25–29",chapters:chapterRange(25,29),topics:[
["Palavra no tempo certo","Provérbios 25",25,25,"Mensagens adequadas, autocontrole e relações com autoridades são comparados a imagens preciosas.","Verdade sábia considera momento, medida e destinatário."],
["O insensato e o preguiçoso","Provérbios 26",26,26,"Provérbios aparentemente opostos mostram que responder exige discernir a situação, não aplicar fórmulas.","Sabedoria interpreta o caso antes de citar uma frase."],
["Amizade que afia","Provérbios 27",27,27,"Elogio, correção, amizade e cuidado dos rebanhos destacam presença e responsabilidade contínuas.","Relações maduras oferecem verdade fiel, não apenas aprovação."],
["Governo e justiça","Provérbios 28–29",28,29,"Pobreza, suborno, confissão, disciplina e liderança justa afetam toda a população.","Quando justos governam há alegria; autoridade nunca é moralmente neutra."]
]},
{id:"proverbs-u08",title:"Humildade e sabedoria encarnada",subtitle:"Agur, Lemuel e a mulher valorosa em Provérbios 30–31",chapters:chapterRange(30,31),topics:[
["Não sei tudo","Provérbios 30:1–9",30,30,"Agur confessa limites, honra a palavra de Deus e pede nem pobreza nem riqueza.","Humildade intelectual e contentamento protegem contra mentira e autossuficiência."],
["Observar a criação","Provérbios 30:10–33",30,30,"Listas numéricas aprendem com formigas, animais pequenos e movimentos difíceis de explicar.","Sabedoria presta atenção ao mundo em vez de supor que já compreendeu tudo."],
["Fala por quem não tem voz","Provérbios 31:1–9",31,31,"A mãe de Lemuel adverte o rei contra excessos e o chama a defender pobres e necessitados.","Liderança sábia usa voz e julgamento em favor de quem é vulnerável."],
["A mulher de força","Provérbios 31:10–31",31,31,"O poema celebra uma mulher competente em trabalho, comércio, generosidade, ensino e temor de Deus.","Sabedoria aparece em iniciativa, habilidade, compaixão e reconhecimento público."]
]}
];
export const proverbsExpandedUnits=buildExpansionUnits("proverbs","Provérbios",units);
