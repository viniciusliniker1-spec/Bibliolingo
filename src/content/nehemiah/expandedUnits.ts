import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[
{id:"nehemiah-u02",title:"Da oração ao muro",subtitle:"Chamado, planejamento e cooperação em Neemias 1–4",chapters:chapterRange(1,4),topics:[
["Notícia, lamento e oração","Neemias 1",1,1,"Neemias recebe a notícia de Jerusalém, jejua, confessa e fundamenta seu pedido na aliança.","Oração responsável reconhece a crise, a própria participação e as promessas de Deus."],
["Inspecionar antes de anunciar","Neemias 2",2,2,"Autorizado pelo rei, Neemias chega, examina os muros à noite e só depois apresenta a missão.","Planejamento sábio observa a realidade antes de mobilizar pessoas."],
["Cada um em seu trecho","Neemias 3",3,3,"Sacerdotes, famílias, artesãos e governantes reconstroem diferentes partes do muro.","Uma grande obra avança quando tarefas locais se conectam a um propósito comum."],
["Edificar e vigiar","Neemias 4",4,4,"Zombaria vira ameaça, e o povo combina oração, guarda e trabalho sem abandonar a construção.","Fé sob pressão une dependência, prudência e perseverança."]
]},
{id:"nehemiah-u03",title:"Justiça dentro dos muros",subtitle:"Exploração, conspiração e conclusão em Neemias 5–7",chapters:chapterRange(5,7),topics:[
["A crise dos endividados","Neemias 5",5,5,"Famílias denunciam juros, perda de terras e servidão; Neemias confronta nobres e devolve recursos.","Reconstrução externa perde sentido quando a própria comunidade explora vulneráveis."],
["Convites e rumores","Neemias 6:1–14",6,6,"Inimigos tentam tirar Neemias da obra por reuniões, carta aberta e falsa profecia.","Discernimento reconhece quando diálogo aparente é estratégia de intimidação."],
["O muro concluído","Neemias 6:15–19",6,6,"O muro termina em cinquenta e dois dias, e adversários percebem que a obra foi realizada com auxílio de Deus.","Concluir uma etapa confirma a cooperação sem transformar o líder em herói solitário."],
["Portas, guardas e registros","Neemias 7",7,7,"Após a obra, Neemias organiza segurança, liderança e genealogias da comunidade retornada.","Infraestrutura precisa de pessoas, regras e memória para continuar servindo."]
]},
{id:"nehemiah-u04",title:"Palavra, aliança e continuidade",subtitle:"Renovação comunitária em Neemias 8–13",chapters:chapterRange(8,13),topics:[
["Ler e explicar","Neemias 8",8,8,"Esdras lê a Lei, levitas explicam e o povo responde com lágrimas, alegria e celebração.","Ensino bíblico torna o texto compreensível e conduz a uma resposta comunitária."],
["Confessar e comprometer-se","Neemias 9–10",9,10,"A oração relembra graça e rebelião, e a comunidade registra compromissos de aliança.","Mudança duradoura precisa de memória honesta e compromissos concretos."],
["Habitar e dedicar","Neemias 11–12",11,12,"Pessoas se dispõem a morar em Jerusalém, e dois coros celebram a dedicação dos muros.","Uma cidade restaurada precisa de moradores e gratidão, não apenas construções."],
["Reformas que precisam continuar","Neemias 13",13,13,"Ao retornar, Neemias encontra abusos no templo, negligência e alianças rompidas e promove novas reformas.","Uma celebração não elimina a necessidade de formação e vigilância contínuas."]
]}
];
export const nehemiahExpandedUnits=buildExpansionUnits("nehemiah","Neemias",units);
