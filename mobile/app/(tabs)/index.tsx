import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

/**
 * Home is intentionally lightweight. Curriculum and adaptive engines are
 * loaded only after the learner opens their respective screens, keeping the
 * JavaScript thread free for touch and navigation.
 */
export default function HomeScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress, hydrated, syncStatus } = useMobileProgress();

  if (!hydrated) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.teal} size="large" />
        <Text style={styles.muted}>Carregando seu progresso…</Text>
      </Screen>
    );
  }

  const displayName = auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "estudante";
  return (
    <Screen>
      <View style={styles.welcome}>
        <Text style={styles.brand}>BIBLIOLINGO</Text>
        <Text style={styles.title}>Olá, {displayName}.</Text>
        <Text style={styles.muted}>Escolha seu próximo passo. Cada área carrega somente quando você a abre.</Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusText}>🔥 {progress.streak}</Text>
        <Text style={styles.statusText}>⚡ {progress.xp} XP</Text>
        <Text style={styles.statusText}>♥ {progress.hearts}/{progress.settings.maxHearts}</Text>
      </View>

      <QuickLink title="Continuar a jornada" note="Trilhas, livros e unidades" onPress={() => router.push("/tracks")} />
      <QuickLink title="Bíblia" note="Leitura, destaques e anotações" onPress={() => router.push("/(tabs)/bible")} />
      <QuickLink title="Professor Noah" note="Tutor bíblico contextual" onPress={() => router.push("/noah")} featured />
      <QuickLink title="Estudar" note="Revisão, Grego, Teologia e Formação Pastoral" onPress={() => router.push("/(tabs)/study")} />
      <QuickLink title="Minhas Missões" note="Desafios pedagógicos opcionais" onPress={() => router.push("/missions")} />
      <QuickLink title="Meu Aprendizado" note="Progresso e recomendações" onPress={() => router.push("/dashboard")} />
      <QuickLink title="Planos de Estudo" note="Metas, leituras e calendário" onPress={() => router.push("/plans")} />

      <Text style={styles.sync} accessibilityLiveRegion="polite">
        {syncStatus === "syncing" ? "Sincronizando progresso…" : syncStatus === "offline" ? "Progresso local salvo; sincronização pendente." : "Progresso pronto."}
      </Text>
    </Screen>
  );
}

function QuickLink({ title, note, onPress, featured = false }: { title: string; note: string; onPress: () => void; featured?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.link, featured && styles.featured, pressed && styles.pressed]}
    >
      <View style={styles.flex}>
        <Text style={styles.linkText}>{title}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
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
  link: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  featured: { borderColor: colors.teal, backgroundColor: "#e8f7f4" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  flex: { flex: 1, gap: 3 },
  linkText: { color: colors.navy, fontSize: 16, fontWeight: "900" },
  note: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  chevron: { color: colors.tealDark, fontSize: 27 },
  sync: { color: colors.muted, fontSize: 12, textAlign: "center", paddingBottom: 76 }
});
