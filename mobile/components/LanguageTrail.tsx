import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";
import type { Unit } from "../../src/types/content";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { mobileActivityRoute, type MobileActivityKind } from "../domain/activityCatalog";
import { isOutOfHearts } from "../domain/hearts";
import { LANGUAGE_TRAILS, mirrorX, nodeLetter, unitWord, type LanguageTrailColors, type LanguageTrailId, type LanguageTrailTheme } from "../domain/languageTrailThemes";
import { buildTrailModel, TRAIL_LAYOUT, trailPath, type TrailNode } from "../domain/trailModel";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette } from "../providers/ThemeProvider";
import { HeartsGate } from "./HeartsGate";
import { Icon } from "./navigation/Icons";

interface Props {
  language: LanguageTrailId;
  units: Unit[];
  /** Linha extra no topo (ex.: palavras aprendidas). */
  stat?: string;
  dictionaryRoute: "/greek/dictionary" | "/hebrew/dictionary";
}

const BANNER_HEIGHT = 92;
/** Espaço extra no topo para o balão da Lumi não cobrir a 1ª faixa. */
const TOP_SHIFT = 84;

/** Trilha temática dos idiomas originais (grego e hebraico). */
export function LanguageTrail({ language, units, stat, dictionaryRoute }: Props) {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { progress } = useMobileProgress();
  const palette = usePalette();
  const theme = LANGUAGE_TRAILS[language];
  const c = palette.isDark ? theme.dark : theme.light;
  const styles = useMemo(() => makeStyles(c), [c]);
  const scrollRef = useRef<ScrollView>(null);
  const [heartsGate, setHeartsGate] = useState(false);
  const [notice, setNotice] = useState("");
  const kind = language as MobileActivityKind;
  const headerHeight = insets.top + 64;

  const model = useMemo(() => {
    const base = buildTrailModel({
      book: { id: language, title: theme.title, shortTitle: theme.title, units },
      orderedActivityIds: units.flatMap((unit) => [...unit.lessons.map((lesson) => lesson.id), unit.checkpoint.id]),
      completedLessonIds: progress.completedLessonIds,
      completedCheckpointIds: progress.completedCheckpointIds,
      mode: "individual",
      width
    });
    // Hebraico: o caminho começa pela direita.
    const nodes = base.nodes.map((node) => ({
      ...node,
      x: mirrorX(theme, node.x, width),
      y: node.y + TOP_SHIFT,
      companionSide: theme.mirrored ? (node.companionSide === "left" ? "right" as const : "left" as const) : node.companionSide
    }));
    const unitsShifted = base.units.map((unit) => ({ ...unit, y: unit.inline ? unit.y + TOP_SHIFT : unit.y }));
    let doneUntil = 0;
    while (doneUntil < nodes.length && nodes[doneUntil].state === "done") doneUntil += 1;
    return { ...base, nodes, units: unitsShifted, height: base.height + TOP_SHIFT, current: nodes.find((node) => node.state === "current"), pathAll: trailPath(nodes), pathDone: doneUntil > 0 ? trailPath(nodes.slice(0, doneUntil + 1)) : "" };
  }, [units, progress.completedLessonIds, progress.completedCheckpointIds, width, language, theme]);

  // Abre já no próximo passo.
  useEffect(() => {
    const target = model.current;
    if (!target) return;
    const timer = setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, target.y - 320), animated: false }), 60);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  const open = (node: TrailNode) => {
    if (node.state === "locked") { setNotice("Conclua a lição anterior para liberar esta."); return; }
    if (isOutOfHearts(progress, kind)) { setHeartsGate(true); return; }
    router.push(mobileActivityRoute(kind, node.id));
  };

  const lessonOrdinals = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    for (const node of model.nodes) if (!node.checkpoint) { map.set(node.id, n); n += 1; }
    return map;
  }, [model.nodes]);

  const current = model.current;
  const percent = model.total ? Math.round((model.completed / model.total) * 100) : 0;
  const lumiSize = 112;
  const lumi = current ? (() => {
    const side = current.companionSide;
    const x = side === "left" ? current.x - current.size / 2 - lumiSize - 6 : current.x + current.size / 2 + 6;
    return { x: Math.max(4, Math.min(width - lumiSize - 4, x)), y: current.y - lumiSize / 2 };
  })() : undefined;

  return (
    <View style={styles.root}>
      {/* Topo fixo */}
      <View style={[styles.header, { paddingTop: insets.top + 6, height: headerHeight }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} hitSlop={8} style={styles.iconButton}>
          <Icon name="back" size={22} color={c.text} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.eyebrow} numberOfLines={1}>{theme.eyebrow}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{theme.title}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${theme.dictionaryLabel}`} onPress={() => router.push(dictionaryRoute)} style={styles.dictButton}>
          <Icon name="search" size={16} color={c.accent} />
          <Text style={styles.dictText}>Léxico</Text>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Apresentação e progresso */}
        <View style={styles.hero}>
          <Text style={[styles.heroGlyph, theme.mirrored && styles.heroGlyphRight]} accessibilityElementsHidden>{theme.watermark}</Text>
          <Text style={styles.heroSubtitle}>{theme.subtitle}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
            <Text style={styles.progressText}>{model.completed}/{model.total}</Text>
          </View>
          {stat ? <Text style={styles.stat}>{stat}</Text> : null}
        </View>

        <View style={{ width, height: model.height }}>
          <TrailOrnaments theme={theme} colors={c} width={width} height={model.height} />
          <Svg width={width} height={model.height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Path d={model.pathAll} stroke={c.path} strokeWidth={10} strokeLinecap="round" fill="none" strokeDasharray="2 18" />
            {model.pathDone ? <Path d={model.pathDone} stroke={c.pathDone} strokeWidth={10} strokeLinecap="round" fill="none" strokeDasharray="2 18" /> : null}
          </Svg>

          {model.units.map((unit, index) => (
            <UnitBanner key={unit.id} theme={theme} colors={c} index={index} title={unit.title} subtitle={unit.subtitle} completed={unit.completed} total={unit.total} locked={unit.locked}
              top={unit.inline ? unit.y : 24} width={width} />
          ))}

          {model.nodes.map((node) => (
            <TrailNodeView key={node.id} node={node} colors={c} letter={node.checkpoint ? undefined : nodeLetter(theme, lessonOrdinals.get(node.id) ?? 0)} onPress={() => open(node)} />
          ))}

          {current && lumi ? (
            <View pointerEvents="none" style={[styles.lumiWrap, { left: lumi.x, top: lumi.y }]}>
              <View style={styles.bubble}><Text style={styles.bubbleText} numberOfLines={3}>{theme.greeting.replace("{licao}", current.title)}</Text></View>
              <Image source={lumiAnimationAssets[theme.id === "greek" ? "ler" : "ensinar"]} style={{ width: lumiSize, height: lumiSize * 0.92 }} contentFit="contain" accessibilityLabel="Lumi" />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {notice ? <View style={styles.toast} pointerEvents="none"><Text style={styles.toastText}>{notice}</Text></View> : null}

      {current ? (
        <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable accessibilityRole="button" onPress={() => open(current)} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Icon name="play" size={18} color={c.ctaText} />
            <Text style={styles.ctaText} numberOfLines={1}>Continuar · {current.title}</Text>
          </Pressable>
        </View>
      ) : null}

      <HeartsGate visible={heartsGate} maxHearts={progress.settings.maxHearts} onClose={() => setHeartsGate(false)} onReview={() => { setHeartsGate(false); router.push("/review"); }} />
    </View>
  );
}

function TrailNodeView({ node, colors: c, letter, onPress }: { node: TrailNode; colors: LanguageTrailColors; letter?: string; onPress: () => void }) {
  const done = node.state === "done";
  const locked = node.state === "locked";
  const current = node.state === "current";
  const bg = done ? c.done : locked ? c.locked : c.node;
  const lip = done ? c.doneShadow : locked ? c.lockedShadow : c.nodeShadow;
  const size = node.size;
  return (
    <View style={{ position: "absolute", left: node.x - size / 2, top: node.y - size / 2, width: size, alignItems: "center" }}>
      {current ? <View style={{ position: "absolute", top: -8, left: -8, width: size + 16, height: size + 16, borderRadius: (size + 16) / 2, borderWidth: 4, borderColor: c.accent, opacity: 0.55 }} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${node.checkpoint ? "Checkpoint" : "Lição"}: ${node.title}, ${done ? "concluída" : locked ? "bloqueada" : current ? "próximo passo" : "disponível"}`}
        onPress={onPress}
        style={({ pressed }) => [{ width: size, height: size + 6 }, pressed && { transform: [{ translateY: 3 }] }]}
      >
        <View style={{ position: "absolute", top: 6, width: size, height: size, borderRadius: size / 2, backgroundColor: lip }} />
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.22)" }}>
          {locked ? <Icon name="lock" size={22} color={c.muted} strokeWidth={2.6} />
            : node.checkpoint ? <Icon name="shield" size={30} color="#ffffff" />
              : <Text style={{ color: done ? "#3a2a08" : c.nodeText, fontSize: 30, fontWeight: "900", lineHeight: 36 }}>{letter}</Text>}
        </View>
      </Pressable>
      {done ? <View style={{ position: "absolute", right: -4, top: -4, width: 24, height: 24, borderRadius: 12, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={14} color={c.doneShadow} strokeWidth={3.4} /></View> : null}
    </View>
  );
}

function UnitBanner({ theme, colors: c, index, title, subtitle, completed, total, locked, top, width }: {
  theme: LanguageTrailTheme; colors: LanguageTrailColors; index: number; title: string; subtitle: string; completed: number; total: number; locked: boolean; top: number; width: number;
}) {
  const word = unitWord(theme, index);
  const w = width - 32;
  const hebrew = theme.id === "hebrew";
  return (
    <View style={{ position: "absolute", left: 16, top, width: w, height: BANNER_HEIGHT, opacity: locked ? 0.6 : 1 }} accessible accessibilityLabel={`Unidade ${index + 1}: ${title}. ${completed} de ${total} concluídas`}>
      <Svg width={w} height={BANNER_HEIGHT} style={StyleSheet.absoluteFill}>
        {hebrew ? (
          <>
            {/* Pergaminho com dois rolos de madeira */}
            <Rect x={10} y={6} width={w - 20} height={BANNER_HEIGHT - 12} rx={6} fill={c.card} stroke={c.line} strokeWidth={1.5} />
            <Rect x={0} y={0} width={14} height={BANNER_HEIGHT} rx={7} fill={c.ornament} />
            <Rect x={w - 14} y={0} width={14} height={BANNER_HEIGHT} rx={7} fill={c.ornament} />
            <Rect x={3} y={-4} width={8} height={10} rx={3} fill={c.doneShadow} />
            <Rect x={w - 11} y={-4} width={8} height={10} rx={3} fill={c.doneShadow} />
            <Rect x={3} y={BANNER_HEIGHT - 6} width={8} height={10} rx={3} fill={c.doneShadow} />
            <Rect x={w - 11} y={BANNER_HEIGHT - 6} width={8} height={10} rx={3} fill={c.doneShadow} />
          </>
        ) : (
          <>
            {/* Mármore com faixa de meandro grego */}
            <Rect x={0} y={0} width={w} height={BANNER_HEIGHT} rx={14} fill={c.card} stroke={c.line} strokeWidth={1.5} />
            <Path d={meanderPath(10, 8, w - 20, 10)} stroke={c.ornament} strokeWidth={2} fill="none" />
            <Path d={meanderPath(10, BANNER_HEIGHT - 18, w - 20, 10)} stroke={c.ornament} strokeWidth={2} fill="none" opacity={0.6} />
          </>
        )}
      </Svg>
      <View style={{ flex: 1, flexDirection: hebrew ? "row-reverse" : "row", alignItems: "center", paddingHorizontal: hebrew ? 26 : 16, paddingTop: hebrew ? 0 : 10, paddingBottom: hebrew ? 0 : 8, gap: 12 }}>
        <View style={{ flex: 1, alignItems: hebrew ? "flex-end" : "flex-start" }}>
          <Text style={{ color: c.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }}>UNIDADE {index + 1} · {completed}/{total}</Text>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: "900", textAlign: hebrew ? "right" : "left" }} numberOfLines={1}>{title}</Text>
          <Text style={{ color: c.muted, fontSize: 12, textAlign: hebrew ? "right" : "left" }} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={{ alignItems: "center", minWidth: 70 }}>
          <Text style={{ color: c.ornament, fontSize: 22, fontWeight: "900" }}>{word.word}</Text>
          <Text style={{ color: c.muted, fontSize: 10, fontWeight: "800" }}>{word.meaning}</Text>
        </View>
      </View>
    </View>
  );
}

/** Meandro grego (chave grega) em faixa horizontal. */
export function meanderPath(x0: number, y: number, width: number, h: number) {
  const cell = h * 2;
  let d = "";
  for (let x = x0; x + cell <= x0 + width; x += cell) {
    d += `M${x} ${y + h} V${y} H${x + h * 1.6} V${y + h * 0.75} H${x + h * 0.5} V${y + h * 0.35} H${x + h * 1.1} `;
    d += `M${x} ${y + h} H${x + cell} `;
  }
  return d;
}

/** Decoração ao longo da trilha: colunas jônicas (grego) ou ramos de oliveira e letras (hebraico). */
function TrailOrnaments({ theme, colors: c, width, height }: { theme: LanguageTrailTheme; colors: LanguageTrailColors; width: number; height: number }) {
  const items: React.ReactElement[] = [];
  const step = 520;
  for (let y = TRAIL_LAYOUT.top + 120, i = 0; y < height - 160; y += step, i += 1) {
    const left = i % 2 === 0;
    const x = left ? 14 : width - 14;
    if (theme.id === "greek") items.push(<IonicColumn key={i} x={x} y={y} color={c.ornament} />);
    else items.push(<OliveBranch key={i} x={x} y={y} flip={!left} color={c.node} stem={c.ornament} />);
  }
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none" opacity={0.35}>
      {items}
    </Svg>
  );
}

function IonicColumn({ x, y, color }: { x: number; y: number; color: string }) {
  const w = 22; const h = 150; const left = x - w / 2;
  return (
    <G>
      <Rect x={left - 6} y={y} width={w + 12} height={6} rx={2} fill={color} />
      <Circle cx={left - 4} cy={y + 9} r={5} stroke={color} strokeWidth={2} fill="none" />
      <Circle cx={left + w + 4} cy={y + 9} r={5} stroke={color} strokeWidth={2} fill="none" />
      <Rect x={left} y={y + 12} width={w} height={h} fill="none" stroke={color} strokeWidth={2} />
      <Line x1={left + 7} y1={y + 16} x2={left + 7} y2={y + h + 8} stroke={color} strokeWidth={1.5} />
      <Line x1={left + 15} y1={y + 16} x2={left + 15} y2={y + h + 8} stroke={color} strokeWidth={1.5} />
      <Rect x={left - 6} y={y + h + 12} width={w + 12} height={8} rx={2} fill={color} />
    </G>
  );
}

function OliveBranch({ x, y, flip, color, stem }: { x: number; y: number; flip: boolean; color: string; stem: string }) {
  const s = flip ? -1 : 1;
  const leaves = [0, 1, 2, 3, 4];
  return (
    <G>
      <Path d={`M${x} ${y} Q${x + 26 * s} ${y + 60} ${x + 6 * s} ${y + 130}`} stroke={stem} strokeWidth={2.5} fill="none" />
      {leaves.map((i) => {
        const ly = y + 18 + i * 24;
        const lx = x + (14 - i * 2) * s + (i % 2 ? 10 : -6) * s;
        return <Ellipse key={i} cx={lx} cy={ly} rx={11} ry={4.5} fill={color} transform={`rotate(${(i % 2 ? 35 : -35) * s} ${lx} ${ly})`} />;
      })}
      <Circle cx={x + 18 * s} cy={y + 70} r={4} fill={stem} />
    </G>
  );
}

const makeStyles = (c: LanguageTrailColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.ground },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: c.groundDeep, borderBottomWidth: 1, borderBottomColor: c.line },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: c.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  headerTitle: { color: c.text, fontSize: 19, fontWeight: "900" },
  dictButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, minHeight: 38, borderRadius: 19, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.card },
  dictText: { color: c.text, fontSize: 13, fontWeight: "900" },
  hero: { paddingHorizontal: 18, paddingTop: 14, gap: 8, overflow: "hidden" },
  heroGlyph: { position: "absolute", right: 10, top: -18, fontSize: 120, fontWeight: "900", color: c.ornament, opacity: 0.12 },
  heroGlyphRight: { right: undefined, left: 10 },
  heroSubtitle: { color: c.muted, fontSize: 15, lineHeight: 21, maxWidth: 300 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: c.path, overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 5, backgroundColor: c.pathDone },
  progressText: { color: c.text, fontSize: 13, fontWeight: "900" },
  stat: { color: c.muted, fontSize: 13, fontWeight: "700" },
  lumiWrap: { position: "absolute", alignItems: "center", width: 112 },
  bubble: { position: "absolute", bottom: "100%", marginBottom: -4, width: 150, padding: 8, borderRadius: 14, backgroundColor: c.card, borderWidth: 1.5, borderColor: c.line },
  bubbleText: { color: c.text, fontSize: 12, fontWeight: "800", textAlign: "center" },
  toast: { position: "absolute", left: 24, right: 24, bottom: 110, padding: 12, borderRadius: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  toastText: { color: c.text, fontSize: 14, fontWeight: "800", textAlign: "center" },
  ctaBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, backgroundColor: c.groundDeep, borderTopWidth: 1, borderTopColor: c.line },
  cta: { flexDirection: "row", gap: 8, minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, backgroundColor: c.cta, borderBottomWidth: 5, borderBottomColor: c.ctaShadow },
  ctaPressed: { borderBottomWidth: 2, marginTop: 3 },
  ctaText: { color: c.ctaText, fontSize: 16, fontWeight: "900", flexShrink: 1 }
});
