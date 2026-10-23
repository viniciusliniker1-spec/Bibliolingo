import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { achievementProgress, isApprovedAchievementMet, visibleApprovedAchievements } from "../../../src/domain/achievements";
import { mobileAchievementAssets } from "../../assets/achievementAssets";
import { mobileFeedbackAssets } from "../../assets/feedbackAssets";

type AchievementItem = ReturnType<typeof visibleApprovedAchievements>[number];
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function AchievementsScreen(){
 const {progress}=useMobileProgress();
 const achievements=visibleApprovedAchievements();
 const earned=achievements.filter(item=>isApprovedAchievementMet(progress,item)).length;
 const renderItem=({item}:{item:AchievementItem})=>{
  const unlocked=isApprovedAchievementMet(progress,item);
  const value=achievementProgress(progress,item);
  const artwork=mobileAchievementAssets[item.id];
  return <View accessibilityLabel={`${item.title}. ${unlocked?"Desbloqueada":"Bloqueada"}. ${item.description}`} style={[styles.card,!unlocked&&styles.locked]}>
   <View style={[styles.medal,unlocked&&styles.medalEarned]}>
    {artwork?<Image source={artwork} style={styles.artwork} resizeMode="contain" accessibilityIgnoresInvertColors />:<Text style={styles.symbol}>{unlocked?"✦":"○"}</Text>}
   </View>
   <View style={styles.copy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.description}>{item.description}</Text>
    <Text style={[styles.state,unlocked&&styles.stateEarned]}>{unlocked?"Conquistada":value.supported?`${Math.min(value.current,value.target)} de ${value.target}`:"Aguardando registro confiável"}</Text>
   </View>
  </View>;
 };
 return <SafeAreaView style={styles.safe} edges={["top","left","right"]}>
  <FlatList
   data={achievements}
   keyExtractor={(item)=>item.id}
   renderItem={renderItem}
   initialNumToRender={5}
   maxToRenderPerBatch={5}
   windowSize={5}
   removeClippedSubviews
   contentContainerStyle={styles.list}
   ItemSeparatorComponent={()=> <View style={styles.separator}/>}
   ListHeaderComponent={<View style={styles.header}><View style={styles.headerCopy}><Text style={styles.eyebrow}>PROGRESSO</Text><Text style={styles.title}>Conquistas</Text><Text style={styles.subtitle}>{earned} de {achievements.length} conquistas regulares</Text></View><Image source={mobileFeedbackAssets.achievement} style={styles.lumi} resizeMode="contain" accessibilityLabel="Lumi celebrando suas conquistas" /></View>}
  />
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.background},list:{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:90},separator:{height:spacing.md},header:{flexDirection:"row",alignItems:"center",gap:spacing.md,marginBottom:spacing.lg},headerCopy:{flex:1,gap:spacing.xs},lumi:{width:104,height:104},
 eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},subtitle:{color:colors.muted,fontSize:16},
 card:{flexDirection:"row",gap:spacing.md,padding:spacing.lg,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},locked:{opacity:.65},
 medal:{width:72,height:72,borderRadius:36,alignItems:"center",justifyContent:"center",backgroundColor:"#e8edf1",overflow:"hidden"},medalEarned:{backgroundColor:"#fff1bd"},
 artwork:{width:68,height:68},symbol:{fontSize:25,color:colors.navy,fontWeight:"900"},copy:{flex:1,gap:spacing.xs},cardTitle:{fontSize:17,fontWeight:"900",color:colors.navy},
 description:{color:colors.muted,lineHeight:20},state:{fontSize:12,fontWeight:"800",color:colors.muted},stateEarned:{color:colors.goldDark}
});
