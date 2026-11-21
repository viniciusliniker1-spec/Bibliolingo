import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { journeyBooks } from "../../src/content/catalog";
import { noahPortrait } from "../assets/noahAssets";
import { weakAreaMessage, weakestBook } from "../domain/weakAreas";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

/** O Professor Noah nota onde o aluno mais errou e sugere revisar ou conversar. */
export function NoahSuggestionCard() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const area = useMemo(() => weakestBook(progress.attempts, journeyBooks), [progress.attempts]);
  if (!area) return null;
  return (
    <View style={styles.card}>
      <Image source={noahPortrait} style={styles.portrait} contentFit="cover" accessibilityElementsHidden />
      <View style={styles.copy}>
        <Text style={styles.title}>Sugestão do Professor Noah</Text>
        <Text style={styles.text}>{weakAreaMessage(area)}</Text>
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/review")} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
            <Text style={styles.primaryText}>Revisar</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/noah")} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.85 }]}>
            <Text style={styles.ghostText}>Falar com o Noah</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 20, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.accent },
  portrait: { width: 52, height: 52, borderRadius: 26 },
  copy: { flex: 1, gap: 4 },
  title: { color: p.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  text: { color: p.text, fontSize: 14, lineHeight: 19, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  primary: { minHeight: 40, paddingHorizontal: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 3, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 14, fontWeight: "900" },
  ghost: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.accent },
  ghostText: { color: p.accent, fontSize: 14, fontWeight: "900" }
});
