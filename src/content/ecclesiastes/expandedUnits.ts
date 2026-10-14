import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[
{id:"ecclesiastes-u02",title:"Tempo, companhia e reverência",subtitle:"Dons e limites em Eclesiastes 3–6",chapters:chapterRange(3,6),topics:[
["Tempo para cada propósito","Eclesiastes 3",3,3,"O poema dos tempos reconhece mudanças que humanos vivem sem controlar plenamente; desfrutar o trabalho é dom.","Receber o tempo difere de dominar o futuro."],
["O valor da companhia","Eclesiastes 4",4,4,"Opressão, competição e isolamento são contrastados com a força de duas pessoas que se sustentam.","Sucesso solitário pode custar justamente a comunhão que torna a vida habitável."],
["Reverência e dinheiro","Eclesiastes 5",5,5,"Palavras diante de Deus pedem cuidado, enquanto riqueza acumulada não garante descanso nem permanência.","Culto e finanças revelam os limites de nossa pretensão de controle."],
["Ter sem desfrutar","Eclesiastes 6",6,6,"Possuir muito sem capacidade de receber a vida como dom é descrito como profunda frustração.","Acumular recursos não cria automaticamente contentamento."]
]},
{id:"ecclesiastes-u03",title:"Sabedoria para viver com limites",subtitle:"Morte, ação e Criador em Eclesiastes 7–12",chapters:chapterRange(7,12),topics:[
["A casa do luto","Eclesiastes 7–8",7,8,"A consciência da morte pode ensinar mais que diversão constante, embora sabedoria não controle toda injustiça.","Maturidade encara finitude sem abandonar prudência."],
["Vivos diante do imprevisível","Eclesiastes 9–10",9,10,"Morte alcança todos, tempo e acaso desafiam mérito, e pequenas insensatezes podem destruir grande trabalho.","Agir com sabedoria importa mesmo quando resultados não são garantidos."],
["Semeia e alegra-te","Eclesiastes 11",11,11,"A incerteza não deve paralisar: o Pregador chama a repartir, semear e alegrar-se com responsabilidade.","Não controlar o resultado é motivo para ação humilde, não inércia."],
["Lembra-te do Criador","Eclesiastes 12",12,12,"A poesia da velhice conduz à conclusão de temer a Deus e guardar seus mandamentos.","Finitude orienta uma vida de lembrança, reverência e responsabilidade."]
]}
];
export const ecclesiastesExpandedUnits=buildExpansionUnits("ecclesiastes","Eclesiastes",units);
