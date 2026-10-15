import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getActivity, orderedActivityIds } from "../../../src/content/catalog";
import { getLevelProgress } from "../../../src/domain/gamification";
import { nextJourneyActivityId } from "../../../src/domain/unlocks";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { Screen } from "../../components/Screen";
import { StatCard } from "../../components/StatCard";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { progress, hydrated } = useMobileProgress();
  const level = getLevelProgress(progress.xp);
  const completed = progress.completedLessonIds.length + progress.completedCheckpointIds.length;
  const nextId = nextJourneyActivityId(
    orderedActivityIds,
    progress.completedLessonIds,
    progress.completedCheckpointIds
  );
  const nextActivity = getActivity(nextId);

  if (!hydrated) {
    return (
      <Screen scroll={false} contentStyle={styles.loading}>
        <ActivityIndicator color={colors.teal} size="large" />
        <Text style={styles.muted}>Carregando seu progresso…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View>
        <Text style={styles.brand}>BIBLIOLINGO</Text>
        <Text style={styles.title}>Olá, estudante!</Text>
        <Text style={styles.subtitle}>Sua jornada bíblica está pronta para continuar.</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="XP acumulado" value={String(progress.xp)} accent={colors.gold} />
        <StatCard label="dias seguidos" value={String(progress.streak)} accent={colors.rose} />
        <StatCard label="nível" value={String(level.level)} accent={colors.teal} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>PRÓXIMA ATIVIDADE</Text>
        <Text style={styles.heroTitle}>{nextActivity?.title ?? "Jornada concluída"}</Text>
        <Text style={styles.heroText}>
          {nextActivity?.subtitle ?? "Você concluiu todas as atividades disponíveis."}
        </Text>
        {nextActivity ? (
          <PrimaryButton
            onPress={() => router.push({ pathname: "/lesson/[activityId]", params: { activityId: nextId } })}
          >
            Continuar estudando
          </PrimaryButton>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Progresso geral</Text>
          <Text style={styles.progressLabel}>{completed}/{orderedActivityIds.length}</Text>
        </View>
        <ProgressBar value={completed / orderedActivityIds.length} />
        <Text style={styles.muted}>Nível {level.level}: {level.xpIntoLevel}/{level.xpNeeded} XP</Text>
      </View>

      <PrimaryButton variant="secondary" onPress={() => router.push("/tracks")}>
        Ver trilhas bíblicas
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center"
  },
  brand: {
    color: colors.tealDark,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2
  },
  title: {
    color: colors.navy,
    fontSize: 30,
    fontWeight: "900",
    marginTop: spacing.sm
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.xs
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md
  },
  eyebrow: {
    color: "#88ded3",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "900"
  },
  heroText: {
    color: "#dce8ef",
    fontSize: 16,
    lineHeight: 24
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "800"
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  progressLabel: {
    color: colors.tealDark,
    fontWeight: "800"
  },
  muted: {
    color: colors.muted,
    fontSize: 14
  }
});
