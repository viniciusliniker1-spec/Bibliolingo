import { useMemo, useState } from "react";
import { PushButton } from "../../components/PushButton";
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lumiMoodAssets } from "../../assets/lumiMoodAssets";
import { AuthEntry } from "../../components/AuthEntry";
import { Icon } from "../../components/navigation/Icons";
import { Enter, GrowBar, Pop } from "../../components/motion";
import { LumiAvatar } from "../../components/social/LumiAvatar";
import { checkHandle, formatXp, medalFor, sanitizeHandle, socialErrorMessage, suggestHandle, weekCountdown, type LeaderboardEntry, type SocialScope } from "../../domain/social";
import { useLumiWallet } from "../../hooks/useLumiWallet";
import { useSocial } from "../../hooks/useSocial";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

/** Ranking da semana: corrida de XP entre os alunos, com amigos e perfis. */
export default function SocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const [scope, setScope] = useState<SocialScope>("global");
  const social = useSocial(scope);
  const [loginOpen, setLoginOpen] = useState(false);

  // A minha linha usa a skin que está no aparelho, sem esperar a sincronização com o servidor.
  const wallet = useLumiWallet();
  const entries = useMemo(() => (social.board?.entries ?? []).map((entry) => (entry.isMe ? { ...entry, skinId: wallet.equippedSkinId } : entry)), [social.board, wallet.equippedSkinId]);
  const countdown = social.board ? weekCountdown(social.board.weekEndsAt) : undefined;
  const me = entries.find((entry) => entry.isMe);
  const podium = scope === "global" ? entries.filter((entry) => entry.rank <= 3) : [];
  const rest = entries.filter((entry) => !podium.includes(entry));
  const hero = scope === "global" && me && me.rank <= 3 ? "trofeu" : me && me.weeklyXp > 0 ? "progresso" : "lupa";

  const defaultHandle = useMemo(() => suggestHandle(
    auth.session?.user.user_metadata?.username as string | undefined,
    auth.session?.user.user_metadata?.display_name as string | undefined,
    progress.profile.name,
    auth.session?.user.email
  ), [auth.session, progress.profile.name]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{
        title: "Ranking",
        headerRight: () => social.status === "ready" ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Buscar alunos" onPress={() => router.push("/social/search")} hitSlop={10} style={styles.headerButton}>
            <Icon name="search" size={22} color={palette.text} />
          </Pressable>
        ) : null
      }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={social.status === "ready" ? <RefreshControl refreshing={social.refreshing} onRefresh={() => void social.reload()} tintColor={palette.accent} /> : undefined}
      >
        {social.status === "loading" ? <View style={styles.center}><ActivityIndicator color={palette.accent} size="large" /></View> : null}

        {social.status === "no-account" ? (
          <Notice art="lupa" title="Conta online indisponível" text="Esta versão do app não está conectada ao servidor, então o ranking não funciona." styles={styles} />
        ) : null}

        {social.status === "unavailable" ? (
          <Notice art="sono" title="Ranking chegando em breve" text="O servidor ainda está sendo preparado para o ranking. Tente novamente mais tarde." styles={styles} />
        ) : null}

        {social.status === "error" ? (
          <Notice art="chuva" title="Não deu para carregar" text={social.message || "Tente de novo em instantes."} action="Tentar de novo" onAction={() => void social.reload()} styles={styles} />
        ) : null}

        {social.status === "guest" ? (
          <>
            <Notice art="lupa" title="Dispute com outros alunos" text="Crie uma conta gratuita para entrar no ranking semanal, seguir amigos e ver o progresso deles." action="Entrar ou criar conta" onAction={() => setLoginOpen(true)} styles={styles} />
            <PrivacyNote styles={styles} />
          </>
        ) : null}

        {social.status === "not-joined" ? <JoinCard defaultHandle={defaultHandle} onJoin={social.join} styles={styles} /> : null}

        {social.status === "ready" ? (
          <>
            <View style={styles.hero}>
              <Image source={lumiMoodAssets[hero]} style={styles.heroLumi} contentFit="contain" />
              <View style={styles.flex}>
                <Text style={styles.eyebrow}>LIGA DA SEMANA</Text>
                <Text style={styles.heroTitle}>{me ? (scope === "friends" ? `${me.rank}º entre amigos` : me.rank <= 3 ? `${medalFor(me.rank)} ${me.rank}º lugar!` : `${me.rank}º lugar`) : "Ranking"}</Text>
                {countdown ? (
                  <View style={[styles.timer, countdown.ending && styles.timerEnding]}>
                    <Icon name="bell" size={13} color={countdown.ending ? "#ffffff" : palette.textMuted} />
                    <Text style={[styles.timerText, countdown.ending && { color: "#ffffff" }]}>{countdown.over ? countdown.label : `Termina em ${countdown.label}`}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {social.myStatus ? (
              <View style={[styles.status, social.myStatus.tone === "lead" && styles.statusLead]}>
                <Text style={styles.statusText}>{social.myStatus.text}</Text>
              </View>
            ) : null}

            <View style={styles.segment} accessibilityRole="tablist">
              {([["global", "Geral"], ["friends", "Amigos"]] as const).map(([id, label]) => (
                <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: scope === id }} onPress={() => setScope(id)} style={[styles.segmentItem, scope === id && styles.segmentActive]}>
                  <Text style={[styles.segmentText, scope === id && styles.segmentTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {podium.length >= 2 ? <Podium entries={podium} onOpen={(entry) => router.push({ pathname: "/social/[id]", params: { id: entry.userId } })} styles={styles} /> : null}

            <View style={styles.list}>
              {(podium.length >= 2 ? rest : entries).map((entry, index, all) => (
                <Enter key={entry.userId} index={index}><Row entry={entry} last={index === all.length - 1} onPress={() => router.push({ pathname: "/social/[id]", params: { id: entry.userId } })} styles={styles} /></Enter>
              ))}
            </View>

            {scope === "friends" && entries.length <= 1 ? (
              <Pressable accessibilityRole="button" onPress={() => router.push("/social/search")} style={({ pressed }) => [styles.emptyFriends, pressed && { opacity: 0.88 }]}>
                <Icon name="plus" size={22} color={palette.accent} />
                <View style={styles.flex}>
                  <Text style={styles.rowName}>Siga amigos para competir</Text>
                  <Text style={styles.rowMeta}>Busque alunos pelo @usuário ou pelo nome.</Text>
                </View>
              </Pressable>
            ) : null}

            <PushButton accessibilityRole="button" onPress={() => router.push("/social/search")} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
              <Icon name="search" size={18} color={palette.ctaText} />
              <Text style={styles.ctaText}>Buscar alunos</Text>
            </PushButton>
            <Pressable accessibilityRole="button" onPress={() => void social.leave()} style={styles.leave}>
              <Text style={styles.leaveText}>Sair do ranking</Text>
            </Pressable>
            <Text style={styles.footnote}>A semana vai de segunda a domingo (horário de Brasília). O ranking usa o XP ganho em lições e revisões.</Text>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={loginOpen && !auth.session} animationType="slide" transparent onRequestClose={() => setLoginOpen(false)} statusBarTranslucent>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Conta online</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setLoginOpen(false)} hitSlop={10}><Icon name="close" size={22} color={palette.text} /></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled"><AuthEntry showGuestAction={false} profileContext /></ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function Notice({ art, title, text, action, onAction, styles }: { art: keyof typeof lumiMoodAssets; title: string; text: string; action?: string; onAction?: () => void; styles: Styles }) {
  return (
    <View style={styles.notice}>
      <Image source={lumiMoodAssets[art]} style={styles.noticeLumi} contentFit="contain" />
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeText}>{text}</Text>
      {action ? <PushButton accessibilityRole="button" onPress={onAction} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}><Text style={styles.ctaText}>{action}</Text></PushButton> : null}
    </View>
  );
}

function PrivacyNote({ styles }: { styles: Styles }) {
  return (
    <View style={styles.privacy}>
      <Text style={styles.privacyTitle}>O que os outros alunos veem</Text>
      <Text style={styles.privacyText}>• Seu @usuário e primeiro nome{"\n"}• A skin da sua Lumi{"\n"}• XP da semana e total, ofensiva e lições concluídas{"\n"}Nada de e-mail, foto ou conversas. Você escolhe entrar e pode sair quando quiser.</Text>
    </View>
  );
}

function JoinCard({ defaultHandle, onJoin, styles }: { defaultHandle: string; onJoin: (handle: string) => Promise<void>; styles: Styles }) {
  const palette = usePalette();
  const [handle, setHandle] = useState(defaultHandle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const check = checkHandle(handle);
  const submit = async () => {
    if (check !== "ok" || busy) return;
    setBusy(true); setError("");
    try { await onJoin(handle.trim().toLowerCase()); } catch (failure) { setError(socialErrorMessage(failure)); } finally { setBusy(false); }
  };
  return (
    <>
      <View style={styles.notice}>
        <Image source={lumiMoodAssets.trofeu} style={styles.noticeLumi} contentFit="contain" />
        <Text style={styles.noticeTitle}>Entre no ranking da semana</Text>
        <Text style={styles.noticeText}>Dispute o topo com outros alunos, siga amigos e acompanhe o progresso deles.</Text>
        <Text style={styles.label}>Escolha seu @usuário</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.at}>@</Text>
          <TextInput
            accessibilityLabel="Seu @usuário"
            value={handle}
            onChangeText={(value) => { setHandle(sanitizeHandle(value)); setError(""); }}
            autoCapitalize="none" autoCorrect={false} maxLength={20} placeholder="seu_usuario" placeholderTextColor={palette.textMuted}
            onSubmitEditing={() => void submit()} style={styles.input}
          />
        </View>
        <Text style={[styles.hint, (error || (handle.length > 0 && check !== "ok")) && styles.hintError]}>
          {error || (handle.length > 0 && check !== "ok" ? "Use de 3 a 20 letras minúsculas, números ou “_”." : "Letras minúsculas, números e “_”. Dá para mudar depois.")}
        </Text>
        <PushButton accessibilityRole="button" accessibilityState={{ disabled: check !== "ok" || busy }} disabled={check !== "ok" || busy} onPress={() => void submit()} style={({ pressed }) => [styles.cta, (check !== "ok" || busy) && styles.ctaOff, pressed && styles.ctaPressed]}>
          {busy ? <ActivityIndicator color={palette.ctaText} /> : <Text style={styles.ctaText}>Entrar no ranking</Text>}
        </PushButton>
      </View>
      <PrivacyNote styles={styles} />
    </>
  );
}

function Podium({ entries, onOpen, styles }: { entries: LeaderboardEntry[]; onOpen: (entry: LeaderboardEntry) => void; styles: Styles }) {
  const palette = usePalette();
  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));
  const slots = [2, 1, 3].map((rank) => byRank.get(rank));
  const heights: Record<number, number> = { 1: 96, 2: 70, 3: 52 };
  const rings: Record<number, string> = { 1: "#f2b84b", 2: "#aebccb", 3: "#c98a5b" };
  return (
    <View style={styles.podium}>
      {slots.map((entry, index) => entry ? (
        <Pressable key={entry.userId} accessibilityRole="button" accessibilityLabel={`${entry.rank}º lugar, @${entry.handle}, ${entry.weeklyXp} XP`} onPress={() => onOpen(entry)} style={styles.podiumSlot}>
          <Text style={styles.podiumMedal}>{medalFor(entry.rank)}</Text>
          <Pop delay={entry.rank === 1 ? 520 : entry.rank === 2 ? 360 : 220}><LumiAvatar skinId={entry.skinId} size={entry.rank === 1 ? 64 : 52} ring={rings[entry.rank]} /></Pop>
          <Text style={[styles.podiumName, entry.isMe && { color: palette.accent }]} numberOfLines={1}>{entry.isMe ? "Você" : `@${entry.handle}`}</Text>
          <Text style={styles.podiumXp}>{formatXp(entry.weeklyXp)} XP</Text>
          <View style={[styles.podiumColumn, { height: heights[entry.rank] }]}>
            <GrowBar delay={entry.rank === 1 ? 420 : entry.rank === 2 ? 260 : 120} style={[styles.podiumBase, { backgroundColor: rings[entry.rank] + "55", borderColor: rings[entry.rank] }, { height: "100%" }]} />
            <Text style={styles.podiumRank}>{entry.rank}</Text>
          </View>
        </Pressable>
      ) : <View key={index} style={styles.podiumSlot} />)}
    </View>
  );
}

function Row({ entry, last, onPress, styles }: { entry: LeaderboardEntry; last: boolean; onPress: () => void; styles: Styles }) {
  const palette = usePalette();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${entry.rank}º lugar, ${entry.name}, @${entry.handle}, ${entry.weeklyXp} XP esta semana${entry.isMe ? ", você" : ""}`} onPress={onPress}
      style={({ pressed }) => [styles.row, entry.isMe && styles.rowMe, !last && styles.rowDivider, pressed && { opacity: 0.85 }]}>
      <Text style={styles.rank}>{medalFor(entry.rank) ?? entry.rank}</Text>
      <LumiAvatar skinId={entry.skinId} size={42} ring={entry.isMe ? palette.accent : undefined} />
      <View style={styles.flex}>
        <Text style={styles.rowName} numberOfLines={1}>{entry.isMe ? "Você" : entry.name}{entry.isFollowing ? "  ✓" : ""}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>@{entry.handle}{entry.streak > 0 ? `  ·  🔥 ${entry.streak}` : ""}</Text>
      </View>
      <View style={styles.xpBox}>
        <Text style={styles.xpValue}>{formatXp(entry.weeklyXp)}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  center: { paddingVertical: 60, alignItems: "center" },
  headerButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  heroLumi: { width: 92, height: 92 },
  eyebrow: { color: p.xp, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  heroTitle: { color: p.text, fontSize: 26, fontWeight: "900" },
  timer: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: p.ground },
  timerEnding: { backgroundColor: p.heart },
  timerText: { color: p.textMuted, fontSize: 12, fontWeight: "900" },
  status: { padding: 12, borderRadius: 16, backgroundColor: p.activeTabBg },
  statusLead: { backgroundColor: p.goldSoft },
  statusText: { color: p.text, fontSize: 14, fontWeight: "800", lineHeight: 20 },
  segment: { flexDirection: "row", padding: 4, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  segmentItem: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  segmentActive: { backgroundColor: p.cta },
  segmentText: { color: p.textMuted, fontSize: 14, fontWeight: "900" },
  segmentTextActive: { color: p.ctaText },
  podium: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingTop: 4 },
  podiumSlot: { flex: 1, alignItems: "center", gap: 3 },
  podiumMedal: { fontSize: 22 },
  podiumName: { color: p.text, fontSize: 13, fontWeight: "900", maxWidth: "100%" },
  podiumXp: { color: p.textMuted, fontSize: 12, fontWeight: "800" },
  podiumColumn: { alignSelf: "stretch", justifyContent: "flex-end", alignItems: "center", marginTop: 4 },
  podiumBase: { width: "100%", borderTopLeftRadius: 14, borderTopRightRadius: 14, borderWidth: 2, borderBottomWidth: 0 },
  podiumRank: { position: "absolute", bottom: 8, color: p.text, fontSize: 26, fontWeight: "900" },
  list: { borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  rowMe: { backgroundColor: p.activeTabBg },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: p.divider },
  rank: { width: 30, textAlign: "center", color: p.textMuted, fontSize: 16, fontWeight: "900" },
  rowName: { color: p.text, fontSize: 15, fontWeight: "900" },
  rowMeta: { color: p.textMuted, fontSize: 12, fontWeight: "700" },
  xpBox: { alignItems: "flex-end", minWidth: 52 },
  xpValue: { color: p.text, fontSize: 17, fontWeight: "900" },
  xpLabel: { color: p.textMuted, fontSize: 10, fontWeight: "900" },
  emptyFriends: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed", borderColor: p.accent, backgroundColor: p.card },
  cta: { minHeight: 52, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, borderRadius: 16, backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow, alignSelf: "stretch" },
  ctaOff: { opacity: 0.5 },
  ctaPressed: { opacity: 0.88, transform: [{ translateY: 2 }] },
  ctaText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  leave: { alignItems: "center", paddingVertical: 8 },
  leaveText: { color: p.textMuted, fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
  footnote: { color: p.textMuted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  notice: { alignItems: "center", gap: 8, padding: 18, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  noticeLumi: { width: 120, height: 120 },
  noticeTitle: { color: p.text, fontSize: 20, fontWeight: "900", textAlign: "center" },
  noticeText: { color: p.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  label: { alignSelf: "stretch", color: p.text, fontSize: 13, fontWeight: "900", marginTop: 6 },
  inputWrap: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, borderColor: p.line, backgroundColor: p.ground },
  at: { color: p.accent, fontSize: 18, fontWeight: "900" },
  input: { flex: 1, minHeight: 50, color: p.text, fontSize: 17, fontWeight: "800" },
  hint: { alignSelf: "stretch", color: p.textMuted, fontSize: 12, fontWeight: "700" },
  hintError: { color: p.error },
  privacy: { gap: 4, padding: 14, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  privacyTitle: { color: p.text, fontSize: 14, fontWeight: "900" },
  privacyText: { color: p.textMuted, fontSize: 13, lineHeight: 20 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { maxHeight: "92%", padding: 16, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: p.sheet },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { color: p.sheetText, fontSize: 18, fontWeight: "900" }
});
