import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GrowBar } from "../components/motion";
import { Icon } from "../components/navigation/Icons";
import { PushButton } from "../components/PushButton";
import { pendingPlanMilestone, planStatus } from "../domain/planMilestones";
import { loadCelebratedPlanMilestones } from "../services/planMilestones";
import { SHOWCASE_PLANS, activeEnrollments, enrollmentForPlan, readingParams, stepLabel, todayReading } from "../domain/readingPlans";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { trackEvent } from "../services/funnel";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

/** Planos de leitura guiados: um trecho por dia, com progresso e a leitura de hoje à mão. */
export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress, startReadingPlan, setReadingStepDone, archiveReadingPlan } = useMobileProgress();
  const active = useMemo(() => activeEnrollments(progress), [progress]);
  const finished = progress.planEnrollments.filter((item) => item.status === "completed");
  const [celebrated, setCelebrated] = useState<Record<string, number[]>>();
  useEffect(() => { void loadCelebratedPlanMilestones().then(setCelebrated); }, [progress.planCompletionEvents.length]);
  const openCard = (enrollmentId: string) => router.push({ pathname: "/plan-card/[enrollmentId]", params: { enrollmentId } });

  const read = (step: Parameters<typeof readingParams>[0]) => {
    const params = readingParams(step);
    if (params) router.push({ pathname: "/bible", params });
  };
  const confirmEnd = (id: string, title: string) => {
    Alert.alert("Encerrar plano?", `${title} sai da sua lista. Você pode começar de novo quando quiser.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Encerrar", style: "destructive", onPress: () => archiveReadingPlan(id) }
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: "Planos de leitura" }} />

      {[...active, ...finished].map((enrollment) => {
        const status = planStatus(enrollment, progress.planCompletionEvents);
        const pending = celebrated ? pendingPlanMilestone(status.percent, celebrated[enrollment.id] ?? []) : undefined;
        return pending ? (
          <Pressable key={`m-${enrollment.id}`} accessibilityRole="button" accessibilityLabel={`Ver cartão de ${pending}% de ${enrollment.title}`} onPress={() => openCard(enrollment.id)} style={({ pressed }) => [styles.celebrate, pressed && styles.pressed]}>
            <Text style={styles.celebrateTitle}>🎉 {pending >= 100 ? `Você concluiu ${enrollment.title}!` : `${enrollment.title}: ${pending}% lido!`}</Text>
            <Text style={styles.celebrateNote}>Toque para ver e compartilhar seu cartão de conquista.</Text>
          </Pressable>
        ) : null;
      })}

      {active.length ? <Text style={styles.section}>Em andamento</Text> : null}
      {active.map((enrollment) => {
        const today = todayReading(progress, enrollment);
        const done = today?.progress.completed ?? enrollment.stepsSnapshot.length;
        const total = enrollment.stepsSnapshot.length;
        return (
          <View key={enrollment.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{enrollment.title}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Encerrar ${enrollment.title}`} hitSlop={10} onPress={() => confirmEnd(enrollment.id, enrollment.title)}>
                <Icon name="close" size={18} color={palette.textMuted} />
              </Pressable>
            </View>
            <View style={styles.track}><GrowBar style={[styles.fill, { width: `${Math.round((done / total) * 100)}%` }]} /></View>
            <Text style={styles.note}>{done} de {total} etapas</Text>
            {today ? (
              <>
                <View style={styles.today}>
                  <Text style={styles.eyebrow}>{today.completedToday ? "PRÓXIMA LEITURA" : today.overdue ? "LEITURA ATRASADA" : "LEITURA DE HOJE"}</Text>
                  <Text style={styles.reading}>{stepLabel(today.step)}</Text>
                </View>
                <View style={styles.row}>
                  <PushButton accessibilityRole="button" accessibilityLabel={`Ler ${stepLabel(today.step)}`} onPress={() => read(today.step)} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
                    <Icon name="book" size={17} color={palette.ctaText} />
                    <Text style={styles.primaryText}>Ler agora</Text>
                  </PushButton>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Marcar ${stepLabel(today.step)} como lida`} onPress={() => { setReadingStepDone(enrollment.id, today.step.id, true); void trackEvent("plan_step_done"); }} style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
                    <Icon name="check" size={17} color={palette.accent} />
                    <Text style={styles.ghostText}>Já li</Text>
                  </Pressable>
                </View>
              </>
            ) : <Text style={styles.note}>Plano concluído! 🎉</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={`Compartilhar progresso de ${enrollment.title}`} onPress={() => openCard(enrollment.id)} style={({ pressed }) => [styles.shareLink, pressed && styles.pressed]}>
              <Icon name="share" size={16} color={palette.accent} />
              <Text style={styles.shareLinkText}>Compartilhar meu progresso</Text>
            </Pressable>
          </View>
        );
      })}

      <Text style={styles.section}>Comece um plano</Text>
      <Text style={styles.note}>Ler um pouco por dia vale mais que muito de vez em quando. Cada leitura conta como estudo do dia e mantém sua ofensiva.</Text>
      {SHOWCASE_PLANS.map(({ plan, hook, minutes }) => {
        const running = Boolean(enrollmentForPlan(progress, plan.id));
        const finishedBefore = finished.some((item) => item.planId === plan.id);
        return (
          <View key={plan.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{plan.title}</Text>
              {finishedBefore ? <Text style={styles.badge}>Concluído</Text> : null}
            </View>
            <Text style={styles.hook}>{hook}</Text>
            <Text style={styles.note}>{plan.steps.length} {plan.steps.length === 1 ? "etapa" : "etapas"} · cerca de {minutes} min por dia</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={running ? `${plan.title}: já em andamento` : `Começar ${plan.title}`}
              disabled={running}
              onPress={() => { startReadingPlan(plan); void trackEvent("plan_started"); }}
              style={({ pressed }) => [styles.ghost, styles.start, running && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.ghostText}>{running ? "Em andamento" : finishedBefore ? "Ler de novo" : "Começar plano"}</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 12 },
  section: { color: p.text, fontSize: 20, fontWeight: "900", marginTop: 6 },
  card: { gap: 8, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { flexShrink: 1, color: p.text, fontSize: 17, fontWeight: "900" },
  badge: { color: p.success, fontSize: 12, fontWeight: "900" },
  hook: { color: p.text, fontSize: 14, fontWeight: "700" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  track: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: p.line },
  fill: { height: 8, borderRadius: 4, backgroundColor: p.xp },
  today: { gap: 2, padding: 12, borderRadius: 14, backgroundColor: p.activeTabBg },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  reading: { color: p.text, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", gap: 8 },
  primary: { flex: 1.4, minHeight: 50, borderRadius: 14, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  ghost: { flex: 1, minHeight: 50, borderRadius: 14, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: p.accent, backgroundColor: p.card },
  ghostText: { color: p.accent, fontSize: 15, fontWeight: "900" },
  start: { flex: 0, marginTop: 4 },
  disabled: { opacity: 0.5 },
  celebrate: { gap: 2, padding: 14, borderRadius: 18, backgroundColor: p.activeTabBg, borderWidth: 1.5, borderColor: p.xp },
  celebrateTitle: { color: p.text, fontSize: 16, fontWeight: "900" },
  celebrateNote: { color: p.textMuted, fontSize: 13 },
  shareLink: { minHeight: 44, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  shareLinkText: { color: p.accent, fontSize: 14, fontWeight: "900" },
  pressed: { opacity: 0.85 }
});
