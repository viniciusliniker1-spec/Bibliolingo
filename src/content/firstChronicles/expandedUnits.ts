import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[
{id:"1-chronicles-u02",title:"Raízes de um povo restaurado",subtitle:"Genealogias e identidade em 1 Crônicas 1–9",chapters:chapterRange(1,9),topics:[
["De Adão aos filhos de Israel","1 Crônicas 1–2",1,2,"As genealogias ligam Israel à humanidade e concentram a narrativa em Judá e na linhagem de Davi.","Identidade restaurada começa lembrando que a história pessoal pertence a uma história maior."],
["Tribos e territórios","1 Crônicas 3–5",3,5,"Descendentes de Davi e famílias de Judá, Simeão e tribos orientais preservam memória de pertencimento e perdas.","Listas antigas registram pessoas, lugares e responsabilidades que o exílio não apagou."],
["Levi e o serviço","1 Crônicas 6",6,6,"A linhagem de Levi organiza sacerdotes, músicos, cidades e tarefas relacionadas ao culto.","Serviço comunitário depende de vocações diversas e memória responsável."],
["Retorno e moradores de Jerusalém","1 Crônicas 7–9",7,9,"As tribos são lembradas até a comunidade que voltou do exílio e reassumiu funções em Jerusalém.","Recomeçar exige tanto raízes quanto disposição para ocupar novamente responsabilidades."]
]},
{id:"1-chronicles-u03",title:"O reino reunido",subtitle:"Saul, Davi e Jerusalém em 1 Crônicas 10–14",chapters:chapterRange(10,14),topics:[
["O fim de Saul","1 Crônicas 10",10,10,"A derrota e morte de Saul são interpretadas à luz de sua infidelidade e de sua busca por orientação inadequada.","Posição recebida não substitui escuta e fidelidade contínuas."],
["Davi reconhecido por Israel","1 Crônicas 11–12",11,12,"As tribos se reúnem em torno de Davi, e listas de valentes destacam a contribuição coletiva para o reino.","Nenhuma liderança saudável se constrói sem pessoas corajosas e responsabilidades compartilhadas."],
["A primeira tentativa com a arca","1 Crônicas 13",13,13,"A celebração termina com a morte de Uzá porque a arca é conduzida sem o cuidado prescrito.","Entusiasmo religioso precisa caminhar com conhecimento e reverência."],
["Casa, família e consulta","1 Crônicas 14",14,14,"Davi se estabelece, reconhece que Deus confirma o reino e consulta o Senhor em duas batalhas diferentes.","Experiência anterior não dispensa buscar direção novamente."]
]},
{id:"1-chronicles-u04",title:"A arca e a promessa",subtitle:"Adoração organizada e aliança davídica em 1 Crônicas 15–17",chapters:chapterRange(15,17),topics:[
["Levitas conduzem a arca","1 Crônicas 15",15,15,"Davi corrige o transporte da arca, reúne levitas e organiza músicos para uma procissão alegre e reverente.","Corrigir um erro inclui aprender, reorganizar e tentar novamente com responsabilidade."],
["Dai graças ao Senhor","1 Crônicas 16",16,16,"A arca recebe lugar, ministros são designados e um cântico convoca Israel e as nações a recordar as obras de Deus.","Adoração forma memória, gratidão e testemunho público."],
["Davi deseja construir","1 Crônicas 17:1–6",17,17,"Davi propõe uma casa para Deus, mas a palavra divina recorda que sua presença acompanhou o povo em movimento.","Boas intenções também precisam ser submetidas à direção de Deus."],
["Deus promete uma casa","1 Crônicas 17:7–27",17,17,"Deus relembra sua iniciativa e promete estabelecer a casa de Davi; o rei responde com humildade e oração.","A promessa nasce da graça antes de se tornar tarefa humana."]
]},
{id:"1-chronicles-u05",title:"Vitórias, falhas e misericórdia",subtitle:"O reino de Davi em 1 Crônicas 18–21",chapters:chapterRange(18,21),topics:[
["Justiça no reino","1 Crônicas 18",18,18,"As vitórias e a administração são resumidas pela afirmação de que Davi praticava justiça e equidade.","Expansão e organização só encontram legitimidade quando servem à justiça."],
["Conflitos e coragem","1 Crônicas 19–20",19,20,"Uma missão de consolo é interpretada como espionagem e desencadeia guerras enfrentadas por Joabe e os valentes.","Suspeita sem investigação pode transformar gestos de paz em crises extensas."],
["O censo de Davi","1 Crônicas 21:1–17",21,21,"Davi insiste em contar forças militares, reconhece culpa e escolhe cair nas mãos misericordiosas de Deus.","Medir recursos pode revelar confiança orgulhosa quando números substituem dependência."],
["A eira de Ornã","1 Crônicas 21:18–30",21,21,"Davi compra a eira, oferece sacrifício e recebe resposta; o lugar prepara a futura localização do templo.","Arrependimento assume custo e pode transformar lugar de crise em espaço de adoração."]
]},
{id:"1-chronicles-u06",title:"Preparar o que outro concluirá",subtitle:"Templo, ministérios e sucessão em 1 Crônicas 22–29",chapters:chapterRange(22,29),topics:[
["Davi prepara Salomão","1 Crônicas 22",22,22,"Impedido de construir, Davi reúne materiais e orienta Salomão a agir com coragem e fidelidade.","Vocação também é preparar bem uma obra que outra pessoa realizará."],
["Levitas, sacerdotes e músicos","1 Crônicas 23–25",23,25,"Famílias recebem funções no templo, no ensino, na música e no serviço sacerdotal.","Adoração comunitária depende de organização e dons diversos."],
["Porteiros, tesouros e líderes","1 Crônicas 26–27",26,27,"Responsabilidades administrativas, militares e patrimoniais são distribuídas com nomes e turnos.","Transparência e divisão de tarefas protegem a comunidade do personalismo."],
["Oferta e sucessão","1 Crônicas 28–29",28,29,"Davi apresenta o projeto, oferece recursos e ora reconhecendo que tudo vem de Deus; Salomão é confirmado.","Generosidade e sucessão saudável reconhecem que pessoas e recursos pertencem ao propósito de Deus."]
]}
];
export const firstChroniclesExpandedUnits=buildExpansionUnits("1-chronicles","1 Crônicas",units);
