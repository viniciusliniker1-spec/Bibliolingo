import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, G, Path, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { LAKES, RIVERS, type BiblicalMap, type LonLat, type MapPlace } from "../content/maps/biblicalMaps";
import { COASTLINES } from "../content/maps/coastlines";
import { usePalette } from "../providers/ThemeProvider";

export interface MapColors { sea: string; land: string; coast: string; river: string; label: string; region: string; place: string; halo: string }

export function mapColors(isDark: boolean): MapColors {
  return isDark
    ? { sea: "#12324f", land: "#cdbd93", coast: "#8f7c52", river: "#3f8fd0", label: "#20180b", region: "rgba(60,44,20,0.55)", place: "#5a3d16", halo: "#efe3c4" }
    : { sea: "#a8d0e8", land: "#f1e6c8", coast: "#b39b67", river: "#3c86c4", label: "#2e2410", region: "rgba(90,66,30,0.5)", place: "#6b4a1c", halo: "#fffaf0" };
}

export function projector(id: string) {
  const coast = COASTLINES[id];
  const [west, south, east, north] = coast.bbox;
  const k = Math.cos(((south + north) / 2) * Math.PI / 180);
  const scale = coast.width / ((east - west) * k);
  return { coast, project: ([lon, lat]: LonLat) => [(lon - west) * k * scale, (north - lat) * scale] as [number, number] };
}

interface Props {
  map: BiblicalMap;
  selectedPlace?: string;
  onSelectPlace?: (place: MapPlace) => void;
  activeRoutes?: string[];
  /** Largura em pontos; a altura segue a proporção do mapa. */
  width?: number;
  /** Mapa em miniatura: sem rótulos nem toques. */
  thumbnail?: boolean;
}

/** Mapa bíblico em SVG, com litoral real, rios, rotas e lugares tocáveis. */
export function BibleMap({ map, selectedPlace, onSelectPlace, activeRoutes, width, thumbnail }: Props) {
  const palette = usePalette();
  const c = mapColors(palette.isDark);
  const { width: screen } = useWindowDimensions();
  const { coast, project } = useMemo(() => projector(map.id), [map.id]);
  const w = width ?? screen - 32;
  const h = (w * coast.height) / coast.width;
  const unit = coast.width / 1000;
  const places = useMemo(() => new Map(map.places.map((place) => [place.id, place])), [map]);
  const line = (points: LonLat[]) => points.map((point) => project(point).map((v) => v.toFixed(1)).join(",")).join(" ");
  const routes = map.routes.filter((route) => !activeRoutes || activeRoutes.includes(route.id));
  const onRoute = new Set(routes.flatMap((route) => route.stops));
  const font = thumbnail ? 0 : 30 * unit;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${coast.width} ${coast.height}`} accessibilityLabel={`Mapa: ${map.title}`}>
      <Rect x={0} y={0} width={coast.width} height={coast.height} fill={c.sea} />
      <Path d={coast.land} fill={c.land} stroke={c.coast} strokeWidth={2.5 * unit} fillRule="evenodd" />
      {Object.values(RIVERS).map((river, i) => <Polyline key={i} points={line(river)} fill="none" stroke={c.river} strokeWidth={(thumbnail ? 3 : 4) * unit} strokeLinejoin="round" strokeLinecap="round" />)}
      {Object.values(LAKES).map((lake, i) => <Path key={i} d={"M" + lake.map((p) => project(p).join(" ")).join("L") + "Z"} fill={c.sea} stroke={c.river} strokeWidth={2 * unit} />)}

      {!thumbnail ? map.regions.map((region) => {
        const [x, y] = project(region.at);
        return <SvgText key={region.name} x={x} y={y} fill={c.region} fontSize={(region.size ?? 13) * 2.4 * unit} fontWeight="800" letterSpacing={4 * unit} textAnchor="middle">{region.name}</SvgText>;
      }) : null}

      {routes.map((route) => (
        <G key={route.id}>
          <Polyline points={line(route.stops.map((id) => places.get(id)!.at))} fill="none" stroke={c.halo} strokeWidth={(thumbnail ? 7 : 11) * unit} strokeLinejoin="round" strokeLinecap="round" opacity={0.7} />
          <Polyline points={line(route.stops.map((id) => places.get(id)!.at))} fill="none" stroke={route.color} strokeWidth={(thumbnail ? 4 : 6) * unit} strokeDasharray={`${16 * unit} ${10 * unit}`} strokeLinejoin="round" strokeLinecap="round" />
        </G>
      ))}

      {map.places.map((place) => {
        const [x, y] = project(place.at);
        const selected = place.id === selectedPlace;
        const r = (place.major ? 11 : 8) * unit * (selected ? 1.5 : 1);
        const side = place.label ?? "right";
        const dx = side === "right" ? r + 8 * unit : side === "left" ? -(r + 8 * unit) : 0;
        const dy = side === "top" ? -(r + 10 * unit) : side === "bottom" ? r + font : font * 0.35;
        const anchor = side === "right" ? "start" : side === "left" ? "end" : "middle";
        const size = font * (place.major ? 1.05 : 0.88);
        return (
          <G key={place.id} onPress={onSelectPlace && !thumbnail ? () => onSelectPlace(place) : undefined}>
            {!thumbnail ? <Circle cx={x} cy={y} r={r * 2.4} fill="transparent" /> : null}
            {selected ? <Circle cx={x} cy={y} r={r * 1.9} fill="none" stroke={c.place} strokeWidth={3 * unit} opacity={0.6} /> : null}
            <Circle cx={x} cy={y} r={r} fill={onRoute.has(place.id) ? "#c0392b" : c.place} stroke={c.halo} strokeWidth={3 * unit} />
            {!thumbnail ? (
              <>
                <SvgText x={x + dx} y={y + dy} fontSize={size} fontWeight={place.major ? "900" : "700"} textAnchor={anchor} stroke={c.halo} strokeWidth={6 * unit} strokeLinejoin="round">{place.name}</SvgText>
                <SvgText x={x + dx} y={y + dy} fontSize={size} fontWeight={place.major ? "900" : "700"} textAnchor={anchor} fill={c.label}>{place.name}</SvgText>
              </>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}

/** Mapa com zoom simples (1×/2×) e rolagem quando ampliado. */
export function ZoomableMap(props: Omit<Props, "width">) {
  const { width: screen } = useWindowDimensions();
  const palette = usePalette();
  const [zoom, setZoom] = useState(1);
  const base = screen - 32;
  return (
    <View>
      <ScrollView horizontal scrollEnabled={zoom > 1} showsHorizontalScrollIndicator={false} style={styles.frame} contentContainerStyle={{ width: base * zoom }}>
        <ScrollView nestedScrollEnabled scrollEnabled={zoom > 1} showsVerticalScrollIndicator={false} style={{ maxHeight: base * 1.25 }}>
          <BibleMap {...props} width={base * zoom} />
        </ScrollView>
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel={zoom > 1 ? "Afastar mapa" : "Aproximar mapa"} onPress={() => setZoom(zoom > 1 ? 1 : 2)}
        style={[styles.zoom, { backgroundColor: palette.card, borderColor: palette.line }]}>
        <Text style={{ color: palette.text, fontSize: 20, fontWeight: "900" }}>{zoom > 1 ? "−" : "+"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 18, overflow: "hidden" },
  zoom: { position: "absolute", right: 10, bottom: 10, width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1.5 }
});
