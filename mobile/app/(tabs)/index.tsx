import { useEffect, useState, type ComponentType } from "react";
import { ActivityIndicator, InteractionManager, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { loadMobileCurriculum } from "../../services/mobileCurriculum";
import { colors, radius, spacing } from "../../theme/tokens";

/**
 * The first Home frame intentionally contains no curriculum, adaptive engine or
 * large artwork imports. The complete journey is evaluated after navigation
 * interactions finish, so Android can paint and accept input first.
 */
export default function HomeScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress, hydrated } = useMobileProgress();
  const [Journey, setJourney] = useState<ComponentType | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hydrated || Journey) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        void loadMobileCurriculum()
          .then(() => import("../../components/HomeJourneyScreen"))
          .then((module) => {
            if (!active) return;
            setJourney(() => module.default);
            setLoadError(false);
          })
          .catch(() => {
            if (active) setLoadError(true);
          });
      }, 250);
    });
    return () => {
      active = false;
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [attempt, hydrated, Journey]);

  if (!hydrated) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.teal} size="large" />
        <Text style={styles.muted}>Carregando seu progresso…</Text>
      </Screen>
    );
  }

  if (Journey) return <Journey />;

  const displayName = auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "estudante";
  return (
    <Screen>
      <View style={styles.welcome}>
        <Text style={styles.brand}>BIBLIOLINGO</Text>
        <Text style={styles.title}>Olá, {displayName}.</Text>
        <Text style={styles.muted}>Sua jornada está sendo preparada.</Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusText}>🔥 {progress.streak}</Text>
        <Text style={styles.statusText}>⚡ {progress.xp} XP</Text>
        <Text style={styles.statusText}>♥ {progress.hearts}/{progress.settings.maxHearts}</Text>
      </View>

      <QuickLink title="Trilhas" onPress={() => router.push("/tracks")} />
      <QuickLink title="Bíblia" onPress={() => router.push("/(tabs)/bible")} />
      <QuickLink title="Minhas Missões" onPress={() => router.push("/missions")} />
      <QuickLink title="Meu Aprendizado" onPress={() => router.push("/dashboard")} />

      <View style={styles.loadingCard}>
        {loadError ? (
          <>
            <Text style={styles.cardTitle}>Não foi possível preparar a jornada.</Text>
            <Pressable accessibilityRole="button" style={styles.retry} onPress={() => { setLoadError(false); setAttempt((value) => value + 1); }}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.tealDark} />
            <Text style={styles.muted}>Carregando os detalhes da sua jornada…</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

function QuickLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}>
      <Text style={styles.linkText}>{title}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  welcome: { gap: spacing.xs },
  brand: { color: colors.tealDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  title: { color: colors.navy, fontSize: 28, lineHeight: 34, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  status: { flexDirection: "row", justifyContent: "space-around", padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.navy },
  statusText: { color: colors.surface, fontSize: 13, fontWeight: "800" },
  link: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  linkText: { flex: 1, color: colors.navy, fontSize: 16, fontWeight: "800" },
  chevron: { color: colors.tealDark, fontSize: 27 },
  loadingCard: { minHeight: 86, alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  cardTitle: { color: colors.navy, fontWeight: "800", textAlign: "center" },
  retry: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.teal },
  retryText: { color: colors.navy, fontWeight: "900" }
});
