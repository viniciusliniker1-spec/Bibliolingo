import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCharacter } from "../../components/LumiCharacter";
import { KIDS } from "../../components/kids/theme";
import { KIDS_CHAPTERS, KIDS_STORIES } from "../../content/kids/stories";
import { KIDS_CERTIFICATE } from "../../domain/kidsNarration";
import { kidsReport } from "../../domain/kidsReport";
import { loadKidsStars } from "../../services/kidsProgress";
import { kidsSay, kidsStop } from "../../services/kidsVoice";

/** Certificado ao ouvir toda a grande história. */
export default function KidsCertificate() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stars, setStars] = useState(0);
  useFocusEffect(useCallback(() => {
    void loadKidsStars().then((data) => setStars(kidsReport(KIDS_STORIES, data).stars));
    void kidsSay(KIDS_CERTIFICATE);
    return () => kidsStop();
  }, []));
  const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.paper}>
          <View style={styles.ribbon}><Text style={styles.ribbonText}>CERTIFICADO</Text></View>
          <LumiCharacter mood="achievement" motion="celebrating" style={styles.lumi} accessibilityLabel="Lumi comemorando" />
          <Text style={styles.title}>A Grande História de Deus</Text>
          <Text style={styles.body}>Você ouviu todas as {KIDS_STORIES.length} histórias, da Criação até a promessa de que Deus vai fazer tudo novo!</Text>
          <View style={styles.chapters}>
            {KIDS_CHAPTERS.map((chapter) => (
              <View key={chapter.id} style={styles.chapter}>
                <Text style={styles.chapterEmoji} allowFontScaling={false}>{chapter.emoji}</Text>
                <Text style={styles.chapterTitle} numberOfLines={2}>{chapter.title}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.stars}>⭐ {stars} estrelas</Text>
          <Text style={styles.verse}>“Eis que faço novas todas as coisas.” · Apocalipse 21:5</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.cta, pressed && { transform: [{ translateY: 3 }] }]}>
          <Text style={styles.ctaText}>Voltar às histórias</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS.ground },
  content: { padding: 16, gap: 18 },
  paper: { alignItems: "center", gap: 10, padding: 22, paddingTop: 34, borderRadius: 28, backgroundColor: "#fffdf4", borderWidth: 4, borderColor: KIDS.star },
  ribbon: { position: "absolute", top: -14, paddingHorizontal: 18, paddingVertical: 6, borderRadius: 14, backgroundColor: KIDS.cta },
  ribbonText: { color: "#ffffff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  lumi: { width: 150, height: 140 },
  title: { color: KIDS.text, fontSize: 26, fontWeight: "900", textAlign: "center" },
  body: { color: KIDS.text, fontSize: 17, lineHeight: 25, textAlign: "center", fontWeight: "700" },
  chapters: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginVertical: 6 },
  chapter: { width: 74, alignItems: "center", gap: 2 },
  chapterEmoji: { fontSize: 34 },
  chapterTitle: { color: KIDS.muted, fontSize: 11, fontWeight: "800", textAlign: "center" },
  stars: { color: KIDS.text, fontSize: 20, fontWeight: "900" },
  verse: { color: KIDS.muted, fontSize: 14, fontStyle: "italic", textAlign: "center" },
  date: { color: KIDS.muted, fontSize: 13, fontWeight: "700" },
  cta: { minHeight: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.cta, borderBottomWidth: 6, borderBottomColor: KIDS.ctaShadow },
  ctaText: { color: KIDS.ctaText, fontSize: 18, fontWeight: "900" }
});
