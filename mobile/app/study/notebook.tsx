import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { loadNotebook, removeNotebookItem, type NotebookItem } from "../../services/studyLibrary";
import { colors, radius, spacing } from "../../theme/tokens";
export default function NotebookScreen(){
 const router=useRouter();const {progress}=useMobileProgress();const [items,setItems]=useState<NotebookItem[]>([]);
 const reload=useCallback(()=>{void loadNotebook().then(setItems);},[]);
 useFocusEffect(reload);
 const annotations=Object.values(progress.bibleAnnotations).filter(item=>item.bookmarked||item.note.trim()).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 return <Screen><View style={styles.guide}><LumiCharacter mood="listening" motion="calm" style={styles.lumi} accessibilityLabel="Lumi cuidando do seu caderno"/><View style={styles.flex}><Text style={styles.title}>Meu caderno</Text><Text style={styles.subtitle}>Notas, marcações e palavras guardadas em um só lugar.</Text></View></View>
 <Text style={styles.section}>Bíblia</Text>{annotations.length?annotations.map(item=><Pressable key={item.id} style={styles.card} onPress={()=>router.push({pathname:"/(tabs)/bible",params:{osis:item.bookOsis,chapter:String(item.chapter),verse:String(item.verse)}})}><Text style={styles.cardTitle}>{item.bookName} {item.chapter}:{item.verse}</Text><Text style={styles.body}>{item.note||"Versículo marcado"}</Text></Pressable>):<Text style={styles.empty}>Suas notas e marcações bíblicas aparecerão aqui.</Text>}
 <Text style={styles.section}>Itens de estudo</Text>{items.length?items.map(item=><View key={item.id} style={styles.card}><Pressable onPress={()=>item.route&&router.push(item.route)}><Text style={styles.kind}>{item.kind==="original-word"?"PALAVRA ORIGINAL":item.kind==="lesson"?"LIÇÃO":"VERSÍCULO"}</Text><Text style={styles.cardTitle}>{item.title}</Text>{item.reference?<Text style={styles.reference}>{item.reference}</Text>:null}<Text style={styles.body}>{item.body}</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>void removeNotebookItem(item.id).then(reload)}><Text style={styles.remove}>Remover</Text></Pressable></View>):<Text style={styles.empty}>Guarde palavras dos dicionários e conteúdos para estudar depois.</Text>}
 </Screen>;
}
const styles=StyleSheet.create({guide:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.md,borderRadius:radius.lg,backgroundColor:"#e8f7f4"},lumi:{width:82,height:76},flex:{flex:1},title:{fontSize:28,fontWeight:"900",color:colors.navy},subtitle:{color:colors.muted,lineHeight:20},section:{fontSize:19,fontWeight:"900",color:colors.navy,marginTop:spacing.sm},card:{padding:spacing.lg,gap:spacing.xs,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},kind:{fontSize:10,fontWeight:"900",letterSpacing:1,color:colors.tealDark},cardTitle:{fontSize:17,fontWeight:"900",color:colors.navy},reference:{color:colors.goldDark,fontWeight:"800"},body:{color:colors.text,lineHeight:21},remove:{alignSelf:"flex-end",color:colors.error,fontWeight:"800",paddingTop:spacing.sm},empty:{color:colors.muted,padding:spacing.lg,textAlign:"center",backgroundColor:colors.surface,borderRadius:radius.md}});