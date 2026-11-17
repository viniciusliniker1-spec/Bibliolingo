import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { STICKERS, STICKER_RARITY_COLOR, STICKER_RARITY_LABEL, type StickerRarity } from "../domain/chestRewards";
import { shieldsAvailable } from "../domain/lumiWallet";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

const ORDER: StickerRarity[] = ["common", "rare", "epic", "legendary"];

/** Álbum de figurinhas bíblicas ganhas nos baús. */
export default function StickersScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const owned = progress.lumiWallet?.stickers ?? {};
  const have = useMemo(() => STICKERS.filter((sticker) => owned[sticker.id]).length, [owned]);
  const shields = shieldsAvailable(progress.lumiWallet);

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: "Álbum de figurinhas" }} />
      <View style={styles.summary}>
        <Text style={styles.big}>{have} de {STICKERS.length}</Text>
        <Text style={styles.note}>figurinhas no álbum. Abra o baú do dia, depois de completar as 3 missões, para ganhar novas.</Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.round((have / STICKERS.length) * 100)}%` }]} /></View>
        {shields > 0 ? <Text style={styles.shield}>🛡️ {shields} {shields === 1 ? "escudo de ofensiva" : "escudos de ofensiva"} guardado{shields === 1 ? "" : "s"}</Text> : null}
      </View>

      {ORDER.map((rarity) => {
        const items = STICKERS.filter((sticker) => sticker.rarity === rarity);
        const color = STICKER_RARITY_COLOR[rarity];
        return (
          <View key={rarity} style={styles.section}>
            <Text style={[styles.sectionTitle, { color }]}>{STICKER_RARITY_LABEL[rarity].toUpperCase()}</Text>
            <View style={styles.grid}>
              {items.map((sticker) => {
                const count = owned[sticker.id] ?? 0;
                return (
                  <View key={sticker.id} style={[styles.tile, { borderColor: count ? color : palette.line }, !count && styles.tileLocked]} accessible accessibilityLabel={count ? `${sticker.name}, ${STICKER_RARITY_LABEL[rarity]}${count > 1 ? `, ${count} cópias` : ""}` : `Figurinha ${STICKER_RARITY_LABEL[rarity].toLowerCase()} ainda não encontrada`}>
                    <Text style={[styles.emoji, !count && styles.emojiLocked]} allowFontScaling={false}>{count ? sticker.emoji : "❔"}</Text>
                    <Text style={styles.name} numberOfLines={2}>{count ? sticker.name : "???"}</Text>
                    {count > 1 ? <Text style={[styles.count, { backgroundColor: color }]}>x{count}</Text> : null}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 18 },
  summary: { gap: 6, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  big: { color: p.xp, fontSize: 32, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  track: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: p.line, marginTop: 4 },
  fill: { height: 8, borderRadius: 4, backgroundColor: p.xp },
  shield: { color: p.text, fontSize: 14, fontWeight: "800", marginTop: 6 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "31%", minHeight: 112, padding: 10, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: p.card },
  tileLocked: { opacity: 0.55, borderStyle: "dashed" },
  emoji: { fontSize: 36, lineHeight: 44 },
  emojiLocked: { opacity: 0.6 },
  name: { color: p.text, fontSize: 12, fontWeight: "800", textAlign: "center" },
  count: { position: "absolute", top: 6, right: 6, color: "#10243e", fontSize: 11, fontWeight: "900", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, overflow: "hidden" }
});
