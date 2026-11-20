import { memo, useEffect, useId, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { stickerArt } from "../assets/stickerAssets";
import { STICKER_RARITY_LABEL, type Sticker } from "../domain/chestRewards";
import { CARD_STAT_KEYS, CARD_STAT_LABEL, CARD_STAT_NAME, cardProfile, lumiCardById, type CardRarity } from "../domain/lumiCards";

/**
 * Carta colecionável da Lumi, no estilo das cartas de jogos de futebol: escudo metálico por raridade
 * (bronze, prata, ouro e holográfica), nota geral grande, arte da Lumi, nome e seis atributos.
 * Desenhada em um quadro de 100 x 140; tudo escala com a largura.
 */

interface Palette {
  bg: [string, string, string];
  rim: [string, string];
  ink: string;
  sub: string;
  accent: string;
  glow: string;
  ray: string;
  panel: string;
  panelLine: string;
  label: string;
  plate: [string, string];
  plateInk: string;
}

const PALETTE: Record<CardRarity, Palette> = {
  common: { bg: ["#f0c9a0", "#c98a55", "#7d4a26"], rim: ["#ffe6c8", "#8a5028"], ink: "#3b200c", sub: "#6e4220", accent: "#ffe9cf", glow: "#ffdcb4", ray: "#fff3e2", panel: "rgba(255,238,215,0.30)", panelLine: "rgba(80,44,16,0.45)", label: "COMUM", plate: ["#7a4623", "#4d2a12"], plateInk: "#ffe9cf" },
  rare: { bg: ["#fbfcff", "#c8d0dc", "#7d8899"], rim: ["#ffffff", "#7b8696"], ink: "#1c2634", sub: "#46525f", accent: "#ffffff", glow: "#eef4ff", ray: "#ffffff", panel: "rgba(255,255,255,0.38)", panelLine: "rgba(60,72,90,0.45)", label: "RARA", plate: ["#4a586b", "#2a3544"], plateInk: "#ffffff" },
  epic: { bg: ["#fff4b8", "#f5c744", "#b27813"], rim: ["#fffbd8", "#a86f0e"], ink: "#3a2404", sub: "#6b4508", accent: "#fff7cc", glow: "#fff3a8", ray: "#fffce6", panel: "rgba(255,248,214,0.38)", panelLine: "rgba(112,70,6,0.5)", label: "ÉPICA", plate: ["#a8700f", "#6b4508"], plateInk: "#fff4b8" },
  legendary: { bg: ["#101a3e", "#38207f", "#0c7391"], rim: ["#ffeaa6", "#8e5a00"], ink: "#ffeaa6", sub: "#bfeaff", accent: "#7df3ff", glow: "#8d6bff", ray: "#9fe9ff", panel: "rgba(6,12,38,0.52)", panelLine: "rgba(255,226,140,0.55)", label: "LENDÁRIA", plate: ["#0c1342", "#07102e"], plateInk: "#ffe28a" }
};

const SHIELD = "M8 11 Q8 3 16 3 L38 3 Q50 10 62 3 L84 3 Q92 3 92 11 L92 118 Q92 125 86 129 L56 137 Q50 138.5 44 137 L14 129 Q8 125 8 118 Z";
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function star(x: number, y: number, s: number) {
  return `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;
}

interface Props {
  sticker: Sticker;
  width: number;
  /** Se a carta já está no álbum; fechada aparece como silhueta. */
  owned?: boolean;
  /** Cópias que a pessoa tem (mostra x2, x3…). */
  count?: number;
  /** Faixa de brilho passando pela carta (use em cartas grandes, uma por vez). */
  shine?: boolean;
}

export const LumiCard = memo(function LumiCard({ sticker, width, owned = true, count = 0, shine = false }: Props) {
  const def = lumiCardById(sticker.id);
  const rarity = (def?.rarity ?? sticker.rarity) as CardRarity;
  const p = PALETTE[rarity];
  const profile = useMemo(() => (def ? cardProfile(def) : undefined), [def]);
  const compact = width < 150;
  const u = width / 100;
  const height = width * 1.4;
  const art = stickerArt[sticker.id];
  const sweep = useRef(new Animated.Value(-40)).current;
  // ids de gradiente são globais no SVG da web: cada carta precisa dos seus
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = (name: string) => `${name}${uid}`;

  useEffect(() => {
    if (!shine || !owned) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(900),
      Animated.timing(sweep, { toValue: 130, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(sweep, { toValue: -40, duration: 0, useNativeDriver: false })
    ]));
    loop.start();
    return () => loop.stop();
  }, [shine, owned, sweep]);

  const rays = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180, b = ((i * 30 + 13) * Math.PI) / 180, cx = 60, cy = 36, r = 130;
    return `${cx},${cy} ${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} ${(cx + r * Math.cos(b)).toFixed(1)},${(cy + r * Math.sin(b)).toFixed(1)}`;
  }), []);

  const locked = !owned;
  const bg: [string, string, string] = locked ? ["#3a4152", "#252b3a", "#161b27"] : p.bg;
  const label = `${sticker.name}, carta ${STICKER_RARITY_LABEL[rarity].toLowerCase()}${profile ? `, nota ${profile.overall}` : ""}${count > 1 ? `, ${count} cópias` : ""}`;
  const artBox = compact
    ? { left: 12 * u, top: 8 * u, width: 82 * u, height: 87 * u }
    : { left: 15 * u, top: 7 * u, width: 79 * u, height: 58 * u };
  const plateY = compact ? 94.5 : 63.5;
  const plateH = compact ? 13 : 12.2;
  const nameTop = (plateY + 0.6) * u;
  const nameScale = Math.max(0.58, Math.min(1, (compact ? 9 : 10.5) / Math.max(1, sticker.name.length)));
  const nameSize = (compact ? 9.2 : 8.2) * u * nameScale;

  return (
    <View style={{ width, height }} accessible accessibilityLabel={locked ? `Carta ${STICKER_RARITY_LABEL[rarity].toLowerCase()} ainda não encontrada` : label}>
      <Svg width={width} height={height} viewBox="0 0 100 140" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gid("bg")} x1="10" y1="0" x2="90" y2="140" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={bg[0]} />
            <Stop offset="0.55" stopColor={bg[1]} />
            <Stop offset="1" stopColor={bg[2]} />
          </LinearGradient>
          <LinearGradient id={gid("rim")} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={p.rim[0]} />
            <Stop offset="0.5" stopColor={p.rim[1]} />
            <Stop offset="1" stopColor={p.rim[0]} />
          </LinearGradient>
          <RadialGradient id={gid("glow")} cx="60" cy="38" rx="52" ry="46" fx="60" fy="36" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={locked ? "#8190ad" : p.glow} stopOpacity={locked ? 0.28 : 0.95} />
            <Stop offset="1" stopColor={locked ? "#8190ad" : p.glow} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id={gid("holo")} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#52f0ff" stopOpacity="0.30" />
            <Stop offset="0.35" stopColor="#ff6bd6" stopOpacity="0.26" />
            <Stop offset="0.65" stopColor="#ffd75e" stopOpacity="0.28" />
            <Stop offset="1" stopColor="#52f0ff" stopOpacity="0.30" />
          </LinearGradient>
          <LinearGradient id={gid("shade")} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.30" />
          </LinearGradient>
          <LinearGradient id={gid("sheen")} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
          <ClipPath id={gid("clip")}><Path d={SHIELD} /></ClipPath>
        </Defs>

        <Path d={SHIELD} fill={`url(#${gid("bg")})`} stroke={`url(#${gid("rim")})`} strokeWidth={1.8} />
        <G clipPath={`url(#${gid("clip")})`}>
          {!locked ? rays.map((points, i) => <Path key={i} d={`M${points.replace(/ /g, " L").replace(/,/g, " ")} Z`} fill={p.ray} opacity={i % 2 ? 0.07 : 0.14} />) : null}
          <Rect x={0} y={0} width={100} height={140} fill={`url(#${gid("glow")})`} />
          <Rect x={0} y={84} width={100} height={56} fill={`url(#${gid("shade")})`} />
          {rarity === "legendary" && !locked ? <Rect x={0} y={0} width={100} height={140} fill={`url(#${gid("holo")})`} /> : null}
          {!locked && (rarity === "epic" || rarity === "legendary") ? (
            <G fill={rarity === "legendary" ? "#ffffff" : "#fffbe0"} opacity={0.85}>
              <Path d={star(80, 60, 2.2)} /><Path d={star(24, 54, 1.6)} /><Path d={star(88, 22, 1.4)} /><Path d={star(14, 76, 1.2)} /><Path d={star(70, 12, 1.1)} />
            </G>
          ) : null}
          {/* contorno interno, como na moldura das cartas de jogo */}
          <Path d={SHIELD} fill="none" stroke={p.accent} strokeOpacity={0.55} strokeWidth={0.7} transform="translate(50 70) scale(0.935) translate(-50 -70)" />
          {!compact ? (
            <>
              <Rect x={13} y={79} width={74} height={41} rx={3.5} fill={p.panel} stroke={p.panelLine} strokeWidth={0.5} />
              <Rect x={49.6} y={83} width={0.8} height={33} fill={p.panelLine} />
              <Path d="M16 76.4 L40 76.4 M60 76.4 L84 76.4" stroke={p.panelLine} strokeWidth={0.7} />
              <Path d="M50 74.4 L52 76.4 L50 78.4 L48 76.4 Z" fill={p.ink} opacity={0.8} />
            </>
          ) : null}
          {shine && !locked ? <AnimatedRect x={sweep} y={-20} width={24} height={190} fill={`url(#${gid("sheen")})`} transform="rotate(18 50 70)" /> : null}
        </G>
        {/* emblema */}
        <Circle cx={19.5} cy={compact ? 36 : 40.5} r={4.7} fill={locked ? "#2a3040" : p.ink} fillOpacity={0.92} stroke={p.rim[0]} strokeWidth={0.8} />
        <Path d={`M19.5 ${(compact ? 36 : 40.5) - 2.6} L19.5 ${(compact ? 36 : 40.5) + 2.6} M${19.5 - 1.9} ${(compact ? 36 : 40.5) - 0.7} L${19.5 + 1.9} ${(compact ? 36 : 40.5) - 0.7}`} stroke={locked ? "#6b7690" : rarity === "legendary" ? "#14204d" : p.accent} strokeWidth={1.2} strokeLinecap="round" />
      </Svg>

      {/* arte */}
      {art ? (
        <View style={[styles.abs, artBox]} pointerEvents="none">
          <Image
            source={art}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            contentPosition="bottom"
            transition={0}
            tintColor={locked ? "#0b0f18" : undefined}
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : null}

      {/* placa do nome (por cima da arte: também esconde o corte reto da figurinha) */}
      <Svg width={width} height={height} viewBox="0 0 100 140" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={gid("plate")} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={locked ? "#3a4152" : p.plate[0]} /><Stop offset="1" stopColor={locked ? "#222837" : p.plate[1]} /></LinearGradient>
        </Defs>
        <Rect x={9.5} y={plateY} width={81} height={plateH} rx={2.2} fill={`url(#${gid("plate")})`} stroke={p.rim[0]} strokeOpacity={0.75} strokeWidth={0.6} />
        <Rect x={11} y={plateY + 0.9} width={78} height={0.5} fill="#fff" opacity={0.28} />
      </Svg>

      {/* nota geral, rótulo e raridade */}
      <View style={[styles.abs, { left: 9.5 * u, top: 9 * u, width: 21 * u, alignItems: "center" }]} pointerEvents="none">
        <Text allowFontScaling={false} style={{ color: locked ? "#6b7690" : p.ink, fontSize: (compact ? 14 : 16) * u, lineHeight: (compact ? 15 : 17.5) * u, fontWeight: "900", fontVariant: ["tabular-nums"], textShadowColor: "rgba(255,255,255,0.35)", textShadowRadius: 2 * u }}>{locked ? "??" : profile?.overall}</Text>
        <Text allowFontScaling={false} numberOfLines={1} style={{ color: locked ? "#6b7690" : p.sub, fontSize: (rarity === "legendary" ? 2.9 : 3.3) * u, fontWeight: "900", letterSpacing: (rarity === "legendary" ? 0.15 : 0.4) * u, marginTop: 0.5 * u }}>{p.label}</Text>
      </View>

      {/* nome */}
      <View style={[styles.abs, { left: 12 * u, right: 12 * u, top: nameTop, alignItems: "center", height: (plateH - 1.2) * u, justifyContent: "center" }]} pointerEvents="none">
        <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ color: locked ? "#7d88a3" : p.plateInk, fontSize: nameSize, fontWeight: "900", letterSpacing: 0.5 * u, textTransform: "uppercase" }}>{locked ? "???" : sticker.name}</Text>
      </View>

      {/* atributos */}
      {!compact ? (
        <View style={[styles.abs, { left: 16 * u, right: 16 * u, top: 81.5 * u, height: 37 * u, flexDirection: "row" }]} pointerEvents="none">
          {[CARD_STAT_KEYS.slice(0, 3), CARD_STAT_KEYS.slice(3)].map((column, c) => (
            <View key={c} style={{ flex: 1, justifyContent: "space-around", paddingLeft: c ? 4 * u : 0, paddingRight: c ? 0 : 4 * u }}>
              {column.map((key) => (
                <View key={key} style={{ flexDirection: "row", alignItems: "baseline", gap: 2.2 * u }} accessible accessibilityLabel={locked ? undefined : `${CARD_STAT_NAME[key]} ${profile?.stats[key]}`}>
                  <Text allowFontScaling={false} numberOfLines={1} style={{ width: 12 * u, textAlign: "right", color: locked ? "#6b7690" : p.ink, fontSize: 7.4 * u, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{locked ? "--" : profile?.stats[key]}</Text>
                  <Text allowFontScaling={false} style={{ color: locked ? "#6b7690" : p.sub, fontSize: 5 * u, fontWeight: "800", letterSpacing: 0.3 * u }}>{CARD_STAT_LABEL[key]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {/* rodapé: número da carta */}
      {!compact && profile ? (
        <View style={[styles.abs, { left: 0, right: 0, top: 123 * u, alignItems: "center" }]} pointerEvents="none">
          <Text allowFontScaling={false} style={{ color: p.sub, fontSize: 3.4 * u, fontWeight: "800", letterSpacing: 0.7 * u }}>{locked ? "CARTA BLOQUEADA" : `Nº ${String(profile.number).padStart(2, "0")}/${profile.total}  ·  BIBLIOLINGO`}</Text>
        </View>
      ) : null}
      {compact && profile && !locked ? (
        <View style={[styles.abs, { left: 0, right: 0, top: 112 * u, alignItems: "center" }]} pointerEvents="none">
          <Text allowFontScaling={false} style={{ color: p.sub, fontSize: 4.6 * u, fontWeight: "900", letterSpacing: 0.6 * u }}>Nº {String(profile.number).padStart(2, "0")}</Text>
        </View>
      ) : null}

      {count > 1 ? (
        <View style={[styles.abs, { right: 7 * u, top: 5 * u, paddingHorizontal: 3.2 * u, paddingVertical: 0.8 * u, borderRadius: 4 * u, backgroundColor: "#10243e", borderWidth: 0.6 * u, borderColor: p.rim[0] }]} pointerEvents="none">
          <Text allowFontScaling={false} style={{ color: "#ffd98f", fontSize: 5 * u, fontWeight: "900" }}>x{count}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  abs: { position: "absolute" }
});
