import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadCompleteGreekLexicon } from "../../src/content/greek/completeLexicon";
import type { GreekLexeme } from "../../src/content/greek/lexiconData";
const KEY="@bibliolingo/greek-lexicon/v1";
function valid(value:unknown):value is GreekLexeme[]{return Array.isArray(value)&&value.length>=5000&&value.every(item=>item&&typeof item.strong==="string"&&typeof item.lemma==="string");}
export async function loadCachedGreekLexicon(){
 try{const raw=await AsyncStorage.getItem(KEY);if(raw){const value:unknown=JSON.parse(raw);if(valid(value))return value;}}catch{}
 const lexicon=await loadCompleteGreekLexicon();
 await AsyncStorage.setItem(KEY,JSON.stringify(lexicon)).catch(()=>undefined);
 return lexicon;
}
