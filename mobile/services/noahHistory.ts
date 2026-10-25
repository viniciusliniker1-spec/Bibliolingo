import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NoahHistoryMessage } from "../domain/noah";
const PREFIX="@bibliolingo/noah-thread/v1/";
export interface SavedNoahMessage extends NoahHistoryMessage{id:string;createdAt:string}
function key(contextKey:string){return PREFIX+encodeURIComponent(contextKey);}
export async function loadNoahThread(contextKey:string):Promise<SavedNoahMessage[]>{try{const raw=await AsyncStorage.getItem(key(contextKey));const value=raw?JSON.parse(raw):[];return Array.isArray(value)?value.slice(-60):[];}catch{return[];}}
export async function saveNoahThread(contextKey:string,messages:SavedNoahMessage[]){await AsyncStorage.setItem(key(contextKey),JSON.stringify(messages.slice(-60)));}
export async function clearNoahThread(contextKey:string){await AsyncStorage.removeItem(key(contextKey));}
