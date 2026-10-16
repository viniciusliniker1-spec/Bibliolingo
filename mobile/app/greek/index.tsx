import { StyleSheet, Text, View } from "react-native";
import { greekActivityIds, greekUnits } from "../../../src/content/greek/catalog";
import { ActivityHub } from "../../components/ActivityHub";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../theme/tokens";

export default function GreekHubScreen(){
 const router=useRouter(); const {progress}=useMobileProgress();
 const completed=greekActivityIds.filter(id=>progress.completedLessonIds.includes(id)||progress.completedCheckpointIds.includes(id)).length;
 const learned=(progress as typeof progress & {learnedGreekLexemeIds?:string[]}).learnedGreekLexemeIds?.length??0;
 const groups=greekUnits.map(unit=>({id:unit.id,title:unit.title,subtitle:unit.subtitle,activities:[
  ...unit.lessons.map(lesson=>({id:lesson.id,title:lesson.title,subtitle:`${lesson.estimatedMinutes} min`})),
  {id:unit.checkpoint.id,title:unit.checkpoint.title,subtitle:"Checkpoint",checkpoint:true}
 ]}));
 return <Screen><View><Text style={styles.eyebrow}>GREGO KOINÉ</Text><Text style={styles.title}>Grego Bíblico</Text>
  <Text style={styles.subtitle}>Alfabeto, vocabulário, morfologia, gramática e leitura responsável do Novo Testamento.</Text></View>
  <View style={styles.metrics}><Text style={styles.metric}>{completed}/{greekActivityIds.length} atividades</Text><Text style={styles.metric}>{learned} palavras aprendidas</Text></View>
  <PrimaryButton variant="secondary" onPress={()=>router.push("/greek/dictionary")}>Abrir Dicionário Grego</PrimaryButton>
  <ActivityHub kind="greek" groups={groups} orderedIds={greekActivityIds}/>
 </Screen>;
}
const styles=StyleSheet.create({eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},
 subtitle:{color:colors.muted,fontSize:16,lineHeight:24},metrics:{flexDirection:"row",gap:spacing.md,flexWrap:"wrap"},metric:{color:colors.navy,fontWeight:"800"}});
