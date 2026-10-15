import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

export function StatCard({ label, value, accent = colors.teal }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 96,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginBottom: spacing.sm
  },
  value: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "800"
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  }
});
