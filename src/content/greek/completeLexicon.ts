import { DODSON_SOURCE, greekLexicon, type GreekLexeme } from "./lexiconData";
import { betaHeadword, betaTransliteration } from "./betaCode";
import { filterGreekLexicon } from "./search";

const DODSON_REVISION="74f70358d4acfaf2f980bf2feb58ab7115cbbcbc";
const DODSON_URL="https://raw.githubusercontent.com/biblicalhumanities/Dodson-Greek-Lexicon/"+DODSON_REVISION+"/dodson.csv";
let lexiconPromise:Promise<GreekLexeme[]>|undefined;

function unquote(value:string){
 const trimmed=value.trim();
 return trimmed.startsWith('"')&&trimmed.endsWith('"')
  ?trimmed.slice(1,-1).replace(/""/g,'"')
  :trimmed;
}

export function parseDodsonCsv(content:string):GreekLexeme[]{
 return content.split(/\r?\n/).slice(1).flatMap((line)=>{
  if(!line.trim()) return [];
  const columns=line.split("\t").map(unquote);
  const [strong,,greekWord,brief,longer]=columns;
  if(!/^\d{4}$/.test(strong)||!greekWord||!brief) return [];
  const code="G"+strong;
  const lemma=betaHeadword(greekWord);
  return [{
   id:code.toLowerCase(),
   strong:code,
   lemma,
   transliteration:betaTransliteration(greekWord),
   pronunciation:"Pronúncia não informada pela fonte",
   partOfSpeech:"Entrada lexical do Novo Testamento",
   meanings:[brief,longer].filter((meaning,index,items)=>Boolean(meaning)&&items.indexOf(meaning)===index),
   morphology:"Consulte a forma no versículo para a análise morfológica.",
   forms:[lemma],
   examples:[],
   source:DODSON_SOURCE,
   sourceLanguage:"en" as const
  }];
 });
}

export async function loadCompleteGreekLexicon(signal?:AbortSignal){
 if(!lexiconPromise){
  lexiconPromise=fetch(DODSON_URL,{cache:"force-cache",signal}).then(async(response)=>{
   if(!response.ok) throw new Error("Não foi possível carregar o dicionário completo.");
   const entries=parseDodsonCsv(await response.text());
   if(entries.length<5000) throw new Error("O arquivo lexical recebido está incompleto.");
   const byStrong=new Map(entries.map((entry)=>[entry.strong,entry]));
   greekLexicon.forEach((entry)=>byStrong.set(entry.strong,entry));
   return [...byStrong.values()].sort((a,b)=>Number(a.strong.slice(1))-Number(b.strong.slice(1)));
  }).catch((error)=>{lexiconPromise=undefined;throw error;});
 }
 return lexiconPromise;
}

export async function searchCompleteGreekLexicon(query:string,limit=80,signal?:AbortSignal){
 return filterGreekLexicon(await loadCompleteGreekLexicon(signal),query,limit);
}
