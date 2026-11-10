import { useCallback, useEffect, useState } from "react";
import { GrowBar } from "../../components/motion";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../components/navigation/Icons";
import { LumiAvatar } from "../../components/social/LumiAvatar";
import { formatXp, levelOf, medalFor, socialErrorMessage, type SocialProfile } from "../../domain/social";
import { useLumiWallet } from "../../hooks/useLumiWallet";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { followStudent, fetchSocialProfile, reportStudent, unfollowStudent } from "../../services/socialRemote";
import type { Palette } from "../../theme/tokens";

const REASONS = ["Nome ou @usuário ofensivo", "Comportamento inadequado", "Outro motivo"];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Perfil de um aluno: nível, ofensiva, XP da semana e os últimos 7 dias. */
export default function StudentProfileScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { session } = useMobileAuth();
  const params = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<SocialProfile | null>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!session || !params.id) return;
    try { setProfile((await fetchSocialProfile(session, params.id)) ?? null); setError(""); } catch (failure) { setError(socialErrorMessage(failure)); }
  }, [session, params.id]);
  useEffect(() => { void load(); }, [load]);

  const say = (text: string) => { setNotice(text); setTimeout(() => setNotice(""), 2600); };
  const toggleFollow = async () => {
    if (!session || !profile || busy) return;
    setBusy(true);
    try {
      if (profile.isFollowing) await unfollowStudent(session, profile.userId); else await followStudent(session, profile.userId);
      await load();
    } catch (failure) { say(socialErrorMessage(failure)); } finally { setBusy(false); }
  };
  const report = async (reason: string) => {
    setReporting(false);
    if (!session || !profile) return;
    try { await reportStudent(session, profile.userId, reason); say("Denúncia enviada. Obrigado por cuidar da comunidade."); } catch (failure) { say(socialErrorMessage(failure)); }
  };

  const wallet = useLumiWallet();
  const level = profile ? levelOf(profile.totalXp) : 1;
  const maxDay = Math.max(50, ...(profile?.days.map((day) => day.xp) ?? [0]));

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: profile ? `@${profile.handle}` : "Aluno" }} />
      {profile === undefined && !error ? <View style={styles.center}><ActivityIndicator color={palette.accent} size="large" /></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {profile === null ? <Text style={styles.error}>Este aluno não está disponível no ranking.</Text> : null}

      {profile ? (
        <>
          <View style={styles.hero}>
            <LumiAvatar skinId={profile.isMe ? wallet.equippedSkinId : profile.skinId} size={96} ring={palette.accent} />
            <Text style={styles.name}>{profile.isMe ? `${profile.name} (você)` : profile.name}</Text>
            <Text style={styles.handle}>@{profile.handle}</Text>
            <View style={styles.badges}>
              <View style={styles.badge}><Text style={styles.badgeText}>Nível {level}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>{profile.followers} {profile.followers === 1 ? "seguidor" : "seguidores"}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>Segue {profile.following}</Text></View>
            </View>
            {!profile.isMe ? (
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void toggleFollow()} style={({ pressed }) => [styles.follow, profile.isFollowing && styles.following, pressed && { opacity: 0.88 }]}>
                {busy ? <ActivityIndicator color={profile.isFollowing ? palette.text : palette.ctaText} /> : (
                  <>
                    <Icon name={profile.isFollowing ? "check" : "plus"} size={18} color={profile.isFollowing ? palette.text : palette.ctaText} />
                    <Text style={[styles.followText, profile.isFollowing && { color: palette.text }]}>{profile.isFollowing ? "Seguindo" : "Seguir"}</Text>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>

          <View style={styles.stats}>
            <Stat label="ofensiva" value={`🔥 ${profile.streak}`} styles={styles} />
            <Stat label="XP total" value={formatXp(profile.totalXp)} styles={styles} />
            <Stat label="lições" value={String(profile.lessons)} styles={styles} />
            <Stat label="recorde" value={`${profile.longestStreak} d`} styles={styles} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Esta semana</Text>
              <Text style={styles.cardMeta}>{profile.weekRank ? `${medalFor(profile.weekRank) ?? ""} ${profile.weekRank}º lugar` : "Fora do ranking"}</Text>
            </View>
            <Text style={styles.weekXp}>{formatXp(profile.weekXp)} <Text style={styles.weekUnit}>XP</Text></Text>
            <Text style={styles.cardMeta}>Últimos 7 dias</Text>
            <View style={styles.bars}>
              {profile.days.map((day) => {
                const date = new Date(day.day + "T12:00:00");
                return (
                  <View key={day.day} style={styles.barCol} accessible accessibilityLabel={`${date.toLocaleDateString("pt-BR", { weekday: "long" })}: ${day.xp} XP`}>
                    <Text style={styles.barXp}>{day.xp > 0 ? day.xp : ""}</Text>
                    <View style={styles.barTrack}><GrowBar style={[styles.barFill, { height: `${Math.max(day.xp > 0 ? 8 : 0, Math.round((day.xp / maxDay) * 100))}%` }]} /></View>
                    <Text style={styles.barDay}>{WEEKDAYS[date.getDay()]}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {!profile.isMe ? (
            <Pressable accessibilityRole="button" onPress={() => setReporting(true)} style={styles.reportLink}>
              <Text style={styles.reportText}>Denunciar este perfil</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {notice ? <Text style={styles.toast}>{notice}</Text> : null}

      <Modal visible={reporting} transparent animationType="fade" onRequestClose={() => setReporting(false)} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => setReporting(false)} accessibilityLabel="Fechar">
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Qual é o problema?</Text>
            {REASONS.map((reason) => (
              <Pressable key={reason} accessibilityRole="button" onPress={() => void report(reason)} style={({ pressed }) => [styles.reason, pressed && { opacity: 0.8 }]}>
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={() => setReporting(false)} style={styles.cancel}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Stat({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof makeStyles> }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 14 },
  center: { paddingVertical: 60, alignItems: "center" },
  error: { color: p.textMuted, fontSize: 15, textAlign: "center", paddingVertical: 40 },
  hero: { alignItems: "center", gap: 6, padding: 18, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  name: { color: p.text, fontSize: 22, fontWeight: "900", marginTop: 6 },
  handle: { color: p.accent, fontSize: 15, fontWeight: "900" },
  badges: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: p.ground },
  badgeText: { color: p.textMuted, fontSize: 12, fontWeight: "900" },
  follow: { minHeight: 48, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", alignSelf: "stretch", marginTop: 8, borderRadius: 16, backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  following: { backgroundColor: p.card, borderWidth: 1.5, borderColor: p.line, borderBottomWidth: 1.5 },
  followText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  statValue: { color: p.text, fontSize: 17, fontWeight: "900" },
  statLabel: { color: p.textMuted, fontSize: 11, fontWeight: "800" },
  card: { gap: 4, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: p.text, fontSize: 16, fontWeight: "900" },
  cardMeta: { color: p.textMuted, fontSize: 13, fontWeight: "800" },
  weekXp: { color: p.xp, fontSize: 34, fontWeight: "900" },
  weekUnit: { fontSize: 16 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 130, marginTop: 6 },
  barCol: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 3 },
  barXp: { color: p.textMuted, fontSize: 10, fontWeight: "800", height: 14 },
  barTrack: { width: "100%", flex: 1, justifyContent: "flex-end", borderRadius: 8, backgroundColor: p.ground, overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 8, backgroundColor: p.xp },
  barDay: { color: p.textMuted, fontSize: 12, fontWeight: "900" },
  reportLink: { alignItems: "center", paddingVertical: 8 },
  reportText: { color: p.textMuted, fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  toast: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, backgroundColor: p.card, color: p.text, fontSize: 14, fontWeight: "800", overflow: "hidden", textAlign: "center" },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.55)" },
  dialog: { alignSelf: "stretch", gap: 8, padding: 18, borderRadius: 22, backgroundColor: p.sheet },
  dialogTitle: { color: p.sheetText, fontSize: 17, fontWeight: "900", marginBottom: 4 },
  reason: { minHeight: 48, justifyContent: "center", paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: p.line },
  reasonText: { color: p.sheetText, fontSize: 15, fontWeight: "800" },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { color: p.textMuted, fontSize: 14, fontWeight: "800" }
});
