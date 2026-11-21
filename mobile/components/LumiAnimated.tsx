import { Image, type ImageStyle } from "expo-image";
import type { StyleProp } from "react-native";
import { lumiAnimationAssets, lumiAnimationLabels } from "../assets/lumiAnimationAssets";
import type { LumiAnimationId } from "../domain/lumiBehavior";

/** Lumi animada (WebP com transparência) para cabeçalhos, estados vazios e comemorações. */
export function LumiAnimated({ animation, style, accessibilityLabel }: { animation: LumiAnimationId; style?: StyleProp<ImageStyle>; accessibilityLabel?: string }) {
  return <Image source={lumiAnimationAssets[animation]} style={style} contentFit="contain" accessibilityLabel={accessibilityLabel ?? lumiAnimationLabels[animation]} />;
}
