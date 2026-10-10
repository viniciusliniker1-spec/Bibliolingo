import { greekLexicon, type GreekLexeme } from "./lexiconData";
export function normalizeGreekSearch(value:string){
 return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").replace(/ς/g,"σ").replace(/[^a-z0-9α-ω]/g,"");
}
export function searchGreekLexicon(query:string,limit=30):GreekLexeme[]{
 const normalized=normalizeGreekSearch(query); if(!normalized)return greekLexicon.slice(0,limit);
 return greekLexicon.filter((entry)=>{
  const fields=[entry.strong,entry.lemma,entry.transliteration,...entry.meanings,...entry.forms];
  return fields.some((field)=>normalizeGreekSearch(field).includes(normalized));
 }).slice(0,limit);
}
export function lexemeById(id:string){return greekLexicon.find((entry)=>entry.id===id);}
