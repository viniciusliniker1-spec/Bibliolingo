import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StreakChallengeCard } from "../components/challenges/ChallengeCards";
import { LumiMoodLadder } from "../components/LumiMoodLadder";
import { Icon } from "../components/navigation/Icons";
import { StreakCalendar } from "../components/StreakCalendar";
import { lumiStreakMood } from "../domain/lumiMood";
import { Enter } from "../components/motion";
import { useChallenges } from "../hooks/useChallenges";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

/** Ofensiva: calendário de constância, humor da Lumi e desafio de dias seguidos. */
export default function StreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const challenges = useChallenges();
  const mood = lumiStreakMood({ streak: progress.streak, lastStudyDate: progress.lastStudyDate });
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: "Ofensiva" }} />
      <Enter><StreakCalendar /></Enter>
      <Enter index={2}><StreakChallengeCard challenges={challenges} /></Enter>
      <View style={styles.card}>
        <Text style={styles.title}>O humor da Lumi</Text>
        <Text style={styles.note}>Ela fica mais feliz a cada dia seguido e morre de saudade quando você some. Ela aparece assim no widget e nas notificações.</Text>
        <LumiMoodLadder current={mood.mood} />
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push("/challenges")} style={({ pressed }) => [styles.link, pressed && { opacity: 0.85 }]}>
        <Icon name="trophy" size={20} color={palette.accent} />
        <View style={styles.flex}>
          <Text style={styles.linkTitle}>Missões e desafio do mês</Text>
          <Text style={styles.note}>{challenges.pending ? `${challenges.pending} recompensa${challenges.pending > 1 ? "s" : ""} para receber` : "Ganhe moedas Lumi todos os dias"}</Text>
        </View>
        <Icon name="chevronRight" size={18} color={palette.textMuted} />
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 14 },
  flex: { flex: 1 },
  card: { gap: 8, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  title: { color: p.text, fontSize: 18, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 19 },
  link: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  linkTitle: { color: p.text, fontSize: 16, fontWeight: "900" }
});
