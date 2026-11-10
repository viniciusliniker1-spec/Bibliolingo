import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { noahPortrait } from "../assets/noahAssets";
import { ProfessorNoahModal } from "../components/ProfessorNoahModal";
import { buildMobileLearningProfile, type NoahContext } from "../domain/noah";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

export default function NoahScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
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
    <View style={styles.screen}>
      <View style={styles.card}>
        <Image source={noahPortrait} style={styles.portrait} contentFit="cover" accessibilityLabel="Professor Noah" />
        <Text style={styles.title}>Professor Noah</Text>
        <Text style={styles.copy}>Pergunte sobre a Bíblia, uma dificuldade da jornada ou um assunto que deseja revisar.</Text>
        <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={styles.primary}><Text style={styles.primaryText}>Conversar com o Noah</Text></Pressable>
      </View>
      <ProfessorNoahModal visible={visible} context={context} contextKey="general-noah" onClose={close} />
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 22, backgroundColor: p.ground },
  card: { alignItems: "center", gap: 12, padding: 24, borderRadius: 26, borderWidth: 1, borderColor: p.line, backgroundColor: p.card },
  portrait: { width: 96, height: 96, borderRadius: 26 },
  title: { color: p.text, fontSize: 26, fontWeight: "900" },
  copy: { color: p.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  primary: { alignSelf: "stretch", minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" }
});
