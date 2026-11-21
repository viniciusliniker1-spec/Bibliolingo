import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { PushButton } from "./PushButton";

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
  const label = (
    <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel, variant === "text" && styles.textLabel]}>
      {children}
    </Text>
  );
  if (variant === "text") {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress}
        style={({ pressed }) => [styles.base, styles.text, pressed && { opacity: 0.6 }, style]}>
        {label}
      </Pressable>
    );
  }
  return (
    <PushButton accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress}
      style={[styles.base, styles[variant], disabled && variant === "primary" && styles.disabled, style]}>
      {label}
    </PushButton>
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
