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