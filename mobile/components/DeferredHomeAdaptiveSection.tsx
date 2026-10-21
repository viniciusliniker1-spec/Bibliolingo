import { useEffect, useState, type ComponentType } from "react";
import { InteractionManager, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

export function DeferredHomeAdaptiveSection() {
  const [Section, setSection] = useState<ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        void import("./HomeAdaptiveSection").then((module) => {
          if (active) setSection(() => module.HomeAdaptiveSection);
        });
      });
    });
    return () => {
      active = false;
      task.cancel();
    };
  }, []);

  if (Section) return <Section />;

  return (
    <View style={styles.card} accessibilityLabel="Recomendações sendo preparadas em segundo plano">
      <Text style={styles.eyebrow}>APRENDIZADO ADAPTATIVO</Text>
      <Text style={styles.title}>Recomendado para você</Text>
      <Text style={styles.muted}>Preparando recomendações em segundo plano…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  eyebrow: { color: colors.tealDark, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.navy, fontSize: 19, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 }
});
