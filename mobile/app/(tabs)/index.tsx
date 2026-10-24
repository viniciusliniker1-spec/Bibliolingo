import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getLevelProgress } from "../../../src/domain/gamification";
import { toLocalDateKey } from "../../../src/domain/streak";
import { CanonicalJourneyMap } from "../../components/CanonicalJourneyMap";
import { LearningHud } from "../../components/LearningHud";
import { LumiCharacter } from "../../components/LumiCharacter";
import { LumiWelcome } from "../../components/LumiWelcome";
import { ProgressBar } from "../../components/ProgressBar";
import { SceneBanner } from "../../components/SceneBanner";
import { Screen } from "../../components/Screen";
import { mobileSceneAssets } from "../../assets/sceneAssets";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function HomeScreen(){
 const router=useRouter();const auth=useMobileAuth();const {progress,hydrated,syncStatus}=useMobileProgress();
 if(!hydrated)return <Screen scroll={false} contentStyle={styles.center}><LumiCharacter mood="loading" motion="thinking" style={styles.loadingLumi} accessibilityLabel="Lumi preparando sua jornada"/><ActivityIndicator color={colors.teal}/><Text style={styles.muted}>Preparando sua jornada…</Text></Screen>;
 const displayName=auth.session?.user.user_metadata?.display_name??progress.profile.name??"estudante";const returning=progress.xp>0||progress.completedLessonIds.length>0;const offline=syncStatus==="offline";
 const todayXp=progress.activity[toLocalDateKey(new Date())]?.xp??0;const dailyGoal=progress.profile.dailyGoal;const level=getLevelProgress(progress.xp);
 return <Screen>
  <View style={styles.welcome}><View style={styles.welcomeCopy}><Text style={styles.brand}>BIBLIOLINGO · NÍVEL {level.level}</Text><Text style={styles.title}>{returning?"Que bom ter você de volta":"Sua jornada começa aqui"}, {displayName}.</Text><Text style={styles.muted}>{offline?"Seu progresso está seguro neste aparelho.":"A Lumi já encontrou seu próximo passo."}</Text></View>{offline?<LumiCharacter mood="connectionError" motion="thinking" style={styles.lumi} accessibilityLabel="Lumi atenta à conexão"/>:returning?<LumiCharacter mood="returning" motion="encouraging" style={styles.lumi} accessibilityLabel="Lumi acolhendo você"/>:<LumiWelcome style={styles.lumi}/>}</View>
  <LearningHud streak={progress.streak} xp={progress.xp} hearts={progress.hearts} maxHearts={progress.settings.maxHearts} heartsEnabled={progress.settings.heartsEnabled} progress={Math.min(1,todayXp/dailyGoal)} label={`Meta de hoje · ${Math.min(todayXp,dailyGoal)}/${dailyGoal} XP`}/>
  <SceneBanner source={mobileSceneAssets.journey} eyebrow="SUA JORNADA" title="Da criação à nova criação" accessibilityLabel="Caminho iluminado representando a jornada canônica"/>
  <CanonicalJourneyMap/>
  <View style={styles.shortcuts}><Text style={styles.sectionTitle}>Continue explorando</Text><View style={styles.grid}><Shortcut title="Bíblia" note="Leitura e notas" onPress={()=>router.push("/(tabs)/bible")}/><Shortcut title="Estudar" note="Outras rotas" onPress={()=>router.push("/(tabs)/study")}/></View><Shortcut title="Professor Noah" note="Tutor bíblico contextual" onPress={()=>router.push("/noah")} wide/></View>
  <Text style={styles.sync} accessibilityLiveRegion="polite">{syncStatus==="syncing"?"Sincronizando progresso…":offline?"Modo offline · sincronização será retomada automaticamente":"Progresso pronto."}</Text>
 </Screen>;
}
function Shortcut({title,note,onPress,wide=false}:{title:string;note:string;onPress:()=>void;wide?:boolean}){return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[styles.shortcut,wide&&styles.wide,pressed&&styles.pressed]}><View style={styles.shortcutIcon}><Text style={styles.shortcutSymbol}>{title==="Bíblia"?"▤":title==="Estudar"?"✦":"N"}</Text></View><View style={styles.flex}><Text style={styles.shortcutTitle}>{title}</Text><Text style={styles.shortcutNote}>{note}</Text></View><Text style={styles.chevron}>›</Text></Pressable>;}
const styles=StyleSheet.create({center:{alignItems:"center",justifyContent:"center",gap:spacing.sm},loadingLumi:{width:118,height:108},welcome:{minHeight:122,flexDirection:"row",alignItems:"center",gap:spacing.sm},welcomeCopy:{flex:1,gap:spacing.xs},lumi:{width:116,height:108},brand:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:1.4},title:{color:colors.navy,fontSize:26,lineHeight:32,fontWeight:"900"},muted:{color:colors.muted,fontSize:14,lineHeight:21},shortcuts:{gap:spacing.md},sectionTitle:{color:colors.navy,fontSize:19,fontWeight:"900"},grid:{flexDirection:"row",gap:spacing.sm},shortcut:{flex:1,minHeight:82,flexDirection:"row",alignItems:"center",gap:spacing.sm,padding:spacing.md,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},wide:{flex:0,width:"100%"},shortcutIcon:{width:40,height:40,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:"#d8f2ee"},shortcutSymbol:{color:colors.navy,fontWeight:"900",fontSize:17},shortcutTitle:{color:colors.navy,fontWeight:"900"},shortcutNote:{color:colors.muted,fontSize:10,marginTop:2},flex:{flex:1},chevron:{color:colors.tealDark,fontSize:24},pressed:{transform:[{scale:.98}],opacity:.9},sync:{color:colors.muted,fontSize:12,textAlign:"center",paddingBottom:spacing.md}});
