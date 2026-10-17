import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { bibleBooks, bibleBookByOsis } from "../../../src/content/bible/catalog";
import { bibleAnnotationId, parseBibleReference } from "../../../src/domain/bibleReference";
import { BIBLE_TRANSLATION, type BibleBookData, type BibleVerse } from "../../../src/services/bible";
import { hasGreekNewTestamentBook, loadGreekVerse, GREEK_NT_SOURCE, type GreekVerseWord } from "../../../src/services/greekNewTestament";
import type { BibleAnnotation } from "../../../src/types/progress";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { loadCachedBibleBook } from "../../services/bibleStorage";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function BibleScreen(){
 const params=useLocalSearchParams<{osis?:string;chapter?:string;verse?:string;returnActivityId?:string;returnKind?:string;returnJourneyMode?:string;returnJourneyBookId?:string}>();
 const router=useRouter();
 const {progress,hydrated,setBibleLocation,saveBibleAnnotation}=useMobileProgress();
 const [osis,setOsis]=useState(params.osis??"Gen");
 const [chapter,setChapter]=useState(Math.max(1,Number(params.chapter??1)));
 const [targetVerse,setTargetVerse]=useState<number|undefined>(params.verse?Number(params.verse):undefined);
 const [bookData,setBookData]=useState<BibleBookData>(); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const [search,setSearch]=useState(""); const [notice,setNotice]=useState(""); const [testament,setTestament]=useState<"old"|"new">("old");
 const [showBooks,setShowBooks]=useState(false); const [selected,setSelected]=useState<BibleVerse>(); const [note,setNote]=useState("");
 const [bookmarked,setBookmarked]=useState(false); const annotations=progress.bibleAnnotations;
 const [greek,setGreek]=useState<GreekVerseWord[]>(); const [greekLoading,setGreekLoading]=useState(false);
 const book=bibleBookByOsis.get(osis)??bibleBooks[0];

 useEffect(()=>{if(!hydrated)return;const location=progress.bibleLocation;if(!params.osis&&location){setOsis(location.bookOsis);setChapter(location.chapter);setTargetVerse(location.verse);}},[hydrated]);
 useEffect(()=>{setTestament(book.testament);setLoading(true);setError("");setBookData(undefined);
  void loadCachedBibleBook(book).then(setBookData).catch(err=>setError(err instanceof Error?err.message:"Não foi possível abrir este livro.")).finally(()=>setLoading(false));
  setBibleLocation({translationId:BIBLE_TRANSLATION.id,bookOsis:book.osis,chapter,verse:targetVerse});
 },[book.osis,chapter,targetVerse]);
 const chapterData=bookData?.chapters.find(item=>item.chapter===chapter);
 const selectedId=selected?bibleAnnotationId(BIBLE_TRANSLATION.id,book.osis,chapter,selected.number):undefined;
 const chooseVerse=(verse:BibleVerse)=>{const annotation=annotations[bibleAnnotationId(BIBLE_TRANSLATION.id,book.osis,chapter,verse.number)];
  setSelected(verse);setNote(annotation?.note??"");setBookmarked(annotation?.bookmarked??false);setGreek(undefined);};
 const persistAnnotation=(nextBookmarked=bookmarked,nextNote=note)=>{if(!selected||!selectedId)return;const annotation:BibleAnnotation={id:selectedId,translationId:BIBLE_TRANSLATION.id,bookOsis:book.osis,
  bookName:book.name,chapter,verse:selected.number,note:nextNote,bookmarked:nextBookmarked,updatedAt:new Date().toISOString()};saveBibleAnnotation(annotation);};
 const toggleBookmark=()=>{const next=!bookmarked;setBookmarked(next);persistAnnotation(next,note);setNotice(next?"Versículo marcado e salvo.":"Marcação removida.");};
 const returnToLesson=()=>{if(!params.returnActivityId)return;const common={activityId:params.returnActivityId,journeyMode:params.returnJourneyMode,journeyBookId:params.returnJourneyBookId};
  if(params.returnKind&&params.returnKind!=="bible")router.replace({pathname:"/activity/[kind]/[activityId]",params:{...common,kind:params.returnKind}});
  else router.replace({pathname:"/lesson/[activityId]",params:common});};
 const go=(nextOsis:string,nextChapter:number,verse?:number)=>{setOsis(nextOsis);setChapter(nextChapter);setTargetVerse(verse);setSelected(undefined);setShowBooks(false);};
 const move=(direction:-1|1)=>{let index=bibleBooks.findIndex(item=>item.osis===book.osis);let nextChapter=chapter+direction;
  if(nextChapter<1){if(index===0)return;index-=1;go(bibleBooks[index].osis,bibleBooks[index].chapters);}
  else if(nextChapter>book.chapters){if(index===bibleBooks.length-1)return;index+=1;go(bibleBooks[index].osis,1);}else go(book.osis,nextChapter);
 };
 const runSearch=()=>{const parsed=parseBibleReference(search,book.osis,chapter);if(!parsed){setNotice("Digite uma referência como João 3:16.");return;}
  go(parsed.book.osis,parsed.chapter,parsed.verse);setNotice(`Abrindo ${parsed.book.name} ${parsed.chapter}:${parsed.verse}`);
 };
 const verseText=selected?`${selected.text} — ${book.name} ${chapter}:${selected.number} (${BIBLE_TRANSLATION.shortName})`:"";
 const oldBooks=useMemo(()=>bibleBooks.filter(item=>item.testament===testament),[testament]);

 return <><Screen>
  {params.returnActivityId?<Pressable accessibilityRole="button" onPress={returnToLesson} style={styles.returnButton}><Text style={styles.returnButtonText}>← Voltar à aula</Text></Pressable>:null}
  <View><Text style={styles.eyebrow}>LEITOR BÍBLICO</Text><Text style={styles.title}>{book.name} {chapter}</Text>
   <Text style={styles.source}>{BIBLE_TRANSLATION.name} · {BIBLE_TRANSLATION.license}</Text></View>
  <View style={styles.searchRow}><TextInput value={search} onChangeText={setSearch} onSubmitEditing={runSearch} placeholder="João 3:16" style={styles.search}/>
   <Pressable accessibilityRole="button" onPress={runSearch} style={styles.searchButton}><Text style={styles.searchButtonText}>Buscar</Text></Pressable></View>
  {notice?<Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>:null}
  <View style={styles.segment}><Pressable onPress={()=>setTestament("old")} style={[styles.segmentButton,testament==="old"&&styles.segmentActive]}><Text style={styles.segmentText}>Antigo</Text></Pressable>
   <Pressable onPress={()=>setTestament("new")} style={[styles.segmentButton,testament==="new"&&styles.segmentActive]}><Text style={styles.segmentText}>Novo</Text></Pressable></View>
  <PrimaryButton variant="secondary" onPress={()=>setShowBooks(value=>!value)}>{showBooks?"Ocultar livros":"Escolher livro"}</PrimaryButton>
  {showBooks?<View style={styles.bookGrid}>{oldBooks.map(item=><Pressable key={item.id} onPress={()=>go(item.osis,1)} style={[styles.bookChip,item.osis===book.osis&&styles.bookChipActive]}>
   <Text style={styles.bookChipText}>{item.name}</Text></Pressable>)}</View>:null}
  <View style={styles.chapterNav}><Pressable accessibilityLabel="Capítulo anterior" onPress={()=>move(-1)} style={styles.navButton}><Text style={styles.navText}>‹</Text></Pressable>
   <View style={styles.chapterCenter}><Text style={styles.chapterTitle}>{book.name}</Text><Text style={styles.chapterCount}>Capítulo {chapter} de {book.chapters}</Text></View>
   <Pressable accessibilityLabel="Próximo capítulo" onPress={()=>move(1)} style={styles.navButton}><Text style={styles.navText}>›</Text></Pressable></View>
  {loading?<ActivityIndicator color={colors.teal} size="large"/>:error?<View style={styles.errorCard}><Text style={styles.error}>{error}</Text>
   <Text style={styles.source}>Sem uma cópia armazenada, o primeiro carregamento de cada livro precisa de internet.</Text></View>:
   <View style={styles.verses}>{chapterData?.verses.map(verse=>{const id=bibleAnnotationId(BIBLE_TRANSLATION.id,book.osis,chapter,verse.number);const marked=annotations[id]?.bookmarked;
    return <Pressable key={verse.number} onPress={()=>chooseVerse(verse)} style={[styles.verse,marked&&styles.markedVerse,targetVerse===verse.number&&styles.target]}>
     <Text style={styles.verseText}><Text style={styles.verseNumber}>{verse.number}{marked?" ★":""} </Text>{verse.text}</Text></Pressable>;
   })}</View>}
 </Screen>
 <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={()=>setSelected(undefined)}>
  <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS==="ios"?"padding":"height"} keyboardVerticalOffset={0}>
  <View style={styles.backdrop}><View style={styles.sheet}><ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled"><View style={styles.handle}/><Text style={styles.sheetTitle}>{book.name} {chapter}:{selected?.number}</Text>
   <Text style={styles.selectedText}>{selected?.text}</Text>
   <View style={styles.actions}><PrimaryButton variant="secondary" onPress={async()=>{await Clipboard.setStringAsync(verseText);setNotice("Versículo copiado.");setSelected(undefined);}}>Copiar</PrimaryButton>
    <PrimaryButton variant="secondary" onPress={async()=>{await Share.share({message:verseText});}}>Compartilhar</PrimaryButton></View>
   <TextInput value={note} onChangeText={setNote} multiline placeholder="Sua anotação pessoal" style={styles.note}/>
   <Pressable onPress={toggleBookmark} style={[styles.bookmark,bookmarked&&styles.bookmarkActive]}><Text style={styles.bookmarkText}>{bookmarked?"✓ Remover marcação":"▰ Marcar versículo"}</Text></Pressable>
   {hasGreekNewTestamentBook(book.osis)?<PrimaryButton variant="secondary" onPress={async()=>{if(!selected)return;setGreekLoading(true);
    try{setGreek(await loadGreekVerse(book.osis,chapter,selected.number));}catch(err){setNotice(err instanceof Error?err.message:"Texto grego indisponível.");}finally{setGreekLoading(false);}}}>
    Ver no grego original</PrimaryButton>:null}
   {greekLoading?<ActivityIndicator color={colors.teal}/>:greek?<View style={styles.greekBox}><Text style={styles.greekTitle}>{GREEK_NT_SOURCE.title}</Text>
    <View style={styles.greekWords}>{greek.map(word=><Pressable key={word.position} onPress={()=>{setSelected(undefined);router.push({pathname:"/greek/dictionary",params:{query:word.strong}});}} style={styles.greekWord}>
     <Text style={styles.greekForm}>{word.form}</Text><Text style={styles.phonetic}>{word.transliteration}</Text><Text style={styles.strong}>{word.strong}</Text></Pressable>)}</View></View>:null}
   <PrimaryButton onPress={async()=>{persistAnnotation(bookmarked,note);setSelected(undefined);setNotice("Anotação salva.");}}>Salvar</PrimaryButton>
   <PrimaryButton variant="text" onPress={()=>setSelected(undefined)}>Fechar</PrimaryButton>
  </ScrollView></View></View></KeyboardAvoidingView>
 </Modal></>;
}
const styles=StyleSheet.create({
 keyboard:{flex:1},returnButton:{minHeight:46,alignSelf:"flex-start",justifyContent:"center",paddingHorizontal:spacing.md,borderRadius:radius.full,backgroundColor:"#d8f2ee"},returnButtonText:{color:colors.tealDark,fontWeight:"900"},
 eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},source:{color:colors.muted,fontSize:13,lineHeight:19},
 searchRow:{flexDirection:"row",gap:spacing.sm},search:{flex:1,minHeight:48,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.surface,paddingHorizontal:spacing.md,fontSize:16},
 searchButton:{minWidth:78,alignItems:"center",justifyContent:"center",borderRadius:radius.md,backgroundColor:colors.teal},searchButtonText:{fontWeight:"900",color:colors.navy},
 notice:{padding:spacing.md,borderRadius:radius.md,backgroundColor:"#e8f7f4",color:colors.tealDark},segment:{flexDirection:"row",padding:4,borderRadius:radius.full,backgroundColor:"#dfe9ee"},
 segmentButton:{flex:1,minHeight:42,alignItems:"center",justifyContent:"center",borderRadius:radius.full},segmentActive:{backgroundColor:colors.surface},segmentText:{color:colors.navy,fontWeight:"800"},
 bookGrid:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},bookChip:{paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderRadius:radius.full,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},
 bookChipActive:{borderColor:colors.teal,backgroundColor:"#d8f2ee"},bookChipText:{color:colors.navy,fontWeight:"700"},chapterNav:{flexDirection:"row",alignItems:"center",gap:spacing.md},
 navButton:{width:48,height:48,borderRadius:24,alignItems:"center",justifyContent:"center",backgroundColor:colors.navy},navText:{color:colors.surface,fontSize:30},chapterCenter:{flex:1,alignItems:"center"},
 chapterTitle:{color:colors.navy,fontSize:19,fontWeight:"900"},chapterCount:{color:colors.muted},verses:{backgroundColor:colors.surface,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.xs},
 verse:{borderRadius:radius.sm,paddingVertical:spacing.sm,paddingHorizontal:spacing.xs,borderLeftWidth:4,borderLeftColor:"transparent"},markedVerse:{backgroundColor:"#fff0a8",borderLeftColor:colors.gold},target:{backgroundColor:"#ffe28a"},verseText:{color:colors.text,fontSize:18,lineHeight:30},
 verseNumber:{color:colors.tealDark,fontSize:12,fontWeight:"900"},errorCard:{padding:spacing.lg,borderRadius:radius.md,backgroundColor:"#fff0f2"},error:{color:colors.error,fontWeight:"800"},
 backdrop:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(16,36,62,.45)"},sheet:{height:"92%",maxHeight:"92%",borderTopLeftRadius:radius.lg,borderTopRightRadius:radius.lg,backgroundColor:colors.surface},sheetScroll:{padding:spacing.xl,paddingBottom:spacing.xxl,gap:spacing.md},
 handle:{alignSelf:"center",width:48,height:5,borderRadius:3,backgroundColor:colors.border},sheetTitle:{color:colors.navy,fontSize:22,fontWeight:"900"},selectedText:{color:colors.text,fontSize:17,lineHeight:26},
 actions:{gap:spacing.sm},note:{minHeight:90,textAlignVertical:"top",borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md,fontSize:16},
 bookmark:{minHeight:48,alignItems:"center",justifyContent:"center",borderRadius:radius.md,borderWidth:1,borderColor:colors.gold},bookmarkActive:{backgroundColor:"#fff0a8"},bookmarkText:{color:colors.goldDark,fontWeight:"900"},greekBox:{gap:spacing.sm},greekTitle:{color:colors.navy,fontWeight:"900"},
 greekWords:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},greekWord:{padding:spacing.sm,borderRadius:radius.sm,backgroundColor:"#eef4f8"},greekForm:{fontSize:19,color:colors.navy},phonetic:{fontSize:12,color:colors.tealDark,fontWeight:"800"},strong:{fontSize:10,color:colors.muted}
});
