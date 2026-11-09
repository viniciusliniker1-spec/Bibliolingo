import { useCallback, useMemo, useState } from "react";
import { GrowBar } from "../../../components/motion";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiAnimated } from "../../../components/LumiAnimated";
import { Icon } from "../../../components/navigation/Icons";
import { READER_LEVELS, type ReaderLanguage } from "../../../content/reader/types";
import { isPassageUnlocked, nextPassage, READER } from "../../../domain/reader";
import { LANGUAGE_TRAILS, type LanguageTrailColors } from "../../../domain/languageTrailThemes";
import { useLightStatusBar } from "../../../hooks/useLightStatusBar";
import { usePalette } from "../../../providers/ThemeProvider";
import { loadReaderProgress, type ReaderProgress } from "../../../services/readerProgress";

/** Leitor do original: textos bíblicos graduados, das primeiras palavras a passagens inteiras. */
export default function ReaderHome() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lang: string }>();
  const lang: ReaderLanguage = params.lang === "hbo" ? "hbo" : "grc";
  const theme = LANGUAGE_TRAILS[lang === "grc" ? "greek" : "hebrew"];
  const palette = usePalette();
  const c = palette.isDark ? theme.dark : theme.light;
  const styles = useMemo(() => makeStyles(c), [c]);
  const passages = READER[lang];
  const [done, setDone] = useState<ReaderProgress>({});
  useFocusEffect(useCallback(() => { void loadReaderProgress(lang).then(setDone); }, [lang]));

  const next = nextPassage(passages, done);
  const count = passages.filter((passage) => done[passage.id]).length;
  const rtl = lang === "hbo";
  const open = (id: string) => router.push({ pathname: "/reader/[lang]/[id]", params: { lang, id } });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: lang === "grc" ? "Ler o grego" : "Ler o hebraico", headerStyle: { backgroundColor: c.groundDeep }, headerTintColor: c.text, headerTitleStyle: { color: c.text, fontWeight: "900" } }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.hero}>
          <Text style={[styles.watermark, rtl && styles.watermarkLeft]} accessibilityElementsHidden>{theme.watermark}</Text>
          <LumiAnimated animation="estudar" style={styles.heroLumi} />
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>LEITOR DO ORIGINAL</Text>
            <Text style={styles.title}>{lang === "grc" ? "Leia o Novo Testamento em grego" : "Leia a Bíblia Hebraica no original"}</Text>
            <Text style={styles.muted}>Cada leitura: ler com apoio, reconhecer sons e sentidos, montar o texto e ler sozinho.</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{count} de {passages.length} leituras</Text>
            <Text style={styles.progressPct}>{Math.round((count / passages.length) * 100)}%</Text>
          </View>
          <View style={styles.bar}><GrowBar style={[styles.fill, { width: `${(count / passages.length) * 100}%` }]} /></View>
          {next ? (
            <Pressable accessibilityRole="button" onPress={() => open(next.id)} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
              <Icon name="play" size={18} color={c.ctaText} />
              <Text style={styles.ctaText} numberOfLines={1}>{count ? "Continuar" : "Começar"}: {next.title}</Text>
            </Pressable>
          ) : <Text style={styles.allDone}>Você leu todos os textos! Releia para fixar ou avance nas trilhas.</Text>}
        </View>

        {READER_LEVELS.map((level) => {
          const items = passages.filter((passage) => passage.level === level.level);
          if (!items.length) return null;
          return (
            <View key={level.level} style={styles.section}>
              <Text style={styles.sectionEyebrow}>NÍVEL {level.level}</Text>
              <Text style={styles.sectionTitle}>{level.title}</Text>
              <Text style={styles.muted}>{level.subtitle}</Text>
              {items.map((passage) => {
                const unlocked = isPassageUnlocked(passages, done, passage.id);
                const finished = Boolean(done[passage.id]);
                const preview = passage.words.slice(0, 4).map((word) => word.text).join(" ");
                return (
                  <Pressable key={passage.id} disabled={!unlocked} accessibilityRole="button" accessibilityState={{ disabled: !unlocked }}
                    accessibilityLabel={`${passage.title}${passage.ref ? `, ${passage.ref}` : ""}${finished ? ", concluída" : unlocked ? "" : ", bloqueada"}`}
                    onPress={() => open(passage.id)} style={({ pressed }) => [styles.item, !unlocked && styles.itemLocked, pressed && styles.pressed]}>
                    <View style={[styles.badge, finished ? styles.badgeDone : unlocked ? styles.badgeOpen : styles.badgeLocked]}>
                      <Icon name={finished ? "check" : unlocked ? "book" : "lock"} size={18} color={finished || unlocked ? "#ffffff" : c.muted} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.itemTitle}>{passage.title}</Text>
                      <Text style={styles.itemRef}>{`\u200E${passage.ref || passage.focus}`}</Text>
                      <Text style={[styles.preview, rtl && styles.previewRtl]} numberOfLines={1}>{preview}</Text>
                    </View>
                    {done[passage.id]?.solo === "review" ? <Text style={styles.reviewTag}>rever</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: LanguageTrailColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.ground },
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  hero: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, overflow: "hidden" },
  watermark: { position: "absolute", right: 8, top: -30, fontSize: 120, fontWeight: "900", color: c.ornament, opacity: 0.1 },
  watermarkLeft: { right: undefined, left: 8 },
  heroLumi: { width: 80, height: 76 },
  eyebrow: { color: c.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: c.text, fontSize: 19, fontWeight: "900" },
  muted: { color: c.muted, fontSize: 13, lineHeight: 19 },
  progressCard: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: c.text, fontSize: 14, fontWeight: "800" },
  progressPct: { color: c.accent, fontSize: 14, fontWeight: "900" },
  bar: { height: 10, borderRadius: 5, backgroundColor: c.line, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5, backgroundColor: c.done },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, paddingHorizontal: 16, borderRadius: 16, backgroundColor: c.cta, borderBottomWidth: 4, borderBottomColor: c.ctaShadow },
  ctaText: { color: c.ctaText, fontSize: 16, fontWeight: "900", flexShrink: 1 },
  allDone: { color: c.text, fontSize: 14, fontWeight: "700", textAlign: "center" },
  section: { gap: 8 },
  sectionEyebrow: { color: c.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  sectionTitle: { color: c.text, fontSize: 18, fontWeight: "900", marginTop: -4 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  itemLocked: { opacity: 0.55 },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeDone: { backgroundColor: c.done },
  badgeOpen: { backgroundColor: c.node },
  badgeLocked: { backgroundColor: c.locked },
  itemTitle: { color: c.text, fontSize: 15, fontWeight: "900" },
  itemRef: { color: c.muted, fontSize: 12, fontWeight: "700" },
  preview: { color: c.ornament, fontSize: 18, marginTop: 2 },
  previewRtl: { textAlign: "right", writingDirection: "rtl" },
  reviewTag: { color: c.accent, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }
});
