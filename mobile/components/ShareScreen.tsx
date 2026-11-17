import type { ReactNode, RefObject } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./navigation/Icons";
import { PushButton } from "./PushButton";
import { useShareCard } from "../hooks/useShareCard";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

interface Props {
  title: string;
  subtitle: string;
  caption: string;
  filename: string;
  cardLabel: string;
  /** Desenha o cartão com a largura calculada; a ref precisa ir na View raiz do cartão. */
  renderCard: (width: number, ref: RefObject<View | null>) => ReactNode;
  /** Botão secundário à direita de “Copiar legenda”. */
  secondary?: { label: string; onPress: () => void };
  onClose: () => void;
  closeLabel?: string;
  overlay?: ReactNode;
}

/** Tela padrão para compartilhar um cartão 9:16: título, cartão, compartilhar e copiar legenda. */
export function ShareScreen({ title, subtitle, caption, filename, cardLabel, renderCard, secondary, onClose, closeLabel = "Agora não", overlay }: Props) {
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { cardRef, busy, message, share, copyCaption } = useShareCard({ filename, caption, dialogTitle: "Compartilhar" });

  // O cartão (9:16) precisa caber inteiro entre o título e os botões, sem rolar.
  const roomForCard = height - insets.top - Math.max(insets.bottom, 12) - 360;
  const cardWidth = Math.max(180, Math.min(width - 56, 300, (roomForCard * 9) / 16));
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={[styles.cardFrame, { width: cardWidth }]} accessible accessibilityLabel={cardLabel}>
          {renderCard(cardWidth, cardRef)}
        </View>
        {message ? <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text> : null}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <PushButton accessibilityRole="button" disabled={busy} onPress={() => void share()} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, busy && styles.disabled]}>
          <Icon name="share" size={20} color={palette.ctaText} />
          <Text style={styles.primaryText}>{busy ? "Preparando imagem…" : "Compartilhar"}</Text>
        </PushButton>
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={() => void copyCaption()} style={styles.ghost}>
            <Icon name="copy" size={17} color={palette.accent} />
            <Text style={styles.ghostText}>Copiar legenda</Text>
          </Pressable>
          {secondary ? (
            <Pressable accessibilityRole="button" onPress={secondary.onPress} style={[styles.ghost, styles.ghostStrong]}>
              <Text style={styles.ghostStrongText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{secondary.label}</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.link}><Text style={styles.linkText}>{closeLabel}</Text></Pressable>
      </View>
      {overlay}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { alignItems: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 10 },
  title: { color: p.xp, fontSize: 28, fontWeight: "900", textAlign: "center" },
  subtitle: { color: p.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 6, paddingHorizontal: 12 },
  cardFrame: { borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: p.line, shadowColor: "#000000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  message: { color: p.accent, fontSize: 13, fontWeight: "800", textAlign: "center", marginTop: 4 },
  actions: { gap: 8, paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.divider },
  primary: { flexDirection: "row", gap: 8, minHeight: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryPressed: { borderBottomWidth: 2, marginTop: 3 },
  disabled: { opacity: 0.6 },
  primaryText: { color: p.ctaText, fontSize: 18, fontWeight: "900" },
  row: { flexDirection: "row", gap: 8 },
  ghost: { flex: 1, minHeight: 48, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  ghostText: { color: p.accent, fontSize: 14, fontWeight: "900" },
  ghostStrong: { borderColor: p.accent },
  ghostStrongText: { flexShrink: 1, color: p.accent, fontSize: 14, fontWeight: "900" },
  link: { minHeight: 40, alignItems: "center", justifyContent: "center" },
  linkText: { color: p.textMuted, fontSize: 14, fontWeight: "800" }
});
