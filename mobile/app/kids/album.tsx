import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../components/navigation/Icons";
import { KIDS } from "../../components/kids/theme";
import { KIDS_STORIES } from "../../content/kids/stories";
import { loadKidsStars, type KidsStars } from "../../services/kidsProgress";
import { kidsSay, kidsStop } from "../../services/kidsVoice";

/** Álbum de figurinhas: cada história ouvida cola uma figurinha. */
export default function KidsAlbum() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [stars, setStars] = useState<KidsStars>({});
  useFocusEffect(useCallback(() => { void loadKidsStars().then(setStars); return () => kidsStop(); }, []));

  const columns = width > 600 ? 4 : 3;
  const size = Math.floor((Math.min(width, 720) - 32 - (columns - 1) * 12) / columns);
  const got = KIDS_STORIES.filter((story) => stars[story.id]).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar às histórias" onPress={() => router.back()} hitSlop={10} style={styles.round}>
          <Icon name="chevronLeft" size={26} color={KIDS.muted} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.title}>Meu álbum</Text>
          <Text style={styles.count}>{got} de {KIDS_STORIES.length} figurinhas</Text>
        </View>
      </View>
      <View style={styles.bar}><View style={[styles.fill, { width: `${(got / KIDS_STORIES.length) * 100}%` }]} /></View>
      <ScrollView contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 30 }]}>
        {KIDS_STORIES.map((story, i) => {
          const earned = stars[story.id] ?? 0;
          return earned ? (
            <Pressable key={story.id} accessibilityRole="button" accessibilityLabel={story.title}
              onPress={() => void kidsSay(story.title)}
              onLongPress={() => router.push({ pathname: "/kids/story/[id]", params: { id: story.id } })}
              style={({ pressed }) => [styles.sticker, { width: size, height: size * 1.25, backgroundColor: story.color, transform: [{ rotate: `${(i % 3) - 1}deg` }, { scale: pressed ? 0.95 : 1 }] }]}>
              <View style={styles.shine} />
              <Text style={[styles.emoji, { fontSize: size * 0.42 }]} allowFontScaling={false}>{story.cover}</Text>
              <Text style={styles.name} numberOfLines={2}>{story.title}</Text>
              <View style={styles.stars}>{[1, 2, 3].map((n) => <Icon key={n} name="star" size={13} color={n <= earned ? KIDS.star : "rgba(255,255,255,0.45)"} />)}</View>
            </Pressable>
          ) : (
            <Pressable key={story.id} accessibilityRole="button" accessibilityLabel={`Figurinha ${i + 1}, ainda não ganha`}
              onPress={() => router.push({ pathname: "/kids/story/[id]", params: { id: story.id } })}
              style={[styles.empty, { width: size, height: size * 1.25 }]}>
              <Text style={styles.number}>{i + 1}</Text>
              <Text style={[styles.emoji, styles.ghost, { fontSize: size * 0.36 }]} allowFontScaling={false}>{story.cover}</Text>
              <Text style={styles.hint}>Ouça a história</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS.ground },
  flex: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 },
  round: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.card, borderWidth: 1.5, borderColor: KIDS.line },
  title: { color: KIDS.text, fontSize: 26, fontWeight: "900" },
  count: { color: KIDS.muted, fontSize: 15, fontWeight: "800" },
  bar: { height: 12, marginHorizontal: 16, marginTop: 12, borderRadius: 6, backgroundColor: KIDS.line, overflow: "hidden" },
  fill: { height: 12, borderRadius: 6, backgroundColor: KIDS.star },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 16, justifyContent: "center" },
  sticker: { alignItems: "center", justifyContent: "center", gap: 4, padding: 8, borderRadius: 20, borderWidth: 4, borderColor: "#ffffff", overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  shine: { position: "absolute", top: -30, left: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.22)" },
  emoji: { textAlign: "center" },
  name: { color: "#ffffff", fontSize: 13, fontWeight: "900", textAlign: "center" },
  stars: { flexDirection: "row", gap: 1 },
  empty: { alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 20, borderWidth: 3, borderStyle: "dashed", borderColor: KIDS.path, backgroundColor: "#fffdf7" },
  number: { position: "absolute", top: 8, left: 10, color: KIDS.muted, fontSize: 13, fontWeight: "900" },
  ghost: { opacity: 0.18 },
  hint: { color: KIDS.muted, fontSize: 12, fontWeight: "800", textAlign: "center" }
});
