import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { SceneBanner } from "../../components/SceneBanner";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";
import { mobileSceneAssets } from "../../assets/sceneAssets";

const tracks = [
  {id:"noah",title:"Professor Noah",description:"Tutor contextual para dúvidas bíblicas e orientação de estudo.",route:"/noah",symbol:"N"},
  {id:"journey",title:"Jornada bíblica",description:"66 livros em ordem canônica.",route:"/(tabs)/tracks",symbol:"▤"},
  {id:"review",title:"Revisar",description:"Repetição espaçada dos conteúdos que precisam de atenção.",route:"/(tabs)/review",symbol:"↻"},
  {id:"greek",title:"Grego Bíblico",description:"8 unidades, 32 lições, checkpoints e evolução.",route:"/greek",symbol:"Ω"},
  {id:"dictionary",title:"Dicionário Grego",description:"Léxico koiné completo, formas, transliteração e Strong.",route:"/greek/dictionary",symbol:"λ"},
  {id:"hebrew",title:"Hebraico e Aramaico Bíblico",description:"32 lições e leitura das línguas do Antigo Testamento.",route:"/hebrew",symbol:"א"},
  {id:"hebrew-dictionary",title:"Dicionário Hebraico/Aramaico",description:"Milhares de verbetes Strong incluídos no aplicativo.",route:"/hebrew/dictionary",symbol:"אב"},
  {id:"deepen",title:"Aprofundar",description:"Estudos avançados, fontes e avaliações próprias.",route:"/deepen",symbol:"⌁"},
  {id:"formation",title:"Formação Pastoral Nazarena",description:"6 matérias, provas e simulado final.",route:"/formation",symbol:"N"}
] as const;

export default function StudyScreen(){
 const router=useRouter();
 const {progress}=useMobileProgress();
 return <Screen>
  <View><Text style={styles.eyebrow}>PERCURSOS</Text><Text style={styles.title}>Estudar</Text>
  <Text style={styles.subtitle}>Escolha uma área. Cada percurso mantém seu próprio contexto e usa o mesmo progresso.</Text></View>
  <SceneBanner source={mobileSceneAssets.study} eyebrow="BIBLIOTECA" title="Escolha seu próximo percurso" accessibilityLabel="Biblioteca representando os percursos de estudo" />
  {tracks.map(item=><Pressable key={item.id} accessibilityRole="button" onPress={()=>router.push(item.route)}
    style={({pressed})=>[styles.card,pressed&&styles.pressed]}>
    <View style={styles.icon}><Text style={styles.symbol}>{item.symbol}</Text></View>
    <View style={styles.copy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.description}>{item.description}</Text></View>
    <Text style={styles.arrow}>›</Text>
  </Pressable>)}
  <Text style={styles.summary}>{progress.completedLessonIds.length} lições e {progress.completedCheckpointIds.length} checkpoints concluídos.</Text>
 </Screen>;
}
const styles=StyleSheet.create({
 eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},
 subtitle:{color:colors.muted,fontSize:16,lineHeight:24},card:{minHeight:92,flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg,
 backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg},pressed:{transform:[{scale:.99}],backgroundColor:"#e8f7f4"},
 icon:{width:52,height:52,borderRadius:26,alignItems:"center",justifyContent:"center",backgroundColor:"#d8f2ee"},
 symbol:{color:colors.navy,fontSize:23,fontWeight:"900"},copy:{flex:1,gap:spacing.xs},cardTitle:{color:colors.navy,fontSize:17,fontWeight:"900"},
 description:{color:colors.muted,lineHeight:20},arrow:{color:colors.tealDark,fontSize:30},summary:{color:colors.muted,textAlign:"center",paddingBottom:80}
});
