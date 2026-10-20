import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LessonConfetti } from "../components/LessonConfetti";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { mobileActivityRoute, mobileHubRoute, resolveMobileActivity, type MobileActivityKind } from "../domain/activityCatalog";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { mobileVisualAssets } from "../assets/visualAssets";
import { colors, radius, spacing } from "../theme/tokens";

export default function ResultScreen() {
  const params = useLocalSearchParams<{activityId:string;activityTitle?:string;kind?:MobileActivityKind;nextId?:string;journeyMode?:"canonical"|"individual";journeyBookId?:string;correct:string;incorrect:string;total:string;xpEarned:string;passed:string;}>();
  const router = useRouter();
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const kind = params.kind ?? "bible";
  const correct = Number(params.correct ?? 0), incorrect = Number(params.incorrect ?? 0), total = Math.max(1, Number(params.total ?? 1));
  const passed = params.passed !== "false";
  const activity = resolveMobileActivity(kind, params.activityId);
  const nextId = params.nextId || params.activityId;
  const nextRoute = mobileActivityRoute(kind, nextId);

  useEffect(() => {
    if (passed) playFeedback("complete");
  }, [passed, playFeedback]);

  const continueActivity = () => {
    const route = nextRoute as { pathname: string; params: Record<string,string> };
    router.replace({
      pathname: route.pathname as never,
      params: {
        ...route.params,
        ...(kind === "bible" ? { journeyMode: params.journeyMode ?? "canonical", journeyBookId: params.journeyBookId ?? "" } : {})
      }
    });
  };

  return <View style={styles.root}>
    <Screen contentStyle={styles.screen}>
      <Image source={passed ? mobileVisualAssets.lumi.proud : mobileVisualAssets.lumi.encouragement} style={styles.lumi} resizeMode="contain" accessibilityLabel={passed ? "Lumi comemorando a conclusão" : "Lumi encorajando uma nova tentativa"} />
      <View style={[styles.celebration,!passed&&styles.review]}><Text style={styles.symbol}>{passed?"✓":"↻"}</Text></View>
      <View style={styles.center}><Text style={styles.eyebrow}>{passed?"ATIVIDADE CONCLUÍDA":"TENTE NOVAMENTE"}</Text>
        <Text style={styles.title}>{activity?.title ?? params.activityTitle ?? "Resultado"}</Text>
        <Text style={styles.subtitle}>{passed?"Muito bem! Seu progresso foi salvo e a próxima atividade está pronta.":"Revise os pontos principais e tente esta atividade novamente."}</Text></View>
      <View style={styles.resultCard}>
        <View style={styles.metric}><Text style={styles.metricValue}>{correct}</Text><Text style={styles.metricLabel}>acertos</Text></View><View style={styles.divider}/>
        <View style={styles.metric}><Text style={styles.metricValue}>{incorrect}</Text><Text style={styles.metricLabel}>erros</Text></View><View style={styles.divider}/>
        <View style={styles.metric}><Text style={styles.metricValue}>+{params.xpEarned??0}</Text><Text style={styles.metricLabel}>XP</Text></View>
      </View>
      <View style={styles.accuracy}><View style={styles.row}><Text style={styles.accuracyTitle}>Precisão</Text><Text style={styles.accuracyValue}>{Math.round(correct/total*100)}%</Text></View><ProgressBar value={correct/total}/></View>
      <PrimaryButton onPress={continueActivity}>{passed&&nextId!==params.activityId?"Começar próximo passo":"Tentar novamente"}</PrimaryButton>
      <PrimaryButton variant="secondary" onPress={()=>router.replace(mobileHubRoute(kind))}>Voltar ao percurso</PrimaryButton>
      <PrimaryButton variant="text" onPress={()=>router.replace("/")}>Voltar ao início</PrimaryButton>
    </Screen>
    <LessonConfetti active={passed}/>
  </View>;
}
const styles=StyleSheet.create({
 root:{flex:1},lumi:{alignSelf:"center",width:154,height:140},screen:{alignItems:"stretch",justifyContent:"center"},celebration:{alignSelf:"center",width:96,height:96,borderRadius:48,alignItems:"center",justifyContent:"center",backgroundColor:colors.gold},review:{backgroundColor:"#ffd9df"},symbol:{color:colors.navy,fontSize:48,fontWeight:"900"},
 center:{alignItems:"center",gap:spacing.sm},eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:28,fontWeight:"900",textAlign:"center"},subtitle:{color:colors.muted,fontSize:16,lineHeight:24,textAlign:"center"},
 resultCard:{flexDirection:"row",alignItems:"center",backgroundColor:colors.surface,borderRadius:radius.lg,borderColor:colors.border,borderWidth:1,padding:spacing.lg},metric:{flex:1,alignItems:"center"},metricValue:{color:colors.navy,fontSize:24,fontWeight:"900"},metricLabel:{color:colors.muted,fontSize:12,marginTop:2},
 divider:{width:1,height:42,backgroundColor:colors.border},accuracy:{backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.lg,gap:spacing.md},row:{flexDirection:"row",justifyContent:"space-between"},accuracyTitle:{color:colors.navy,fontWeight:"800"},accuracyValue:{color:colors.tealDark,fontWeight:"900"}
});
