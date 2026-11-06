import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon } from "../../components/navigation/Icons";
import { KIDS } from "../../components/kids/theme";
import { KIDS_AGES, KIDS_STORIES, type KidsAge } from "../../content/kids/stories";
import { useMobileProgress } from "../../providers/MobileProgressProvider";

/** Ativação do modo criança (feita por um adulto). */
export default function KidsSetup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, updatePreferences } = useMobileProgress();
  const [age, setAge] = useState<KidsAge>(progress.settings.kidsMode?.age ?? "6-8");
  const activate = () => { updatePreferences({}, { kidsMode: { enabled: true, age } }); router.replace("/kids"); };
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
      <Stack.Screen options={{ title: "Modo criança" }} />
      <View style={styles.hero}>
        <LumiCharacter mood="welcome" motion="encouraging" style={styles.lumi} accessibilityLabel="Lumi" />
        <Text style={styles.title}>Histórias da Bíblia para crianças</Text>
        <Text style={styles.text}>{KIDS_STORIES.length} histórias narradas, com atividades de tocar, um versículo para guardar e uma pergunta para conversar em família.</Text>
      </View>
      <View style={styles.list}>
        {["Sem anúncios, sem loja e sem chat", "Sem corações perdidos: errar faz parte", "Narração em todas as telas, botões grandes", "Para sair, um adulto responde uma conta"].map((item) => (
          <View key={item} style={styles.item}><Icon name="check" size={16} color={KIDS.good} strokeWidth={3} /><Text style={styles.itemText}>{item}</Text></View>
        ))}
      </View>
      <Text style={styles.section}>Idade da criança</Text>
      {KIDS_AGES.map((item) => (
        <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: age === item.id }} onPress={() => setAge(item.id)} style={[styles.age, age === item.id && styles.ageActive]}>
          <Text style={styles.ageLabel}>{item.label}</Text>
          <Text style={styles.ageNote}>{item.note}</Text>
        </Pressable>
      ))}
      <Pressable accessibilityRole="button" onPress={activate} style={({ pressed }) => [styles.cta, pressed && { transform: [{ translateY: 3 }] }]}>
        <Text style={styles.ctaText}>Ativar modo criança</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS.ground },
  content: { padding: 18, gap: 12 },
  hero: { alignItems: "center", gap: 8 },
  lumi: { width: 150, height: 140 },
  title: { color: KIDS.text, fontSize: 24, fontWeight: "900", textAlign: "center" },
  text: { color: KIDS.muted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  list: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: KIDS.card, borderWidth: 1.5, borderColor: KIDS.line },
  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemText: { flex: 1, color: KIDS.text, fontSize: 14, fontWeight: "700" },
  section: { color: KIDS.muted, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 8 },
  age: { gap: 2, padding: 16, borderRadius: 18, borderWidth: 2, borderColor: KIDS.line, backgroundColor: KIDS.card },
  ageActive: { borderColor: KIDS.cta, backgroundColor: "#f1edff" },
  ageLabel: { color: KIDS.text, fontSize: 17, fontWeight: "900" },
  ageNote: { color: KIDS.muted, fontSize: 13 },
  cta: { minHeight: 60, marginTop: 8, borderRadius: 30, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.cta, borderBottomWidth: 6, borderBottomColor: KIDS.ctaShadow },
  ctaText: { color: KIDS.ctaText, fontSize: 18, fontWeight: "900" }
});
