import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import { MonthlyCard, QuestsCard, StreakChallengeCard } from "../components/challenges/ChallengeCards";
import { Enter } from "../components/motion";
import { useChallenges } from "../hooks/useChallenges";
import { useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

/** Desafios: ofensiva, missões diárias e desafio do mês. */
export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);
  const challenges = useChallenges();
  const doneQuests = challenges.quests.filter((quest) => quest.current >= quest.target).length;
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: "Desafios" }} />
      <View style={styles.hero}>
        <Image source={lumiMoodAssets[doneQuests === 3 ? "pulo" : doneQuests ? "checklist" : "lupa"]} style={styles.lumi} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.title}>{doneQuests === 3 ? "Dia completo!" : "Bora cumprir as missões?"}</Text>
          <Text style={styles.note}>{doneQuests} de 3 missões hoje. Cada missão vale moedas Lumi para a loja.</Text>
        </View>
      </View>
      <Enter index={1}><QuestsCard challenges={challenges} /></Enter>
      <Enter index={2}><StreakChallengeCard challenges={challenges} /></Enter>
      <Enter index={3}><MonthlyCard challenges={challenges} /></Enter>
      {challenges.state.history.length ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>DESAFIOS CONCLUÍDOS</Text>
          {challenges.state.history.slice().reverse().map((item) => (
            <Text key={item.startedOn + item.days} style={styles.history}>🔥 {item.days} dias · concluído em {new Date(item.completedOn + "T12:00:00").toLocaleDateString("pt-BR")}</Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 14 },
  flex: { flex: 1 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12 },
  lumi: { width: 96, height: 96 },
  title: { color: p.text, fontSize: 21, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 19 },
  card: { gap: 6, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  history: { color: p.text, fontSize: 14, fontWeight: "700" }
});
