import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { recommendAdaptiveNext } from "../../src/domain/adaptive";
import { buildAdaptiveActivityCatalog } from "../../src/domain/adaptiveCatalog";
import { CURATED_PREREQUISITES } from "../../src/domain/prerequisites";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

type AdaptiveResult = ReturnType<typeof recommendAdaptiveNext>;
const recommendationCache = new Map<string, AdaptiveResult>();

function remember(key: string, value: AdaptiveResult) {
  recommendationCache.set(key, value);
  if (recommendationCache.size > 4) {
    const oldest = recommendationCache.keys().next().value;
    if (oldest) recommendationCache.delete(oldest);
  }
}

export function HomeAdaptiveSection() {
  const router = useRouter();
  const { progress, dismissRecommendation, recordRecommendation } = useMobileProgress();
  const fingerprint = useMemo(() => JSON.stringify({
    lessons: progress.completedLessonIds,
    checkpoints: progress.completedCheckpointIds,
    attempts: progress.attempts,
    reviews: progress.reviewItems,
    goal: progress.profile.goal,
    level: progress.profile.knowledgeLevel,
    ignored: progress.ignoredRecommendationIds,
    recent: progress.recentRecommendationIds
  }), [
    progress.completedLessonIds,
    progress.completedCheckpointIds,
    progress.attempts,
    progress.reviewItems,
    progress.profile.goal,
    progress.profile.knowledgeLevel,
    progress.ignoredRecommendationIds,
    progress.recentRecommendationIds
  ]);
  const [adaptive, setAdaptive] = useState<AdaptiveResult | null>(() => recommendationCache.get(fingerprint) ?? null);

  useEffect(() => {
    const cached = recommendationCache.get(fingerprint);
    if (cached) {
      setAdaptive(cached);
      return;
    }
    let active = true;
    const startedAt = globalThis.performance?.now?.() ?? Date.now();
    const timer = setTimeout(() => {
      const activities = buildAdaptiveActivityCatalog({
        completedLessonIds: progress.completedLessonIds,
        completedCheckpointIds: progress.completedCheckpointIds
      });
      const result = recommendAdaptiveNext({
        attempts: progress.attempts,
        reviewItems: progress.reviewItems,
        activities,
        prerequisites: CURATED_PREREQUISITES,
        goal: progress.profile.goal,
        declaredLevel: progress.profile.knowledgeLevel,
        ignoredRecommendationIds: progress.ignoredRecommendationIds,
        recentRecommendationIds: progress.recentRecommendationIds,
        limit: 3
      });
      remember(fingerprint, result);
      if (active) setAdaptive(result);
      const elapsed = (globalThis.performance?.now?.() ?? Date.now()) - startedAt;
      console.info("[BibliolingoPerf] adaptive_recommendations_ms=" + Math.round(elapsed));
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fingerprint, progress]);

  const openRecommendation = (recommendation: AdaptiveResult["recommendations"][number]) => {
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

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>APRENDIZADO ADAPTATIVO</Text>
      <Text style={styles.title}>Recomendado para você</Text>
      {!adaptive ? <Text style={styles.muted}>Preparando recomendações em segundo plano…</Text> : adaptive.recommendations.length ? adaptive.recommendations.map((recommendation) => (
        <View key={recommendation.id} style={styles.recommendation}>
          <Pressable style={styles.action} onPress={() => openRecommendation(recommendation)}>
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
      )) : <Text style={styles.muted}>Ainda não há evidências suficientes para personalizar. Continue pela trilha ou explore livremente.</Text>}
      {adaptive ? <View style={styles.profile}>
        <Text style={styles.activityTitle}>Seu perfil de aprendizagem</Text>
        <Text style={styles.muted}>{adaptive.profile.insufficientEvidence
          ? "Evidências insuficientes. O perfil será refinado com atividades em momentos diferentes."
          : adaptive.profile.strengths.length + " conceitos demonstrados · " + adaptive.profile.difficulties.length + " para reforçar."}</Text>
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  eyebrow: { color: colors.tealDark, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.navy, fontSize: 19, fontWeight: "900" },
  recommendation: { gap: spacing.xs },
  action: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  flex: { flex: 1 },
  activityTitle: { color: colors.navy, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  chevron: { color: colors.tealDark, fontSize: 27 },
  ignoreButton: { alignSelf: "flex-start", paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  ignoreText: { color: colors.tealDark, fontSize: 12, fontWeight: "800" },
  profile: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: "#eef7f6" }
});
