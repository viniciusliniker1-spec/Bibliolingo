import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Image, type ImageStyle, type StyleProp, StyleSheet } from "react-native";
import { mobileFeedbackAssets } from "../assets/feedbackAssets";

export type LumiMood = keyof typeof mobileFeedbackAssets;
type LumiMotion = "calm" | "thinking" | "encouraging" | "celebrating";

interface LumiCharacterProps {
  mood: LumiMood;
  motion?: LumiMotion;
  accessibilityLabel: string;
  style?: StyleProp<ImageStyle>;
}

/** Reuses approved Lumi artwork with light, accessible contextual motion. */
export function LumiCharacter({ mood, motion = "calm", accessibilityLabel, style }: LumiCharacterProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const loop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    const enter = Animated.timing(entrance, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    const repeat = Animated.loop(Animated.sequence([
      Animated.timing(loop, { toValue: 1, duration: motion === "celebrating" ? 460 : 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(loop, { toValue: 0, duration: motion === "celebrating" ? 460 : 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    ]));
    entrance.setValue(0);
    loop.setValue(0);
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!active) return;
      if (reduced) { entrance.setValue(1); return; }
      enter.start();
      repeat.start();
    });
    return () => { active = false; enter.stop(); repeat.stop(); };
  }, [entrance, loop, mood, motion]);

  const lift = motion === "celebrating" ? -10 : motion === "encouraging" ? -5 : motion === "thinking" ? -3 : -4;
  const scale = motion === "celebrating" ? 1.06 : motion === "encouraging" ? 1.025 : 1.015;
  return <Animated.View style={[styles.wrapper, { opacity: entrance, transform: [
    { translateY: Animated.add(entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }), loop.interpolate({ inputRange: [0, 1], outputRange: [0, lift] })) },
    { scale: loop.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }) }
  ] }]}>
    <Image source={mobileFeedbackAssets[mood]} style={style} resizeMode="contain" accessibilityLabel={accessibilityLabel} accessibilityIgnoresInvertColors />
  </Animated.View>;
}

const styles = StyleSheet.create({ wrapper: { alignSelf: "center" } });
