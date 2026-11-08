import { useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { achievementProgress, isApprovedAchievementMet, visibleApprovedAchievements } from "../../../src/domain/achievements";
import { mobileAchievementAssets } from "../../assets/achievementAssets";
import { Icon } from "../../components/navigation/Icons";
import { ChallengesTeaser } from "../../components/challenges/ChallengesTeaser";
import { SocialTeaser } from "../../components/social/SocialTeaser";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import type { Palette } from "../../theme/tokens";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";

type AchievementItem = ReturnType<typeof visibleApprovedAchievements>[number];

export default function AchievementsScreen() {
  const styles = useThemedStyles(makeStyles);
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const { progress } = useMobileProgress();
  const [openId, setOpenId] = useState<string>();
  const achievements = useMemo(() => visibleApprovedAchievements().map((item) => ({
    item,
    unlocked: isApprovedAchievementMet(progress, item),
    value: achievementProgress(progress, item)
  })).sort((a, b) => Number(b.unlocked) - Number(a.unlocked)), [progress]);
  const earned = achievements.filter((entry) => entry.unlocked).length;
  const opened = achievements.find((entry) => entry.item.id === openId);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <FlatList
        data={achievements}
        keyExtractor={(entry) => entry.item.id}
        numColumns={3}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.title}>Conquistas</Text>
            <Text style={styles.subtitle}>{earned} de {achievements.length} conquistadas</Text>
            <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: achievements.length, now: earned }}>
              <View style={[styles.fill, { width: `${achievements.length ? Math.round((earned / achievements.length) * 100) : 0}%` }]} />
            </View>
            <SocialTeaser />
            <ChallengesTeaser />
          </View>
        )}
        renderItem={({ item: entry }) => (
          <Medal item={entry.item} unlocked={entry.unlocked} current={entry.value.current} target={entry.value.target} supported={entry.value.supported} onPress={() => setOpenId(entry.item.id)} />
        )}
      />

      <Modal visible={Boolean(opened)} transparent animationType="fade" onRequestClose={() => setOpenId(undefined)} statusBarTranslucent>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={styles.backdrop} onPress={() => setOpenId(undefined)}>
          {opened ? (
            <View style={styles.detail} accessibilityViewIsModal>
              <MedalArt id={opened.item.id} unlocked={opened.unlocked} size={140} />
              <Text style={styles.detailTitle}>{opened.item.title}</Text>
              <Text style={styles.detailText}>{opened.item.description}</Text>
              {opened.unlocked ? (
                <Text style={styles.detailEarned}>Conquistada!</Text>
              ) : opened.value.supported ? (
                <View style={styles.detailProgress}>
                  <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(Math.min(1, opened.value.current / Math.max(1, opened.value.target)) * 100)}%` }]} /></View>
                  <Text style={styles.detailMeta}>{Math.min(opened.value.current, opened.value.target)} de {opened.value.target}</Text>
                </View>
              ) : (
                <Text style={styles.detailMeta}>Continue estudando para revelar esta conquista.</Text>
              )}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

function MedalArt({ id, unlocked, size }: { id: AchievementItem["id"]; unlocked: boolean; size: number }) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const artwork = mobileAchievementAssets[id];
  return (
    <View style={[styles.medal, { width: size, height: size, borderRadius: size / 2 }, unlocked && styles.medalEarned]}>
      {artwork ? (
        // Conquista bloqueada: só a silhueta da medalha.
        <Image source={artwork} style={[{ width: size * 0.86, height: size * 0.86 }, !unlocked && styles.silhouette]} resizeMode="contain" accessibilityIgnoresInvertColors />
      ) : (
        <Icon name="trophy" size={size * 0.45} color={unlocked ? trail.xp : trail.silhouette} />
      )}
      {!unlocked ? <View style={styles.lockBadge}><Icon name="lock" size={12} color={trail.textMuted} strokeWidth={2.8} /></View> : null}
    </View>
  );
}

function Medal({ item, unlocked, current, target, supported, onPress }: { item: AchievementItem; unlocked: boolean; current: number; target: number; supported: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const ratio = supported && target ? Math.min(1, current / target) : 0;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${unlocked ? "Conquistada" : supported ? `Bloqueada, ${Math.min(current, target)} de ${target}` : "Bloqueada"}`} onPress={onPress} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
      <MedalArt id={item.id} unlocked={unlocked} size={86} />
      <Text style={[styles.cellTitle, !unlocked && styles.cellTitleLocked]} numberOfLines={2}>{item.title}</Text>
      {!unlocked && supported ? <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${Math.round(ratio * 100)}%` }]} /></View> : null}
    </Pressable>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: trail.ground },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  columns: { gap: 10 },
  header: { gap: 6, marginBottom: 18 },
  title: { color: trail.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: trail.textMuted, fontSize: 14, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: trail.card, overflow: "hidden", alignSelf: "stretch" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: trail.xp },
  cell: { flex: 1, maxWidth: "33.3%", alignItems: "center", gap: 6, paddingVertical: 10, marginBottom: 6 },
  pressed: { opacity: 0.75 },
  medal: { alignItems: "center", justifyContent: "center", backgroundColor: trail.medalBg, borderWidth: 2, borderColor: trail.line, overflow: "visible" },
  medalEarned: { backgroundColor: trail.goldSoft, borderColor: trail.xp },
  silhouette: { tintColor: trail.silhouette },
  lockBadge: { position: "absolute", right: 2, bottom: 2, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  cellTitle: { color: trail.text, fontSize: 12, fontWeight: "800", textAlign: "center" },
  cellTitleLocked: { color: trail.textMuted },
  miniTrack: { width: 64, height: 4, borderRadius: 2, backgroundColor: trail.card, overflow: "hidden" },
  miniFill: { height: "100%", backgroundColor: trail.accent },
  backdrop: { flex: 1, backgroundColor: "rgba(4,12,22,0.72)", alignItems: "center", justifyContent: "center", padding: 24 },
  detail: { alignSelf: "stretch", alignItems: "center", gap: 10, padding: 24, borderRadius: 24, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  detailTitle: { color: trail.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  detailText: { color: trail.textMuted, fontSize: 15, lineHeight: 21, textAlign: "center" },
  detailEarned: { color: trail.xp, fontSize: 15, fontWeight: "900" },
  detailProgress: { alignSelf: "stretch", gap: 6, alignItems: "center" },
  detailMeta: { color: trail.textMuted, fontSize: 13, fontWeight: "700", textAlign: "center" }
});
