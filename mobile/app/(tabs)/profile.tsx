import { useState, type ReactNode } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAILY_GOALS, KNOWLEDGE_LEVELS, STUDY_GOALS } from "../../../src/config/profile";
import { getLevelProgress } from "../../../src/domain/gamification";
import { toLocalDateKey } from "../../../src/domain/streak";
import { AuthEntry } from "../../components/AuthEntry";
import { LumiCharacter } from "../../components/LumiCharacter";
import { LumiTutorial } from "../../components/LumiTutorial";
import { ProfilePhotoEditor } from "../../components/ProfilePhotoEditor";
import { Icon, type IconName } from "../../components/navigation/Icons";
import { skinById } from "../../domain/lumiWallet";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useLumiWallet } from "../../hooks/useLumiWallet";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileLumi } from "../../providers/MobileLumiProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { exportMobileBackup, importMobileBackup } from "../../services/mobileBackup";
import type { Palette } from "../../theme/tokens";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";

type SheetId = "photo" | "goals" | "account" | "backup" | "login";

export default function ProfileScreen() {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const auth = useMobileAuth();
  const api = useMobileProgress();
  const lumiAccount = useMobileLumi();
  const wallet = useLumiWallet();
  const { progress } = api;
  const [sheet, setSheet] = useState<SheetId>();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [accountName, setAccountName] = useState(auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "");
  const [username, setUsername] = useState(auth.session?.user.user_metadata?.username ?? "");
  const [newPassword, setNewPassword] = useState("");

  const level = getLevelProgress(progress.xp);
  const displayName = auth.session?.user.user_metadata?.display_name ?? progress.profile.name ?? "Estudante";
  const handle = auth.session ? (auth.session.user.user_metadata?.username ? `@${auth.session.user.user_metadata.username}` : auth.session.user.email) : "Visitante · progresso neste aparelho";
  const accuracy = progress.attempts.length ? Math.round(progress.attempts.filter((item) => item.correct).length / progress.attempts.length * 100) : undefined;
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const activity = progress.activity[toLocalDateKey(date)];
    const xp = activity?.xp ?? 0;
    return { key: toLocalDateKey(date), xp, intensity: xp >= 100 ? 3 : xp >= 40 ? 2 : xp > 0 || (activity?.lessons ?? 0) > 0 ? 1 : 0 };
  });
  const activeDays = days.filter((day) => day.intensity > 0).length;
  const goalLabel = STUDY_GOALS.find((item) => item.id === progress.profile.goal)?.label;
  const dailyLabel = DAILY_GOALS.find((item) => item.xp === progress.profile.dailyGoal);
  const say = (message: string) => { setNotice(message); setTimeout(() => setNotice(""), 2600); };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
        {/* Identidade */}
        <View style={styles.identity}>
          <Pressable accessibilityRole="button" accessibilityLabel={auth.session ? "Trocar foto de perfil" : "Foto de perfil disponível com conta"} onPress={() => setSheet(auth.session ? "photo" : "login")} style={styles.avatar}>
            {lumiAccount.profilePhotoUrl ? <Image source={{ uri: lumiAccount.profilePhotoUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarInitial}>{displayName.slice(0, 1).toUpperCase()}</Text>}
            <View style={styles.avatarEdit}><Icon name="edit" size={12} color={trail.ctaText} strokeWidth={2.6} /></View>
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.handle} numberOfLines={1}>{handle}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelBadge}>Nível {level.level}</Text>
              <View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${Math.round(Math.min(1, level.xpIntoLevel / Math.max(1, level.xpNeeded)) * 100)}%` }]} /></View>
            </View>
            <Text style={styles.levelHint}>{Math.max(0, level.xpNeeded - level.xpIntoLevel)} XP para o nível {level.level + 1}</Text>
          </View>
        </View>

        {/* Números principais */}
        <View style={styles.stats}>
          <Stat icon="flame" color={trail.streak} value={String(progress.streak)} label="dias seguidos" />
          <Stat icon="star" color={trail.xp} value={String(progress.xp)} label="XP total" />
          <Stat icon="book" color={trail.accent} value={String(progress.completedLessonIds.length)} label="lições" />
          <Stat icon="check" color="#8fb8ff" value={accuracy === undefined ? "—" : `${accuracy}%`} label="acertos" />
        </View>

        {/* Lumi */}
        <Pressable accessibilityRole="button" accessibilityLabel={`Minha Lumi: ${skinById(wallet.equippedSkinId)?.name}, ${wallet.balance} moedas. Abrir loja`} onPress={() => router.push("/lumi-store")} style={({ pressed }) => [styles.lumiCard, pressed && styles.pressed]}>
          <LumiCharacter mood="proud" motion="encouraging" skinId={wallet.equippedSkinId} style={styles.lumi} accessibilityLabel="Sua Lumi com a skin equipada" />
          <View style={styles.flex}>
            <Text style={styles.cardEyebrow}>MINHA LUMI</Text>
            <Text style={styles.cardTitle}>{skinById(wallet.equippedSkinId)?.name ?? "Lumi Original"}</Text>
            <Text style={styles.coins}>◆ {wallet.balance} moedas</Text>
          </View>
          <View style={styles.shopButton}><Icon name="shop" size={18} color={trail.ctaText} /><Text style={styles.shopText}>Loja</Text></View>
        </Pressable>

        {/* Constância */}
        <View style={styles.card}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>Constância</Text><Text style={styles.cardMeta}>{activeDays} de 28 dias</Text></View>
          <View style={styles.heatmap}>
            {days.map((day) => <View key={day.key} accessibilityLabel={`${day.key}: ${day.xp} XP`} style={[styles.heatCell, day.intensity === 1 && styles.heat1, day.intensity === 2 && styles.heat2, day.intensity === 3 && styles.heat3]} />)}
          </View>
          <Text style={styles.cardMeta}>Últimas 4 semanas · quanto mais forte, mais XP no dia</Text>
        </View>

        {/* Configurações */}
        <Section title="Estudo">
          <Row icon="trail" title="Objetivo e meta diária" value={dailyLabel ? `${dailyLabel.xp} XP por dia` : undefined} detail={goalLabel} onPress={() => setSheet("goals")} />
          <Row icon="bell" title="Lembretes" onPress={() => router.push("/notification-settings")} />
        </Section>

        <Section title="Experiência">
          <View style={styles.row}>
            <View style={styles.rowIcon}><Icon name="settings" size={18} color={trail.accent} /></View>
            <Text style={[styles.rowTitle, styles.flex]}>Aparência</Text>
            <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel="Aparência">
              {(["system", "light", "dark"] as const).map((mode) => {
                const active = (progress.settings.themeMode ?? "system") === mode;
                return (
                  <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => api.updatePreferences({}, { themeMode: mode })} style={[styles.segmentButton, active && styles.segmentActive]}>
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{mode === "system" ? "Auto" : mode === "light" ? "Claro" : "Escuro"}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <SwitchRow icon="heart" title="Usar corações" value={progress.settings.heartsEnabled} onChange={(value) => api.updatePreferences({}, { heartsEnabled: value })} />
          <SwitchRow icon="play" title="Sons" value={Boolean(progress.settings.soundEnabled)} onChange={(value) => api.updatePreferences({}, { soundEnabled: value })} />
          <SwitchRow icon="memory" title="Vibração" value={Boolean(progress.settings.hapticsEnabled)} onChange={(value) => api.updatePreferences({}, { hapticsEnabled: value })} />
          <SwitchRow icon="settings" title="Reduzir movimento" value={Boolean(progress.settings.reduceMotionEnabled)} onChange={(value) => api.updatePreferences({}, { reduceMotionEnabled: value })} />
          <Row icon="play" title="Rever tutorial da Lumi" detail="Como funcionam trilha, lições e corações" onPress={() => setTutorialOpen(true)} />
        </Section>

        {auth.session ? (
          <Section title="Conta">
            <Row icon="user" title="Dados da conta" detail="Nome, usuário e senha" onPress={() => setSheet("account")} />
            <Row icon="cloud" title="Sincronização" value={syncLabel(api.syncStatus)} detail={api.lastSyncedAt ? `Última: ${new Date(api.lastSyncedAt).toLocaleString("pt-BR")}` : undefined}
              onPress={async () => { const ok = await api.syncNow(); say(ok ? "Progresso salvo na conta." : "Sem conexão agora. Seu progresso continua no aparelho."); }} />
            {api.migrationRequired ? <Row icon="cloud" title="Mesclar progresso deste aparelho" onPress={() => void api.importLocalProgress()} /> : null}
            {auth.biometricAvailable ? (
              <SwitchRow icon="lock" title="Entrar com biometria" value={auth.biometricEnabled} onChange={async (value) => {
                try { if (value) await auth.enableBiometrics(); else await auth.disableBiometrics(); say(value ? "Biometria ativada." : "Biometria desativada."); }
                catch (error) { say(error instanceof Error ? error.message : "Não foi possível alterar a biometria."); }
              }} />
            ) : null}
            <Row icon="copy" title="Cópia de segurança" detail="Exportar ou restaurar arquivo" onPress={() => setSheet("backup")} />
          </Section>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setSheet("login")} style={styles.loginCard}>
            <Icon name="cloud" size={26} color={trail.accent} />
            <View style={styles.flex}><Text style={styles.cardTitle}>Crie sua conta</Text><Text style={styles.cardMeta}>Guarde seu progresso e continue em outros aparelhos.</Text></View>
            <Icon name="chevronRight" size={20} color={trail.textMuted} />
          </Pressable>
        )}

        {!auth.session ? (
          <Section title="Dados">
            <Row icon="copy" title="Cópia de segurança" detail="Exportar ou restaurar arquivo" onPress={() => setSheet("backup")} />
          </Section>
        ) : null}

        {auth.session ? (
          <View style={styles.footer}>
            <Pressable accessibilityRole="button" onPress={() => void auth.signOut()} style={styles.signOut}><Icon name="logout" size={18} color={trail.text} /><Text style={styles.signOutText}>Sair da conta</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => Alert.alert("Excluir conta", "Os dados online serão excluídos. O progresso deste aparelho será preservado.", [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", style: "destructive", onPress: () => void auth.deleteAccount() }
            ])}><Text style={styles.danger}>Excluir conta</Text></Pressable>
          </View>
        ) : null}
      </ScrollView>

      <LumiTutorial visible={tutorialOpen} onDone={() => setTutorialOpen(false)} />

      {notice ? <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite"><Text style={styles.toastText}>{notice}</Text></View> : null}

      <BottomSheet visible={sheet === "photo"} title="Foto de perfil" onClose={() => setSheet(undefined)}><ProfilePhotoEditor /></BottomSheet>

      <BottomSheet visible={sheet === "goals"} title="Objetivo e meta" onClose={() => setSheet(undefined)}>
        <Text style={styles.sheetLabel}>Meta diária</Text>
        {DAILY_GOALS.map((item) => <Choice key={item.xp} title={`${item.title} · ${item.xp} XP`} note={item.note} selected={progress.profile.dailyGoal === item.xp} onPress={() => api.updatePreferences({ dailyGoal: item.xp })} />)}
        <Text style={styles.sheetLabel}>Objetivo</Text>
        {STUDY_GOALS.map((item) => <Choice key={item.id} title={item.label} selected={progress.profile.goal === item.id} onPress={() => api.updatePreferences({ goal: item.id })} />)}
        <Text style={styles.sheetLabel}>Nível de conhecimento</Text>
        {KNOWLEDGE_LEVELS.map((item) => <Choice key={item.id} title={item.title} note={item.note} selected={progress.profile.knowledgeLevel === item.id} onPress={() => api.updatePreferences({ knowledgeLevel: item.id })} />)}
      </BottomSheet>

      <BottomSheet visible={sheet === "account"} title="Dados da conta" onClose={() => setSheet(undefined)}>
        <Field label="Nome" value={accountName} onChange={setAccountName} placeholder="Seu nome" />
        <Field label="Nome de usuário" value={username} onChange={setUsername} placeholder="nome_de_usuario" autoCapitalize="none" />
        <Field label="Nova senha (opcional)" value={newPassword} onChange={setNewPassword} placeholder="••••••••" secure />
        <Pressable accessibilityRole="button" style={styles.primary} onPress={async () => {
          try {
            await auth.updateProfile({ displayName: accountName.trim() || undefined, username: username.trim() || undefined, password: newPassword || undefined });
            api.updatePreferences({ name: accountName.trim() || undefined });
            setNewPassword(""); setSheet(undefined); say("Dados da conta atualizados.");
          } catch (error) { say(error instanceof Error ? error.message : "Não foi possível atualizar a conta."); }
        }}><Text style={styles.primaryText}>Salvar</Text></Pressable>
      </BottomSheet>

      <BottomSheet visible={sheet === "backup"} title="Cópia de segurança" onClose={() => setSheet(undefined)}>
        <Text style={styles.sheetText}>{auth.session ? "Seu progresso já é salvo na conta. O arquivo é só uma cópia extra." : "Sem conta, o progresso fica só neste aparelho. Exporte uma cópia para não perdê-lo."}</Text>
        <Pressable accessibilityRole="button" style={styles.primary} onPress={async () => {
          try { await exportMobileBackup(progress); say("Cópia pronta para compartilhar."); } catch (error) { say(error instanceof Error ? error.message : "Não foi possível exportar."); }
        }}><Text style={styles.primaryText}>Exportar cópia</Text></Pressable>
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={async () => {
          try { const restored = await importMobileBackup(progress); if (restored) { api.replaceProgress(restored); setSheet(undefined); say("Cópia restaurada."); } }
          catch (error) { say(error instanceof Error ? error.message : "Arquivo inválido."); }
        }}><Text style={styles.secondaryText}>Restaurar de um arquivo</Text></Pressable>
      </BottomSheet>

      <BottomSheet visible={sheet === "login"} title="Conta online" onClose={() => setSheet(undefined)}>
        <AuthEntry showGuestAction={false} profileContext />
      </BottomSheet>
    </View>
  );
}

function syncLabel(status: string) {
  if (status === "syncing") return "Salvando…";
  if (status === "synced") return "Em dia";
  if (status === "offline") return "Aguardando internet";
  if (status === "error") return "Tentar de novo";
  return "Só neste aparelho";
}

function Stat({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Icon name={icon} size={18} color={color} strokeWidth={2.6} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionBody}>{children}</View></View>;
}

function Row({ icon, title, value, detail, onPress }: { icon: IconName; title: string; value?: string; detail?: string; onPress: () => void }) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={[title, value, detail].filter(Boolean).join(". ")} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.rowIcon}><Icon name={icon} size={18} color={trail.accent} /></View>
      <View style={styles.flex}><Text style={styles.rowTitle}>{title}</Text>{detail ? <Text style={styles.rowDetail} numberOfLines={1}>{detail}</Text> : null}</View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Icon name="chevronRight" size={18} color={trail.textMuted} />
    </Pressable>
  );
}

function SwitchRow({ icon, title, value, onChange }: { icon: IconName; title: string; value: boolean; onChange: (value: boolean) => void }) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}><Icon name={icon} size={18} color={trail.accent} /></View>
      <Text style={[styles.rowTitle, styles.flex]}>{title}</Text>
      <Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ true: trail.cta, false: trail.line }} thumbColor="#ffffff" />
    </View>
  );
}

function Choice({ title, note, selected, onPress }: { title: string; note?: string; selected: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
      <View style={styles.flex}><Text style={styles.choiceTitle}>{title}</Text>{note ? <Text style={styles.choiceNote}>{note}</Text> : null}</View>
      {selected ? <Icon name="check" size={20} color="#0b7f75" strokeWidth={3} /> : null}
    </Pressable>
  );
}

function Field({ label, value, onChange, placeholder, secure, autoCapitalize }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; secure?: boolean; autoCapitalize?: "none" }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8a97a6" secureTextEntry={secure} autoCapitalize={autoCapitalize} style={styles.input} />
    </View>
  );
}

function BottomSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handleBar} />
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} hitSlop={10}><Icon name="close" size={22} color="#5d6b7a" /></Pressable></View>
          <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: trail.ground },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  identity: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 8 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", backgroundColor: trail.activeTabBg, borderWidth: 3, borderColor: trail.accent },
  avatarImage: { width: "100%", height: "100%", borderRadius: 42 },
  avatarInitial: { color: trail.text, fontSize: 34, fontWeight: "900" },
  avatarEdit: { position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: trail.accent, borderWidth: 2, borderColor: trail.ground },
  name: { color: trail.text, fontSize: 24, fontWeight: "900" },
  handle: { color: trail.textMuted, fontSize: 13, fontWeight: "700", marginTop: 2 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  levelBadge: { color: trail.ctaText, backgroundColor: trail.xp, fontSize: 11, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  levelTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: trail.card, overflow: "hidden" },
  levelFill: { height: "100%", borderRadius: 4, backgroundColor: trail.xp },
  levelHint: { color: trail.textMuted, fontSize: 11, fontWeight: "700", marginTop: 4 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 12, borderRadius: 16, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  statValue: { color: trail.text, fontSize: 18, fontWeight: "900" },
  statLabel: { color: trail.textMuted, fontSize: 11, fontWeight: "700" },
  lumiCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 20, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  lumi: { width: 72, height: 72 },
  cardEyebrow: { color: trail.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  cardTitle: { color: trail.text, fontSize: 17, fontWeight: "900" },
  cardMeta: { color: trail.textMuted, fontSize: 12, fontWeight: "700" },
  coins: { color: trail.xp, fontSize: 14, fontWeight: "900", marginTop: 2 },
  shopButton: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 12, backgroundColor: trail.cta },
  shopText: { color: trail.ctaText, fontWeight: "900" },
  card: { gap: 10, padding: 16, borderRadius: 20, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  cardHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  heatmap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  heatCell: { width: "12.2%", aspectRatio: 1, borderRadius: 6, backgroundColor: trail.heat[0] },
  heat1: { backgroundColor: trail.heat[1] },
  heat2: { backgroundColor: "#18a999" },
  heat3: { backgroundColor: "#7fe3d5" },
  section: { gap: 8, marginTop: 4 },
  sectionTitle: { color: trail.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  sectionBody: { borderRadius: 18, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: trail.divider },
  rowPressed: { backgroundColor: trail.activeTabBg },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: trail.activeTabBg },
  rowTitle: { color: trail.text, fontSize: 15, fontWeight: "800" },
  rowDetail: { color: trail.textMuted, fontSize: 12, marginTop: 1 },
  rowValue: { color: trail.textMuted, fontSize: 13, fontWeight: "700" },
  segment: { flexDirection: "row", padding: 3, borderRadius: 12, backgroundColor: trail.ground },
  segmentButton: { minHeight: 34, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  segmentActive: { backgroundColor: trail.cta },
  segmentText: { color: trail.textMuted, fontSize: 12, fontWeight: "800" },
  segmentTextActive: { color: trail.ctaText },
  loginCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, backgroundColor: trail.activeTabBg, borderWidth: 1, borderColor: trail.accent },
  footer: { alignItems: "center", gap: 16, marginTop: 10 },
  signOut: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "stretch", minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: trail.line },
  signOutText: { color: trail.text, fontWeight: "900" },
  danger: { color: trail.heartText, fontWeight: "800", paddingVertical: 8 },
  toast: { position: "absolute", bottom: 20, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: trail.sheet },
  toastText: { color: "#10243e", fontWeight: "800" },
  backdrop: { flex: 1, backgroundColor: "rgba(4,12,22,0.6)" },
  sheet: { maxHeight: "88%", backgroundColor: trail.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handleBar: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: "#c9d5df", marginTop: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12 },
  sheetTitle: { color: "#10243e", fontSize: 20, fontWeight: "900" },
  sheetBody: { padding: 20, gap: 10 },
  sheetLabel: { color: "#5d6b7a", fontSize: 12, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", marginTop: 8 },
  sheetText: { color: "#3b4f64", fontSize: 14, lineHeight: 20 },
  choice: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#dde5ec", backgroundColor: "#ffffff" },
  choiceSelected: { borderColor: "#0b7f75", backgroundColor: "#eef8f6" },
  choiceTitle: { color: "#10243e", fontSize: 15, fontWeight: "800" },
  choiceNote: { color: "#5d6b7a", fontSize: 12, marginTop: 2 },
  field: { gap: 6 },
  fieldLabel: { color: "#3b4f64", fontSize: 13, fontWeight: "800" },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: "#dde5ec", backgroundColor: "#ffffff", paddingHorizontal: 12, fontSize: 16, color: "#10243e" },
  primary: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: trail.cta, marginTop: 6 },
  primaryText: { color: trail.ctaText, fontSize: 16, fontWeight: "900" },
  secondary: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#10243e" },
  secondaryText: { color: "#10243e", fontSize: 15, fontWeight: "900" }
});
