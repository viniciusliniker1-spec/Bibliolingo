import { useState, type ComponentProps } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { colors, radius, spacing } from "../theme/tokens";
import { PrimaryButton } from "./PrimaryButton";
import { Screen } from "./Screen";

type Mode = "login" | "signup" | "recovery";

interface AuthEntryProps {
  showGuestAction?: boolean;
  profileContext?: boolean;
}

export function AuthEntry({ showGuestAction = true, profileContext = false }: AuthEntryProps) {
  const auth = useMobileAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const title = mode === "signup" ? "Criar conta" : mode === "recovery" ? "Recuperar senha" : "Entrar";
  const missingRequired = !email.trim()
    || (mode !== "recovery" && password.length < 6)
    || (mode === "signup" && !name.trim());

  const submit = async () => {
    setBusy(true);
    setNotice("");
    try {
      if (mode === "recovery") {
        await auth.recover(email.trim());
        setNotice("Solicitação enviada. Confira a caixa de entrada e o spam.");
      } else if (mode === "signup") {
        const result = await auth.signUp(email.trim(), password, name);
        setNotice(result === "confirm-email" ? "Conta criada. Confirme o e-mail para entrar." : "Conta criada.");
      } else {
        await auth.signIn(email.trim(), password);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  };

  const socialLogin = async (provider: "google" | "facebook") => {
    setBusy(true);
    setNotice("");
    try {
      await auth.signInSocial(provider);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível concluir o login.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.brand}>
        <View style={styles.mark} accessibilityElementsHidden><Text style={styles.markText}>B</Text></View>
        <Text style={styles.eyebrow}>BIBLIOLINGO</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.muted}>
          {profileContext
            ? "Entre para sincronizar seu progresso entre o celular e a Web."
            : "Sua jornada bíblica pode continuar em todos os seus dispositivos."}
        </Text>
      </View>

      {!auth.configured ? (
        <View style={styles.warning} accessibilityRole="alert">
          <Text style={styles.warningTitle}>Autenticação indisponível nesta versão</Text>
          <Text style={styles.warningText}>
            A APK não recebeu uma configuração válida do servidor. O modo visitante continua disponível, sem apagar seu progresso local.
          </Text>
        </View>
      ) : null}

      {mode === "login" && (auth.googleEnabled || auth.facebookEnabled) ? (
        <View style={styles.social}>
          {auth.googleEnabled ? (
            <PrimaryButton variant="secondary" disabled={busy} onPress={() => void socialLogin("google")}>
              Continuar com Google
            </PrimaryButton>
          ) : null}
          {auth.facebookEnabled ? (
            <PrimaryButton variant="secondary" disabled={busy} onPress={() => void socialLogin("facebook")}>
              Continuar com Facebook
            </PrimaryButton>
          ) : null}
          <Text style={styles.divider}>ou use seu e-mail</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {mode === "signup" ? <Field label="Nome" value={name} onChangeText={setName} autoComplete="name" /> : null}
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        {mode !== "recovery" ? (
          <Field
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        ) : null}
        <PrimaryButton disabled={busy || !auth.configured || missingRequired} onPress={() => void submit()}>
          {busy ? "Aguarde…" : mode === "signup" ? "Criar conta" : mode === "recovery" ? "Enviar instruções" : "Entrar"}
        </PrimaryButton>
      </View>

      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}

      <View style={styles.links}>
        {mode !== "login" ? <ModeButton title="Já tenho conta" onPress={() => setMode("login")} /> : null}
        {mode !== "signup" ? <ModeButton title="Criar conta" onPress={() => setMode("signup")} /> : null}
        {mode !== "recovery" ? <ModeButton title="Esqueci a senha" onPress={() => setMode("recovery")} /> : null}
      </View>

      {showGuestAction ? (
        <PrimaryButton variant="secondary" disabled={busy} onPress={() => void auth.continueAsGuest()}>
          Continuar como visitante
        </PrimaryButton>
      ) : null}
      <Text style={styles.guest}>O progresso visitante permanece salvo somente neste aparelho até você entrar.</Text>
    </Screen>
  );
}

function Field(props: ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...input } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        style={styles.input}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
      />
    </View>
  );
}

function ModeButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}>
      <Text style={styles.linkText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center", minHeight: "100%" },
  brand: { alignItems: "center", gap: spacing.sm },
  mark: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  markText: { color: colors.surface, fontSize: 30, fontWeight: "900" },
  eyebrow: { color: colors.tealDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: colors.navy, fontSize: 30, fontWeight: "900", textAlign: "center" },
  muted: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: "center" },
  social: { gap: spacing.sm },
  divider: { color: colors.muted, textAlign: "center", fontSize: 13, marginVertical: spacing.xs },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  field: { gap: spacing.xs },
  label: { color: colors.navy, fontWeight: "800" },
  input: { minHeight: 50, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.navy, fontSize: 16, backgroundColor: colors.surface },
  warning: { backgroundColor: "#fff3cf", borderColor: "#e6c86c", borderWidth: 1, padding: spacing.md, borderRadius: radius.md, gap: spacing.xs },
  warningTitle: { color: "#6b5011", fontWeight: "900" },
  warningText: { color: "#6b5011", lineHeight: 21 },
  notice: { backgroundColor: "#e8f7f4", color: colors.tealDark, padding: spacing.md, borderRadius: radius.md },
  links: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
  link: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm },
  linkText: { color: colors.tealDark, fontWeight: "800" },
  guest: { color: colors.muted, textAlign: "center", fontSize: 13, lineHeight: 19 }
});
