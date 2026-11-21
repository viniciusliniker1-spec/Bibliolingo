import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, type IconName } from "./navigation/Icons";
import { inviteMessage } from "../domain/invite";
import { reachedMilestones } from "../domain/milestones";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

/** Atalhos para compartilhar: resumo da semana, marcos de ofensiva e convite para amigos. */
export function ShareHub() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").trim() || undefined;
  const milestones = reachedMilestones(progress.bestStreak > progress.streak ? progress.bestStreak : progress.streak);

  const invite = () => { void Share.share({ message: inviteMessage({ name, url: process.env.EXPO_PUBLIC_INVITE_URL }) }); };

  const Row = ({ icon, title, note, onPress, label }: { icon: IconName; title: string; note: string; onPress: () => void; label: string }) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <View style={styles.icon}><Icon name={icon} size={20} color={palette.accent} /></View>
      <View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.note}>{note}</Text></View>
      <Icon name="chevronRight" size={18} color={palette.textMuted} />
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Compartilhar</Text>
      <Row icon="share" title="Resumo da semana" note="Seus últimos 7 dias em um cartão" label="Abrir resumo da semana" onPress={() => router.push("/weekly-summary")} />
      <Row icon="user" title="Convidar um amigo" note="Chame alguém para estudar com você" label="Convidar um amigo" onPress={invite} />
      {milestones.length ? (
        <View style={styles.marks}>
          <Text style={styles.note}>Seus marcos de ofensiva</Text>
          <View style={styles.markRow}>
            {milestones.map((days) => (
              <Pressable key={days} accessibilityRole="button" accessibilityLabel={`Compartilhar marco de ${days} dias`} onPress={() => router.push({ pathname: "/milestone/[days]", params: { days: String(days) } })} style={({ pressed }) => [styles.mark, pressed && { opacity: 0.85 }]}>
                <Icon name="flame" size={14} color="#ffb347" />
                <Text style={styles.markText}>{days}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  heading: { color: p.text, fontSize: 18, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  copy: { flex: 1 },
  title: { color: p.text, fontSize: 15, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  marks: { gap: 6, paddingTop: 4 },
  markRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mark: { minWidth: 64, minHeight: 40, flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#ffb347", backgroundColor: p.card },
  markText: { color: p.text, fontSize: 14, fontWeight: "900" }
});
