import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../components/Screen";
import { SceneBanner } from "../../components/SceneBanner";
import { mobileFeedbackAssets } from "../../assets/feedbackAssets";
import { mobileSceneAssets } from "../../assets/sceneAssets";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress, hydrated, syncStatus } = useMobileProgress();

  if (!hydrated) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Image source={mobileFeedbackAssets.loading} style={styles.loadingLumi} resizeMode="contain" accessibilityLabel="Lumi preparando sua jornada" />
        <ActivityIndicator color={colors.teal} size="small" />
        <Text style={styles.muted}>Preparando sua jornada…</Text>
      </Screen>
    );
  }

  const displayName = auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "estudante";
  const returning = progress.xp > 0 || progress.completedLessonIds.length > 0;
  const offline = syncStatus === "offline";
  const lumi = offline ? mobileFeedbackAssets.connectionError : returning ? mobileFeedbackAssets.returning : mobileFeedbackAssets.welcome;
  const companionText = offline
    ? "Seu progresso está salvo neste aparelho. A sincronização será retomada quando a conexão voltar."
    : returning ? "Que bom ter você de volta. Continue exatamente de onde parou." : "Vamos começar sua jornada pela Bíblia.";

  return (
    <Screen>
      <View style={styles.welcome}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.brand}>BIBLIOLINGO</Text>
          <Text style={styles.title}>Olá, {displayName}.</Text>
          <Text style={styles.muted}>Sua jornada bíblica está pronta para continuar.</Text>
        </View>
        <Image source={lumi} style={styles.lumi} resizeMode="contain" accessibilityLabel={offline ? "Lumi atenta à conexão" : "Lumi acolhendo você"} />
      </View>

      <SceneBanner source={mobileSceneAssets.journey} eyebrow="SUA JORNADA" title="Caminhe pela história bíblica" accessibilityLabel="Caminho iluminado representando a jornada de aprendizagem" />

      <View style={styles.status}>
        <Text style={styles.statusText}>🔥 {progress.streak}</Text>
        <Text style={styles.statusText}>⚡ {progress.xp} XP</Text>
        <Text style={styles.statusText}>♥ {progress.hearts}/{progress.settings.maxHearts}</Text>
      </View>

      <View style={styles.companion}><Text style={styles.companionText}>{companionText}</Text></View>
      <QuickLink title="Continuar a jornada" note="Trilhas, livros e unidades" onPress={() => router.push("/tracks")} featured />
      <View style={styles.grid}>
        <QuickLink title="Bíblia" note="Leitura e anotações" onPress={() => router.push("/(tabs)/bible")} compact />
        <QuickLink title="Estudar" note="Rotas e revisões" onPress={() => router.push("/(tabs)/study")} compact />
      </View>
      <QuickLink title="Professor Noah" note="Tutor bíblico contextual" onPress={() => router.push("/noah")} />

      <Text style={styles.sync} accessibilityLiveRegion="polite">
        {syncStatus === "syncing" ? "Sincronizando progresso…" : offline ? "Modo offline" : "Progresso pronto."}
      </Text>
    </Screen>
  );
}

function QuickLink({ title, note, onPress, featured = false, compact = false }: { title: string; note: string; onPress: () => void; featured?: boolean; compact?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.link, compact && styles.compactLink, featured && styles.featured, pressed && styles.pressed]}>
      <View style={styles.flex}><Text style={styles.linkText}>{title}</Text><Text style={styles.note}>{note}</Text></View>
      {!compact ? <Text style={styles.chevron}>›</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadingLumi: { width: 118, height: 108 },
  welcome: { minHeight: 118, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  welcomeCopy: { flex: 1, gap: spacing.xs },
  lumi: { width: 112, height: 106 },
  brand: { color: colors.tealDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  title: { color: colors.navy, fontSize: 28, lineHeight: 34, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  status: { flexDirection: "row", justifyContent: "space-around", padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.navy },
  statusText: { color: colors.surface, fontSize: 13, fontWeight: "800" },
  companion: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.gold },
  companionText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  grid: { flexDirection: "row", gap: spacing.sm },
  link: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  compactLink: { flex: 1, minHeight: 78, alignItems: "flex-start", paddingVertical: spacing.md },
  featured: { minHeight: 78, borderColor: colors.teal, backgroundColor: "#e8f7f4" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  flex: { flex: 1, gap: 3 },
  linkText: { color: colors.navy, fontSize: 16, fontWeight: "900" },
  note: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  chevron: { color: colors.tealDark, fontSize: 27 },
  sync: { color: colors.muted, fontSize: 12, textAlign: "center", paddingBottom: 76 }
});
