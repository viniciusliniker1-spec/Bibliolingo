import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { widgetView } from "../domain/lumiWidget";
import { useReminderContext } from "../hooks/useReminderContext";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { widgetSnapshotFrom } from "../services/lumiWidgetSync";
import type { Palette } from "../theme/tokens";
import { Icon } from "./navigation/Icons";

import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";

/** Mostra o widget da Lumi como ele fica na tela inicial e ajuda a adicioná-lo. */
export function LumiWidgetCard({ onNotice }: { onNotice: (text: string) => void }) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const context = useReminderContext();
  const [installed, setInstalled] = useState(false);
  const android = Platform.OS === "android";
  const view = widgetView(widgetSnapshotFrom(progress, context));

  useEffect(() => {
    if (!android) return;
    const lib = require("react-native-android-widget") as typeof import("react-native-android-widget");
    void lib.getWidgetInfo("LumiStreak").then((list) => setInstalled(list.length > 0)).catch(() => undefined);
  }, [android]);

  const add = async () => {
    const lib = require("react-native-android-widget") as typeof import("react-native-android-widget");
    const ok = await lib.requestPinWidget({ widgetName: "LumiStreak" }).catch(() => false);
    if (!ok) onNotice("Seu launcher não aceitou o atalho. Segure um espaço vazio da tela inicial › Widgets › Bibliolingo.");
  };

  let livePreview = null;
  if (android) {
    const { WidgetPreview } = require("react-native-android-widget") as typeof import("react-native-android-widget");
    const { LumiWidget } = require("../widgets/LumiWidget") as typeof import("../widgets/LumiWidget");
    livePreview = <WidgetPreview width={320} height={150} renderWidget={({ width, height }) => <LumiWidget view={view} width={width} height={height} />} />;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}><Icon name="star" size={16} color={palette.xp} /></View>
        <View style={styles.flex}>
          <Text style={styles.title}>Widget da Lumi</Text>
          <Text style={styles.note}>Na tela inicial, a Lumi mostra sua sequência e a meta do dia, e muda de humor conforme você estuda.</Text>
        </View>
      </View>
      <View style={styles.preview}>{livePreview ?? (
        <View style={styles.fake} accessible accessibilityLabel={`Prévia do widget: ${view.title}. ${view.message}`}>
          <Image source={lumiAnimationAssets.pular} style={styles.fakeLumi} contentFit="contain" />
          <View style={styles.flex}>
            <Text style={styles.fakeStreak}>🔥 {view.streak}</Text>
            <Text style={styles.fakeTitle} numberOfLines={2}>{view.title}</Text>
            <Text style={styles.fakeMessage} numberOfLines={2}>{view.message}</Text>
            <View style={styles.fakeTrack}><View style={[styles.fakeFill, { width: `${Math.round(view.goalRatio * 100)}%` }]} /></View>
          </View>
        </View>
      )}</View>
      <View style={styles.moods}>
        {[["Estudou", "😄"], ["Sequência em risco", "😮"], ["Sumiu", "😴"]].map(([label, face]) => (
          <View key={label} style={styles.mood}><Text style={styles.moodFace}>{face}</Text><Text style={styles.moodLabel}>{label}</Text></View>
        ))}
      </View>
      {android ? (
        installed ? (
          <View style={styles.done}><Icon name="check" size={18} color={palette.success} strokeWidth={3} /><Text style={styles.doneText}>Widget já está na sua tela inicial</Text></View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => void add()} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Adicionar à tela inicial</Text>
          </Pressable>
        )
      ) : <Text style={styles.note}>Disponível no app para Android.</Text>}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 14, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  header: { flexDirection: "row", gap: 12 },
  badge: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.goldSoft },
  title: { color: p.text, fontSize: 17, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  preview: { alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: p.groundDeep },
  fake: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "stretch", padding: 12, borderRadius: 22, backgroundColor: "#0f2238" },
  fakeLumi: { width: 92, height: 86 },
  fakeStreak: { alignSelf: "flex-start", color: "#ff9f43", fontSize: 13, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: "#16304d" },
  fakeTitle: { color: "#ffffff", fontSize: 16, fontWeight: "900", marginTop: 6 },
  fakeMessage: { color: "#a9bdd6", fontSize: 13, marginTop: 2 },
  fakeTrack: { height: 8, borderRadius: 4, backgroundColor: "#24476b", marginTop: 8, overflow: "hidden" },
  fakeFill: { height: 8, borderRadius: 4, backgroundColor: "#21c8a8" },
  moods: { flexDirection: "row", gap: 8 },
  mood: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 8, borderRadius: 14, backgroundColor: p.groundDeep },
  moodFace: { fontSize: 20 },
  moodLabel: { color: p.textMuted, fontSize: 11, fontWeight: "800", textAlign: "center" },
  primary: { minHeight: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 1 },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  done: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 44 },
  doneText: { color: p.success, fontSize: 14, fontWeight: "800" }
});
