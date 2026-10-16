import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { getLevelProgress } from "../../../src/domain/gamification";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";

type Mode = "login" | "signup" | "recovery";

export default function ProfileScreen() {
  const auth = useMobileAuth();
  const { progress, syncStatus, migrationRequired, importLocalProgress, syncNow } = useMobileProgress();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const level = getLevelProgress(progress.xp);

  if (auth.loading) {
    return <Screen contentStyle={styles.center}><ActivityIndicator color={colors.teal} /></Screen>;
  }

  if (auth.session) {
    const currentName = auth.session.user.user_metadata?.display_name ?? "Estudante";
    return (
      <Screen>
        <Text style={styles.eyebrow}>MEU PERFIL</Text>
        <Text style={styles.title}>{currentName}</Text>
        <Text style={styles.muted}>{auth.session.user.email}</Text>
        <View style={styles.stats}>
          <Stat value={String(progress.xp)} label="XP" />
          <Stat value={String(level.level)} label="Nível" />
          <Stat value={String(progress.streak)} label="Dias seguidos" />
          <Stat value={String(progress.completedLessonIds.length)} label="Lições" />
        </View>
        <View style={styles.syncCard}>
          <View style={styles.syncRow}>
            <Text style={styles.cardTitle}>Sincronização</Text>
            <Text style={styles.syncStatus}>{syncLabel(syncStatus)}</Text>
          </View>
          {migrationRequired ? (
            <>
              <Text style={styles.muted}>Encontramos progresso anterior neste aparelho. Importe-o somente se esta for a conta correta.</Text>
              <PrimaryButton onPress={() => void importLocalProgress()}>Mesclar progresso local</PrimaryButton>
            </>
          ) : (
            <PrimaryButton variant="secondary" onPress={() => void syncNow()}>Sincronizar agora</PrimaryButton>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Editar perfil</Text>
          <Field label="Nome" value={name} placeholder={currentName} onChangeText={setName} />
          <Field label="URL do avatar" value={avatarUrl} placeholder="https://…" onChangeText={setAvatarUrl} />
          <PrimaryButton disabled={busy} onPress={async () => {
            setBusy(true);
            try {
              await auth.updateProfile({ displayName: name || currentName, avatarUrl });
              setNotice("Perfil atualizado.");
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Não foi possível atualizar.");
            } finally {
              setBusy(false);
            }
          }}>Salvar perfil</PrimaryButton>
        </View>
        {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
        <PrimaryButton variant="secondary" onPress={() => void auth.signOut()}>Sair</PrimaryButton>
        <Pressable accessibilityRole="button" style={styles.link} onPress={() => Alert.alert(
          "Excluir conta",
          "Os dados online serão excluídos. O progresso local será preservado.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir", style: "destructive", onPress: () => void auth.deleteAccount() }
          ]
        )}><Text style={styles.danger}>Excluir conta</Text></Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>BIBLIOLINGO</Text>
      <Text style={styles.title}>{mode === "signup" ? "Criar conta" : mode === "recovery" ? "Recuperar senha" : "Entrar"}</Text>
      <Text style={styles.muted}>Você pode continuar estudando como visitante. Entre para preparar a sincronização entre dispositivos.</Text>
      {!auth.configured ? <Text style={styles.warning}>A conta online ainda não foi ativada neste ambiente.</Text> : null}
      <View style={styles.card}>
        {mode === "signup" ? <Field label="Nome" value={name} onChangeText={setName} /> : null}
        <Field label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {mode !== "recovery" ? <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry /> : null}
        <PrimaryButton disabled={busy || !auth.configured} onPress={async () => {
          setBusy(true);
          setNotice("");
          try {
            if (mode === "recovery") {
              await auth.recover(email);
              setNotice("Confira seu e-mail para recuperar a senha.");
            } else if (mode === "signup") {
              const result = await auth.signUp(email, password, name);
              setNotice(result === "confirm-email" ? "Confirme o e-mail para entrar." : "Conta criada.");
            } else {
              await auth.signIn(email, password);
            }
          } catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível concluir.");
          } finally {
            setBusy(false);
          }
        }}>{busy ? "Aguarde…" : mode === "signup" ? "Criar conta" : mode === "recovery" ? "Enviar instruções" : "Entrar"}</PrimaryButton>
      </View>
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
      <View style={styles.links}>
        {mode !== "login" ? <ModeButton title="Já tenho conta" onPress={() => setMode("login")} /> : null}
        {mode !== "signup" ? <ModeButton title="Criar conta" onPress={() => setMode("signup")} /> : null}
        {mode !== "recovery" ? <ModeButton title="Esqueci a senha" onPress={() => setMode("recovery")} /> : null}
      </View>
      <Text style={styles.guest}>Modo visitante ativo · seu progresso continua salvo neste aparelho.</Text>
    </Screen>
  );
}

function syncLabel(status: string) {
  if (status === "syncing") return "Sincronizando…";
  if (status === "synced") return "Sincronizado";
  if (status === "offline") return "Aguardando internet";
  if (status === "error") return "Erro de sincronização";
  return "Somente neste aparelho";
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...input } = props;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...input} style={styles.input} placeholderTextColor={colors.muted} /></View>;
}

function ModeButton({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}><Text style={styles.linkText}>{title}</Text></Pressable>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  center:{alignItems:"center",justifyContent:"center"},eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.5},
  title:{color:colors.navy,fontSize:30,fontWeight:"900"},muted:{color:colors.muted,fontSize:16,lineHeight:24},
  card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md},
  cardTitle:{color:colors.navy,fontSize:20,fontWeight:"900"},field:{gap:spacing.xs},label:{color:colors.navy,fontWeight:"800"},
  input:{minHeight:50,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,paddingHorizontal:spacing.md,color:colors.navy,fontSize:16,backgroundColor:colors.surface},
  warning:{backgroundColor:"#fff3cf",color:"#6b5011",padding:spacing.md,borderRadius:radius.md},
  notice:{backgroundColor:"#e8f7f4",color:colors.tealDark,padding:spacing.md,borderRadius:radius.md},
  links:{flexDirection:"row",flexWrap:"wrap",justifyContent:"center",gap:spacing.sm},link:{minHeight:44,justifyContent:"center",paddingHorizontal:spacing.sm},
  linkText:{color:colors.tealDark,fontWeight:"800"},danger:{color:"#a52828",fontWeight:"800",textAlign:"center"},
  guest:{color:colors.muted,textAlign:"center",fontSize:13},stats:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},
  stat:{width:"48%",backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.md,alignItems:"center",borderColor:colors.border,borderWidth:1},
  statValue:{color:colors.navy,fontSize:22,fontWeight:"900"},statLabel:{color:colors.muted,fontSize:12},
  syncCard:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md},
  syncRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:spacing.sm},syncStatus:{color:colors.tealDark,fontWeight:"800",fontSize:12}
});
