import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import { lumiStreakMood } from "../domain/lumiMood";
import { buildMonth, MONTH_NAMES, monthStats, WEEKDAY_INITIALS } from "../domain/streakCalendar";
import { toLocalDateKey } from "../../src/domain/streak";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { Icon } from "./navigation/Icons";

const FLAME = "#ff9f1c";
const FLAME_SOFT = "#ffe1b3";

/** Calendário de constância: ofensiva atual com a Lumi, mês navegável e números do mês. */
export function StreakCalendar({ showHero = true }: { showHero?: boolean }) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const weeks = useMemo(() => buildMonth(cursor.year, cursor.month, progress.activity, progress.profile.dailyGoal, today), [cursor, progress.activity, progress.profile.dailyGoal]); // eslint-disable-line react-hooks/exhaustive-deps
  const stats = monthStats(weeks);
  const todayXp = progress.activity[toLocalDateKey(today)]?.xp ?? 0;
  const mood = lumiStreakMood({ streak: progress.streak, lastStudyDate: progress.lastStudyDate, goalRatio: todayXp / Math.max(1, progress.profile.dailyGoal) });
  const alive = mood.gap <= 1;
  const streak = alive ? progress.streak : 0;
  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();
  const move = (delta: number) => setCursor(({ year, month }) => {
    const date = new Date(year, month + delta, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  return (
    <View style={styles.card}>
      {showHero ? (
        <View style={styles.hero}>
          <Image source={lumiMoodAssets[mood.mood]} style={styles.lumi} contentFit="contain" accessibilityLabel={`Lumi: ${mood.label}`} />
          <View style={styles.flex}>
            <View style={styles.streakRow}>
              <Icon name="flame" size={30} color={streak ? FLAME : palette.textMuted} />
              <Text style={[styles.streakNumber, !streak && styles.streakOff]}>{streak}</Text>
            </View>
            <Text style={styles.streakLabel}>{streak === 1 ? "dia de ofensiva" : "dias de ofensiva"}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
            <Text style={styles.best}>Recorde: {Math.max(progress.bestStreak ?? 0, progress.streak)} dias</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => move(-1)} hitSlop={10} style={styles.nav}>
          <Icon name="chevronLeft" size={20} color={palette.text} />
        </Pressable>
        <Text style={styles.month}>{MONTH_NAMES[cursor.month][0].toUpperCase() + MONTH_NAMES[cursor.month].slice(1)} de {cursor.year}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" disabled={isCurrentMonth} onPress={() => move(1)} hitSlop={10} style={[styles.nav, isCurrentMonth && styles.navOff]}>
          <Icon name="chevronRight" size={20} color={palette.text} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>{WEEKDAY_INITIALS.map((initial, i) => <Text key={i} style={styles.weekday}>{initial}</Text>)}</View>
      {weeks.map((week) => (
        <View key={week[0].key} style={styles.weekRow}>
          {week.map((day) => (
            <View key={day.key} style={styles.cell} accessible accessibilityLabel={`${day.day} de ${MONTH_NAMES[Number(day.key.slice(5, 7)) - 1]}: ${day.studied ? `estudou, ${day.xp} XP${day.goalMet ? ", meta batida" : ""}` : day.future ? "ainda não chegou" : "sem estudo"}`}>
              {day.studied ? <View style={[styles.band, day.joinLeft && styles.bandLeft, day.joinRight && styles.bandRight, !day.inMonth && styles.dim]} /> : null}
              <View style={[styles.dot, day.studied && styles.dotStudied, day.isToday && styles.dotToday, (!day.inMonth || day.future) && styles.dim]}>
                <Text style={[styles.dayText, day.studied && styles.dayTextStudied]}>{day.day}</Text>
              </View>
              {day.goalMet && day.inMonth ? <View style={styles.goal}><Icon name="check" size={9} color="#ffffff" strokeWidth={4} /></View> : null}
            </View>
          ))}
        </View>
      ))}

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: FLAME }]} /><Text style={styles.legendText}>estudou</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: palette.success }]} /><Text style={styles.legendText}>meta batida</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendToday]} /><Text style={styles.legendText}>hoje</Text></View>
      </View>

      <View style={styles.stats}>
        <Stat styles={styles} value={stats.studiedDays} label="dias estudados" />
        <Stat styles={styles} value={stats.goalDays} label="metas batidas" />
        <Stat styles={styles} value={stats.longestRun} label="maior sequência" />
        <Stat styles={styles} value={stats.perfectWeeks} label="semanas perfeitas" />
      </View>
    </View>
  );
}

function Stat({ value, label, styles }: { value: number; label: string; styles: ReturnType<typeof makeStyles> }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { gap: 8, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  flex: { flex: 1 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  lumi: { width: 104, height: 104 },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakNumber: { color: FLAME, fontSize: 40, fontWeight: "900", lineHeight: 44 },
  streakOff: { color: p.textMuted },
  streakLabel: { color: p.text, fontSize: 15, fontWeight: "900", marginTop: -2 },
  moodLabel: { color: p.textMuted, fontSize: 13, fontWeight: "700", marginTop: 2 },
  best: { color: p.accent, fontSize: 12, fontWeight: "900", marginTop: 4 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  month: { color: p.text, fontSize: 16, fontWeight: "900" },
  nav: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: p.ground },
  navOff: { opacity: 0.3 },
  weekRow: { flexDirection: "row" },
  weekday: { flex: 1, textAlign: "center", color: p.textMuted, fontSize: 12, fontWeight: "900" },
  cell: { flex: 1, height: 42, alignItems: "center", justifyContent: "center" },
  band: { position: "absolute", height: 34, left: "50%", right: "50%", backgroundColor: FLAME_SOFT },
  bandLeft: { left: 0 },
  bandRight: { right: 0 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dotStudied: { backgroundColor: FLAME },
  dotToday: { borderWidth: 2.5, borderColor: p.accent },
  dim: { opacity: 0.35 },
  dayText: { color: p.text, fontSize: 14, fontWeight: "800" },
  dayTextStudied: { color: "#ffffff", fontWeight: "900" },
  goal: { position: "absolute", right: 3, bottom: 2, width: 15, height: 15, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: p.success, borderWidth: 1.5, borderColor: p.card },
  legend: { flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendToday: { borderWidth: 2, borderColor: p.accent },
  legendText: { color: p.textMuted, fontSize: 11, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 6, marginTop: 6 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 14, backgroundColor: p.ground },
  statValue: { color: p.text, fontSize: 18, fontWeight: "900" },
  statLabel: { color: p.textMuted, fontSize: 10, fontWeight: "800", textAlign: "center" }
});
