import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getActivity, getBookForActivity, journeyBooks, orderedActivityIds } from "../../../src/content/catalog";
import { getLevelProgress } from "../../../src/domain/gamification";
import { isJourneyActivityUnlocked, nextJourneyActivityId } from "../../../src/domain/unlocks";
import { toLocalDateKey } from "../../../src/domain/streak";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";
import { recommendAdaptiveNext } from "../../../src/domain/adaptive";
import { buildAdaptiveActivityCatalog } from "../../../src/domain/adaptiveCatalog";
import { CURATED_PREREQUISITES } from "../../../src/domain/prerequisites";

export default function HomeScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress, hydrated, dismissRecommendation, recordRecommendation } = useMobileProgress();
  const level = getLevelProgress(progress.xp);
  const completed = progress.completedLessonIds.length + progress.completedCheckpointIds.length;
  const nextId = nextJourneyActivityId(orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds);
  const nextActivity = getActivity(nextId);
  const currentBook = (nextId ? getBookForActivity(nextId) : undefined) ?? journeyBooks[0];
  const currentUnitIndex = Math.max(0, currentBook.units.findIndex((unit) =>
    unit.lessons.some((lesson) => lesson.id === nextId) || unit.checkpoint.id === nextId
  ));
  const bookIds = currentBook.units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]);
  const bookCompleted = bookIds.filter((id) => progress.completedLessonIds.includes(id) || progress.completedCheckpointIds.includes(id)).length;
  const todayXp = progress.activity[toLocalDateKey(new Date())]?.xp ?? 0;
  const dailyGoal = progress.profile.dailyGoal;
  const displayName = auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "estudante";
  const adaptiveActivities = useMemo(
    () => buildAdaptiveActivityCatalog({
      completedLessonIds: progress.completedLessonIds,
      completedCheckpointIds: progress.completedCheckpointIds
    }),
    [progress.completedLessonIds, progress.completedCheckpointIds]
  );
  const adaptive = useMemo(
    () => recommendAdaptiveNext({
      attempts: progress.attempts,
      reviewItems: progress.reviewItems,
      activities: adaptiveActivities,
      prerequisites: CURATED_PREREQUISITES,
      goal: progress.profile.goal,
      declaredLevel: progress.profile.knowledgeLevel,
      ignoredRecommendationIds: progress.ignoredRecommendationIds,
      recentRecommendationIds: progress.recentRecommendationIds,
      limit: 3
    }),
    [adaptiveActivities, progress.attempts, progress.reviewItems, progress.profile.goal, progress.profile.knowledgeLevel, progress.ignoredRecommendationIds, progress.recentRecommendationIds]
  );

  const openRecommendation = (recommendation: (typeof adaptive.recommendations)[number]) => {
    recordRecommendation(recommendation.id);
    if (recommendation.kind === "review") {
      router.push("/review");
      return;
    }
    if (!recommendation.activityId || !recommendation.activityKind) return;
    router.push({
      pathname: "/activity/[kind]/[activityId]",
      params: { kind: recommendation.activityKind, activityId: recommendation.activityId }
    });
  };

  if (!hydrated) {
    return <Screen scroll={false} contentStyle={styles.loading}><ActivityIndicator color={colors.teal} size="large" /><Text style={styles.muted}>Carregando seu progresso…</Text></Screen>;
  }

  return (
    <Screen>
      <View style={styles.welcome}>
        <View style={styles.flex}>
          <Text style={styles.brand}>BIBLIOLINGO</Text>
          <Text style={styles.greeting}>Seu próximo passo está pronto, {displayName}.</Text>
        </View>
        <View style={styles.levelBadge}><Text style={styles.levelLabel}>NÍVEL</Text><Text style={styles.levelValue}>{level.level}</Text></View>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusItem}>🔥 {progress.streak} sequência</Text>
        <Text style={styles.statusItem}>⚡ {progress.xp} XP</Text>
        <Text style={styles.statusItem}>♥ {progress.hearts}/{progress.settings.maxHearts}</Text>
      </View>

      <View style={styles.goalCard}>
        <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Meta de hoje</Text><Text style={styles.progressLabel}>{Math.min(todayXp, dailyGoal)}/{dailyGoal} XP</Text></View>
        <ProgressBar value={Math.min(1, todayXp / dailyGoal)} />
      </View>

      <Pressable style={styles.chooseBook} onPress={() => router.push("/plans")}><View style={styles.flex}><Text style={styles.activityTitle}>Metas e planos de estudo</Text><Text style={styles.muted}>Organize leituras e atividades no seu ritmo.</Text></View><Text style={styles.chevron}>›</Text></Pressable>

      <View style={styles.goalCard}>
        <Text style={styles.eyebrowDark}>APRENDIZADO ADAPTATIVO</Text>
        <Text style={styles.sectionTitle}>Recomendado para você</Text>
        {adaptive.recommendations.length ? adaptive.recommendations.map((recommendation) => (
          <View key={recommendation.id} style={styles.recommendationCard}>
            <Pressable style={styles.chooseBook} onPress={() => openRecommendation(recommendation)}>
              <View style={styles.flex}>
                <Text style={styles.activityTitle}>{recommendation.title}</Text>
                <Text style={styles.muted}>{recommendation.reason} · ~{recommendation.estimatedMinutes} min</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => dismissRecommendation(recommendation.id)} style={styles.ignoreButton}>
              <Text style={styles.ignoreText}>Ignorar esta recomendação</Text>
            </Pressable>
          </View>
        )) : (
          <Text style={styles.muted}>Ainda não há evidências suficientes para personalizar. Continue pela trilha ou explore livremente.</Text>
        )}
        <View style={styles.profileSummary}>
          <Text style={styles.activityTitle}>Seu perfil de aprendizagem</Text>
          <Text style={styles.muted}>
            {adaptive.profile.insufficientEvidence
              ? "Evidências insuficientes. O perfil será refinado com atividades em momentos diferentes."
              : adaptive.profile.strengths.length + " conceitos demonstrados · " + adaptive.profile.difficulties.length + " para reforçar."}
          </Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CONTINUAR SUA JORNADA</Text>
        <Text style={styles.heroTitle}>{nextActivity?.title ?? "Jornada concluída"}</Text>
        <Text style={styles.heroText}>{nextActivity?.subtitle ?? "Você concluiu todas as atividades disponíveis."}</Text>
        {nextActivity ? <PrimaryButton onPress={() => router.push({ pathname: "/lesson/[activityId]", params: { activityId: nextId } })}>Continuar</PrimaryButton> : null}
      </View>

      <View style={styles.journeyHeader}>
        <View style={styles.rowBetween}><View><Text style={styles.eyebrowDark}>SUA JORNADA</Text><Text style={styles.sectionTitle}>{currentBook.title}</Text></View><Text style={styles.progressLabel}>{bookCompleted}/{bookIds.length}</Text></View>
        <ProgressBar value={bookIds.length ? bookCompleted / bookIds.length : 0} />
        <Pressable onPress={() => router.push("/tracks")} style={styles.chooseBook}><Text style={styles.chooseBookText}>Escolher outro livro</Text><Text style={styles.chevron}>›</Text></Pressable>
      </View>

      <View style={styles.bookHeader}>
        <View style={styles.bookBadge}><Text style={styles.bookBadgeText}>{currentBook.shortTitle}</Text></View>
        <View style={styles.flex}><Text style={styles.bookLabel}>LIVRO SELECIONADO</Text><Text style={styles.bookTitle}>{currentBook.title}</Text><Text style={styles.bookMeta}>{currentBook.units.length} unidades · {bookCompleted}/{bookIds.length}</Text></View>
      </View>

      {currentBook.units.map((unit, unitIndex) => {
        const activities = [...unit.lessons, unit.checkpoint];
        const unitCompleted = activities.filter((activity) => progress.completedLessonIds.includes(activity.id) || progress.completedCheckpointIds.includes(activity.id)).length;
        const expanded = unitIndex === currentUnitIndex;
        return (
          <View key={unit.id} style={[styles.unit, expanded && styles.unitExpanded]}>
            <Pressable onPress={() => router.push({ pathname: "/book/[bookId]", params: { bookId: currentBook.id } })} style={styles.unitHeader}>
              <View style={styles.unitNumber}><Text style={styles.unitNumberText}>{unitIndex + 1}</Text></View>
              <View style={styles.flex}><Text style={styles.unitLabel}>Unidade {unitIndex + 1}</Text><Text style={styles.unitTitle}>{unit.title}</Text><Text style={styles.unitSubtitle}>{unit.subtitle}</Text></View>
              <Text style={styles.unitProgress}>{unitCompleted}/{activities.length}</Text>
            </Pressable>
            {expanded ? <View style={styles.activityList}>{activities.map((activity, activityIndex) => {
              const completedActivity = progress.completedLessonIds.includes(activity.id) || progress.completedCheckpointIds.includes(activity.id);
              const unlocked = isJourneyActivityUnlocked(activity.id, orderedActivityIds, progress.completedLessonIds, progress.completedCheckpointIds);
              const checkpoint = !("steps" in activity);
              return <Pressable key={activity.id} disabled={!unlocked} onPress={() => router.push({ pathname: "/lesson/[activityId]", params: { activityId: activity.id } })} style={[styles.activity, !unlocked && styles.locked]}>
                <View style={[styles.activityNode, checkpoint && styles.checkpointNode, completedActivity && styles.completedNode]}><Text style={styles.nodeText}>{completedActivity ? "✓" : checkpoint ? "★" : activityIndex + 1}</Text></View>
                <View style={styles.flex}><Text style={styles.activityTitle}>{activity.title}</Text><Text style={styles.activityMeta}>{completedActivity ? "Concluída" : unlocked ? checkpoint ? "Checkpoint" : "Disponível" : "Bloqueada"}</Text></View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>;
            })}</View> : null}
          </View>
        );
      })}

      {progress.settings.heartsEnabled ? <View style={styles.heartsCard}><Text style={styles.heartsTitle}>♥ Corações: {progress.hearts}/{progress.settings.maxHearts}</Text><Text style={styles.muted}>Erros consomem um coração. Acertos em revisões de conceitos errados recuperam corações, sem forçar você a revisar conteúdos dominados.</Text></View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading:{alignItems:"center",justifyContent:"center"},flex:{flex:1},welcome:{flexDirection:"row",alignItems:"center",gap:spacing.md},brand:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.8},greeting:{color:colors.navy,fontSize:27,lineHeight:33,fontWeight:"900",marginTop:spacing.xs},
  levelBadge:{width:58,height:58,borderRadius:29,alignItems:"center",justifyContent:"center",backgroundColor:"#fff4cf",borderWidth:1,borderColor:colors.gold},levelLabel:{fontSize:9,color:colors.goldDark,fontWeight:"900"},levelValue:{fontSize:20,color:colors.navy,fontWeight:"900"},
  statusBar:{flexDirection:"row",justifyContent:"space-around",padding:spacing.md,borderRadius:radius.md,backgroundColor:colors.navy},statusItem:{color:colors.surface,fontSize:12,fontWeight:"800"},
  goalCard:{gap:spacing.sm,padding:spacing.lg,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},hero:{gap:spacing.md,padding:spacing.xl,borderRadius:radius.lg,backgroundColor:colors.navy},eyebrow:{color:"#88ded3",fontSize:11,fontWeight:"900",letterSpacing:1.1},eyebrowDark:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:1.1},heroTitle:{color:colors.surface,fontSize:24,fontWeight:"900"},heroText:{color:"#dce8ef",fontSize:15,lineHeight:22},
  journeyHeader:{gap:spacing.md},rowBetween:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:spacing.md},sectionTitle:{color:colors.navy,fontSize:19,fontWeight:"900"},progressLabel:{color:colors.tealDark,fontWeight:"900"},chooseBook:{minHeight:56,flexDirection:"row",alignItems:"center",paddingHorizontal:spacing.md,borderRadius:radius.md,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},chooseBookText:{flex:1,color:colors.navy,fontWeight:"800"},
  bookHeader:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg,borderRadius:radius.lg,backgroundColor:"#0f5364"},bookBadge:{width:52,height:52,borderRadius:16,alignItems:"center",justifyContent:"center",backgroundColor:colors.gold},bookBadgeText:{color:colors.navy,fontWeight:"900"},bookLabel:{color:"#8fe1d7",fontSize:10,fontWeight:"900"},bookTitle:{color:colors.surface,fontSize:21,fontWeight:"900"},bookMeta:{color:"#d4e8ed",fontSize:12,marginTop:3},
  unit:{borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,backgroundColor:colors.surface,overflow:"hidden"},unitExpanded:{borderColor:colors.teal,borderWidth:2},unitHeader:{minHeight:86,flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.md},unitNumber:{width:38,height:38,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"#d8f2ee"},unitNumberText:{color:colors.tealDark,fontWeight:"900"},unitLabel:{color:colors.muted,fontSize:10},unitTitle:{color:colors.navy,fontSize:16,fontWeight:"900"},unitSubtitle:{color:colors.muted,fontSize:11,marginTop:2},unitProgress:{color:colors.tealDark,fontWeight:"900"},
  activityList:{padding:spacing.md,paddingTop:0,gap:spacing.sm},activity:{minHeight:68,flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.sm,borderTopWidth:1,borderTopColor:colors.border},activityNode:{width:46,height:46,borderRadius:23,alignItems:"center",justifyContent:"center",backgroundColor:colors.teal},checkpointNode:{backgroundColor:colors.gold},completedNode:{backgroundColor:"#86d5a3"},nodeText:{color:colors.navy,fontWeight:"900"},activityTitle:{color:colors.navy,fontWeight:"800"},activityMeta:{color:colors.muted,fontSize:11,marginTop:3},locked:{opacity:.48},chevron:{color:colors.tealDark,fontSize:27},
  recommendationCard:{gap:spacing.xs},ignoreButton:{alignSelf:"flex-start",paddingVertical:spacing.xs,paddingHorizontal:spacing.sm},ignoreText:{color:colors.tealDark,fontSize:12,fontWeight:"800"},
  profileSummary:{gap:spacing.xs,padding:spacing.md,borderRadius:radius.md,backgroundColor:"#eef7f6"},heartsCard:{gap:spacing.sm,padding:spacing.lg,borderRadius:radius.lg,borderWidth:1,borderColor:"#f2a8b6",backgroundColor:"#fff2f5"},heartsTitle:{color:colors.rose,fontSize:17,fontWeight:"900"},muted:{color:colors.muted,fontSize:13,lineHeight:20}
});
