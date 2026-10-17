import { StyleSheet, Text, View } from "react-native";
import { ACHIEVEMENTS, type AchievementCondition } from "../../../src/domain/achievements";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

function met(condition:AchievementCondition,progress:ReturnType<typeof useMobileProgress>["progress"]){
 switch(condition.type){
  case "lessons":return progress.completedLessonIds.length>=condition.count;
  case "xp":return progress.xp>=condition.amount;
  case "perfect-lessons":return progress.perfectLessonIds.length>=condition.count;
  case "checkpoint":return progress.completedCheckpointIds.includes(condition.id);
  case "streak":return progress.streak>=condition.days;
  case "greek-lexemes":return ((progress as typeof progress & {learnedGreekLexemeIds?:string[]}).learnedGreekLexemeIds?.length??0)>=condition.count;
  case "prompts":return (progress.promptsGenerated[condition.promptType] ?? 0) >= condition.count;
 }
}
export default function AchievementsScreen(){
 const {progress}=useMobileProgress();
 const earned=ACHIEVEMENTS.filter(item=>met(item.condition,progress)).length;
 return <Screen>
  <View><Text style={styles.eyebrow}>PROGRESSO</Text><Text style={styles.title}>Conquistas</Text>
  <Text style={styles.subtitle}>{earned} de {ACHIEVEMENTS.length} desbloqueadas</Text></View>
  <View style={styles.grid}>{ACHIEVEMENTS.map(item=>{const unlocked=met(item.condition,progress);return <View key={item.id}
   accessibilityLabel={`${item.title}. ${unlocked?"Desbloqueada":"Bloqueada"}. ${item.description}`}
   style={[styles.card,!unlocked&&styles.locked]}>
   <View style={[styles.medal,unlocked&&styles.medalEarned]}><Text style={styles.symbol}>{unlocked?item.icon:"○"}</Text></View>
   <View style={styles.copy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.description}>{item.description}</Text>
   <Text style={[styles.state,unlocked&&styles.stateEarned]}>{unlocked?"Conquistada":"Ainda bloqueada"}</Text></View>
  </View>})}</View>
 </Screen>;
}
const styles=StyleSheet.create({
 eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},
 subtitle:{color:colors.muted,fontSize:16},grid:{gap:spacing.md,paddingBottom:80},card:{flexDirection:"row",gap:spacing.md,padding:spacing.lg,
 borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},locked:{opacity:.65},
 medal:{width:54,height:54,borderRadius:27,alignItems:"center",justifyContent:"center",backgroundColor:"#e8edf1"},
 medalEarned:{backgroundColor:"#fff1bd"},symbol:{fontSize:25,color:colors.navy,fontWeight:"900"},copy:{flex:1,gap:spacing.xs},
 cardTitle:{fontSize:17,fontWeight:"900",color:colors.navy},description:{color:colors.muted,lineHeight:20},state:{fontSize:12,fontWeight:"800",color:colors.muted},
 stateEarned:{color:colors.goldDark}
});
