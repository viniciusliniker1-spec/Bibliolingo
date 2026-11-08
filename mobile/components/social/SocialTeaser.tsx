import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { lumiMoodAssets } from "../../assets/lumiMoodAssets";
import { medalFor, weekCountdown } from "../../domain/social";
import { useSocial } from "../../hooks/useSocial";
import { useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

/** Resumo do ranking da semana, com atalho para a tela completa. Some se o servidor ainda não tem o ranking. */
export function SocialTeaser() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const social = useSocial("global", 3);
  if (social.status === "loading" || social.status === "unavailable" || social.status === "no-account" || social.status === "error") return null;

  const me = social.board?.entries.find((entry) => entry.isMe);
  const medal = me ? medalFor(me.rank) : undefined;
  const countdown = social.board ? weekCountdown(social.board.weekEndsAt) : undefined;
  const title = social.status === "ready" && me ? `${medal ?? ""} Você está em ${me.rank}º lugar`.trim() : social.status === "guest" ? "Dispute com outros alunos" : "Entre no ranking semanal";
  const note = social.status === "ready" && me
    ? `${me.weeklyXp} XP esta semana${countdown ? ` · termina em ${countdown.label}` : ""}`
    : social.status === "guest" ? "Crie uma conta para ver o ranking e seguir amigos." : "Escolha um @usuário e dispute pelo topo.";

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ranking. ${title}. ${note}`} onPress={() => router.push("/social")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}>
      <Image source={lumiMoodAssets[me && me.rank <= 3 ? "trofeu" : me ? "progresso" : "lupa"]} style={styles.lumi} contentFit="contain" />
      <View style={styles.flex}>
        <Text style={styles.eyebrow}>RANKING DA SEMANA</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.note} numberOfLines={2}>{note}</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, padding: 12, borderRadius: 20, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.xp },
  flex: { flex: 1 },
  lumi: { width: 66, height: 66 },
  eyebrow: { color: p.xp, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 16, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 12, fontWeight: "700" }
});
