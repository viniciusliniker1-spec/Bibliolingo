import { memo, useMemo, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MobileActivityKind } from "../domain/activityCatalog";
import { mobileActivityRoute } from "../domain/activityCatalog";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { Icon, type IconName } from "./navigation/Icons";

export interface HubActivity { id: string; title: string; subtitle?: string; checkpoint?: boolean }
export interface HubGroup { id: string; title: string; subtitle?: string; activities: HubActivity[] }

/** Tela de percurso (Aprofundar, Formação): cabeçalho, progresso geral e unidades. */
export function HubScreen({ eyebrow, title, subtitle, icon, tint, children, progress }: { eyebrow: string; title: string; subtitle: string; icon: IconName; tint: string; children: ReactNode; progress?: { done: number; total: number } }) {
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);
  const percent = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <View style={[styles.hero, { borderColor: tint + "66" }]}>
        <View style={[styles.heroIcon, { backgroundColor: tint + "26" }]}><Icon name={icon} size={26} color={tint} /></View>
        <Text style={[styles.eyebrow, { color: tint }]}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {progress ? (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: tint }]} /></View>
            <Text style={styles.progressText}>{progress.done}/{progress.total}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function hubProgress(groups: HubGroup[], completed: Set<string>) {
  const all = groups.flatMap((group) => group.activities);
  return { done: all.filter((item) => completed.has(item.id)).length, total: all.length };
}

export const ActivityHub = memo(function ActivityHub({ kind, groups, orderedIds, tint }: { kind: MobileActivityKind; groups: HubGroup[]; orderedIds: string[]; tint?: string }) {
  const router = useRouter();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const accent = tint ?? palette.accent;
  const { progress } = useMobileProgress();
  const completed = useMemo(() => new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]), [progress.completedLessonIds, progress.completedCheckpointIds]);
  const order = useMemo(() => new Map(orderedIds.map((id, index) => [id, index])), [orderedIds]);
  const nextId = orderedIds.find((id) => !completed.has(id));
  return (
    <View style={styles.groups}>
      {groups.map((group, index) => {
        const done = group.activities.reduce((count, item) => count + (completed.has(item.id) ? 1 : 0), 0);
        const complete = done === group.activities.length;
        return (
          <View key={group.id} style={styles.group}>
            <View style={styles.header}>
              <View style={[styles.number, { backgroundColor: complete ? palette.xp : accent + "26" }]}>
                {complete ? <Icon name="check" size={16} color="#3a2a08" strokeWidth={3.2} /> : <Text style={[styles.numberText, { color: accent }]}>{index + 1}</Text>}
              </View>
              <View style={styles.flex}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.subtitle ? <Text style={styles.groupSubtitle} numberOfLines={2}>{group.subtitle}</Text> : null}
              </View>
              <Text style={[styles.count, { color: accent }]}>{done}/{group.activities.length}</Text>
            </View>
            {group.activities.map((item) => {
              const itemIndex = order.get(item.id) ?? -1;
              const unlocked = itemIndex <= 0 || completed.has(orderedIds[itemIndex - 1]);
              const isDone = completed.has(item.id);
              const isNext = item.id === nextId;
              return (
                <Pressable key={item.id} disabled={!unlocked} accessibilityRole="button" accessibilityState={{ disabled: !unlocked }}
                  accessibilityLabel={`${item.title}. ${isDone ? "Concluída" : unlocked ? "Disponível" : "Bloqueada"}`}
                  onPress={() => router.push(mobileActivityRoute(kind, item.id))}
                  style={({ pressed }) => [styles.item, isNext && { borderColor: accent, backgroundColor: accent + "14" }, !unlocked && styles.locked, pressed && unlocked && styles.pressed]}>
                  <View style={[styles.node, { backgroundColor: isDone ? palette.xp : unlocked ? accent : palette.line }]}>
                    <Icon name={isDone ? "check" : !unlocked ? "lock" : item.checkpoint ? "shield" : "book"} size={18} color={isDone ? "#3a2a08" : unlocked ? "#ffffff" : palette.textMuted} strokeWidth={isDone ? 3.2 : 2.4} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle ?? (item.checkpoint ? "Avaliação" : "Lição")}</Text>
                  </View>
                  {isNext ? <View style={[styles.startPill, { backgroundColor: accent }]}><Text style={styles.startText}>Começar</Text></View>
                    : isDone ? <Text style={styles.doneText}>Feita</Text> : null}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
});

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 14 },
  flex: { flex: 1 },
  hero: { gap: 6, padding: 18, borderRadius: 24, backgroundColor: p.card, borderWidth: 1.5 },
  heroIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: p.textMuted, fontSize: 14, lineHeight: 20 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  progressTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: p.line, overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 5 },
  progressText: { color: p.text, fontSize: 13, fontWeight: "900" },
  groups: { gap: 14 },
  group: { gap: 8, padding: 12, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 4, marginBottom: 2 },
  number: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  numberText: { fontSize: 15, fontWeight: "900" },
  groupTitle: { color: p.text, fontSize: 17, fontWeight: "900" },
  groupSubtitle: { color: p.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  count: { fontSize: 13, fontWeight: "900" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, padding: 10, borderRadius: 16, borderWidth: 1.5, borderColor: "transparent" },
  locked: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  node: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  itemTitle: { color: p.text, fontSize: 15, fontWeight: "800" },
  itemSubtitle: { color: p.textMuted, fontSize: 12, marginTop: 2 },
  startPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  startText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  doneText: { color: p.xp, fontSize: 12, fontWeight: "900" }
});
