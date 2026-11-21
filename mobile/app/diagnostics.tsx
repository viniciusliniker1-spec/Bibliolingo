import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/navigation/Icons";
import { EMPTY_FUNNEL, funnelReport, funnelStages, type FunnelState } from "../domain/funnel";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { loadFunnel } from "../services/funnel";
import type { Palette } from "../theme/tokens";

/** Funil de uso neste aparelho (nada é enviado): onde a jornada avança ou para. */
export default function DiagnosticsScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [state, setState] = useState<FunnelState>(EMPTY_FUNNEL);
  const [copied, setCopied] = useState(false);
  useFocusEffect(useCallback(() => { void loadFunnel().then(setState); }, []));
  const stages = funnelStages(state);

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: "Funil de uso" }} />
      <Text style={styles.note}>Estes marcos ficam só neste aparelho. Eles mostram até onde a jornada chegou, para entender onde as pessoas avançam ou desistem.</Text>
      <View style={styles.card}>
        <Text style={styles.days}>{state.openDays.length} {state.openDays.length === 1 ? "dia" : "dias"} com o app aberto</Text>
        {stages.map((stage) => (
          <View key={stage.id} style={styles.row} accessible accessibilityLabel={`${stage.label}: ${stage.reached ? "feito" : stage.pending ? "ainda cedo para medir" : "não feito"}`}>
            <Text style={[styles.mark, stage.reached && styles.markDone]}>{stage.reached ? "✔" : stage.pending ? "…" : "✘"}</Text>
            <View style={styles.copy}>
              <Text style={styles.label}>{stage.label}</Text>
              {stage.at ? <Text style={styles.note}>{stage.at.slice(0, 10)}</Text> : null}
            </View>
          </View>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => { void Clipboard.setStringAsync(funnelReport(state)).then(() => setCopied(true)); }} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
        <Icon name="copy" size={18} color={palette.accent} />
        <Text style={styles.buttonText}>{copied ? "Relatório copiado!" : "Copiar relatório"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 14 },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  card: { gap: 12, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  days: { color: p.text, fontSize: 16, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  mark: { width: 24, textAlign: "center", color: p.textMuted, fontSize: 18, fontWeight: "900" },
  markDone: { color: p.success },
  copy: { flex: 1 },
  label: { color: p.text, fontSize: 15, fontWeight: "800" },
  button: { minHeight: 52, borderRadius: 16, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.accent, backgroundColor: p.card },
  buttonText: { color: p.accent, fontSize: 16, fontWeight: "900" }
});
