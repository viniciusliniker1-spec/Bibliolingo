import { useRouter } from "expo-router";
import { Image, StyleSheet, Text } from "react-native";
import { mobileFeedbackAssets } from "../assets/feedbackAssets";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme/tokens";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen contentStyle={styles.screen}>
      <Image source={mobileFeedbackAssets.connectionError} style={styles.lumi} resizeMode="contain" accessibilityLabel="Lumi procurando o caminho" />
      <Text style={styles.title}>Caminho não encontrado</Text>
      <Text style={styles.text}>Esta tela não existe ou ainda não está disponível no Bibliolingo Mobile.</Text>
      <PrimaryButton onPress={() => router.replace("/")}>Voltar ao início</PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center", alignItems: "stretch" },
  lumi: { width: 146, height: 134, alignSelf: "center", marginBottom: spacing.sm },
  title: { color: colors.navy, fontSize: 28, fontWeight: "900", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: "center" }
});
