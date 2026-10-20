import { Image, StyleSheet, Text, View } from "react-native";
import { achievementProgress, isApprovedAchievementMet, visibleApprovedAchievements } from "../../../src/domain/achievements";
import { mobileAchievementAssets } from "../../assets/achievementAssets";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function AchievementsScreen(){
 const {progress}=useMobileProgress();
 const achievements=visibleApprovedAchievements();
 const earned=achievements.filter(item=>isApprovedAchievementMet(progress,item)).length;
 return <Screen>
  <View><Text style={styles.eyebrow}>PROGRESSO</Text><Text style={styles.title}>Conquistas</Text>
  <Text style={styles.subtitle}>{earned} de {achievements.length} conquistas regulares</Text></View>
  <View style={styles.grid}>{achievements.map(item=>{const unlocked=isApprovedAchievementMet(progress,item);const value=achievementProgress(progress,item);const artwork=mobileAchievementAssets[item.id];return <View key={item.id}
   accessibilityLabel={`${item.title}. ${unlocked?"Desbloqueada":"Bloqueada"}. ${item.description}`}
   style={[styles.card,!unlocked&&styles.locked]}>
   <View style={[styles.medal,unlocked&&styles.medalEarned]}>{artwork?<Image source={artwork} style={styles.artwork} resizeMode="contain" accessibilityIgnoresInvertColors />:<Text style={styles.symbol}>{unlocked?"✦":"○"}</Text>}</View>
   <View style={styles.copy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.description}>{item.description}</Text>
   <Text style={[styles.state,unlocked&&styles.stateEarned]}>{unlocked?"Conquistada":value.supported?`${Math.min(value.current,value.target)} de ${value.target}`:"Aguardando registro confiável"}</Text></View>
  </View>})}</View>
 </Screen>;
}
const styles=StyleSheet.create({
 eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},
 subtitle:{color:colors.muted,fontSize:16},grid:{gap:spacing.md,paddingBottom:80},card:{flexDirection:"row",gap:spacing.md,padding:spacing.lg,
 borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},locked:{opacity:.65},
 medal:{width:72,height:72,borderRadius:36,alignItems:"center",justifyContent:"center",backgroundColor:"#e8edf1",overflow:"hidden"},
 medalEarned:{backgroundColor:"#fff1bd"},artwork:{width:68,height:68},symbol:{fontSize:25,color:colors.navy,fontWeight:"900"},copy:{flex:1,gap:spacing.xs},
 cardTitle:{fontSize:17,fontWeight:"900",color:colors.navy},description:{color:colors.muted,lineHeight:20},state:{fontSize:12,fontWeight:"800",color:colors.muted},
 stateEarned:{color:colors.goldDark}
});
