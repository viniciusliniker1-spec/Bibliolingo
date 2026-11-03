import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseBibleReference } from "../../../../src/domain/bibleReference";
import { ZoomableMap } from "../../../components/BibleMap";
import { Icon } from "../../../components/navigation/Icons";
import { biblicalMapById, type MapPlace } from "../../../content/maps/biblicalMaps";
import { useLightStatusBar } from "../../../hooks/useLightStatusBar";
import { usePalette, useThemedStyles } from "../../../providers/ThemeProvider";
import type { Palette } from "../../../theme/tokens";

function openTarget(label: string) {
  const match = label.match(/^(.+?)\s+(\d+)/);
  return parseBibleReference(`${match ? match[1] : label} ${match ? match[2] : 1}:1`, "Gen", 1);
}

export default function MapScreen() {
  useLightStatusBar();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{ id: string; place?: string }>();
  const map = biblicalMapById.get(params.id ?? "") ?? biblicalMapById.get("mundo")!;
  const [selected, setSelected] = useState<MapPlace | undefined>(map.places.find((place) => place.id === params.place));
  const [routes, setRoutes] = useState<string[]>(map.routes.map((route) => route.id));
  const routeOf = useMemo(() => (place?: MapPlace) => map.routes.filter((route) => place && route.stops.includes(place.id)), [map]);

  const read = (ref: string) => {
    const target = openTarget(ref);
    if (target) router.push({ pathname: "/(tabs)/bible", params: { osis: target.book.osis, chapter: String(target.chapter), verse: "1" } });
  };
  const toggle = (id: string) => setRoutes((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title: map.title }} />
      <Text style={styles.subtitle}>{map.subtitle}</Text>

      {map.routes.length ? (
        <View style={styles.routes}>
          {map.routes.map((route) => (
            <Pressable key={route.id} accessibilityRole="checkbox" accessibilityState={{ checked: routes.includes(route.id) }} onPress={() => toggle(route.id)}
              style={[styles.routeChip, routes.includes(route.id) && { borderColor: route.color, backgroundColor: route.color + "22" }]}>
              <View style={[styles.routeLine, { backgroundColor: route.color, opacity: routes.includes(route.id) ? 1 : 0.35 }]} />
              <Text style={styles.routeText}>{route.name}</Text>
              {route.note ? <Text style={styles.routeNote}>{route.note}</Text> : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      <ZoomableMap map={map} selectedPlace={selected?.id} onSelectPlace={setSelected} activeRoutes={routes} />

      {selected ? (
        <View style={styles.placeCard} accessibilityLiveRegion="polite">
          <View style={styles.placeHead}>
            <Icon name="pin" size={18} color={palette.xp} />
            <Text style={styles.placeName}>{selected.name}</Text>
            <Pressable onPress={() => setSelected(undefined)} hitSlop={8} accessibilityLabel="Fechar"><Icon name="close" size={16} color={palette.textMuted} /></Pressable>
          </View>
          <Text style={styles.placeNote}>{selected.note}</Text>
          {routeOf(selected).length ? <Text style={styles.placeRoute}>Na rota: {routeOf(selected).map((route) => route.name).join(" · ")}</Text> : null}
          <View style={styles.refs}>
            {selected.refs.map((ref) => (
              <Pressable key={ref} accessibilityRole="link" onPress={() => read(ref)} style={styles.refPill}><Icon name="book" size={13} color={palette.accent} /><Text style={styles.refText}>{ref}</Text></Pressable>
            ))}
          </View>
        </View>
      ) : <Text style={styles.hint}>Toque num ponto do mapa para saber o que aconteceu ali. Use + para aproximar.</Text>}

      {map.caution ? <View style={styles.caution}><Icon name="bulb" size={16} color={palette.xp} /><Text style={styles.cautionText}>{map.caution}</Text></View> : null}

      <Text style={styles.section}>Lugares</Text>
      <View style={styles.list}>
        {map.places.map((place, i) => (
          <Pressable key={place.id} accessibilityRole="button" onPress={() => setSelected(place)} style={[styles.row, i > 0 && styles.rowDivider, selected?.id === place.id && styles.rowActive]}>
            <View style={[styles.dot, place.major && styles.dotMajor]} />
            <View style={styles.flex}><Text style={styles.rowTitle}>{place.name}</Text><Text style={styles.rowNote} numberOfLines={1}>{place.note}</Text></View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { padding: 16, gap: 12 },
  flex: { flex: 1 },
  subtitle: { color: p.textMuted, fontSize: 14, fontWeight: "600" },
  routes: { gap: 8 },
  routeChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, minHeight: 40, borderRadius: 14, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  routeLine: { width: 22, height: 5, borderRadius: 3 },
  routeText: { color: p.text, fontSize: 14, fontWeight: "900" },
  routeNote: { marginLeft: "auto", color: p.textMuted, fontSize: 12, fontWeight: "700" },
  placeCard: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: p.card, borderWidth: 1.5, borderColor: p.xp },
  placeHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  placeName: { flex: 1, color: p.text, fontSize: 19, fontWeight: "900" },
  placeNote: { color: p.text, fontSize: 15, lineHeight: 22 },
  placeRoute: { color: p.xp, fontSize: 12, fontWeight: "800" },
  refs: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  refPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, minHeight: 32, borderRadius: 16, backgroundColor: p.activeTabBg },
  refText: { color: p.accent, fontSize: 12, fontWeight: "900" },
  hint: { color: p.textMuted, fontSize: 13, textAlign: "center" },
  caution: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 14, backgroundColor: p.goldSoft },
  cautionText: { flex: 1, color: p.text, fontSize: 13, lineHeight: 19 },
  section: { color: p.textMuted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 6 },
  list: { borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: p.divider },
  rowActive: { backgroundColor: p.activeTabBg },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: p.xp },
  dotMajor: { width: 14, height: 14, borderRadius: 7 },
  rowTitle: { color: p.text, fontSize: 15, fontWeight: "900" },
  rowNote: { color: p.textMuted, fontSize: 12 }
});
