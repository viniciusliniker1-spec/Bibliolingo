import { ImageBackground, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { radius, spacing } from "../theme/tokens";

export function SceneBanner({ source, eyebrow, title, accessibilityLabel, compact = false }: {
  source: ImageSourcePropType;
  eyebrow?: string;
  title: string;
  accessibilityLabel: string;
  compact?: boolean;
}) {
  return (
    <ImageBackground
      source={source}
      style={[styles.banner, compact && styles.compact]}
      imageStyle={styles.image}
      resizeMode="cover"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.shade} />
      <View style={styles.overlay}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: { minHeight: 164, justifyContent: "flex-end", borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#123c49" },
  compact: { minHeight: 138 },
  image: { borderRadius: radius.lg },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4, 22, 32, 0.18)" },
  overlay: { padding: spacing.lg, paddingTop: 64, backgroundColor: "rgba(5, 29, 40, 0.56)" },
  eyebrow: { color: "#a9eee5", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#ffffff", fontSize: 21, lineHeight: 27, fontWeight: "900", marginTop: 3, textShadowColor: "rgba(0,0,0,.35)", textShadowRadius: 3 },
});
