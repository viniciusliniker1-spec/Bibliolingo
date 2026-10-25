import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTEBOOK_KEY="@bibliolingo/study-notebook/v1";
const MEMORY_KEY="@bibliolingo/verse-memory/v1";

export type NotebookKind="verse"|"original-word"|"lesson";
export interface NotebookItem{id:string;kind:NotebookKind;title:string;body:string;reference?:string;route?:string;createdAt:string;updatedAt:string}
export interface VerseMemoryCard{id:string;reference:string;text:string;box:number;dueDate:string;createdAt:string;lastReviewedAt?:string;correctReviews:number;incorrectReviews:number}

function array<T>(raw:string|null):T[]{if(!raw)return[];try{const value=JSON.parse(raw);return Array.isArray(value)?value:[];}catch{return[];}}
export async function loadNotebook(){return array<NotebookItem>(await AsyncStorage.getItem(NOTEBOOK_KEY));}
export async function saveNotebookItem(input:Omit<NotebookItem,"createdAt"|"updatedAt">){
 const current=await loadNotebook();const now=new Date().toISOString();const previous=current.find(item=>item.id===input.id);
 const item:NotebookItem={...input,createdAt:previous?.createdAt??now,updatedAt:now};
 const next=[item,...current.filter(entry=>entry.id!==item.id)].slice(0,500);
 await AsyncStorage.setItem(NOTEBOOK_KEY,JSON.stringify(next));return item;
}
export async function removeNotebookItem(id:string){const next=(await loadNotebook()).filter(item=>item.id!==id);await AsyncStorage.setItem(NOTEBOOK_KEY,JSON.stringify(next));}

export async function loadMemoryCards(){return array<VerseMemoryCard>(await AsyncStorage.getItem(MEMORY_KEY));}
export async function addVerseMemoryCard(input:{id:string;reference:string;text:string}){
 const current=await loadMemoryCards();const previous=current.find(item=>item.id===input.id);if(previous)return previous;
 const now=new Date().toISOString();const item:VerseMemoryCard={...input,box:0,dueDate:now.slice(0,10),createdAt:now,correctReviews:0,incorrectReviews:0};
 await AsyncStorage.setItem(MEMORY_KEY,JSON.stringify([item,...current]));return item;
}
function localDateAfter(days:number){const date=new Date();date.setDate(date.getDate()+days);return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");}
export async function reviewMemoryCard(id:string,remembered:boolean){
 const current=await loadMemoryCards();const intervals=[0,1,3,7,14,30];let updated:VerseMemoryCard|undefined;
 const next=current.map(card=>{if(card.id!==id)return card;const box=remembered?Math.min(5,card.box+1):0;updated={...card,box,dueDate:localDateAfter(intervals[box]),lastReviewedAt:new Date().toISOString(),correctReviews:card.correctReviews+(remembered?1:0),incorrectReviews:card.incorrectReviews+(remembered?0:1)};return updated;});
 await AsyncStorage.setItem(MEMORY_KEY,JSON.stringify(next));return updated;
}
export async function removeMemoryCard(id:string){const next=(await loadMemoryCards()).filter(item=>item.id!==id);await AsyncStorage.setItem(MEMORY_KEY,JSON.stringify(next));}
