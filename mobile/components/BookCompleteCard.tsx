import { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import { routeBackgrounds } from "../assets/sceneAssets";
import { LumiAvatar } from "./social/LumiAvatar";

export interface BookCardData {
  /** Nome de quem estuda; sem nome, o cartão fala em primeira pessoa. */
  name?: string;
  bookId: string;
  bookTitle: string;
  activities: number;
  xp: number;
  streak: number;
  dateLabel: string;
  photoUrl?: string;
  skinId: string;
  lastOfBible: boolean;
}

const GOLD = "#f2b84b";
const GOLD_SOFT = "#ffd98f";
const NAVY = "#0b1a2c";

/**
 * Cartão de felicitações (9:16) para ver na tela e compartilhar como imagem.
 * As medidas escalam com a largura, então a captura sai igual em qualquer tamanho.
 * Cores fixas (não seguem o tema): o cartão é uma peça de marca.
 */
export const BookCompleteCard = forwardRef<View, { width: number; data: BookCardData }>(function BookCompleteCard({ width, data }, ref) {
  const u = (value: number) => (value * width) / 360;
  const height = (width * 16) / 9;
  const background = routeBackgrounds[data.bookId];
  const stats = [
    { value: String(data.activities), label: data.activities === 1 ? "etapa" : "etapas" },
    { value: data.xp.toLocaleString("pt-BR"), label: "XP" },
    data.streak > 1 ? { value: String(data.streak), label: "dias seguidos" } : undefined
  ].filter((item): item is { value: string; label: string } => Boolean(item));

  return (
    <View ref={ref} collapsable={false} style={{ width, height, backgroundColor: NAVY, overflow: "hidden" }}>
      {background ? <Image source={background} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} /> : null}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={NAVY} stopOpacity="0.82" />
            <Stop offset="0.28" stopColor={NAVY} stopOpacity="0.28" />
            <Stop offset="0.5" stopColor={NAVY} stopOpacity="0.2" />
            <Stop offset="0.74" stopColor={NAVY} stopOpacity="0.72" />
            <Stop offset="1" stopColor={NAVY} stopOpacity="0.95" />
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
          <Text style={{ color: "#b9cbe0", fontSize: u(12), fontWeight: "700" }}>{data.dateLabel}</Text>
        </View>

        <View style={styles.center}>
          <View style={{ backgroundColor: GOLD, paddingHorizontal: u(14), paddingVertical: u(6), borderRadius: u(14) }}>
            <Text style={{ color: "#10243e", fontSize: u(12), fontWeight: "900", letterSpacing: u(2) }}>{data.lastOfBible ? "BÍBLIA COMPLETA" : "LIVRO CONCLUÍDO"}</Text>
          </View>

          <View style={{ marginTop: u(26), width: u(120), height: u(120), borderRadius: u(60), borderWidth: u(4), borderColor: GOLD, overflow: "hidden", backgroundColor: "#16304d" }}>
            {data.photoUrl
              ? <Image source={{ uri: data.photoUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              : <LumiAvatar skinId={data.skinId} size={u(112)} ring="transparent" />}
          </View>

          {data.name ? <Text numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: u(14), maxWidth: "92%", color: "#ffffff", fontSize: u(30), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: u(8) }}>{data.name}</Text> : null}
          <Text style={{ marginTop: u(data.name ? 4 : 18), color: "#d4e1ee", fontSize: u(14), fontWeight: "800", letterSpacing: u(3) }}>{data.name ? "CONCLUIU" : "EU CONCLUÍ"}</Text>
          <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6} style={{ marginTop: u(6), maxWidth: "94%", textAlign: "center", color: GOLD_SOFT, fontSize: u(44), lineHeight: u(50), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: u(12) }}>{data.bookTitle}</Text>

          <View style={{ flexDirection: "row", gap: u(8), marginTop: u(22) }}>
            {stats.map((stat) => (
              <View key={stat.label} style={{ minWidth: u(82), alignItems: "center", paddingVertical: u(9), paddingHorizontal: u(10), borderRadius: u(14), backgroundColor: "rgba(11,26,44,0.72)", borderWidth: 1, borderColor: "rgba(255,217,143,0.45)" }}>
                <Text style={{ color: "#ffffff", fontSize: u(20), fontWeight: "900" }}>{stat.value}</Text>
                <Text style={{ color: "#b9cbe0", fontSize: u(11), fontWeight: "700" }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.row, { alignItems: "flex-end" }]}>
          <Image source={lumiMoodAssets.coroa} style={{ width: u(104), height: u(104) }} contentFit="contain" />
          <View style={{ flex: 1, marginLeft: u(10), paddingBottom: u(10) }}>
            <Text style={{ color: "#ffffff", fontSize: u(15), fontWeight: "900", lineHeight: u(19) }}>Estude a Bíblia de um jeito divertido, com a Lumi</Text>
            <Text style={{ color: GOLD, fontSize: u(12), fontWeight: "800", marginTop: u(4) }}>Baixe o Bibliolingo</Text>
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
