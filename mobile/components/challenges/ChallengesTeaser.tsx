import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { lumiMoodAssets } from "../../assets/lumiMoodAssets";
import { useChallenges } from "../../hooks/useChallenges";
import { useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

/** Resumo das missões do dia, com atalho para os Desafios. */
export function ChallengesTeaser() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const challenges = useChallenges();
  const done = challenges.quests.filter((quest) => quest.current >= quest.target).length;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Desafios: ${done} de 3 missões hoje`} onPress={() => router.push("/challenges")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}>
      <Image source={lumiMoodAssets[done === 3 ? "pulo" : "lupa"]} style={styles.lumi} contentFit="contain" />
      <View style={styles.flex}>
        <Text style={styles.eyebrow}>DESAFIOS</Text>
        <Text style={styles.title}>{done} de 3 missões hoje</Text>
        <View style={styles.bars}>{challenges.quests.map((quest) => <View key={quest.id} style={styles.bar}><View style={[styles.fill, { width: `${Math.round((quest.current / quest.target) * 100)}%` }]} /></View>)}</View>
        <Text style={styles.note}>{challenges.streak ? `Desafio de ${challenges.streak.tier.days} dias: ${challenges.streak.done}/${challenges.streak.tier.days}` : "Escolha um desafio de ofensiva"} · {challenges.month.title}</Text>
      </View>
      {challenges.pending ? <View style={styles.badge}><Text style={styles.badgeText}>{challenges.pending}</Text></View> : null}
    </Pressable>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, padding: 12, borderRadius: 20, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.line },
  flex: { flex: 1 },
  lumi: { width: 70, height: 70 },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 16, fontWeight: "900" },
  bars: { flexDirection: "row", gap: 4, marginVertical: 5 },
  bar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: p.ground, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: "#f2b84b" },
  note: { color: p.textMuted, fontSize: 12, fontWeight: "700" },
  badge: { position: "absolute", top: -6, right: -6, minWidth: 24, height: 24, paddingHorizontal: 6, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.heart },
  badgeText: { color: "#ffffff", fontSize: 12, fontWeight: "900" }
});
