import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { filterGreekLexicon } from "../../../src/content/greek/search";
import { greekLexiconSources, type GreekLexeme } from "../../../src/content/greek/lexiconData";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProfessorNoahModal } from "../../components/ProfessorNoahModal";
import { Screen } from "../../components/Screen";
import { loadCachedGreekLexicon } from "../../services/greekLexiconStorage";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function GreekDictionaryScreen(){
 const params=useLocalSearchParams<{query?:string}>(); const [query,setQuery]=useState(params.query??""); const [entries,setEntries]=useState<GreekLexeme[]>([]);
 const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [selected,setSelected]=useState<GreekLexeme>(); const [noah,setNoah]=useState(false);
 const {progress,markGreekLexeme}=useMobileProgress();
 useEffect(()=>{let active=true;void loadCachedGreekLexicon().then(value=>{if(active)setEntries(value);}).catch(err=>{if(active)setError(err instanceof Error?err.message:"Dicionário indisponível.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const results=useMemo(()=>filterGreekLexicon(entries,query,80),[entries,query]);
 const learned=new Set(progress.learnedGreekLexemeIds??[]);
 return <><Screen>
  <View><Text style={styles.eyebrow}>LÉXICO KOINÉ</Text><Text style={styles.title}>Dicionário Grego</Text>
   <Text style={styles.subtitle}>Pesquise lema, forma, transliteração, significado ou número Strong. {entries.length?entries.length.toLocaleString("pt-BR")+" entradas carregadas.":""}</Text></View>
  <TextInput value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} placeholder="ἀγάπη, agapē, amor ou G0026" style={styles.search}/>
  {loading?<ActivityIndicator color={colors.teal} size="large"/>:error?<View style={styles.errorCard}><Text style={styles.error}>{error}</Text>
   <Text style={styles.subtitle}>O arquivo lexical local não pôde ser aberto. Reinstale a build completa do aplicativo.</Text></View>:
   <View style={styles.results}>{results.map(entry=><Pressable key={entry.id} onPress={()=>setSelected(entry)} style={styles.entry}>
    <View style={styles.entryTop}><Text style={styles.lemma}>{entry.lemma}</Text><Text style={styles.strong}>{entry.strong}</Text></View>
    <Text style={styles.transliteration}>{entry.transliteration} · {entry.partOfSpeech}</Text><Text style={styles.meaning}>{entry.meanings.slice(0,2).join("; ")}</Text>
    {learned.has(entry.id)?<Text style={styles.learned}>✓ Vocabulário aprendido</Text>:null}
   </Pressable>)}</View>}
  <Text style={styles.source}>Fontes: {greekLexiconSources.map(source=>`${source.title} (${source.license})`).join(" · ")}</Text>
 </Screen>
 <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={()=>setSelected(undefined)}><View style={styles.backdrop}><View style={styles.sheet}>
  <View style={styles.handle}/><Text style={styles.detailLemma}>{selected?.lemma}</Text><Text style={styles.detailMeta}>{selected?.strong} · {selected?.transliteration}</Text>
  <Text style={styles.heading}>Sentidos</Text><Text style={styles.detailText}>{selected?.meanings.join("; ")}</Text>
  <Text style={styles.heading}>Morfologia</Text><Text style={styles.detailText}>{selected?.morphology}</Text>
  {selected?.forms.length?<><Text style={styles.heading}>Formas</Text><Text style={styles.detailText}>{selected.forms.join(" · ")}</Text></>:null}
  <PrimaryButton variant="secondary" onPress={()=>{if(selected)markGreekLexeme(selected.id);}}>Marcar como aprendida</PrimaryButton>
  <PrimaryButton variant="secondary" onPress={()=>setNoah(true)}>Perguntar ao Noah sobre esta palavra</PrimaryButton>
  <PrimaryButton variant="text" onPress={()=>setSelected(undefined)}>Fechar</PrimaryButton>
 </View></View></Modal>
 {selected?<ProfessorNoahModal visible={noah} onClose={()=>setNoah(false)} contextKey={`lexicon:${selected.id}`} context={{
  area:"lexicon",title:`Dicionário Grego · ${selected.lemma}`,content:`${selected.lemma} (${selected.transliteration}) — ${selected.meanings.join("; ")}. ${selected.morphology}`,
  lexicalData:{lemma:selected.lemma,strong:selected.strong,transliteration:selected.transliteration,meanings:selected.meanings,morphology:selected.morphology,forms:selected.forms},
  sources:[selected.source.title,selected.source.license]
 }}/>:null}</>;
}
const styles=StyleSheet.create({
 eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},subtitle:{color:colors.muted,fontSize:15,lineHeight:22},
 search:{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.surface,paddingHorizontal:spacing.lg,fontSize:17,color:colors.navy},
 results:{gap:spacing.md},entry:{padding:spacing.lg,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,gap:spacing.xs},
 entryTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},lemma:{fontSize:24,color:colors.navy,fontWeight:"800"},strong:{color:colors.tealDark,fontWeight:"900"},
 transliteration:{color:colors.muted},meaning:{color:colors.text,fontSize:16,lineHeight:23},learned:{color:colors.success,fontSize:12,fontWeight:"800"},source:{color:colors.muted,fontSize:12,lineHeight:18,paddingBottom:spacing.xl},
 errorCard:{padding:spacing.lg,borderRadius:radius.md,backgroundColor:"#fff0f2"},error:{color:colors.error,fontWeight:"800"},backdrop:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(16,36,62,.45)"},
 sheet:{maxHeight:"88%",padding:spacing.xl,paddingBottom:spacing.xxl,gap:spacing.md,borderTopLeftRadius:radius.lg,borderTopRightRadius:radius.lg,backgroundColor:colors.surface},
 handle:{alignSelf:"center",width:48,height:5,borderRadius:3,backgroundColor:colors.border},detailLemma:{fontSize:32,color:colors.navy,fontWeight:"900"},detailMeta:{color:colors.tealDark,fontWeight:"800"},
 heading:{color:colors.navy,fontWeight:"900",fontSize:16},detailText:{color:colors.text,fontSize:16,lineHeight:24}
});
