import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { journeyBooks } from "../../../src/content/catalog";
import { Screen } from "../../components/Screen";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function TracksScreen() {
  const router = useRouter();
  const { progress } = useMobileProgress();

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View>
        <Text style={styles.eyebrow}>JORNADA BÍBLICA</Text>
        <Text style={styles.title}>Trilhas</Text>
        <Text style={styles.subtitle}>Livros organizados da criação à nova criação.</Text>
      </View>
      <FlatList
        data={journeyBooks}
        keyExtractor={(book) => book.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const ids = item.units.flatMap((unit) => [
            ...unit.lessons.map((lesson) => lesson.id),
            unit.checkpoint.id
          ]);
          const completed = ids.filter((id) =>
            progress.completedLessonIds.includes(id) || progress.completedCheckpointIds.includes(id)
          ).length;
          const available = index === 0 || completed > 0;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.title}, ${completed} de ${ids.length} atividades concluídas`}
              onPress={() => router.push({ pathname: "/book/[bookId]", params: { bookId: item.id } })}
              style={({ pressed }) => [styles.book, pressed && styles.pressed]}
            >
              <View style={[styles.badge, available ? styles.badgeAvailable : styles.badgeLocked]}>
                <Text style={styles.badgeText}>{item.shortTitle}</Text>
              </View>
              <View style={styles.bookText}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookMeta}>{item.units.length} unidades · {completed}/{ids.length}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 78
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
    fontWeight: "900",
    marginTop: spacing.xs
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.xs
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl
  },
  book: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeAvailable: {
    backgroundColor: "#d8f2ee"
  },
  badgeLocked: {
    backgroundColor: "#e8edf1"
  },
  badgeText: {
    color: colors.navy,
    fontWeight: "900"
  },
  bookText: {
    flex: 1
  },
  bookTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "800"
  },
  bookMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xs
  },
  chevron: {
    color: colors.tealDark,
    fontSize: 30,
    fontWeight: "500"
  }
});
