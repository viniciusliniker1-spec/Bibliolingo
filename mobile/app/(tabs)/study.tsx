import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toLocalDateKey } from "../../../src/domain/streak";
import { Icon, type IconName } from "../../components/navigation/Icons";
import { LumiCharacter } from "../../components/LumiCharacter";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import type { Palette } from "../../theme/tokens";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";

interface Tile { id: string; title: string; note: string; route: Href; icon?: IconName; glyph?: string; tint: string }

const GROUPS: { title: string; tiles: Tile[] }[] = [
  {
    title: "Ferramentas",
    tiles: [
      { id: "notebook", title: "Meu caderno", note: "Notas e conteúdos salvos", route: "/study/notebook", icon: "notebook", tint: "#7fe3d5" },
      { id: "memory", title: "Memorizar", note: "Versículos em cartões", route: "/study/memory", icon: "memory", tint: "#f2b84b" },
      { id: "search", title: "Busca bíblica", note: "Palavra, referência e Strong", route: "/study/search", icon: "search", tint: "#8fb8ff" },
      { id: "context", title: "Linha do tempo", note: "Mapas e contexto histórico", route: "/study/context", icon: "globe", tint: "#ff9fb4" }
    ]
  },
  {
    title: "Idiomas originais",
    tiles: [
      { id: "greek", title: "Grego bíblico", note: "32 lições", route: "/greek", glyph: "Ω", tint: "#8fb8ff" },
      { id: "greek-dictionary", title: "Dicionário grego", note: "Léxico koiné e Strong", route: "/greek/dictionary", glyph: "λ", tint: "#8fb8ff" },
      { id: "hebrew", title: "Hebraico e aramaico", note: "32 lições", route: "/hebrew", glyph: "א", tint: "#f2b84b" },
      { id: "hebrew-dictionary", title: "Dicionário hebraico", note: "Verbetes Strong", route: "/hebrew/dictionary", glyph: "אב", tint: "#f2b84b" }
    ]
  },
  {
    title: "Percursos",
    tiles: [
      { id: "books", title: "Livros da Bíblia", note: "Os 66 livros", route: "/tracks", icon: "book", tint: "#7fe3d5" },
      { id: "deepen", title: "Aprofundar", note: "Estudos avançados", route: "/deepen", icon: "study", tint: "#c9a7ff" },
      { id: "formation", title: "Formação Pastoral", note: "Nazarena · 6 matérias", route: "/formation", icon: "shield", tint: "#ffb35c" }
    ]
  }
];

export default function StudyScreen() {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress } = useMobileProgress();
  const today = toLocalDateKey(new Date());
  const due = progress.reviewItems.filter((item) => item.dueDate <= today).length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Estudar</Text>

      <Pressable accessibilityRole="button" accessibilityLabel={due ? `Revisar ${due} itens agora` : "Revisão em dia"} onPress={() => router.push("/review")} style={({ pressed }) => [styles.review, pressed && styles.pressed]}>
        <View style={styles.flex}>
          <Text style={styles.reviewEyebrow}>REVISÃO DE HOJE</Text>
          <Text style={styles.reviewTitle}>{due ? `${due} ${due === 1 ? "item espera" : "itens esperam"} por você` : "Tudo em dia!"}</Text>
          <Text style={styles.reviewText}>{due ? "Revisar no momento certo fixa o que você aprendeu." : "Novos itens aparecem conforme você estuda."}</Text>
          {due ? <View style={styles.reviewButton}><Icon name="play" size={14} color={trail.ctaText} /><Text style={styles.reviewButtonText}>Revisar agora</Text></View> : null}
        </View>
        <LumiCharacter mood={due ? "lessonStart" : "proud"} motion="encouraging" style={styles.reviewLumi} accessibilityLabel="Lumi" />
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => router.push("/noah")} style={({ pressed }) => [styles.noah, pressed && styles.pressed]}>
        <View style={styles.noahIcon}><Text style={styles.noahGlyph}>N</Text></View>
        <View style={styles.flex}>
          <Text style={styles.noahTitle}>Pergunte ao Professor Noah</Text>
          <Text style={styles.noahText}>Tire dúvidas bíblicas com um tutor que conhece sua lição.</Text>
        </View>
        <Icon name="chevronRight" size={20} color={trail.textMuted} />
      </Pressable>

      {GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.grid}>
            {group.tiles.map((tile) => (
              <Pressable key={tile.id} accessibilityRole="button" accessibilityLabel={`${tile.title}. ${tile.note}`} onPress={() => router.push(tile.route)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
                <View style={[styles.tileIcon, { backgroundColor: tile.tint + "22" }]}>
                  {tile.icon ? <Icon name={tile.icon} size={22} color={tile.tint} /> : <Text style={[styles.tileGlyph, { color: tile.tint }]}>{tile.glyph}</Text>}
                </View>
                <Text style={styles.tileTitle} numberOfLines={1}>{tile.title}</Text>
                <Text style={styles.tileNote} numberOfLines={1}>{tile.note}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: trail.ground },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  title: { color: trail.text, fontSize: 28, fontWeight: "900" },
  review: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16, borderRadius: 22, backgroundColor: trail.activeTabBg, borderWidth: 1, borderColor: trail.accent },
  reviewEyebrow: { color: trail.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  reviewTitle: { color: trail.text, fontSize: 19, fontWeight: "900", marginTop: 2 },
  reviewText: { color: trail.textMuted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  reviewButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 12, minHeight: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: trail.cta },
  reviewButtonText: { color: trail.ctaText, fontWeight: "900" },
  reviewLumi: { width: 92, height: 92 },
  noah: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  noahIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: trail.goldSoft, borderWidth: 1, borderColor: trail.xp },
  noahGlyph: { color: trail.xp, fontSize: 20, fontWeight: "900" },
  noahTitle: { color: trail.text, fontSize: 16, fontWeight: "900" },
  noahText: { color: trail.textMuted, fontSize: 13, lineHeight: 18 },
  group: { gap: 10, marginTop: 6 },
  groupTitle: { color: trail.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48.4%", minHeight: 116, padding: 14, gap: 4, borderRadius: 18, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  tileIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  tileGlyph: { fontSize: 20, fontWeight: "900" },
  tileTitle: { color: trail.text, fontSize: 15, fontWeight: "900" },
  tileNote: { color: trail.textMuted, fontSize: 12, fontWeight: "600" }
});
