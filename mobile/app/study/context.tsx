import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseBibleReference } from "../../../src/domain/bibleReference";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon } from "../../components/navigation/Icons";
import { biblicalTimeline, contextualRoutes, type TimelineEvent } from "../../content/biblicalContext";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";

const CERTAINTY: Record<TimelineEvent["certainty"], { label: string; color: string }> = {
  textual: { label: "Data histórica", color: "#4caf6a" },
  approximate: { label: "Aproximada", color: "#f2b84b" },
  debated: { label: "Debatida", color: "#e5739a" }
};

/** "Gênesis 12–50" → abre Gênesis 12:1; "Atos" → Atos 1:1. */
function referenceTarget(label: string) {
  const match = label.match(/^(.+?)\s+(\d+)/);
  const name = match ? match[1] : label.split(/[–-]/)[0].trim();
  const chapter = match ? match[2] : "1";
  return parseBibleReference(`${name} ${chapter}:1`, "Gen", 1);
}

export default function ContextScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const eras = useMemo(() => [...new Set(biblicalTimeline.map((item) => item.era))], []);
  const [era, setEra] = useState<string>();
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});

  const jump = (target: string) => {
    setEra(target);
    const first = biblicalTimeline.find((item) => item.era === target);
    const y = first ? positions.current[first.id] : undefined;
    if (y !== undefined) scrollRef.current?.scrollTo({ y: y - 8, animated: true });
  };

  const open = (label: string) => {
    const target = referenceTarget(label);
    if (target) router.push({ pathname: "/(tabs)/bible", params: { osis: target.book.osis, chapter: String(target.chapter), verse: "1" } });
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Linha do tempo" }} />
      {/* Eras: atalhos fixos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eraBar} contentContainerStyle={styles.eras}>
        {eras.map((item) => (
          <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: era === item }} onPress={() => jump(item)} style={[styles.eraChip, era === item && styles.eraChipActive]}>
            <Text style={[styles.eraText, era === item && styles.eraTextActive]}>{item.toLocaleLowerCase("pt-BR").replace(/(^|\s)\S/g, (c) => c.toLocaleUpperCase("pt-BR"))}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.hero}>
          <LumiCharacter mood="explaining" motion="thinking" style={styles.heroLumi} accessibilityLabel="Lumi explicando" />
          <View style={styles.flex}>
            <Text style={styles.title}>Da Criação à Igreja</Text>
            <Text style={styles.muted}>A grande história da Bíblia em ordem. Toque numa referência para ler.</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {Object.values(CERTAINTY).map((item) => <View key={item.label} style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: item.color }]} /><Text style={styles.legendText}>{item.label}</Text></View>)}
        </View>

        {biblicalTimeline.map((item, index) => {
          const certainty = CERTAINTY[item.certainty];
          const newEra = index === 0 || biblicalTimeline[index - 1].era !== item.era;
          return (
            <View key={item.id} onLayout={(event) => { positions.current[item.id] = event.nativeEvent.layout.y; }}>
              {newEra ? <Text style={styles.eraHeading}>{item.era}</Text> : null}
              <View style={styles.event}>
                <View style={styles.axis}>
                  <View style={[styles.dot, { backgroundColor: certainty.color }]} />
                  {index < biblicalTimeline.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={[styles.card, era === item.era && styles.cardActive]}>
                  <Text style={[styles.period, { color: certainty.color }]}>{item.period}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.body}>{item.summary}</Text>
                  <View style={styles.refs}>
                    {item.references.map((ref) => (
                      <Pressable key={ref} accessibilityRole="link" accessibilityLabel={`Ler ${ref}`} onPress={() => open(ref)} style={styles.refPill}>
                        <Icon name="book" size={13} color={palette.accent} /><Text style={styles.refText}>{ref}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={styles.section}>Rotas históricas</Text>
        {contextualRoutes.map((route) => (
          <View key={route.id} style={styles.routeCard}>
            <Text style={styles.cardTitle}>{route.title}</Text>
            <View style={styles.places}>
              {route.places.map((place, i) => (
                <View key={place} style={styles.placeWrap}>
                  <View style={[styles.place, i === 0 && styles.placeStart, i === route.places.length - 1 && styles.placeEnd]}><Text style={styles.placeText}>{place}</Text></View>
                  {i < route.places.length - 1 ? <Icon name="chevronRight" size={16} color={palette.xp} /> : null}
                </View>
              ))}
            </View>
            <Text style={styles.note}>{route.note}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  eraBar: { flexGrow: 0, flexShrink: 0, height: 56, borderBottomWidth: 1, borderBottomColor: p.divider, backgroundColor: p.groundDeep },
  eras: { gap: 8, paddingHorizontal: 14, alignItems: "center", height: 56 },
  eraChip: { paddingHorizontal: 12, minHeight: 34, justifyContent: "center", borderRadius: 17, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  eraChipActive: { borderColor: p.accent, backgroundColor: p.activeTabBg },
  eraText: { color: p.textMuted, fontSize: 13, fontWeight: "800" },
  eraTextActive: { color: p.accent },
  content: { padding: 16, gap: 10 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  heroLumi: { width: 84, height: 80 },
  title: { color: p.text, fontSize: 22, fontWeight: "900" },
  muted: { color: p.textMuted, fontSize: 14, lineHeight: 20 },
  legend: { flexDirection: "row", gap: 14, flexWrap: "wrap", paddingHorizontal: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: p.textMuted, fontSize: 12, fontWeight: "700" },
  eraHeading: { color: p.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1.3, marginTop: 14, marginBottom: 6, marginLeft: 34 },
  event: { flexDirection: "row", gap: 12 },
  axis: { width: 22, alignItems: "center" },
  dot: { width: 16, height: 16, borderRadius: 8, marginTop: 18, borderWidth: 3, borderColor: p.ground },
  line: { width: 3, flex: 1, backgroundColor: p.line, marginTop: 2 },
  card: { flex: 1, gap: 4, padding: 14, marginBottom: 10, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  cardActive: { borderColor: p.accent },
  period: { fontSize: 12, fontWeight: "900" },
  cardTitle: { color: p.text, fontSize: 17, fontWeight: "900" },
  body: { color: p.textMuted, fontSize: 14, lineHeight: 20 },
  refs: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  refPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, minHeight: 30, borderRadius: 15, backgroundColor: p.activeTabBg },
  refText: { color: p.accent, fontSize: 12, fontWeight: "900" },
  section: { color: p.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 14 },
  routeCard: { gap: 10, padding: 16, borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  places: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 },
  placeWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  place: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: p.groundDeep, borderWidth: 1, borderColor: p.line },
  placeStart: { borderColor: p.accent },
  placeEnd: { borderColor: p.xp },
  placeText: { color: p.text, fontSize: 12, fontWeight: "800" },
  note: { color: p.textMuted, fontSize: 12, lineHeight: 17 }
});
