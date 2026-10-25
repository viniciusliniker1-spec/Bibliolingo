export interface TimelineEvent{id:string;era:string;title:string;period:string;summary:string;references:string[];certainty:"textual"|"approximate"|"debated"}
export const biblicalTimeline:TimelineEvent[]=[
{id:"patriarchs",era:"PATRIARCAS",title:"Abraão e a promessa",period:"Tradicionalmente, início do segundo milênio a.C.",summary:"A narrativa de Gênesis acompanha a chamada de Abraão, a aliança e a família patriarcal.",references:["Gênesis 12–50"],certainty:"approximate"},
{id:"exodus",era:"ÊXODO E ALIANÇA",title:"Êxodo e Sinai",period:"Data histórica debatida",summary:"Israel é liberto do Egito e recebe a aliança no Sinai. As propostas cronológicas variam.",references:["Êxodo 1–24"],certainty:"debated"},
{id:"monarchy",era:"MONARQUIA",title:"Reino unido",period:"c. século X a.C.",summary:"Saul, Davi e Salomão marcam a transição para a monarquia e a centralidade de Jerusalém.",references:["1 Samuel 8–1 Reis 11"],certainty:"approximate"},
{id:"exile",era:"EXÍLIO",title:"Queda de Jerusalém",period:"586 a.C.",summary:"A Babilônia destrói Jerusalém e o templo; textos proféticos interpretam a crise à luz da aliança.",references:["2 Reis 25","Jeremias 39"],certainty:"textual"},
{id:"return",era:"PERÍODO PERSA",title:"Retorno e reconstrução",period:"A partir de 538 a.C.",summary:"Grupos retornam, o templo é reconstruído e Jerusalém reorganizada sob domínio persa.",references:["Esdras 1–6","Neemias 1–13"],certainty:"textual"},
{id:"jesus",era:"NOVO TESTAMENTO",title:"Ministério de Jesus",period:"c. 27–30 d.C.",summary:"Os Evangelhos testemunham o ministério, morte e ressurreição de Jesus em seu contexto judaico-romano.",references:["Mateus–João"],certainty:"approximate"},
{id:"church",era:"IGREJA APOSTÓLICA",title:"Missão e comunidades",period:"c. 30–100 d.C.",summary:"Atos e as cartas registram a expansão do evangelho e a formação das primeiras comunidades cristãs.",references:["Atos","Romanos–Apocalipse"],certainty:"approximate"}
];
export const contextualRoutes=[
{id:"exodus",title:"Do Egito a Canaã",places:["Egito","Sinai","Moabe","Canaã"],note:"Esquema didático; não representa escala geográfica nem decide rotas arqueologicamente debatidas."},
{id:"paul",title:"Viagens missionárias de Paulo",places:["Antioquia","Ásia Menor","Macedônia","Acaia","Roma"],note:"Síntese baseada em Atos; consulte as passagens para cada etapa."}
];
export const biblicalThemes=[
{id:"grace",title:"Graça",terms:["graça","favor"],references:[{label:"Efésios 2:8–10",osis:"Eph",chapter:2,verse:8},{label:"Romanos 3:23–24",osis:"Rom",chapter:3,verse:23}],note:"A iniciativa graciosa de Deus e sua relação com fé, salvação e vida transformada."},
{id:"covenant",title:"Aliança",terms:["aliança","pacto"],references:[{label:"Gênesis 12:1–3",osis:"Gen",chapter:12,verse:1},{label:"Jeremias 31:31–34",osis:"Jer",chapter:31,verse:31}],note:"As alianças devem ser lidas em seus contextos históricos e canônicos próprios."},
{id:"justice",title:"Justiça",terms:["justiça","justificação"],references:[{label:"Miqueias 6:8",osis:"Mic",chapter:6,verse:8},{label:"Romanos 5:1",osis:"Rom",chapter:5,verse:1}],note:"O vocabulário bíblico abrange justiça de Deus, vida justa e justificação."},
{id:"prayer",title:"Oração",terms:["oração","orar"],references:[{label:"Mateus 6:5–13",osis:"Matt",chapter:6,verse:5},{label:"Filipenses 4:6–7",osis:"Phil",chapter:4,verse:6}],note:"Textos sobre oração incluem ensino, prática comunitária, lamento e ação de graças."},
{id:"resurrection",title:"Ressurreição",terms:["ressurreição","ressuscitou"],references:[{label:"Lucas 24:1–12",osis:"Luke",chapter:24,verse:1},{label:"1 Coríntios 15:1–28",osis:"1Cor",chapter:15,verse:1}],note:"Tema central do testemunho apostólico sobre Jesus e a esperança cristã."}
] as const;
