import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ProfessorNoahModal } from "../components/ProfessorNoahModal";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { buildMobileLearningProfile, type NoahContext } from "../domain/noah";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

export default function NoahScreen() {
  const router = useRouter();
  const { progress } = useMobileProgress();
  const [visible, setVisible] = useState(true);
  const context = useMemo<NoahContext>(() => ({
    area: "bible",
    title: "Jornada geral no Bibliolingo",
    objective: "Ajudar o aluno a compreender conteúdos bíblicos e organizar seus próximos estudos.",
    answerStatus: "unanswered",
    learningProfile: buildMobileLearningProfile(progress),
    editorialStatus: "reviewed"
  }), [progress]);

  const close = () => {
    setVisible(false);
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/study");
  };

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>N</Text></View>
        <Text style={styles.eyebrow}>TUTOR BÍBLICO CONTEXTUAL</Text>
        <Text style={styles.title}>Professor Noah</Text>
        <Text style={styles.copy}>Pergunte sobre a Bíblia, uma dificuldade da jornada ou um assunto que deseja revisar.</Text>
        <PrimaryButton onPress={() => setVisible(true)}>Conversar com o Professor Noah</PrimaryButton>
      </View>
      <ProfessorNoahModal
        visible={visible}
        context={context}
        contextKey="general-noah"
        onClose={close}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center" },
  card: { alignItems: "center", gap: spacing.md, padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: colors.teal },
  avatarText: { color: colors.navy, fontSize: 32, fontWeight: "900" },
  eyebrow: { color: colors.tealDark, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.navy, fontSize: 28, fontWeight: "900" },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" }
});
