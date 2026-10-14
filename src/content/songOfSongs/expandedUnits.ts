import { buildExpansionUnits, chapterRange, type ExpansionUnit } from "../oldTestament/buildExpansionUnits";
const units:ExpansionUnit[]=[{id:"song-of-songs-u02",title:"Busca, reencontro e amor forte",subtitle:"Movimentos finais do Cântico em capítulos 5–8",chapters:chapterRange(5,8),topics:[
["A porta não aberta","Cântico 5",5,5,"Uma oportunidade perdida conduz a uma busca dolorosa, e a amada descreve aquele que procura.","Amor requer presença e atenção; desejo poético não elimina desencontros."],
["Eu sou do meu amado","Cântico 6",6,6,"O reencontro retoma admiração mútua e pertencimento expresso sem apagar a voz própria da mulher.","Reciprocidade distingue aliança amorosa de posse."],
["Desejo e convite","Cântico 7",7,7,"Corpo, beleza e desejo são celebrados por linguagem poética, e a mulher também toma iniciativa no encontro.","A poesia bíblica reconhece desejo dentro de relação mútua e digna."],
["Forte como a morte","Cântico 8",8,8,"O clímax afirma que muitas águas não apagam o amor e que riqueza alguma pode comprá-lo.","Amor fiel possui força e valor que não se reduzem a controle ou preço."]
]}];
export const songOfSongsExpandedUnits=buildExpansionUnits("song-of-songs","Cântico dos Cânticos",units);
