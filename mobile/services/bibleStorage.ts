import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BibleBookMeta } from "../../src/content/bible/catalog";
import { loadBibleBook, type BibleBookData } from "../../src/services/bible";
import type { BibleAnnotation, BibleLocation } from "../../src/types/progress";

const BOOK_PREFIX="@bibliolingo/bible-book/v1/";
const READER_KEY="@bibliolingo/bible-reader/v1";
const ANNOTATIONS_KEY="@bibliolingo/bible-annotations/v1";

function validBook(value:unknown):value is BibleBookData{
 if(!value||typeof value!=="object")return false;
 const candidate=value as Partial<BibleBookData>;
 return typeof candidate.book==="string"&&Array.isArray(candidate.chapters)&&candidate.chapters.every(chapter=>
  typeof chapter?.chapter==="number"&&Array.isArray(chapter.verses)&&chapter.verses.every(verse=>typeof verse?.number==="number"&&typeof verse?.text==="string")
 );
}

export async function loadCachedBibleBook(book:BibleBookMeta){
 const key=BOOK_PREFIX+book.osis;
 try{
  const raw=await AsyncStorage.getItem(key);
  if(raw){const parsed:unknown=JSON.parse(raw);if(validBook(parsed)&&parsed.book===book.osis)return parsed;}
 }catch{}
 const loaded=await loadBibleBook(book);
 await AsyncStorage.setItem(key,JSON.stringify(loaded)).catch(()=>undefined);
 return loaded;
}

export async function loadBibleReaderLocation():Promise<BibleLocation|undefined>{
 try{const raw=await AsyncStorage.getItem(READER_KEY);if(!raw)return undefined;const value=JSON.parse(raw) as Partial<BibleLocation>;
  return typeof value.bookOsis==="string"&&typeof value.chapter==="number"?{translationId:"almeida-1819",bookOsis:value.bookOsis,chapter:value.chapter,verse:value.verse}:undefined;
 }catch{return undefined;}
}
export async function saveBibleReaderLocation(location:BibleLocation){await AsyncStorage.setItem(READER_KEY,JSON.stringify(location));}
export async function loadBibleAnnotations():Promise<Record<string,BibleAnnotation>>{
 try{const raw=await AsyncStorage.getItem(ANNOTATIONS_KEY);const value=raw?JSON.parse(raw):{};return value&&typeof value==="object"?value:{};}catch{return {};}
}
export async function saveBibleAnnotation(annotation:BibleAnnotation){
 const all=await loadBibleAnnotations();
 if(!annotation.bookmarked&&!annotation.note.trim())delete all[annotation.id];else all[annotation.id]=annotation;
 await AsyncStorage.setItem(ANNOTATIONS_KEY,JSON.stringify(all));return all;
}
