import { useState, type ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { DAILY_GOALS, KNOWLEDGE_LEVELS, STUDY_GOALS } from "../../../src/config/profile";
import { getLevelProgress } from "../../../src/domain/gamification";
import { toLocalDateKey } from "../../../src/domain/streak";
import { mobileSceneAssets } from "../../assets/sceneAssets";
import { AuthEntry } from "../../components/AuthEntry";
import { SceneBanner } from "../../components/SceneBanner";
import { LumiCharacter } from "../../components/LumiCharacter";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { exportMobileBackup, importMobileBackup } from "../../services/mobileBackup";
import { colors, radius, spacing } from "../../theme/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const api = useMobileProgress();
  const { progress } = api;
  const [notice, setNotice] = useState("");
  const [accountName, setAccountName] = useState(auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "");
  const [username, setUsername] = useState(auth.session?.user.user_metadata?.username ?? "");
  const [avatarUrl, setAvatarUrl] = useState(auth.session?.user.user_metadata?.avatar_url ?? "");
  const [newPassword, setNewPassword] = useState("");
  const level = getLevelProgress(progress.xp);
  const accuracy = progress.attempts.length
    ? Math.round(progress.attempts.filter((item) => item.correct).length / progress.attempts.length * 100)
    : undefined;
  const minutes = Math.round(Object.values(progress.activity).reduce((sum, item) => sum + item.seconds, 0) / 60);
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const key = toLocalDateKey(date);
    const activity = progress.activity[key];
    const xp = activity?.xp ?? 0;
    const lessons = activity?.lessons ?? 0;
    return { key, day: String(date.getDate()), month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), xp, lessons, intensity: xp >= 100 ? 3 : xp >= 40 ? 2 : xp > 0 || lessons > 0 ? 1 : 0 };
  });
  const activeDays = days.filter((day) => day.intensity > 0).length;
  const periodXp = days.reduce((sum, day) => sum + day.xp, 0);
  const displayName = auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "Estudante";

  return (
    <Screen>
      <View>
        <Text style={styles.eyebrow}>MEU PERFIL</Text>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.muted}>
          {auth.session ? "Conta conectada · " + auth.session.user.email : "Modo visitante · progresso neste aparelho"}
        </Text>
      </View>

      <View style={styles.companion}>
        <LumiCharacter mood="returning" motion="encouraging" style={styles.companionLumi} accessibilityLabel="Lumi acolhendo você no perfil" />
        <View style={styles.companionCopy}><Text style={styles.companionTitle}>Que bom ter você aqui</Text><Text style={styles.muted}>Seu progresso está seguro. Continue no seu ritmo.</Text></View>
      </View>

      <View style={styles.stats}>
        <Stat value={String(progress.xp)} label="XP" />
        <Stat value={String(level.level)} label="Nível" />
        <Stat value={String(progress.streak)} label="Dias seguidos" />
        <Stat value={accuracy === undefined ? "—" : accuracy + "%"} label="Precisão" />
        <Stat value={minutes + " min"} label="Estudo" />
        <Stat value={String(progress.completedLessonIds.length)} label="Lições" />
      </View>

      <SceneBanner source={mobileSceneAssets.consistency} eyebrow="SUA CONSTÂNCIA" title="Cada dia de estudo conta" accessibilityLabel="Santuário da constância" />

      <Card title="Atividade nos últimos 28 dias">
        <View style={styles.calendarSummary}><View><Text style={styles.summaryValue}>{activeDays}</Text><Text style={styles.help}>dias com estudo</Text></View><View><Text style={styles.summaryValue}>{periodXp}</Text><Text style={styles.help}>XP no período</Text></View></View>
        <View style={styles.weekdays}>{["D","S","T","Q","Q","S","S"].map((label,index)=><Text key={label+index} style={styles.weekday}>{label}</Text>)}</View>
        <View style={styles.calendar}>
          {days.map((day) => (
            <View key={day.key} style={styles.dayWrap} accessibilityLabel={`${day.key}, ${day.xp} XP, ${day.lessons} lições`}>
              <View style={[styles.day, day.intensity===1&&styles.dayLow, day.intensity===2&&styles.dayMedium, day.intensity===3&&styles.dayHigh]}><Text style={[styles.dayNumber,day.intensity>1&&styles.dayNumberActive]}>{day.day}</Text></View>
              <Text style={styles.dayLabel}>{day.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legend}><Text style={styles.help}>Menos</Text><View style={styles.legendOff}/><View style={styles.legendLow}/><View style={styles.legendMedium}/><View style={styles.legendHigh}/><Text style={styles.help}>Mais</Text></View>
      </Card>

      <Card title="Objetivo de estudo">
        {STUDY_GOALS.map((item) => (
          <Choice key={item.id} title={item.label} selected={progress.profile.goal === item.id}
            onPress={() => api.updatePreferences({ goal: item.id })} />
        ))}
      </Card>

      <Card title="Meta diária">
        {DAILY_GOALS.map((item) => (
          <Choice key={item.xp} title={item.title + " · " + item.xp + " XP"} note={item.note}
            selected={progress.profile.dailyGoal === item.xp}
            onPress={() => api.updatePreferences({ dailyGoal: item.xp })} />
        ))}
      </Card>

      <Card title="Nível de conhecimento">
        {KNOWLEDGE_LEVELS.map((item) => (
          <Choice key={item.id} title={item.title} note={item.note}
            selected={progress.profile.knowledgeLevel === item.id}
            onPress={() => {
              api.updatePreferences({ knowledgeLevel: item.id });
              if (item.id === "advanced") router.push("/deepen");
            }} />
        ))}
      </Card>

      <Card title="Preferências">
        <Toggle title="Usar corações" note="Erros consomem corações somente nos percursos previstos pelas regras."
          value={progress.settings.heartsEnabled} onChange={(value) => api.updatePreferences({}, { heartsEnabled: value })} />
        <Toggle title="Sons" note="Feedback sonoro durante os exercícios."
          value={progress.settings.soundEnabled} onChange={(value) => api.updatePreferences({}, { soundEnabled: value })} />
        <Toggle title="Vibração" note="Feedback tátil quando disponível."
          value={progress.settings.hapticsEnabled} onChange={(value) => api.updatePreferences({}, { hapticsEnabled: value })} />
        <Toggle title="Reduzir movimento" note="Mantém a Lumi e os feedbacks visuais com animações discretas."
          value={Boolean(progress.settings.reduceMotionEnabled)} onChange={(value) => api.updatePreferences({}, { reduceMotionEnabled: value })} />
      </Card>

      <Card title="Backup do progresso">
        <Text style={styles.muted}>Inclui progresso, preferências, tentativas, notas e marcações em formato validado.</Text>
        <PrimaryButton variant="secondary" onPress={async () => {
          try { await exportMobileBackup(progress); setNotice("Backup preparado para compartilhamento."); }
          catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível exportar."); }
        }}>Exportar backup</PrimaryButton>
        <PrimaryButton variant="secondary" onPress={async () => {
          try {
            const restored = await importMobileBackup(progress);
            if (restored) { api.replaceProgress(restored); setNotice("Backup restaurado."); }
          } catch (error) { setNotice(error instanceof Error ? error.message : "Backup inválido."); }
        }}>Restaurar backup</PrimaryButton>
      </Card>

      <PrimaryButton variant="secondary" onPress={() => router.push("/notification-settings")}>Configurar notificações</PrimaryButton>

      {auth.session ? (
        <Card title="Dados da conta">
          <Text style={styles.muted}>Edite os dados que identificam sua conta no Web e no Mobile.</Text>
          <TextInput accessibilityLabel="Nome" value={accountName} onChangeText={setAccountName} placeholder="Seu nome" style={styles.input} />
          <TextInput accessibilityLabel="Nome de usuário" value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="nome_de_usuario" style={styles.input} />
          <TextInput accessibilityLabel="URL do avatar" value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" keyboardType="url" placeholder="https://..." style={styles.input} />
          <TextInput accessibilityLabel="Nova senha" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Nova senha (opcional)" style={styles.input} />
          <PrimaryButton onPress={async () => {
            try {
              await auth.updateProfile({
                displayName: accountName.trim() || undefined,
                username: username.trim() || undefined,
                avatarUrl: avatarUrl.trim() || undefined,
                password: newPassword || undefined
              });
              api.updatePreferences({ name: accountName.trim() || undefined });
              setNewPassword("");
              setNotice("Dados da conta atualizados.");
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Não foi possível atualizar a conta.");
            }
          }}>Salvar dados da conta</PrimaryButton>
        </Card>
      ) : null}

      {auth.session && auth.biometricAvailable ? (
        <Card title="Entrada por biometria">
          <Text style={styles.muted}>Use a digital ou biometria cadastrada no aparelho para liberar sua sessão. Sua senha não é armazenada.</Text>
          <PrimaryButton variant="secondary" onPress={async () => {
            try {
              if (auth.biometricEnabled) {
                await auth.disableBiometrics();
                setNotice("Entrada por biometria desativada.");
              } else {
                await auth.enableBiometrics();
                setNotice("Entrada por biometria ativada. Ela será solicitada na próxima abertura.");
              }
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Não foi possível alterar a biometria.");
            }
          }}>{auth.biometricEnabled ? "Desativar biometria" : "Ativar entrada por biometria"}</PrimaryButton>
        </Card>
      ) : null}

      {auth.session ? (
        <Card title="Conta e sincronização">
          <Text style={styles.muted}>{syncLabel(api.syncStatus)}</Text>
          {api.migrationRequired ? <PrimaryButton onPress={() => void api.importLocalProgress()}>Mesclar progresso local</PrimaryButton> : null}
          <PrimaryButton variant="secondary" onPress={() => void api.syncNow()}>Sincronizar agora</PrimaryButton>
          <PrimaryButton variant="secondary" onPress={() => void auth.signOut()}>Sair</PrimaryButton>
          <Pressable onPress={() => Alert.alert("Excluir conta", "Os dados online serão excluídos. O progresso local será preservado.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir", style: "destructive", onPress: () => void auth.deleteAccount() }
          ])}><Text style={styles.danger}>Excluir conta</Text></Pressable>
        </Card>
      ) : (
        <Card title="Conta online"><AuthEntry showGuestAction={false} profileContext /></Card>
      )}
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
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
function Card({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{children}</View>;
}
function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}
function Choice({ title, note, selected, onPress }: { title: string; note?: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
    <View style={[styles.radio, selected && styles.radioSelected]} /><View style={styles.flex}><Text style={styles.choiceTitle}>{title}</Text>{note ? <Text style={styles.help}>{note}</Text> : null}</View>
  </Pressable>;
}
function Toggle({ title, note, value, onChange }: { title: string; note: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.toggle}><View style={styles.flex}><Text style={styles.choiceTitle}>{title}</Text><Text style={styles.help}>{note}</Text></View>
    <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.teal }} /></View>;
}
const styles = StyleSheet.create({
  companion:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.md,borderRadius:radius.lg,backgroundColor:"#e8f7f4",borderWidth:1,borderColor:"#bfe9df"},companionLumi:{width:82,height:76},companionCopy:{flex:1,gap:spacing.xs},companionTitle:{color:colors.navy,fontSize:17,fontWeight:"900"},
  eyebrow:{color:colors.tealDark,fontSize:12,fontWeight:"900",letterSpacing:1.5},title:{color:colors.navy,fontSize:30,fontWeight:"900"},muted:{color:colors.muted,fontSize:15,lineHeight:22},
  stats:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},stat:{width:"31%",minHeight:78,backgroundColor:colors.surface,borderRadius:radius.md,padding:spacing.sm,alignItems:"center",justifyContent:"center",borderColor:colors.border,borderWidth:1},
  statValue:{color:colors.navy,fontSize:19,fontWeight:"900"},statLabel:{color:colors.muted,fontSize:11,textAlign:"center"},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md},
  cardTitle:{color:colors.navy,fontSize:20,fontWeight:"900"},calendarSummary:{flexDirection:"row",justifyContent:"space-around",padding:spacing.md,borderRadius:radius.md,backgroundColor:colors.background},summaryValue:{color:colors.navy,fontSize:22,fontWeight:"900",textAlign:"center"},weekdays:{flexDirection:"row",justifyContent:"space-between"},weekday:{width:"13%",textAlign:"center",color:colors.muted,fontSize:11,fontWeight:"800"},calendar:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",rowGap:8},dayWrap:{width:"13%",alignItems:"center",gap:3},day:{width:34,height:34,borderRadius:8,alignItems:"center",justifyContent:"center",backgroundColor:"#edf1f3"},dayLow:{backgroundColor:"#bfe9df"},dayMedium:{backgroundColor:"#55c3ae"},dayHigh:{backgroundColor:colors.tealDark},dayNumber:{fontSize:11,color:colors.muted,fontWeight:"700"},dayNumberActive:{color:colors.surface},dayLabel:{fontSize:8,color:colors.muted,textTransform:"uppercase"},legend:{flexDirection:"row",alignItems:"center",justifyContent:"flex-end",gap:5},legendOff:{width:15,height:15,borderRadius:4,backgroundColor:"#edf1f3"},legendLow:{width:15,height:15,borderRadius:4,backgroundColor:"#bfe9df"},legendMedium:{width:15,height:15,borderRadius:4,backgroundColor:"#55c3ae"},legendHigh:{width:15,height:15,borderRadius:4,backgroundColor:colors.tealDark},help:{color:colors.muted,fontSize:12,lineHeight:18},choice:{minHeight:52,flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.md,borderRadius:radius.md,borderWidth:1,borderColor:colors.border},
  choiceSelected:{borderColor:colors.teal,backgroundColor:"#e8f7f4"},radio:{width:18,height:18,borderRadius:9,borderWidth:2,borderColor:colors.muted},radioSelected:{borderColor:colors.teal,backgroundColor:colors.teal},
  choiceTitle:{color:colors.navy,fontWeight:"800",fontSize:15},toggle:{minHeight:64,flexDirection:"row",alignItems:"center",gap:spacing.md},flex:{flex:1},danger:{color:colors.error,fontWeight:"800",textAlign:"center",padding:spacing.md},
  notice:{backgroundColor:"#e8f7f4",color:colors.tealDark,padding:spacing.md,borderRadius:radius.md},input:{minHeight:50,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,paddingHorizontal:spacing.md,color:colors.navy,fontSize:16,backgroundColor:colors.surface}
});
