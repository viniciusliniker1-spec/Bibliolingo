import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { greekBookAssets, hebrewBookAssets, originalLexiconAssets } from "../assets/originalLanguageAssets";
import { parseGreekNewTestamentBook } from "../../src/services/greekNewTestament";
import { greekLexicon, type GreekLexeme } from "../../src/content/greek/lexiconData";
import { parseDodsonCsv } from "../../src/content/greek/completeLexicon";

export type OriginalLanguage="hbo"|"arc"|"grc";
export interface OriginalWord{position:number;form:string;lemma:string;strong:string;morphology:string;language:OriginalLanguage;transliteration?:string}
export interface HebrewLexiconEntry{id:string;strong:string;lemma:string;transliteration:string;pronunciation:string;definition:string;usage:string;language:"hbo"|"arc";search:string}

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
   return {position:index+1,form,lemma,strong:strongFor(lemma),morphology,language:hebrewLanguage(morphology)};
  }));
 }
 const book=await loadGreekBook(osis);const verses:OriginalWord[][]=[];
 for(const [key,words] of book){const [c,v]=key.split(":").map(Number);if(c!==chapter)continue;verses[v-1]=words.map(word=>({...word,lemma:word.strong,language:"grc" as const}));}
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
