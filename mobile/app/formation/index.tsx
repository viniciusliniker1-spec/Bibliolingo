import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formationActivityTitle, formationContent, orderedFormationActivityIds } from "../../../src/content/formation/catalog";
import { ActivityHub, HubScreen, hubProgress, type HubGroup } from "../../components/ActivityHub";
import { Icon } from "../../components/navigation/Icons";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { isFormationUnlocked } from "../../domain/accessCodes";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

const TINT = "#ffb35c";

export default function FormationHubScreen() {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const router = useRouter();
  const unlocked = isFormationUnlocked(progress.settings);
  const groups = useMemo<HubGroup[]>(() => {
    const items: HubGroup[] = formationContent.subjects.map((subject) => ({
      id: subject.id, title: subject.title, subtitle: subject.description,
      activities: [...subject.lessonIds.map((id) => ({ id, title: formationActivityTitle(id) })), { id: subject.examId, title: formationActivityTitle(subject.examId), subtitle: "Prova da matéria", checkpoint: true }]
    }));
    items.push({ id: "final", title: "Simulado final", subtitle: "30 questões da formação", activities: [{ id: formationContent.finalExam.id, title: formationContent.finalExam.title, subtitle: "Avaliação final", checkpoint: true }] });
    return items;
  }, []);
  const completed = useMemo(() => new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]), [progress.completedLessonIds, progress.completedCheckpointIds]);

  if (!unlocked) {
    return (
      <HubScreen eyebrow="ACESSO RESTRITO" title="Conteúdo restrito" icon="lock" tint={TINT}
        subtitle="Este percurso é liberado com um código de acesso. Se você recebeu o código, informe-o em Perfil › Código de acesso.">
        <View style={styles.gate}>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/profile")} style={styles.primary}><Icon name="user" size={18} color={palette.ctaText} /><Text style={styles.primaryText}>Ir para o Perfil</Text></Pressable>
        </View>
      </HubScreen>
    );
  }
  return (
    <HubScreen eyebrow="FORMAÇÃO PASTORAL" title={formationContent.title} icon="shield" tint={TINT} subtitle={formationContent.disclaimer} progress={hubProgress(groups, completed)}>
      <ActivityHub kind="formation" groups={groups} orderedIds={orderedFormationActivityIds} tint={TINT} />
    </HubScreen>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  gate: { gap: 10 },
  input: { minHeight: 54, borderRadius: 16, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card, paddingHorizontal: 16, fontSize: 18, color: p.text },
  error: { color: p.error, fontWeight: "800" },
  primary: { flexDirection: "row", gap: 8, minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" }
});
