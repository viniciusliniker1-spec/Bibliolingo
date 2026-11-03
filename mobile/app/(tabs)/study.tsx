import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { greekUnits } from "../../../src/content/greek/catalog";
import { hebrewUnits } from "../../../src/content/hebrew/catalog";
import { toLocalDateKey } from "../../../src/domain/streak";
import { noahPortrait } from "../../assets/noahAssets";
import { meanderPath } from "../../components/LanguageTrail";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon, type IconName } from "../../components/navigation/Icons";
import { LANGUAGE_TRAILS, type LanguageTrailId } from "../../domain/languageTrailThemes";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { useTourTarget } from "../../providers/TourProvider";
import { loadMemoryCards, loadNotebook } from "../../services/studyLibrary";
import type { Palette } from "../../theme/tokens";

interface LanguageProgress { done: number; total: number; next?: string }

/** Aba Estudar: o que fazer hoje, idiomas originais, ferramentas e percursos. */
export default function StudyScreen() {
  const tourReview = useTourTarget("study-review");
  const tourNoah = useTourTarget("study-noah");
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress } = useMobileProgress();
  const today = toLocalDateKey(new Date());
  const due = progress.reviewItems.filter((item) => item.dueDate <= today).length;
  const [memory, setMemory] = useState({ due: 0, total: 0 });
  const [notes, setNotes] = useState(0);

  // Contagens leves de cada ferramenta (lidas do aparelho ao abrir a aba).
  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.all([loadMemoryCards(), loadNotebook()]).then(([cards, items]) => {
      if (!active) return;
      setMemory({ due: cards.filter((card) => card.dueDate <= today).length, total: cards.length });
      const annotations = Object.values(progress.bibleAnnotations).filter((item) => item.bookmarked || item.note.trim() || item.highlightColor).length;
      setNotes(items.length + annotations);
    });
    return () => { active = false; };
  }, [today, progress.bibleAnnotations]));

  // Progresso dos idiomas (catálogos pequenos, montados a partir das sementes).
  const languages = useMemo<Record<LanguageTrailId, LanguageProgress>>(() => {
    const done = new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]);
    const summarize = (units: { lessons: { id: string; title: string }[]; checkpoint: { id: string; title: string } }[]): LanguageProgress => {
      const all = units.flatMap((unit) => [...unit.lessons, unit.checkpoint]);
      return { done: all.filter((item) => done.has(item.id)).length, total: all.length, next: all.find((item) => !done.has(item.id))?.title };
    };
    return { greek: summarize(greekUnits), hebrew: summarize(hebrewUnits) };
  }, [progress.completedLessonIds, progress.completedCheckpointIds]);

  const continueLanguage = useMemo(() => {
    if (!languages) return undefined;
    const started = (["greek", "hebrew"] as const).filter((id) => languages[id].done > 0 && languages[id].done < languages[id].total);
    return started[0];
  }, [languages]);

  return (
    <View style={styles.root}>
      {/* Cabeçalho fixo: o conteúdo não passa por baixo da barra de status */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Estudar</Text>
        <Text style={styles.subtitle}>Aprofunde, revise e guarde a Palavra.</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Para hoje */}
        <Pressable ref={tourReview} accessibilityRole="button" accessibilityLabel={due ? `Revisar ${due} itens agora` : "Revisão em dia"} onPress={() => router.push("/review")} style={({ pressed }) => [styles.review, pressed && styles.pressed]}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>REVISÃO DE HOJE</Text>
            <Text style={styles.reviewTitle}>{due ? `${due} ${due === 1 ? "item espera" : "itens esperam"} por você` : "Tudo em dia!"}</Text>
            <Text style={styles.muted}>{due ? "Revisar no momento certo fixa o que você aprendeu." : "Pratique o que já estudou e ganhe corações."}</Text>
            <View style={styles.reviewButton}><Icon name="play" size={14} color={palette.ctaText} /><Text style={styles.reviewButtonText}>{due ? "Revisar agora" : "Praticar"}</Text></View>
          </View>
          <LumiCharacter mood={due ? "lessonStart" : "proud"} motion="encouraging" style={styles.reviewLumi} accessibilityLabel="Lumi" />
        </Pressable>

        <View style={styles.quickRow}>
          <QuickCard icon="memory" tint="#f2b84b" title="Memorizar" value={memory.due ? `${memory.due} para hoje` : memory.total ? `${memory.total} versículos` : "Comece aqui"} onPress={() => router.push("/study/memory")} />
          {continueLanguage && languages ? (
            <QuickCard glyph={LANGUAGE_TRAILS[continueLanguage].watermark} tint={LANGUAGE_TRAILS[continueLanguage].dark.accent} title={continueLanguage === "greek" ? "Grego" : "Hebraico"} value={languages[continueLanguage].next ?? "Continuar"} onPress={() => router.push(continueLanguage === "greek" ? "/greek" : "/hebrew")} />
          ) : (
            <QuickCard icon="notebook" tint="#7fe3d5" title="Meu caderno" value={notes ? `${notes} ${notes === 1 ? "item" : "itens"}` : "Notas e destaques"} onPress={() => router.push("/study/notebook")} />
          )}
        </View>

        <Pressable ref={tourNoah} accessibilityRole="button" onPress={() => router.push("/noah")} style={({ pressed }) => [styles.noah, pressed && styles.pressed]}>
          <Image source={noahPortrait} style={styles.noahIcon} contentFit="cover" accessibilityElementsHidden />
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Pergunte ao Professor Noah</Text>
            <Text style={styles.muted} numberOfLines={2}>Contexto, palavras originais e por que uma resposta está certa.</Text>
          </View>
          <Icon name="chevronRight" size={20} color={palette.textMuted} />
        </Pressable>

        {/* Idiomas originais */}
        <Text style={styles.section}>Idiomas originais</Text>
        {(["greek", "hebrew"] as const).map((id) => (
          <LanguageCard key={id} id={id} progress={languages?.[id]} onOpen={() => router.push(id === "greek" ? "/greek" : "/hebrew")} onLexicon={() => router.push(id === "greek" ? "/greek/dictionary" : "/hebrew/dictionary")} />
        ))}

        {/* Ferramentas */}
        <Text style={styles.section}>Ferramentas</Text>
        <View style={styles.list}>
          <ToolRow icon="notebook" tint="#7fe3d5" title="Meu caderno" note={notes ? `${notes} ${notes === 1 ? "nota ou destaque" : "notas e destaques"}` : "Notas, destaques e palavras salvas"} route="/study/notebook" />
          <ToolRow icon="memory" tint="#f2b84b" title="Memorizar versículos" note={memory.due ? `${memory.due} para revisar hoje` : "Recordação ativa, passo a passo"} route="/study/memory" />
          <ToolRow icon="search" tint="#8fb8ff" title="Busca bíblica" note="Palavra, referência, tema ou Strong" route="/study/search" />
          <ToolRow icon="globe" tint="#ff9fb4" title="Linha do tempo" note="Da Criação à Igreja, com mapas de rotas" route="/study/context" last />
        </View>

        {/* Percursos */}
        <Text style={styles.section}>Percursos</Text>
        <View style={styles.list}>
          <ToolRow icon="book" tint="#7fe3d5" title="Livros da Bíblia" note="Estude qualquer um dos 66 livros" route="/tracks" />
          <ToolRow icon="study" tint="#c9a7ff" title="Aprofundar" note="Estudos avançados de teologia bíblica" route="/deepen" />
          <ToolRow icon="shield" tint="#ffb35c" title="Formação Pastoral" note="Nazarena · 6 matérias" route="/formation" last />
        </View>
      </ScrollView>
    </View>
  );
}

function QuickCard({ icon, glyph, tint, title, value, onPress }: { icon?: IconName; glyph?: string; tint: string; title: string; value: string; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}: ${value}`} onPress={onPress} style={({ pressed }) => [styles.quick, pressed && styles.pressed]}>
      <View style={[styles.toolIcon, { backgroundColor: tint + "22" }]}>
        {icon ? <Icon name={icon} size={20} color={tint} /> : <Text style={[styles.glyph, { color: tint }]}>{glyph}</Text>}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.muted} numberOfLines={2}>{value}</Text>
    </Pressable>
  );
}

function ToolRow({ icon, tint, title, note, route, last }: { icon: IconName; tint: string; title: string; note: string; route: Href; last?: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const router = useRouter();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${note}`} onPress={() => router.push(route)} style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.pressed]}>
      <View style={[styles.toolIcon, { backgroundColor: tint + "22" }]}><Icon name={icon} size={20} color={tint} /></View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.muted} numberOfLines={1}>{note}</Text>
      </View>
      <Icon name="chevronRight" size={18} color={palette.textMuted} />
    </Pressable>
  );
}

/** Cartão temático de cada idioma, com o mesmo visual da trilha. */
function LanguageCard({ id, progress, onOpen, onLexicon }: { id: LanguageTrailId; progress?: LanguageProgress; onOpen: () => void; onLexicon: () => void }) {
  const palette = usePalette();
  const theme = LANGUAGE_TRAILS[id];
  const c = palette.isDark ? theme.dark : theme.light;
  const hebrew = id === "hebrew";
  const percent = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const [width, setWidth] = useState(0);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${theme.title}. ${progress ? `${progress.done} de ${progress.total} concluídas` : ""}`} onPress={onOpen}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={({ pressed }) => [{ overflow: "hidden", borderRadius: 22, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.line, padding: 16, gap: 10 }, pressed && { opacity: 0.85 }]}>
      {width && !hebrew ? <Svg width={width} height={14} style={{ position: "absolute", top: 8, left: 0 }}><Path d={meanderPath(14, 2, width - 28, 9)} stroke={c.ornament} strokeWidth={1.6} fill="none" opacity={0.7} /></Svg> : null}
      {hebrew ? (
        <>
          <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, backgroundColor: c.ornament, opacity: 0.85 }} />
          <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 10, backgroundColor: c.ornament, opacity: 0.85 }} />
        </>
      ) : null}
      <Text style={{ position: "absolute", [hebrew ? "left" : "right"]: 14, top: -14, fontSize: 96, fontWeight: "900", color: c.ornament, opacity: 0.16 }} accessibilityElementsHidden>{theme.watermark}</Text>
      <View style={{ marginTop: hebrew ? 0 : 10, alignItems: hebrew ? "flex-end" : "flex-start", paddingHorizontal: hebrew ? 8 : 0 }}>
        <Text style={{ color: c.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }}>{theme.eyebrow}</Text>
        <Text style={{ color: c.text, fontSize: 21, fontWeight: "900" }}>{theme.title}</Text>
        <Text style={{ color: c.muted, fontSize: 13, textAlign: hebrew ? "right" : "left" }} numberOfLines={1}>{progress?.next ? `Próxima: ${progress.next}` : theme.subtitle}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: hebrew ? 8 : 0 }}>
        <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: c.path, overflow: "hidden" }}>
          <View style={{ width: `${percent}%`, height: 8, borderRadius: 4, backgroundColor: c.pathDone }} />
        </View>
        <Text style={{ color: c.text, fontSize: 12, fontWeight: "900" }}>{progress ? `${progress.done}/${progress.total}` : "…"}</Text>
      </View>
      <View style={{ flexDirection: hebrew ? "row-reverse" : "row", gap: 8, paddingHorizontal: hebrew ? 8 : 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, minHeight: 40, borderRadius: 12, backgroundColor: c.cta, borderBottomWidth: 3, borderBottomColor: c.ctaShadow }}>
          <Icon name="play" size={14} color={c.ctaText} />
          <Text style={{ color: c.ctaText, fontWeight: "900" }}>{progress?.done ? "Continuar trilha" : "Começar trilha"}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={theme.dictionaryLabel} onPress={onLexicon} hitSlop={4} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, minHeight: 40, borderRadius: 12, borderWidth: 1.5, borderColor: c.line }}>
          <Icon name="search" size={14} color={c.accent} />
          <Text style={{ color: c.text, fontWeight: "900" }}>Léxico</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: p.ground, borderBottomWidth: 1, borderBottomColor: p.divider },
  title: { color: p.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: p.textMuted, fontSize: 14, fontWeight: "600" },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32, gap: 12 },
  pressed: { opacity: 0.8 },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  section: { color: p.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 10 },
  muted: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  cardTitle: { color: p.text, fontSize: 16, fontWeight: "900" },
  review: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16, borderRadius: 22, backgroundColor: p.activeTabBg, borderWidth: 1, borderColor: p.accent },
  reviewTitle: { color: p.text, fontSize: 19, fontWeight: "900", marginTop: 2, marginBottom: 2 },
  reviewButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 12, minHeight: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: p.cta },
  reviewButtonText: { color: p.ctaText, fontWeight: "900" },
  reviewLumi: { width: 92, height: 92 },
  quickRow: { flexDirection: "row", gap: 10 },
  quick: { flex: 1, gap: 4, padding: 14, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  noah: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  noahIcon: { width: 48, height: 48, borderRadius: 14 },
  list: { borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 64 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: p.divider },
  toolIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  glyph: { fontSize: 20, fontWeight: "900" }
});
