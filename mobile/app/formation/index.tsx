import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { formationActivityTitle, formationContent, orderedFormationActivityIds } from "../../../src/content/formation/catalog";
import { ActivityHub, HubScreen, hubProgress, type HubGroup } from "../../components/ActivityHub";
import { Icon } from "../../components/navigation/Icons";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

const TINT = "#ffb35c";
let formationGranted = false;

export default function FormationHubScreen() {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const [granted, setGranted] = useState(formationGranted);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const groups = useMemo<HubGroup[]>(() => {
    const items: HubGroup[] = formationContent.subjects.map((subject) => ({
      id: subject.id, title: subject.title, subtitle: subject.description,
      activities: [...subject.lessonIds.map((id) => ({ id, title: formationActivityTitle(id) })), { id: subject.examId, title: formationActivityTitle(subject.examId), subtitle: "Prova da matéria", checkpoint: true }]
    }));
    items.push({ id: "final", title: "Simulado final", subtitle: "30 questões da formação", activities: [{ id: formationContent.finalExam.id, title: formationContent.finalExam.title, subtitle: "Avaliação final", checkpoint: true }] });
    return items;
  }, []);
  const completed = useMemo(() => new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]), [progress.completedLessonIds, progress.completedCheckpointIds]);

  if (!granted) {
    const enter = () => { if (code === "12345") { formationGranted = true; setGranted(true); setError(""); } else setError("Código inválido."); };
    return (
      <HubScreen eyebrow="ACESSO RESTRITO" title="Formação Pastoral Nazarena" icon="lock" tint={TINT}
        subtitle="Digite o código fornecido pela sua turma. Este código só protege a navegação; não é autenticação para conteúdo confidencial.">
        <View style={styles.gate}>
          <TextInput value={code} onChangeText={setCode} secureTextEntry keyboardType="number-pad" placeholder="Código de acesso" placeholderTextColor={palette.textMuted} style={styles.input} onSubmitEditing={enter} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" onPress={enter} style={styles.primary}><Icon name="shield" size={18} color={palette.ctaText} /><Text style={styles.primaryText}>Entrar na formação</Text></Pressable>
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
