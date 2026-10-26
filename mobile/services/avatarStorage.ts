import AsyncStorage from "@react-native-async-storage/async-storage";
import { neutralAvatar, normalizeAvatar, type AvatarSelection } from "../domain/avatar";
const PREFIX="@bibliolingo/avatar/v1/";
function safeOwner(ownerId?:string){return encodeURIComponent(ownerId?.trim()||"guest");}
export async function loadAvatar(ownerId?:string):Promise<AvatarSelection>{
 try{const raw=await AsyncStorage.getItem(PREFIX+safeOwner(ownerId));return raw?normalizeAvatar(JSON.parse(raw)):neutralAvatar;}catch{return neutralAvatar;}
}
export async function saveAvatar(ownerId:string|undefined,selection:AvatarSelection):Promise<AvatarSelection>{
 const normalized={...normalizeAvatar(selection),updatedAt:new Date().toISOString()};await AsyncStorage.setItem(PREFIX+safeOwner(ownerId),JSON.stringify(normalized));return normalized;
}
