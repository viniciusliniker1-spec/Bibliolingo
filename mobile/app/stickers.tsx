import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCard } from "../components/LumiCard";
import { COLLECTIBLES, STICKERS, STICKER_RARITY_COLOR, STICKER_RARITY_LABEL, type Sticker, type StickerRarity } from "../domain/chestRewards";
import { shieldsAvailable } from "../domain/lumiWallet";
import { CARD_STAT_KEYS, CARD_STAT_NAME, cardProfile, lumiCardById } from "../domain/lumiCards";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

const ORDER: StickerRarity[] = ["common", "rare", "epic", "legendary"];
const GAP = 10;

/** Álbum de cartas da Lumi ganhas nos baús. Toque em uma carta para ver os atributos. */
export default function StickersScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { width: screenWidth } = useWindowDimensions();
  const { progress } = useMobileProgress();
  const [selected, setSelected] = useState<Sticker>();
  const owned = progress.lumiWallet?.stickers ?? {};
  const have = useMemo(() => COLLECTIBLES.filter((sticker) => owned[sticker.id]).length, [owned]);
  const legacy = useMemo(() => STICKERS.filter((sticker) => sticker.legacy && owned[sticker.id]), [owned]);
  const shields = shieldsAvailable(progress.lumiWallet);
  const contentWidth = Math.min(screenWidth, 560) - 32;
  const cardWidth = Math.floor((contentWidth - GAP * 2) / 3);
  const bigWidth = Math.min(300, Math.floor(Math.min(screenWidth, 560) - 72));
  const profile = selected ? (lumiCardById(selected.id) ? cardProfile(lumiCardById(selected.id)!) : undefined) : undefined;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Stack.Screen options={{ title: "Álbum de cartas" }} />
        <View style={styles.summary}>
          <Text style={styles.big}>{have} de {COLLECTIBLES.length}</Text>
          <Text style={styles.note}>cartas da Lumi no álbum. Abra o baú do dia, depois de completar as 3 missões, para ganhar novas. Quanto mais rara, maior a nota!</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.round((have / COLLECTIBLES.length) * 100)}%` }]} /></View>
          {shields > 0 ? <Text style={styles.shield}>🛡️ {shields} {shields === 1 ? "escudo de ofensiva" : "escudos de ofensiva"} guardado{shields === 1 ? "" : "s"}</Text> : null}
        </View>

        {ORDER.map((rarity) => {
          const items = COLLECTIBLES.filter((sticker) => sticker.rarity === rarity);
          const color = STICKER_RARITY_COLOR[rarity];
          const got = items.filter((sticker) => owned[sticker.id]).length;
          return (
            <View key={rarity} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, { color }]}>{STICKER_RARITY_LABEL[rarity].toUpperCase()}</Text>
                <Text style={styles.sectionCount}>{got}/{items.length}</Text>
              </View>
              <View style={styles.grid}>
                {items.map((sticker) => {
                  const count = owned[sticker.id] ?? 0;
                  return (
                    <Pressable
                      key={sticker.id}
                      accessibilityRole="button"
                      accessibilityLabel={count ? `Ver a carta ${sticker.name}` : `Carta ${STICKER_RARITY_LABEL[rarity].toLowerCase()} ainda não encontrada`}
                      disabled={!count}
                      onPress={() => setSelected(sticker)}
                      style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
                    >
                      <LumiCard sticker={sticker} width={cardWidth} owned={Boolean(count)} count={count} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {legacy.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>FIGURINHAS CLÁSSICAS</Text>
              <Text style={styles.sectionCount}>{legacy.length}</Text>
            </View>
            <Text style={styles.note}>As figurinhas de antes continuam com você.</Text>
            <View style={styles.grid}>
              {legacy.map((sticker) => (
                <View key={sticker.id} style={[styles.tile, { borderColor: STICKER_RARITY_COLOR[sticker.rarity] }]} accessible accessibilityLabel={`${sticker.name}, ${STICKER_RARITY_LABEL[sticker.rarity]}`}>
                  <Text style={styles.emoji} allowFontScaling={false}>{sticker.emoji}</Text>
                  <Text style={styles.tileName} numberOfLines={2}>{sticker.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {selected ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar carta" onPress={() => setSelected(undefined)} style={styles.overlay}>
          <View style={styles.viewer}>
            <LumiCard sticker={selected} width={bigWidth} count={owned[selected.id] ?? 0} shine />
            {profile ? (
              <Text style={styles.viewerNote}>
                Destaque: {CARD_STAT_NAME[lumiCardById(selected.id)!.focus[0]]} e {CARD_STAT_NAME[lumiCardById(selected.id)!.focus[1]]}
                {owned[selected.id] > 1 ? ` · ${owned[selected.id]} cópias` : ""}
              </Text>
            ) : null}
            <Text style={styles.viewerClose}>Toque para fechar</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
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
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  sectionCount: { color: p.textMuted, fontSize: 12, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  tile: { width: "31%", minHeight: 100, padding: 10, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: p.card },
  emoji: { fontSize: 32, lineHeight: 40 },
  tileName: { color: p.text, fontSize: 12, fontWeight: "800", textAlign: "center" },
  overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(4, 10, 20, 0.88)" },
  viewer: { alignItems: "center", gap: 14 },
  viewerNote: { color: "#d4e1ee", fontSize: 14, fontWeight: "800", textAlign: "center" },
  viewerClose: { color: "#8aa0b8", fontSize: 12, fontWeight: "700" }
});
