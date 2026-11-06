import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import type { LumiMoodId } from "../domain/lumiMood";
import { useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

const STEPS: { mood: LumiMoodId; label: string }[] = [
  { mood: "chorando", label: "5+ dias longe" },
  { mood: "brava", label: "3 dias longe" },
  { mood: "chuva", label: "Ofensiva apagou" },
  { mood: "pedindo", label: "Falta hoje" },
  { mood: "checklist", label: "Estudou hoje" },
  { mood: "progresso", label: "3 dias" },
  { mood: "calendario", label: "7 dias" },
  { mood: "trofeu", label: "14 dias" },
  { mood: "coroa", label: "30 dias" },
  { mood: "amor", label: "100 dias" }
];

/** Escada de humor da Lumi: da saudade à coroa, destacando o humor atual. */
export function LumiMoodLadder({ current }: { current?: LumiMoodId }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {STEPS.map((step) => {
        const active = step.mood === current;
        return (
          <View key={step.mood} style={[styles.step, active && styles.stepActive]} accessible accessibilityLabel={`${step.label}${active ? ", humor atual" : ""}`}>
            <Image source={lumiMoodAssets[step.mood]} style={styles.image} contentFit="contain" />
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>{step.label}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  step: { width: 76, alignItems: "center", gap: 2, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: "transparent" },
  stepActive: { borderColor: p.accent, backgroundColor: p.activeTabBg },
  image: { width: 60, height: 60 },
  label: { color: p.textMuted, fontSize: 10, fontWeight: "800", textAlign: "center" },
  labelActive: { color: p.text }
});
