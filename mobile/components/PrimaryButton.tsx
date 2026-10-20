import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

interface PrimaryButtonProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "text";
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function PrimaryButton({
  children,
  onPress,
  disabled = false,
  variant = "primary",
  style,
  accessibilityLabel
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel, variant === "text" && styles.textLabel]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md
  },
  primary: {
    backgroundColor: colors.teal,
    borderBottomColor: colors.tealDark,
    borderBottomWidth: 4
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.teal,
    borderWidth: 2
  },
  text: {
    backgroundColor: "transparent"
  },
  disabled: {
    backgroundColor: colors.border,
    borderBottomColor: colors.disabled
  },
  pressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2
  },
  label: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  secondaryLabel: {
    color: colors.tealDark
  },
  textLabel: {
    color: colors.tealDark
  }
});
