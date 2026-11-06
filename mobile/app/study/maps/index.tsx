import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LumiAnimated } from "../../../components/LumiAnimated";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BibleMap } from "../../../components/BibleMap";
import { Icon } from "../../../components/navigation/Icons";
import { BIBLICAL_MAPS } from "../../../content/maps/biblicalMaps";
import { useLightStatusBar } from "../../../hooks/useLightStatusBar";
import { usePalette, useThemedStyles } from "../../../providers/ThemeProvider";
import type { Palette } from "../../../theme/tokens";

/** Galeria de mapas, na ordem da história bíblica. */
export default function MapsScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const thumb = Math.min(132, (width - 64) * 0.38);
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: "Mapas bíblicos" }} />
      <View style={styles.introRow}>
        <LumiAnimated animation="binoculo" style={styles.introLumi} />
        <Text style={[styles.intro, styles.flex]}>Veja onde as histórias aconteceram. Toque num lugar do mapa para ler um resumo e abrir a passagem.</Text>
      </View>
      {BIBLICAL_MAPS.map((map) => (
        <Pressable key={map.id} accessibilityRole="button" accessibilityLabel={`${map.title}. ${map.subtitle}`} onPress={() => router.push({ pathname: "/study/maps/[id]", params: { id: map.id } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.thumb}><BibleMap map={map} width={thumb} thumbnail /></View>
          <View style={styles.flex}>
            <Text style={styles.era}>{map.era.toLocaleUpperCase("pt-BR")}</Text>
            <Text style={styles.title}>{map.title}</Text>
            <Text style={styles.subtitle}>{map.subtitle}</Text>
            <Text style={styles.meta}>{map.places.length} lugares{map.routes.length ? ` · ${map.routes.length} ${map.routes.length === 1 ? "rota" : "rotas"}` : ""}</Text>
          </View>
          <Icon name="chevronRight" size={18} color={palette.textMuted} />
        </Pressable>
      ))}
      <Text style={styles.source}>Litoral: Natural Earth (domínio público). Localizações antigas são aproximadas; rotas tradicionais são didáticas.</Text>
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  introRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  introLumi: { width: 92, height: 92 },
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 12 },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  intro: { color: p.textMuted, fontSize: 14, lineHeight: 20 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  thumb: { borderRadius: 12, overflow: "hidden" },
  era: { color: p.accent, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: p.text, fontSize: 17, fontWeight: "900" },
  subtitle: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  meta: { color: p.xp, fontSize: 12, fontWeight: "800", marginTop: 4 },
  source: { color: p.textMuted, fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 8 }
});
