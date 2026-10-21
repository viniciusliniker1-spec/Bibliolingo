import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getActivity, orderedActivityIds } from "../../src/content/catalog";
import { nextJourneyActivityId } from "../../src/domain/unlocks";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    activityId: string;
    correct: string;
    incorrect: string;
    total: string;
    xpEarned: string;
    passed: string;
  }>();
  const router = useRouter();
  const { progress } = useMobileProgress();
  const correct = Number(params.correct ?? 0);
  const incorrect = Number(params.incorrect ?? 0);
  const total = Math.max(1, Number(params.total ?? 1));
  const accuracy = correct / total;
  const passed = params.passed !== "false";
  const activity = getActivity(params.activityId);

  const nextId = passed
    ? nextJourneyActivityId(
      orderedActivityIds,
      progress.completedLessonIds,
      progress.completedCheckpointIds
    )
    : params.activityId;

  return (
    <Screen contentStyle={styles.screen}>
      <View style={[styles.celebration, !passed && styles.review]}>
        <Text style={styles.symbol}>{passed ? "✓" : "↻"}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>{passed ? "ATIVIDADE CONCLUÍDA" : "REVISÃO NECESSÁRIA"}</Text>
        <Text style={styles.title}>{activity?.title ?? "Resultado"}</Text>
        <Text style={styles.subtitle}>
          {passed
            ? "Muito bem! Seu progresso foi salvo neste aparelho."
            : "Revise os pontos principais e tente o checkpoint novamente."}
        </Text>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{correct}</Text>
          <Text style={styles.metricLabel}>acertos</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{incorrect}</Text>
          <Text style={styles.metricLabel}>erros</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>+{params.xpEarned ?? 0}</Text>
          <Text style={styles.metricLabel}>XP</Text>
        </View>
      </View>

      <View style={styles.accuracy}>
        <View style={styles.row}>
          <Text style={styles.accuracyTitle}>Precisão</Text>
          <Text style={styles.accuracyValue}>{Math.round(accuracy * 100)}%</Text>
        </View>
        <ProgressBar value={accuracy} />
      </View>

      <PrimaryButton
        onPress={() => router.replace({ pathname: "/lesson/[activityId]", params: { activityId: nextId } })}
      >
        {passed ? "Começar próximo passo" : "Tentar novamente"}
      </PrimaryButton>
      <PrimaryButton variant="text" onPress={() => router.replace("/")}>
        Voltar ao início
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "stretch",
    justifyContent: "center"
  },
  celebration: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold
  },
  review: {
    backgroundColor: "#ffd9df"
  },
  symbol: {
    color: colors.navy,
    fontSize: 48,
    fontWeight: "900"
  },
  center: {
    alignItems: "center",
    gap: spacing.sm
  },
  eyebrow: {
    color: colors.tealDark,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  title: {
    color: colors.navy,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.lg
  },
  metric: {
    flex: 1,
    alignItems: "center"
  },
  metricValue: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  divider: {
    width: 1,
    height: 42,
    backgroundColor: colors.border
  },
  accuracy: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  accuracyTitle: {
    color: colors.navy,
    fontWeight: "800"
  },
  accuracyValue: {
    color: colors.tealDark,
    fontWeight: "900"
  }
});
