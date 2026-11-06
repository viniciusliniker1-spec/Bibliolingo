import { useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Icon } from "./navigation/Icons";

interface Props {
  glyph: string;
  size: number;
  ink: string;
  guide: string;
  background: string;
  /** Chamado quando o traçado cobre o suficiente da letra. */
  onComplete: () => void;
}

/**
 * Prática de escrita: a pessoa passa o dedo por cima da letra-guia.
 * Considera completo quando o traço percorre um comprimento proporcional ao tamanho.
 */
export function TracingPad({ glyph, size, ink, guide, background, onComplete }: Props) {
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef("");
  const length = useRef(0);
  const last = useRef<{ x: number; y: number } | undefined>(undefined);
  const done = useRef(false);
  const [, force] = useState(0);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX: x, locationY: y } = event.nativeEvent;
      current.current = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      last.current = { x, y };
      force((n) => n + 1);
    },
    onPanResponderMove: (event) => {
      const { locationX: x, locationY: y } = event.nativeEvent;
      const prev = last.current;
      if (prev) length.current += Math.hypot(x - prev.x, y - prev.y);
      last.current = { x, y };
      current.current += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      force((n) => n + 1);
      if (!done.current && length.current > size * 1.6) { done.current = true; onComplete(); }
    },
    onPanResponderRelease: () => {
      setPaths((list) => [...list, current.current]);
      current.current = "";
    }
  }), [size, onComplete]);

  const clear = () => { setPaths([]); current.current = ""; length.current = 0; done.current = false; force((n) => n + 1); };

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View {...responder.panHandlers} style={[styles.pad, { width: size, height: size, backgroundColor: background }]} accessibilityLabel={`Área para traçar a letra ${glyph}`}>
        <Text style={[styles.guide, { fontSize: size * 0.72, lineHeight: size * 0.95, color: guide }]} allowFontScaling={false}>{glyph}</Text>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          {[...paths, current.current].filter(Boolean).map((d, i) => <Path key={i} d={d} stroke={ink} strokeWidth={size * 0.06} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
        </Svg>
      </View>
      <Pressable accessibilityRole="button" onPress={clear} hitSlop={8} style={styles.clear}>
        <Icon name="refresh" size={14} color={guide} /><Text style={[styles.clearText, { color: guide }]}>Apagar e tentar de novo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  guide: { textAlign: "center", fontWeight: "400" },
  clear: { flexDirection: "row", alignItems: "center", gap: 6 },
  clearText: { fontSize: 13, fontWeight: "800" }
});
