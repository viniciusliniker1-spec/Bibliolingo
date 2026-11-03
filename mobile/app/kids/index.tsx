import { useCallback, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { LumiCharacter } from "../../components/LumiCharacter";
import { Icon } from "../../components/navigation/Icons";
import { ParentGate } from "../../components/kids/ParentGate";
import { KIDS_AGES, KIDS_STORIES } from "../../content/kids/stories";
import { kidsReport } from "../../domain/kidsReport";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { loadKidsStars, type KidsStars } from "../../services/kidsProgress";
import { kidsSay } from "../../services/kidsVoice";
import { KIDS } from "../../components/kids/theme";

const STEP = 190;

/** Início do modo criança: caminho de histórias, estrelas e a Lumi como guia. */
export default function KidsHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { progress, updatePreferences } = useMobileProgress();
  const [stars, setStars] = useState<KidsStars>({});
  const [gate, setGate] = useState(false);
  const [menu, setMenu] = useState(false);
  const age = progress.settings.kidsMode?.age ?? "6-8";

  useFocusEffect(useCallback(() => {
    setStatusBarStyle("dark");
    void loadKidsStars().then(setStars);
    // O "voltar" do Android não tira a criança daqui: abre o portão dos pais.
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { setGate(true); return true; });
    return () => sub.remove();
  }, []));

  const next = KIDS_STORIES.find((story) => !stars[story.id]) ?? KIDS_STORIES[0];
  const positions = KIDS_STORIES.map((_, i) => ({ x: i % 2 === 0 ? width * 0.3 : width * 0.7, y: 90 + i * STEP }));
  const path = positions.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `C${positions[i - 1].x} ${p.y - STEP / 2} ${p.x} ${positions[i - 1].y + STEP / 2} ${p.x} ${p.y}`)).join(" ");
  const report = kidsReport(KIDS_STORIES, stars);
  const total = report.stars;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <LumiCharacter mood="welcome" motion="encouraging" style={styles.lumi} accessibilityLabel="Lumi" />
        <View style={styles.flex}>
          <Text style={styles.hello}>Olá! Vamos ouvir uma história?</Text>
          <View style={styles.starsTotal}><Icon name="star" size={18} color={KIDS.star} /><Text style={styles.starsText}>{total}</Text></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Meu álbum de figurinhas" onPress={() => router.push("/kids/album")} style={styles.album}>
          <Text style={styles.albumEmoji} allowFontScaling={false}>📒</Text>
          <Text style={styles.albumText}>{report.done}/{report.total}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Área dos pais" onPress={() => setGate(true)} hitSlop={10} style={styles.lock}>
          <Icon name="lock" size={18} color={KIDS.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ height: 90 + KIDS_STORIES.length * STEP + insets.bottom + 40 }}>
        <Svg width={width} height={90 + KIDS_STORIES.length * STEP} style={StyleSheet.absoluteFill}>
          <Path d={path} stroke={KIDS.path} strokeWidth={14} strokeLinecap="round" fill="none" strokeDasharray="4 22" />
        </Svg>
        {KIDS_STORIES.map((story, i) => {
          const pos = positions[i];
          const earned = stars[story.id] ?? 0;
          const isNext = story.id === next.id;
          return (
            <View key={story.id} style={[styles.node, { left: pos.x - 70, top: pos.y - 60 }]}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${story.title}. ${earned} estrelas`}
                onPress={() => { void kidsSay(story.title); router.push({ pathname: "/kids/story/[id]", params: { id: story.id } }); }}
                style={({ pressed }) => [styles.bubble, { backgroundColor: story.color, borderColor: isNext ? KIDS.cta : "#ffffff" }, pressed && { transform: [{ scale: 0.95 }] }]}>
                <Text style={styles.cover} allowFontScaling={false}>{story.cover}</Text>
              </Pressable>
              {isNext ? <View style={styles.playBadge}><Icon name="play" size={14} color="#ffffff" /></View> : null}
              <Text style={styles.storyTitle} numberOfLines={2}>{story.title}</Text>
              <View style={styles.starsRow}>{[1, 2, 3].map((n) => <Icon key={n} name="star" size={18} color={n <= earned ? KIDS.star : KIDS.starOff} />)}</View>
            </View>
          );
        })}
      </ScrollView>

      <ParentGate visible={gate} onCancel={() => setGate(false)} onPass={() => { setGate(false); setMenu(true); }} />
      {menu ? (
        <View style={styles.menuBackdrop}>
          <ScrollView style={styles.menuScroll} contentContainerStyle={[styles.menu, { paddingBottom: insets.bottom + 18 }]}>
            <Text style={styles.menuTitle}>Área dos pais</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}><Text style={styles.statValue}>{report.done}/{report.total}</Text><Text style={styles.statLabel}>histórias</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{report.stars}/{report.maxStars}</Text><Text style={styles.statLabel}>estrelas</Text></View>
              <View style={styles.stat}><Text style={styles.statValue} numberOfLines={1}>{report.next ? report.next.cover : "🏆"}</Text><Text style={styles.statLabel} numberOfLines={2}>{report.next ? `Próxima: ${report.next.title}` : "Trilha completa!"}</Text></View>
            </View>
            {report.talks.length ? (
              <View style={styles.talks}>
                <Text style={styles.sectionLabel}>PARA CONVERSAR EM FAMÍLIA</Text>
                {report.talks.slice(0, 3).map((talk) => (
                  <View key={talk.title} style={styles.talk}>
                    <Text style={styles.talkTitle}>{talk.title}</Text>
                    <Text style={styles.talkText}>{talk.family}</Text>
                    <Text style={styles.talkVerse}>{talk.verse}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text style={styles.sectionLabel}>IDADE</Text>
            <Text style={styles.menuNote}>A idade ajusta o tamanho dos textos, a narração automática e as atividades.</Text>
            {KIDS_AGES.map((item) => (
              <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: item.id === age }} onPress={() => updatePreferences({}, { kidsMode: { enabled: true, age: item.id } })}
                style={[styles.ageRow, item.id === age && styles.ageRowActive]}>
                <Text style={styles.ageLabel}>{item.label}</Text>
                <Text style={styles.ageNote}>{item.note}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={() => { setMenu(false); updatePreferences({}, { kidsMode: { enabled: false, age } }); router.replace("/(tabs)"); }} style={styles.exit}>
              <Text style={styles.exitText}>Sair do modo criança</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setMenu(false)} style={styles.close}><Text style={styles.closeText}>Continuar no modo criança</Text></Pressable>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS.ground },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  lumi: { width: 84, height: 80 },
  hello: { color: KIDS.text, fontSize: 21, fontWeight: "900" },
  starsTotal: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  starsText: { color: KIDS.text, fontSize: 16, fontWeight: "900" },
  lock: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.card, borderWidth: 1.5, borderColor: KIDS.line },
  node: { position: "absolute", width: 140, alignItems: "center", gap: 4 },
  bubble: { width: 112, height: 112, borderRadius: 56, alignItems: "center", justifyContent: "center", borderWidth: 6, borderBottomWidth: 10 },
  cover: { fontSize: 54 },
  playBadge: { position: "absolute", top: 0, right: 14, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.cta, borderWidth: 3, borderColor: "#ffffff" },
  storyTitle: { color: KIDS.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  starsRow: { flexDirection: "row", gap: 2 },
  menuBackdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "flex-end", backgroundColor: "rgba(20,20,40,0.5)" },
  menuScroll: { flexGrow: 0, maxHeight: "88%", borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: "#ffffff" },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, alignItems: "center", gap: 2, padding: 10, borderRadius: 16, backgroundColor: KIDS.ground },
  statValue: { color: KIDS.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: KIDS.muted, fontSize: 12, fontWeight: "700", textAlign: "center" },
  sectionLabel: { color: KIDS.cta, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginTop: 6 },
  talks: { gap: 8 },
  talk: { gap: 3, padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: KIDS.line },
  talkTitle: { color: KIDS.text, fontSize: 15, fontWeight: "900" },
  talkText: { color: KIDS.text, fontSize: 14, lineHeight: 20 },
  talkVerse: { color: KIDS.muted, fontSize: 12, fontStyle: "italic" },
  album: { flexDirection: "row", alignItems: "center", gap: 4, height: 44, paddingHorizontal: 10, borderRadius: 22, backgroundColor: KIDS.card, borderWidth: 1.5, borderColor: KIDS.line },
  albumEmoji: { fontSize: 20 },
  albumText: { color: KIDS.text, fontSize: 14, fontWeight: "900" },
  menu: { gap: 10, padding: 20 },
  menuTitle: { color: KIDS.text, fontSize: 22, fontWeight: "900" },
  menuNote: { color: KIDS.muted, fontSize: 14, lineHeight: 20 },
  ageRow: { gap: 2, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: KIDS.line },
  ageRowActive: { borderColor: KIDS.cta, backgroundColor: "#f1edff" },
  ageLabel: { color: KIDS.text, fontSize: 16, fontWeight: "900" },
  ageNote: { color: KIDS.muted, fontSize: 13 },
  exit: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: KIDS.badSoft, marginTop: 6 },
  exitText: { color: KIDS.bad, fontSize: 16, fontWeight: "900" },
  close: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  closeText: { color: KIDS.muted, fontSize: 15, fontWeight: "800" }
});
