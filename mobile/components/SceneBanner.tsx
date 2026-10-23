import { ImageBackground, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { radius, spacing } from "../theme/tokens";

export function SceneBanner({ source, eyebrow, title, accessibilityLabel }: {
  source: ImageSourcePropType;
  eyebrow?: string;
  title: string;
  accessibilityLabel: string;
}) {
  return (
    <ImageBackground
      source={source}
      style={styles.banner}
      imageStyle={styles.image}
      resizeMode="cover"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.overlay}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: { minHeight: 128, justifyContent: "flex-end", borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#123c49" },
  image: { borderRadius: radius.lg },
  overlay: { padding: spacing.lg, paddingTop: 44, backgroundColor: "rgba(5, 29, 40, 0.48)" },
  eyebrow: { color: "#9be4da", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#ffffff", fontSize: 21, lineHeight: 26, fontWeight: "900", marginTop: 3 }
});
