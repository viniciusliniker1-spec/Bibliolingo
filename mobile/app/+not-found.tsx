import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors } from "../theme/tokens";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen contentStyle={styles.screen}>
      <Text style={styles.title}>Caminho não encontrado</Text>
      <Text style={styles.text}>Esta tela não existe ou ainda não está disponível no Bibliolingo Mobile.</Text>
      <PrimaryButton onPress={() => router.replace("/")}>Voltar ao início</PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center"
  },
  title: {
    color: colors.navy,
    fontSize: 28,
    fontWeight: "900"
  },
  text: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  }
});
