import { StyleSheet, View } from "react-native";
import { colors, radius } from "../theme/tokens";

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(safeValue * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${safeValue * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.teal
  }
});
