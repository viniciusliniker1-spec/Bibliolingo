import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import { colors } from "../theme/tokens";

const PALETTE = [colors.gold, colors.teal, colors.navy, "#f07878", "#7b61ff", "#49b6ff"];

export function LessonConfetti({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => Array.from({ length: 26 }, (_, index) => ({
    left: (index * 47) % Math.max(1, width - 20),
    color: PALETTE[index % PALETTE.length],
    delay: (index % 9) * 55,
    drift: ((index % 5) - 2) * 24,
    size: 7 + index % 5
  })), [width]);
  const values = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    let stopped = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || stopped) return;
      values.forEach((value) => value.setValue(0));
      Animated.parallel(values.map((value, index) => Animated.timing(value, {
        toValue: 1,
        duration: 1350 + (index % 6) * 80,
        delay: pieces[index].delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }))).start();
    });
    return () => { stopped = true; values.forEach((value) => value.stopAnimation()); };
  }, [active, pieces, values]);

  if (!active) return null;
  return <View pointerEvents="none" accessibilityElementsHidden style={StyleSheet.absoluteFill}>
    {pieces.map((piece, index) => <Animated.View key={index} style={{
      position: "absolute",
      left: piece.left,
      bottom: -20,
      width: piece.size,
      height: piece.size * 1.8,
      borderRadius: 2,
      backgroundColor: piece.color,
      opacity: values[index].interpolate({ inputRange: [0, .08, .88, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { translateY: values[index].interpolate({ inputRange: [0, 1], outputRange: [0, -(height + 70)] }) },
        { translateX: values[index].interpolate({ inputRange: [0, .5, 1], outputRange: [0, piece.drift, 0] }) },
        { rotate: values[index].interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${360 + index * 23}deg`] }) }
      ]
    }}/>)}
  </View>;
}
