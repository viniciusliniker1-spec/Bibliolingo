import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
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
import {
  accountUsernameError,
  getAccountUsername,
  normalizeAccountUsername
} from "../../../src/auth/accountIdentity";
import { AuthEntry } from "../../components/AuthEntry";
import { AvatarPreview } from "../../components/AvatarPreview";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../../theme/tokens";
import { neutralAvatar, type AvatarSelection } from "../../domain/avatar";
import { loadAvatar } from "../../services/avatarStorage";


export default function ProfileScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress, syncStatus, migrationRequired, importLocalProgress, syncNow } = useMobileProgress();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [avatar, setAvatar] = useState<AvatarSelection>(neutralAvatar);
  const ownerId = auth.session?.user.id;
  useFocusEffect(useCallback(() => { let active=true; void loadAvatar(ownerId).then(value=>{if(active)setAvatar(value);}); return()=>{active=false;}; }, [ownerId]));
  const level = getLevelProgress(progress.xp);

  if (auth.loading) {
    return <Screen contentStyle={styles.center}><ActivityIndicator color={colors.teal} /></Screen>;
  }

  if (auth.session) {
    const currentName = auth.session.user.user_metadata?.display_name ?? "Estudante";
    const currentUsername = getAccountUsername(auth.session.user);
    return (
      <Screen>
        <Text style={styles.eyebrow}>MEU PERFIL</Text>
        <Text style={styles.title}>{currentName}</Text>
        <Text style={styles.username}>@{currentUsername}</Text>
        <Text style={styles.muted}>Conta conectada · {auth.session.user.email}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Editar meu avatar" onPress={()=>router.push("/avatar-editor")} style={({pressed})=>[styles.avatarCard,pressed&&styles.avatarPressed]}><AvatarPreview selection={avatar} size={156} accessibilityLabel="Seu avatar atual"/><View style={styles.avatarCopy}><Text style={styles.avatarTitle}>Meu avatar</Text><Text style={styles.avatarHelp}>Toque para personalizar</Text><Text style={styles.avatarProvisional}>Visual provisório · sprites finais pendentes</Text></View></Pressable>
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
          <Field label="Nome de usuário" value={username} placeholder={currentUsername} onChangeText={(value) => setUsername(value.toLowerCase())} autoCapitalize="none" autoCorrect={false} maxLength={24} />
          <Text style={styles.fieldHelp}>Aparece como @{username || currentUsername}. O login continua sendo feito pelo e-mail.</Text>
          <Field label="URL do avatar" value={avatarUrl} placeholder="https://…" onChangeText={setAvatarUrl} />
          <PrimaryButton disabled={busy} onPress={async () => {
            setBusy(true);
            try {
              const nextUsername = normalizeAccountUsername(username || currentUsername);
              const usernameError = accountUsernameError(nextUsername);
              if (usernameError) {
                setNotice(usernameError);
                return;
              }
              await auth.updateProfile({ displayName: name || currentName, username: nextUsername, avatarUrl });
              setUsername("");
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

  return <AuthEntry showGuestAction={false} profileContext />;

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

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  center:{alignItems:"center",justifyContent:"center"},avatarCard:{flexDirection:"row",alignItems:"center",gap:spacing.lg,padding:spacing.md,borderRadius:radius.lg,backgroundColor:"#10272b"},avatarPressed:{opacity:.9,transform:[{scale:.99}]},avatarCopy:{flex:1,gap:spacing.xs},avatarTitle:{color:"#effaf4",fontSize:20,fontWeight:"900"},avatarHelp:{color:"#7ed6c4",fontWeight:"800"},avatarProvisional:{color:"#d8c17f",fontSize:10,lineHeight:15},eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.5},
  title:{color:colors.navy,fontSize:30,fontWeight:"900"},username:{color:colors.tealDark,fontSize:17,fontWeight:"900"},muted:{color:colors.muted,fontSize:16,lineHeight:24},
  card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md},
  cardTitle:{color:colors.navy,fontSize:20,fontWeight:"900"},field:{gap:spacing.xs},label:{color:colors.navy,fontWeight:"800"},
  input:{minHeight:50,borderColor:colors.border,borderWidth:1,borderRadius:radius.md,paddingHorizontal:spacing.md,color:colors.navy,fontSize:16,backgroundColor:colors.surface},
  fieldHelp:{color:colors.muted,fontSize:12,lineHeight:18,marginTop:-spacing.sm},
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
