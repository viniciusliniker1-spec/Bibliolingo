import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { KidsScene } from "../../content/kids/stories";

/**
 * Ilustração da cena. Usa a imagem quando existir; até lá, desenha um céu em
 * degradê com os emojis da cena (provisório, já no formato 4:3 das ilustrações).
 */
export function KidsSceneArt({ scene, width }: { scene: KidsScene; width: number }) {
  const height = Math.round(width * 0.75);
  if (scene.image) return <Image source={scene.image} style={{ width, height, borderRadius: 28 }} contentFit="cover" accessibilityLabel={scene.text} />;
  const [top, bottom] = scene.art.sky;
  const size = scene.art.emoji.length > 2 ? width * 0.2 : width * 0.27;
  return (
    <View style={[styles.frame, { width, height }]} accessible accessibilityLabel={scene.text}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`sky-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#sky-${scene.id})`} />
        <Rect x={0} y={height * 0.78} width={width} height={height * 0.22} fill="#ffffff" opacity={0.18} />
      </Svg>
      <View style={styles.row}>
        {scene.art.emoji.map((emoji, i) => <Text key={i} style={{ fontSize: size, lineHeight: size * 1.2 }} allowFontScaling={false}>{emoji}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 28, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-end" }
});
