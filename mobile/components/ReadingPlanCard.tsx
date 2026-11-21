import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GrowBar } from "./motion";
import { Icon } from "./navigation/Icons";
import { PushButton } from "./PushButton";
import { pendingPlanMilestone, planStatus } from "../domain/planMilestones";
import { SHOWCASE_PLANS, activeEnrollments, readingParams, stepLabel, todayReading } from "../domain/readingPlans";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { trackEvent } from "../services/funnel";
import { loadCelebratedPlanMilestones } from "../services/planMilestones";
import { isPlanPromoSnoozed, snoozePlanPromo } from "../services/planPromo";
import type { Palette } from "../theme/tokens";

interface Props {
  /** Na aba Estudar o convite aparece sempre; na trilha, só até a pessoa dispensar. */
  showPromo?: "always" | "dismissible" | "never";
  /** Versão de uma linha para a trilha: não rouba espaço do caminho. */
  compact?: boolean;
}

/** Plano de leitura em destaque: a leitura de hoje com “Ler agora”/“Já li”, ou o convite para começar um plano. */
export function ReadingPlanCard({ showPromo = "dismissible", compact = false }: Props) {
  const router = useRouter();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress, setReadingStepDone } = useMobileProgress();
  const [celebrated, setCelebrated] = useState<Record<string, number[]>>();
  const [snoozed, setSnoozed] = useState(true);
  useEffect(() => { void loadCelebratedPlanMilestones().then(setCelebrated); void isPlanPromoSnoozed().then(setSnoozed); }, [progress.planCompletionEvents.length]);

  const enrollments = useMemo(() => activeEnrollments(progress), [progress]);
  const main = enrollments[0];
  const today = useMemo(() => (main ? todayReading(progress, main) : undefined), [progress, main]);

  if (!main) {
    if (showPromo === "never" || (showPromo === "dismissible" && snoozed)) return null;
    const suggestion = SHOWCASE_PLANS[0];
    return (
      <View style={[styles.card, styles.promo]}>
        <View style={styles.iconBubble}><Icon name="book" size={22} color={palette.accent} /></View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>PLANO DE LEITURA</Text>
          <Text style={styles.title}>Leia um pouco por dia</Text>
          <Text style={styles.note}>{suggestion.plan.title} · {suggestion.hook}. A Lumi avisa na hora certa.</Text>
          <View style={styles.row}>
            <PushButton accessibilityRole="button" accessibilityLabel="Ver planos de leitura" onPress={() => router.push("/plans")} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>Ver planos</Text>
            </PushButton>
            {showPromo === "dismissible" ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Dispensar convite do plano de leitura" onPress={() => { setSnoozed(true); void snoozePlanPromo(); }} style={styles.link}><Text style={styles.linkText}>Agora não</Text></Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  const status = planStatus(main, progress.planCompletionEvents);
  const pending = celebrated ? pendingPlanMilestone(status.percent, celebrated[main.id] ?? []) : undefined;
  const read = () => {
    const params = today && readingParams(today.step);
    if (params) router.push({ pathname: "/bible", params });
  };

  if (compact && today) {
    return (
      <View style={[styles.card, styles.compactCard]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${main.title}`} onPress={() => router.push("/plans")} style={styles.compactCopy}>
          <Icon name="book" size={18} color={palette.accent} />
          <View style={styles.copy}>
            <Text style={styles.compactEyebrow} numberOfLines={1}>{today.completedToday ? "PRÓXIMA LEITURA" : today.overdue ? "LEITURA ATRASADA" : "LEITURA DE HOJE"} · {status.percent}%</Text>
            <Text style={styles.compactTitle} numberOfLines={1}>{stepLabel(today.step)}</Text>
          </View>
        </Pressable>
        <PushButton accessibilityRole="button" accessibilityLabel={`Ler ${stepLabel(today.step)} agora`} onPress={read} style={({ pressed }) => [styles.compactPrimary, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>Ler</Text>
        </PushButton>
        <Pressable accessibilityRole="button" accessibilityLabel={`Marcar ${stepLabel(today.step)} como lida`} onPress={() => { setReadingStepDone(main.id, today.step.id, true); void trackEvent("plan_step_done"); }} style={({ pressed }) => [styles.compactGhost, pressed && styles.pressed]}>
          <Icon name="check" size={18} color={palette.accent} />
        </Pressable>
        {pending ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver cartão de ${pending}% do plano`} onPress={() => router.push({ pathname: "/plan-card/[enrollmentId]", params: { enrollmentId: main.id } })} style={styles.compactBadge}>
            <Text style={styles.compactBadgeText}>🎉 {pending}%</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${main.title}`} onPress={() => router.push("/plans")} style={styles.head}>
        <View style={styles.iconBubble}><Icon name="book" size={20} color={palette.accent} /></View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{today ? (today.completedToday ? "PRÓXIMA LEITURA" : today.overdue ? "LEITURA ATRASADA" : "LEITURA DE HOJE") : "PLANO CONCLUÍDO"}</Text>
          <Text style={styles.title} numberOfLines={1}>{today ? stepLabel(today.step) : main.title}</Text>
          <Text style={styles.note} numberOfLines={1}>{main.title} · {status.completed} de {status.total}{enrollments.length > 1 ? ` · +${enrollments.length - 1} plano${enrollments.length > 2 ? "s" : ""}` : ""}</Text>
        </View>
        <Icon name="chevronRight" size={18} color={palette.textMuted} />
      </Pressable>
      <View style={styles.track}><GrowBar style={[styles.fill, { width: `${Math.max(3, status.percent)}%` }]} /></View>
      {today ? (
        <View style={styles.row}>
          <PushButton accessibilityRole="button" accessibilityLabel={`Ler ${stepLabel(today.step)} agora`} onPress={read} style={({ pressed }) => [styles.primary, styles.grow, pressed && styles.pressed]}>
            <Icon name="book" size={16} color={palette.ctaText} />
            <Text style={styles.primaryText}>Ler agora</Text>
          </PushButton>
          <Pressable accessibilityRole="button" accessibilityLabel={`Marcar ${stepLabel(today.step)} como lida`} onPress={() => { setReadingStepDone(main.id, today.step.id, true); void trackEvent("plan_step_done"); }} style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
            <Icon name="check" size={16} color={palette.accent} />
            <Text style={styles.ghostText}>Já li</Text>
          </Pressable>
        </View>
      ) : null}
      {pending ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver cartão de ${pending}% do plano`} onPress={() => router.push({ pathname: "/plan-card/[enrollmentId]", params: { enrollmentId: main.id } })} style={({ pressed }) => [styles.celebrate, pressed && styles.pressed]}>
          <Text style={styles.celebrateText}>🎉 {pending >= 100 ? "Plano concluído!" : `Você chegou a ${pending}%!`} Ver cartão para compartilhar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { gap: 10, marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 18, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.accent },
  promo: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBubble: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  copy: { flex: 1, gap: 2 },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 19, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  track: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: p.line },
  fill: { height: 6, borderRadius: 3, backgroundColor: p.xp },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  grow: { flex: 1 },
  primary: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 15, fontWeight: "900" },
  ghost: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.accent },
  ghostText: { color: p.accent, fontSize: 15, fontWeight: "900" },
  link: { minHeight: 44, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  linkText: { color: p.textMuted, fontSize: 14, fontWeight: "800" },
  celebrate: { padding: 10, borderRadius: 12, backgroundColor: p.activeTabBg },
  celebrateText: { color: p.text, fontSize: 13, fontWeight: "800", textAlign: "center" },
  compactCard: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginTop: 6 },
  compactCopy: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 },
  compactEyebrow: { color: p.accent, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  compactTitle: { color: p.text, fontSize: 16, fontWeight: "900" },
  compactPrimary: { minWidth: 56, minHeight: 44, paddingHorizontal: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 3, borderBottomColor: p.ctaShadow },
  compactGhost: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.accent },
  compactBadge: { position: "absolute", top: -10, right: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: p.xp },
  compactBadgeText: { color: "#10243e", fontSize: 11, fontWeight: "900" },
  pressed: { opacity: 0.85 }
});
