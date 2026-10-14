import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[
{id:"ezra-u02",title:"Altar, oposição e templo",subtitle:"O primeiro retorno em Esdras 1–6",chapters:chapterRange(1,6),topics:[
["Ciro abre o caminho","Esdras 1–2",1,2,"O decreto persa permite retorno, devolve utensílios e registra famílias que assumem o recomeço.","Providência histórica age por decisões públicas e por pessoas concretas que respondem."],
["Altar antes das paredes","Esdras 3",3,3,"O altar e as festas são restaurados antes do templo completo; alegria e choro se misturam no lançamento dos fundamentos.","Recomeços podem carregar celebração, memória e luto ao mesmo tempo."],
["A obra interrompida","Esdras 4",4,4,"Oposição, acusações e interesses políticos conseguem paralisar a reconstrução por um período.","Resistência externa exige discernimento, documentação e perseverança."],
["Profetas e conclusão","Esdras 5–6",5,6,"Ageu e Zacarias encorajam a retomada, arquivos confirmam o decreto e o templo é dedicado com Páscoa.","A Palavra reacende a missão, e boa memória institucional protege a continuidade."]
]},
{id:"ezra-u03",title:"Esdras e a formação pela Palavra",subtitle:"Segundo retorno, ensino e crise em Esdras 7–10",chapters:chapterRange(7,10),topics:[
["Estudar, praticar e ensinar","Esdras 7",7,7,"Esdras chega com autorização e coração disposto a estudar, praticar e ensinar a Lei.","Autoridade docente confiável integra conhecimento, exemplo e serviço."],
["Uma viagem com prestação de contas","Esdras 8",8,8,"A comitiva jejua, confia em Deus e pesa cuidadosamente recursos antes e depois da viagem.","Confiança espiritual e transparência administrativa fortalecem uma à outra."],
["Confissão comunitária","Esdras 9",9,9,"Esdras lamenta a infidelidade e ora incluindo-se na comunidade, sem se colocar acima dela.","Liderança de arrependimento assume solidariedade e nomeia a gravidade do problema."],
["Uma resposta difícil","Esdras 10",10,10,"A assembleia trata casamentos mistos por medidas severas que atingem famílias e exigem leitura histórica e ética cuidadosa.","Narrar uma decisão antiga não significa transformá-la automaticamente em norma cristã."]
]}
];
export const ezraExpandedUnits=buildExpansionUnits("ezra","Esdras",units);
