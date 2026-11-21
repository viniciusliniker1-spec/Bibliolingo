import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCard } from "../components/LumiCard";
import { COLLECTIBLES, STICKERS, STICKER_RARITY_COLOR, STICKER_RARITY_LABEL, type Sticker, type StickerRarity } from "../domain/chestRewards";
import { ALBUM_ACHIEVEMENT_TITLE, isAlbumComplete } from "../domain/albumAchievement";
import { shieldsAvailable } from "../domain/lumiWallet";
import { CARD_STAT_KEYS, CARD_STAT_NAME, cardProfile, lumiCardById } from "../domain/lumiCards";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

const ORDER: StickerRarity[] = ["common", "rare", "epic", "legendary"];
const GAP = 10;
type Tab = "mine" | "album";
type Filter = "all" | StickerRarity;
const FILTERS: { id: Filter; label: string }[] = [{ id: "all", label: "Todas" }, { id: "legendary", label: "Lendárias" }, { id: "epic", label: "Épicas" }, { id: "rare", label: "Raras" }, { id: "common", label: "Comuns" }];

/** Álbum de cartas da Lumi ganhas nos baús. Toque em uma carta para ver os atributos. */
export default function StickersScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { width: screenWidth } = useWindowDimensions();
  const { progress } = useMobileProgress();
  const router = useRouter();
  const [selected, setSelected] = useState<Sticker>();
  const [tab, setTab] = useState<Tab>();
  const [filter, setFilter] = useState<Filter>("all");
  const owned = progress.lumiWallet?.stickers ?? {};
  const have = useMemo(() => COLLECTIBLES.filter((sticker) => owned[sticker.id]).length, [owned]);
  const legacy = useMemo(() => STICKERS.filter((sticker) => sticker.legacy && owned[sticker.id]), [owned]);
  const shields = shieldsAvailable(progress.lumiWallet);
  const contentWidth = Math.min(screenWidth, 560) - 32;
  const complete = isAlbumComplete(owned);
  // Abre em "Minhas cartas" quando já há alguma; sem nenhuma, mostra o álbum para a pessoa ver o que pode ganhar.
  const activeTab: Tab = tab ?? (have > 0 ? "mine" : "album");
  const mine = useMemo(() => {
    const rank: Record<StickerRarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return COLLECTIBLES.map((sticker, index) => ({ sticker, index })).filter(({ sticker }) => owned[sticker.id] && (filter === "all" || sticker.rarity === filter))
      .sort((a, b) => rank[a.sticker.rarity] - rank[b.sticker.rarity] || a.index - b.index).map(({ sticker }) => sticker);
  }, [owned, filter]);
  const mineCount = useMemo(() => Object.fromEntries(ORDER.map((rarity) => [rarity, COLLECTIBLES.filter((sticker) => sticker.rarity === rarity && owned[sticker.id]).length])) as Record<StickerRarity, number>, [owned]);
  useEffect(() => { setFilter("all"); }, [activeTab]);
  const bigGrid = Math.floor((contentWidth - GAP) / 2);
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
          <View style={[styles.goal, complete && styles.goalDone]}>
            <Text style={styles.goalIcon} allowFontScaling={false}>{complete ? "🏆" : "🎯"}</Text>
            <Text style={styles.goalText}>{complete ? `Conquista “${ALBUM_ACHIEVEMENT_TITLE}” desbloqueada!` : `Complete o álbum para ganhar a conquista “${ALBUM_ACHIEVEMENT_TITLE}”.`}</Text>
          </View>
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {([["mine", `Minhas cartas (${have})`], ["album", `Álbum (${COLLECTIBLES.length})`]] as const).map(([id, label]) => (
            <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: activeTab === id }} onPress={() => setTab(id)} style={[styles.tab, activeTab === id && styles.tabOn]}>
              <Text style={[styles.tabText, activeTab === id && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "mine" ? (
          have === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon} allowFontScaling={false}>🃏</Text>
              <Text style={styles.emptyTitle}>Você ainda não tem cartas</Text>
              <Text style={styles.note}>Complete as 3 missões do dia e abra o baú: ele pode trazer uma carta da Lumi.</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push("/challenges")} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Ver desafios de hoje</Text></Pressable>
            </View>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {FILTERS.map(({ id, label }) => {
                  const n = id === "all" ? have : mineCount[id];
                  return (
                    <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: filter === id }} onPress={() => setFilter(id)} style={[styles.chip, filter === id && styles.chipOn, n === 0 && id !== "all" && { opacity: 0.45 }]}>
                      <Text style={[styles.chipText, filter === id && styles.chipTextOn]}>{label} {n}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {mine.length ? (
                <View style={styles.grid}>
                  {mine.map((sticker) => (
                    <Pressable key={sticker.id} accessibilityRole="button" accessibilityLabel={`Ver a carta ${sticker.name}`} onPress={() => setSelected(sticker)} style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}>
                      <LumiCard sticker={sticker} width={bigGrid} count={owned[sticker.id] ?? 0} />
                    </Pressable>
                  ))}
                </View>
              ) : <Text style={styles.note}>Nenhuma carta dessa raridade ainda.</Text>}
            </>
          )
        ) : null}

        {activeTab === "album" ? ORDER.map((rarity) => {
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
        }) : null}

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
  goal: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: p.activeTabBg, borderWidth: 1, borderColor: p.line },
  goalDone: { borderColor: p.xp, backgroundColor: p.goldSoft },
  goalIcon: { fontSize: 22 },
  goalText: { flex: 1, color: p.text, fontSize: 13, fontWeight: "800", lineHeight: 18 },
  tabs: { flexDirection: "row", gap: 6, padding: 4, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  tab: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: p.cta, borderBottomWidth: 3, borderBottomColor: p.ctaShadow },
  tabText: { color: p.textMuted, fontSize: 14, fontWeight: "900" },
  tabTextOn: { color: p.ctaText },
  chips: { gap: 8, paddingVertical: 2 },
  chip: { minHeight: 38, paddingHorizontal: 14, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  chipOn: { borderColor: p.accent, backgroundColor: p.activeTabBg },
  chipText: { color: p.textMuted, fontSize: 13, fontWeight: "800" },
  chipTextOn: { color: p.accent },
  empty: { alignItems: "center", gap: 8, padding: 24, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { color: p.text, fontSize: 18, fontWeight: "900" },
  emptyButton: { marginTop: 6, minHeight: 46, paddingHorizontal: 20, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  emptyButtonText: { color: p.ctaText, fontSize: 15, fontWeight: "900" },
  overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(4, 10, 20, 0.88)" },
  viewer: { alignItems: "center", gap: 14 },
  viewerNote: { color: "#d4e1ee", fontSize: 14, fontWeight: "800", textAlign: "center" },
  viewerClose: { color: "#8aa0b8", fontSize: 12, fontWeight: "700" }
});
