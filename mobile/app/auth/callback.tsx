import { router } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { mobileFeedbackAssets } from "../../assets/feedbackAssets";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { colors, radius, spacing } from "../../theme/tokens";

export default function AuthCallbackScreen() {
  const auth = useMobileAuth();
  const incomingUrl = Linking.useURL();
  const [processing, setProcessing] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const finish = async () => {
      try {
        const url = incomingUrl ?? await Linking.getInitialURL();
        if (!url) throw new Error("Não foi possível ler o retorno da autenticação.");
        const type = await auth.completeAuthCallback(url);
        if (!active) return;
        if (type === "recovery") {
          setRecovery(true);
          setProcessing(false);
        } else {
          router.replace("/(tabs)");
        }
      } catch (error) {
        if (active) {
          setNotice(error instanceof Error ? error.message : "Não foi possível concluir a autenticação.");
          setProcessing(false);
        }
      }
    };
    void finish();
    return () => {
      active = false;
    };
  }, [auth.completeAuthCallback, incomingUrl]);

  const savePassword = async () => {
    if (password.length < 8) {
      setNotice("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setProcessing(true);
    setNotice("");
    try {
      await auth.updateProfile({ password });
      router.replace("/(tabs)");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível alterar a senha.");
      setProcessing(false);
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.card}>
        {processing ? (
          <>
            <Image source={mobileFeedbackAssets.loading} style={styles.lumi} resizeMode="contain" accessibilityLabel="Lumi concluindo sua entrada" />
            <ActivityIndicator color={colors.teal} size="large" />
            <Text style={styles.title}>Confirmando sua conta…</Text>
            <Text style={styles.text}>Aguarde enquanto validamos a sessão com segurança.</Text>
          </>
        ) : recovery ? (
          <>
            <Text style={styles.title}>Crie uma nova senha</Text>
            <Text style={styles.text}>Sua identidade foi confirmada pelo link enviado ao e-mail.</Text>
            <TextInput
              accessibilityLabel="Nova senha"
              autoComplete="new-password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Nova senha"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <PrimaryButton onPress={() => void savePassword()}>Salvar nova senha</PrimaryButton>
          </>
        ) : (
          <>
            <Text style={styles.title}>Não foi possível entrar</Text>
            <Text style={styles.text}>{notice || "O link pode ter expirado. Solicite um novo e tente novamente."}</Text>
            <PrimaryButton variant="secondary" onPress={() => router.replace("/")}>Voltar ao login</PrimaryButton>
          </>
        )}
        {recovery && notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { minHeight: "100%", alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "stretch"
  },
  lumi: { width: 150, height: 138, alignSelf: "center" },
  title: { color: colors.navy, fontSize: 24, fontWeight: "900", textAlign: "center" },
  text: { color: colors.muted, fontSize: 16, lineHeight: 23, textAlign: "center" },
  input: {
    minHeight: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.navy,
    backgroundColor: colors.surface,
    fontSize: 16
  },
  notice: { color: "#8a3b12", textAlign: "center" }
});
