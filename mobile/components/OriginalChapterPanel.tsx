import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { BibleVerse } from "../../src/services/bible";
import { explainMorphology, originalLanguageLabel, transliterateOriginal } from "../../src/domain/originalLanguage";
import { loadBundledOriginalChapter, type OriginalWord } from "../services/originalLanguages";
import { colors, radius, spacing } from "../theme/tokens";

export function OriginalChapterPanel({osis,chapter,portuguese=[],interlinear,onSelect}:{osis:string;chapter:number;portuguese?:BibleVerse[];interlinear:boolean;onSelect:(verse:BibleVerse,words:OriginalWord[])=>void}){
 const [verses,setVerses]=useState<OriginalWord[][]>();const [error,setError]=useState("");
 useEffect(()=>{let active=true;setVerses(undefined);setError("");void loadBundledOriginalChapter(osis,chapter).then(value=>{if(active)setVerses(value);}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:"Texto original indisponível.");});return()=>{active=false;};},[osis,chapter]);
 if(error)return <View style={styles.state}><Text style={styles.error}>{error}</Text></View>;
 if(!verses)return <View style={styles.state}><ActivityIndicator color={colors.teal}/><Text style={styles.muted}>Abrindo o texto incluído no aplicativo…</Text></View>;
 const rtl=verses.some(words=>words.some(word=>word.language!=="grc"));
 return <View style={styles.verses}>{verses.map((words,index)=>{if(!words?.length)return null;const number=index+1;const translation=portuguese.find(item=>item.number===number);const verse=translation??{number,text:""};const original=words.map(word=>word.form).join(" ");
  return <Pressable accessibilityRole="button" accessibilityLabel={"Abrir detalhes do versículo "+number} key={number} onPress={()=>onSelect(verse,words)} style={styles.verse}>
   <Text style={styles.number}>{number}</Text>
   {interlinear?<View style={[styles.wordGrid,rtl&&styles.wordGridRtl]}>{words.map(word=><View key={word.position} style={styles.word}><Text selectable style={[styles.wordForm,word.language!=="grc"&&styles.rtl]}>{word.form}</Text><Text style={styles.transliteration}>{word.transliteration||transliterateOriginal(word.form,word.language)}</Text><Text style={styles.language}>{originalLanguageLabel(word.language)}</Text><Text style={styles.morph}>{explainMorphology(word.morphology,word.language)}</Text></View>)}</View>:<Text selectable style={[styles.original,rtl&&styles.rtl]}>{original}</Text>}
   {interlinear&&translation?<Text style={styles.translation}>{translation.text}</Text>:null}
  </Pressable>;
 })}</View>;
}
const styles=StyleSheet.create({
 state:{minHeight:180,alignItems:"center",justifyContent:"center",gap:spacing.sm},muted:{color:colors.muted},error:{color:colors.error,fontWeight:"800"},verses:{gap:spacing.sm},
 verse:{padding:spacing.lg,borderRadius:radius.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},number:{color:colors.tealDark,fontSize:12,fontWeight:"900"},
 original:{color:colors.navy,fontSize:25,lineHeight:39,textAlign:"left"},rtl:{writingDirection:"rtl",textAlign:"right"},
 wordGrid:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm,marginTop:spacing.xs},wordGridRtl:{direction:"rtl"},word:{maxWidth:180,minWidth:104,padding:spacing.sm,borderRadius:radius.sm,backgroundColor:"#eef4f8",gap:2},
 wordForm:{fontSize:22,color:colors.navy},transliteration:{fontSize:13,color:colors.tealDark,fontWeight:"800"},language:{fontSize:10,color:colors.goldDark,fontWeight:"800"},morph:{fontSize:10,lineHeight:14,color:colors.muted},
 translation:{color:colors.text,fontSize:16,lineHeight:25,borderTopWidth:1,borderTopColor:colors.border,paddingTop:spacing.sm,marginTop:spacing.sm}
});
