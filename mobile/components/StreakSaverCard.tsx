import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "./navigation/Icons";
import { freezeOffer } from "../domain/streakFreeze";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { useThemedStyles, usePalette } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

/** Aparece quando 1–2 dias foram perdidos e a ofensiva ainda pode ser salva com moedas Lumi. */
export function StreakSaverCard() {
  const { progress, freezeStreak } = useMobileProgress();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const offer = useMemo(() => freezeOffer(progress), [progress]);

  if (done && !offer) {
    return (
      <View style={[styles.card, styles.saved]} accessibilityLiveRegion="polite">
        <Text style={styles.savedText}>Ofensiva salva! Estude hoje para continuar a sequência. 🔥</Text>
      </View>
    );
  }
  if (!offer) return null;

  const days = offer.days.length;
  const save = () => {
    const result = freezeStreak();
    if (result.ok) { setDone(true); setError(""); }
    else setError(result.reason === "insufficient" ? `Faltam ${result.missing} moedas Lumi.` : "Nada para salvar agora.");
  };

  return (
    <View style={styles.card} accessible={false}>
      <View style={styles.icon}><Icon name="flame" size={22} color="#ffb347" /></View>
      <View style={styles.copy}>
        <Text style={styles.title}>Salve sua ofensiva de {offer.streak} {offer.streak === 1 ? "dia" : "dias"}</Text>
        <Text style={styles.note}>
          Você perdeu {days === 1 ? "1 dia" : `${days} dias`}. {offer.affordable ? `Use ${offer.price} moedas Lumi e continue de onde parou.` : `Você precisa de ${offer.price} moedas Lumi (tem ${offer.balance}).`}
        </Text>
        {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Salvar ofensiva por ${offer.price} moedas Lumi`}
        accessibilityState={{ disabled: !offer.affordable }}
        disabled={!offer.affordable}
        onPress={save}
        style={({ pressed }) => [styles.button, !offer.affordable && styles.disabled, pressed && { opacity: 0.85 }]}
      >
        <Icon name="coin" size={15} color={palette.ctaText} />
        <Text style={styles.buttonText}>{offer.price}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: p.card, borderWidth: 1.5, borderColor: "#ffb347" },
  saved: { justifyContent: "center", borderColor: p.accent },
  savedText: { color: p.text, fontSize: 13, fontWeight: "800", textAlign: "center" },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,179,71,0.16)" },
  copy: { flex: 1, gap: 2 },
  title: { color: p.text, fontSize: 14, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 12, lineHeight: 16 },
  error: { color: "#ff6b6b", fontSize: 12, fontWeight: "800" },
  button: { minWidth: 64, minHeight: 44, borderRadius: 14, flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  disabled: { opacity: 0.45 },
  buttonText: { color: p.ctaText, fontSize: 15, fontWeight: "900" }
});
