import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { PushButton } from "./PushButton";
import { Image } from "expo-image";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { Icon } from "./navigation/Icons";

interface Props {
  visible: boolean;
  maxHearts: number;
  onReview: () => void;
  onClose: () => void;
  /** Texto do botão secundário (ex.: "Sair da lição"). */
  closeLabel?: string;
}

/** Corações esgotados: a Lumi convida para a revisão, que devolve corações. */
export function HeartsGate({ visible, maxHearts, onReview, onClose, closeLabel = "Agora não" }: Props) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <Image source={lumiAnimationAssets.dormir} style={styles.lumi} contentFit="contain" accessibilityLabel="Lumi descansando" />
          <View style={styles.hearts} accessible accessibilityLabel={`0 de ${maxHearts} corações`}>
            {Array.from({ length: maxHearts }, (_, index) => <Icon key={index} name="heart" size={22} color={palette.line} />)}
          </View>
          <Text style={styles.title}>Seus corações acabaram</Text>
          <Text style={styles.text}>Faça uma revisão rápida: cada acerto devolve 1 coração. Assim você fixa o que errou e volta para a trilha mais forte.</Text>
          <PushButton accessibilityRole="button" onPress={onReview} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Icon name="heart" size={18} color={palette.ctaText} />
            <Text style={styles.primaryText}>Revisar e recuperar</Text>
          </PushButton>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondary}><Text style={styles.secondaryText}>{closeLabel}</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(4,12,22,0.72)" },
  card: { alignSelf: "stretch", alignItems: "center", gap: 10, padding: 22, borderRadius: 26, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  lumi: { width: 150, height: 148 },
  hearts: { flexDirection: "row", gap: 6 },
  title: { color: p.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  text: { color: p.textMuted, fontSize: 15, lineHeight: 21, textAlign: "center" },
  primary: { flexDirection: "row", gap: 8, alignSelf: "stretch", minHeight: 54, marginTop: 6, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 2 },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  secondary: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16 },
  secondaryText: { color: p.textMuted, fontSize: 14, fontWeight: "800" }
});
