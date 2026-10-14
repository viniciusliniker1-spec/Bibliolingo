import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[
{id:"esther-u02",title:"A ameaça e a decisão",subtitle:"Identidade, risco e coragem em Ester 1–5",chapters:chapterRange(1,5),topics:[
["Vasti, Ester e o império","Ester 1–2",1,2,"A corte persa exibe poder, banquetes e controle sobre mulheres; Ester chega ao palácio e Mardoqueu descobre uma conspiração.","Providência pode operar em circunstâncias ambíguas sem transformar estruturas imperiais em ideais."],
["O decreto de Hamã","Ester 3",3,3,"O conflito de Hamã com Mardoqueu torna-se plano genocida selado pelo rei contra todo o povo judeu.","Preconceito pessoal aliado ao poder pode produzir ameaça coletiva."],
["Para um tempo como este","Ester 4",4,4,"Mardoqueu chama Ester a reconhecer responsabilidade; ela convoca jejum e decide entrar diante do rei apesar do risco.","Posição e privilégio podem tornar-se vocação para proteger pessoas ameaçadas."],
["O primeiro banquete","Ester 5",5,5,"Ester aproxima-se do rei, convida-o com Hamã e prepara cuidadosamente o momento de apresentar sua causa.","Coragem não exclui prudência, tempo e estratégia."]
]},
{id:"esther-u03",title:"A grande reversão",subtitle:"Memória, livramento e Purim em Ester 6–10",chapters:chapterRange(6,10),topics:[
["A noite em que o rei não dormiu","Ester 6",6,6,"A leitura dos registros revela o serviço esquecido de Mardoqueu, e Hamã precisa honrar o homem que desejava eliminar.","A narrativa constrói providência por coincidências significativas sem nomear Deus diretamente."],
["Ester revela a trama","Ester 7",7,7,"No segundo banquete, Ester identifica sua origem e denuncia Hamã; ele termina na forca preparada para Mardoqueu.","A verdade corajosa expõe quando poder e violência se escondem atrás de decretos."],
["Defesa e reversão","Ester 8–9:19",8,9,"Como o primeiro decreto não pode ser revogado, outro permite defesa; o resultado traz livramento e violência que deve ser lida sobriamente.","Celebrar sobrevivência não exige romantizar a violência de um mundo imperial."],
["Purim e memória","Ester 9:20–10:3",9,10,"Cartas estabelecem Purim como memória anual de tristeza transformada em alegria, e Mardoqueu usa influência pelo bem do povo.","Comunidades preservam identidade quando contam livramentos e partilham com necessitados."]
]}
];
export const estherExpandedUnits=buildExpansionUnits("esther","Ester",units);
