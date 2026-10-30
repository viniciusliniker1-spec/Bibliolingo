import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { greekBookAssets, hebrewBookAssets, originalLexiconAssets } from "../assets/originalLanguageAssets";
import { parseGreekNewTestamentBook } from "../../src/services/greekNewTestament";
import { greekLexicon, type GreekLexeme } from "../../src/content/greek/lexiconData";
import { parseDodsonCsv } from "../../src/content/greek/completeLexicon";
import { transliterateOriginal } from "../../src/domain/originalLanguage";

export type OriginalLanguage="hbo"|"arc"|"grc";
export interface OriginalWord{position:number;form:string;lemma:string;strong:string;morphology:string;language:OriginalLanguage;transliteration?:string}
export interface HebrewLexiconEntry{id:string;strong:string;lemma:string;transliteration:string;pronunciation:string;definition:string;usage:string;language:"hbo"|"arc";search:string}
export interface OriginalWordInsight{position:number;strong:string;definition:string;senses:string[];source:string}

async function readBundledAsset(moduleId:number){
 const asset=Asset.fromModule(moduleId);
 if(!asset.localUri)await asset.downloadAsync();
 const uri=asset.localUri??asset.uri;
 if(!uri)throw new Error("Recurso linguístico não localizado no aplicativo.");
 return FileSystem.readAsStringAsync(uri);
}

const hebrewCache=new Map<string,Promise<unknown[][][]>>();
const greekCache=new Map<string,Promise<Map<string,ReturnType<typeof parseGreekNewTestamentBook> extends Map<string,infer V>?V:never>>>();

function strongFor(lemma:string){
 const number=lemma.split("/").reverse().find(part=>/\d+/.test(part))?.match(/\d+/)?.[0];
 return number?"H"+number.padStart(4,"0"):"";
}
function hebrewLanguage(morph:string):"hbo"|"arc"{return morph.split("/").some(part=>part.startsWith("A"))?"arc":"hbo";}

async function loadHebrewBook(osis:string){
 let pending=hebrewCache.get(osis);
 if(!pending){
  const moduleId=hebrewBookAssets[osis];if(!moduleId)throw new Error("Texto hebraico não disponível para este livro.");
  pending=readBundledAsset(moduleId).then(raw=>(JSON.parse(raw) as {chapters:unknown[][][]}).chapters);
  hebrewCache.set(osis,pending);
 }
 return pending;
}
async function loadGreekBook(osis:string){
 let pending=greekCache.get(osis);
 if(!pending){
  const moduleId=greekBookAssets[osis];if(!moduleId)throw new Error("Texto grego não disponível para este livro.");
  pending=readBundledAsset(moduleId).then(parseGreekNewTestamentBook);
  greekCache.set(osis,pending);
 }
 return pending;
}

export function hasBundledOriginalBook(osis:string){return Boolean(hebrewBookAssets[osis]||greekBookAssets[osis]);}
export async function loadBundledOriginalChapter(osis:string,chapter:number):Promise<OriginalWord[][]>{
 if(hebrewBookAssets[osis]){
  const chapters=await loadHebrewBook(osis);
  const verses=chapters[chapter-1]??[];
  return verses.map((words)=>words.map((raw,index)=>{
   const tuple=Array.isArray(raw)?raw:[];
   const form=String(tuple[0]??"").replace(/\//g,""),lemma=String(tuple[1]??""),morphology=String(tuple[2]??"");
   const language=hebrewLanguage(morphology);
  return {position:index+1,form,lemma,strong:strongFor(lemma),morphology,language,transliteration:transliterateOriginal(form,language)};
  }));
 }
 const book=await loadGreekBook(osis);const verses:OriginalWord[][]=[];
 for(const [key,words] of book){const [c,v]=key.split(":").map(Number);if(c!==chapter)continue;verses[v-1]=words.map(word=>({...word,lemma:word.strong,language:"grc" as const,transliteration:word.transliteration||transliterateOriginal(word.form,"grc")}));}
 return verses;
}
export async function loadBundledOriginalVerse(osis:string,chapter:number,verse:number){return (await loadBundledOriginalChapter(osis,chapter))[verse-1]??[];}

let hebrewLexiconPromise:Promise<HebrewLexiconEntry[]>|undefined;
export function loadBundledHebrewLexicon(){
 if(!hebrewLexiconPromise)hebrewLexiconPromise=readBundledAsset(originalLexiconAssets.hebrew).then(raw=>JSON.parse(raw) as HebrewLexiconEntry[]);
 return hebrewLexiconPromise;
}
let greekLexiconPromise:Promise<GreekLexeme[]>|undefined;
export function loadBundledGreekLexicon(){
 if(!greekLexiconPromise)greekLexiconPromise=readBundledAsset(originalLexiconAssets.dodson).then(raw=>{
  const byStrong=new Map(parseDodsonCsv(raw).map(entry=>[entry.strong,entry]));greekLexicon.forEach(entry=>byStrong.set(entry.strong,entry));return [...byStrong.values()];
 });
 return greekLexiconPromise;
}


let hebrewByStrongPromise:Promise<Map<string,HebrewLexiconEntry>>|undefined;
function hebrewByStrong(){
 if(!hebrewByStrongPromise)hebrewByStrongPromise=loadBundledHebrewLexicon().then(entries=>new Map(entries.map(entry=>[entry.strong.toUpperCase(),entry])));
 return hebrewByStrongPromise;
}
let greekByStrongPromise:Promise<Map<string,GreekLexeme>>|undefined;
function greekByStrong(){
 if(!greekByStrongPromise)greekByStrongPromise=loadBundledGreekLexicon().then(entries=>new Map(entries.map(entry=>[entry.strong.toUpperCase(),entry])));
 return greekByStrongPromise;
}
function splitSenses(value:string){
 return [...new Set(value.split(/\s*[;|]\s*/).map(item=>item.trim()).filter(Boolean))].slice(0,8);
}
export async function loadOriginalWordInsights(words:OriginalWord[]):Promise<OriginalWordInsight[]>{
 const needsHebrew=words.some(word=>word.language!=="grc"),needsGreek=words.some(word=>word.language==="grc");
 const [hebrew,greek]=await Promise.all([
  needsHebrew?hebrewByStrong():Promise.resolve(new Map<string,HebrewLexiconEntry>()),
  needsGreek?greekByStrong():Promise.resolve(new Map<string,GreekLexeme>())
 ]);
 return words.flatMap(word=>{
  const strong=word.strong.toUpperCase();
  if(!strong)return[];
  if(word.language==="grc"){
   const entry=greek.get(strong);if(!entry)return[];
   const senses=entry.meanings.map(item=>item.trim()).filter(Boolean);
   return [{position:word.position,strong,definition:senses.join("; "),senses,source:entry.source.title}];
  }
  const entry=hebrew.get(strong);if(!entry)return[];
  const definition=entry.definition||entry.usage;const senses=splitSenses(definition);
  return [{position:word.position,strong,definition,senses,source:"Open Scriptures Hebrew Lexicon"}];
 });
}
