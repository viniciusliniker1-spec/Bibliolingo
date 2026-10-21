import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { journeyBooks, orderedActivityIds } from "../../../src/content/catalog";
import { isJourneyActivityUnlocked } from "../../../src/domain/unlocks";
import { ProgressBar } from "../../components/ProgressBar";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function BookScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { progress } = useMobileProgress();
  const book = journeyBooks.find((item) => item.id === bookId);

  if (!book) {
    return (
      <Screen>
        <Text style={styles.title}>Livro não encontrado</Text>
        <Text style={styles.subtitle}>Volte às trilhas e escolha um livro disponível.</Text>
      </Screen>
    );
  }

  const bookIds = book.units.flatMap((unit) => [
    ...unit.lessons.map((lesson) => lesson.id),
    unit.checkpoint.id
  ]);
  const completedCount = bookIds.filter((id) =>
    progress.completedLessonIds.includes(id) || progress.completedCheckpointIds.includes(id)
  ).length;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TRILHA DO LIVRO</Text>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.subtitle}>{completedCount}/{bookIds.length} atividades concluídas</Text>
        <ProgressBar value={completedCount / bookIds.length} />
      </View>

      {book.units.map((unit, unitIndex) => {
        const unitCompleted = unit.lessons.filter((lesson) =>
          progress.completedLessonIds.includes(lesson.id)
        ).length + (progress.completedCheckpointIds.includes(unit.checkpoint.id) ? 1 : 0);
        const activities = [...unit.lessons, unit.checkpoint];

        return (
          <View key={unit.id} style={styles.unit}>
            <View style={styles.unitHeader}>
              <View style={styles.unitNumber}><Text style={styles.unitNumberText}>{unitIndex + 1}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitSubtitle}>{unit.subtitle}</Text>
              </View>
              <Text style={styles.unitProgress}>{unitCompleted}/{activities.length}</Text>
            </View>

            <View style={styles.nodes}>
              {activities.map((activity, activityIndex) => {
                const checkpoint = !("steps" in activity);
                const completed = checkpoint
                  ? progress.completedCheckpointIds.includes(activity.id)
                  : progress.completedLessonIds.includes(activity.id);
                const unlocked = isJourneyActivityUnlocked(
                  activity.id,
                  orderedActivityIds,
                  progress.completedLessonIds,
                  progress.completedCheckpointIds
                );

                return (
                  <Pressable
                    key={activity.id}
                    disabled={!unlocked}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !unlocked }}
                    accessibilityLabel={`${activity.title}, ${completed ? "concluída" : unlocked ? "disponível" : "bloqueada"}`}
                    onPress={() => router.push({
                      pathname: "/lesson/[activityId]",
                      params: { activityId: activity.id }
                    })}
                    style={({ pressed }) => [
                      styles.activity,
                      completed && styles.completed,
                      !unlocked && styles.locked,
                      pressed && unlocked && styles.pressed
                    ]}
                  >
                    <View style={[styles.node, checkpoint && styles.checkpointNode, completed && styles.completedNode]}>
                      <Text style={styles.nodeText}>{completed ? "✓" : checkpoint ? "★" : activityIndex + 1}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.activityTitle, !unlocked && styles.lockedText]}>{activity.title}</Text>
                      <Text style={styles.activitySubtitle}>
                        {checkpoint ? "Checkpoint" : `${activity.estimatedMinutes} min`}
                      </Text>
                    </View>
                    <Text style={styles.stateText}>{completed ? "Feita" : unlocked ? "Começar" : "Bloqueada"}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  unit: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: "hidden"
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.navy
  },
  unitNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal
  },
  unitNumberText: {
    color: colors.navy,
    fontWeight: "900"
  },
  unitTitle: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900"
  },
  unitSubtitle: {
    color: "#cddbe4",
    fontSize: 13,
    marginTop: 2
  },
  unitProgress: {
    color: colors.gold,
    fontWeight: "900"
  },
  nodes: {
    padding: spacing.md,
    gap: spacing.sm
  },
  activity: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    padding: spacing.sm
  },
  completed: {
    backgroundColor: "#fff7df"
  },
  locked: {
    opacity: 0.55
  },
  pressed: {
    backgroundColor: "#e5f7f4"
  },
  node: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal
  },
  checkpointNode: {
    backgroundColor: colors.gold
  },
  completedNode: {
    backgroundColor: colors.gold
  },
  nodeText: {
    color: colors.navy,
    fontWeight: "900",
    fontSize: 18
  },
  flex: {
    flex: 1
  },
  activityTitle: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "800"
  },
  activitySubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  lockedText: {
    color: colors.muted
  },
  stateText: {
    color: colors.tealDark,
    fontSize: 12,
    fontWeight: "800"
  }
});
