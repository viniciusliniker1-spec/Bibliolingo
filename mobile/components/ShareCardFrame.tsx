import { forwardRef, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import { routeBackgrounds } from "../assets/sceneAssets";
import type { LumiMoodId } from "../domain/lumiMood";

export const CARD_GOLD = "#f2b84b";
export const CARD_GOLD_SOFT = "#ffd98f";
export const CARD_NAVY = "#0b1a2c";

interface Props {
  width: number;
  /** Id do livro cujo fundo ilustrado aparece atrás do cartão. */
  backgroundBookId?: string;
  dateLabel: string;
  mood: LumiMoodId;
  /** Selo dourado no topo (ex.: “RESUMO DA SEMANA”). */
  badge: string;
  children: (u: (value: number) => number) => ReactNode;
}

/**
 * Moldura 9:16 dos cartões de compartilhar (resumo, marcos…). As medidas escalam com a largura,
 * então a captura sai igual em qualquer tamanho. Cores fixas: é uma peça de marca.
 */
export const ShareCardFrame = forwardRef<View, Props>(function ShareCardFrame({ width, backgroundBookId = "genesis", dateLabel, mood, badge, children }, ref) {
  const u = (value: number) => (value * width) / 360;
  const height = (width * 16) / 9;
  const background = routeBackgrounds[backgroundBookId] as ImageSource | undefined;
  return (
    <View ref={ref} collapsable={false} style={{ width, height, backgroundColor: CARD_NAVY, overflow: "hidden" }}>
      {background ? <Image source={background} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} /> : null}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={CARD_NAVY} stopOpacity="0.85" />
            <Stop offset="0.3" stopColor={CARD_NAVY} stopOpacity="0.45" />
            <Stop offset="0.55" stopColor={CARD_NAVY} stopOpacity="0.55" />
            <Stop offset="0.8" stopColor={CARD_NAVY} stopOpacity="0.8" />
            <Stop offset="1" stopColor={CARD_NAVY} stopOpacity="0.96" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#shade)" />
      </Svg>

      <View style={{ flex: 1, paddingHorizontal: u(22), paddingTop: u(22), paddingBottom: u(20) }}>
        <View style={styles.row}>
          <View style={styles.brand}>
            <Image source={require("../assets/generated/app_icon.png")} style={{ width: u(30), height: u(30), borderRadius: u(8) }} contentFit="cover" />
            <Text style={{ color: "#ffffff", fontSize: u(16), fontWeight: "900", marginLeft: u(8) }}>Bibliolingo</Text>
          </View>
          <Text style={{ color: "#b9cbe0", fontSize: u(12), fontWeight: "700" }}>{dateLabel}</Text>
        </View>

        <View style={styles.center}>
          <View style={{ backgroundColor: CARD_GOLD, paddingHorizontal: u(14), paddingVertical: u(6), borderRadius: u(14), marginBottom: u(20) }}>
            <Text style={{ color: "#10243e", fontSize: u(12), fontWeight: "900", letterSpacing: u(2) }}>{badge}</Text>
          </View>
          {children(u)}
        </View>

        <View style={[styles.row, { alignItems: "flex-end" }]}>
          <Image source={lumiMoodAssets[mood]} style={{ width: u(104), height: u(104) }} contentFit="contain" />
          <View style={{ flex: 1, marginLeft: u(10), paddingBottom: u(10) }}>
            <Text style={{ color: "#ffffff", fontSize: u(15), fontWeight: "900", lineHeight: u(19) }}>Estude a Bíblia de um jeito divertido, com a Lumi</Text>
            <Text style={{ color: CARD_GOLD, fontSize: u(12), fontWeight: "800", marginTop: u(4) }}>Baixe o Bibliolingo</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" }
});
