import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { toLocalDateKey } from "../../src/domain/streak";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { LessonConfetti } from "../components/LessonConfetti";
import { LumiCharacter } from "../components/LumiCharacter";
import { Icon, type IconName } from "../components/navigation/Icons";
import { mobileActivityRoute, mobileHubRoute, resolveMobileActivity, type MobileActivityKind } from "../domain/activityCatalog";
import { equippedSkinId } from "../domain/lumiWallet";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { useLumiWallet } from "../hooks/useLumiWallet";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";

export default function ResultScreen() {
  useLightStatusBar();
  const params = useLocalSearchParams<{ activityId: string; activityTitle?: string; kind?: MobileActivityKind; nextId?: string; journeyMode?: "canonical" | "individual"; journeyBookId?: string; correct: string; incorrect: string; total: string; xpEarned: string; passed: string; maxCombo?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress, syncNow } = useMobileProgress();
  const wallet = useLumiWallet();
  const playFeedback = useFeedbackEffects(progress.settings);
  const kind = params.kind ?? "bible";
  const correct = Number(params.correct ?? 0);
  const total = Math.max(1, Number(params.total ?? 1));
  const xp = Number(params.xpEarned ?? 0);
  const maxCombo = Number(params.maxCombo ?? 0);
  const passed = params.passed !== "false";
  const accuracy = Math.round((correct / total) * 100);
  const perfect = passed && correct === total;
  const activity = resolveMobileActivity(kind, params.activityId);
  const checkpoint = Boolean(activity?.checkpoint);
  const nextId = params.nextId || params.activityId;
  const nextRoute = mobileActivityRoute(kind, nextId);
  const hasNext = passed && nextId !== params.activityId;
  const coins = passed && xp > 0 ? (checkpoint ? 25 : 5) : 0;
  const today = progress.activity[toLocalDateKey(new Date())];
  const lessonsToday = today?.lessons ?? 0;
  const xpToday = today?.xp ?? 0;
  const dailyGoal = Math.max(1, progress.profile.dailyGoal);
  const [still, setStill] = useState(false);
  const appear = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const hero = useRef(new Animated.Value(0)).current;

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setStill); }, []);
  useEffect(() => {
    if (passed) playFeedback(checkpoint ? "checkpoint" : "complete");
    void syncNow();
    const reduce = Boolean(progress.settings.reduceMotionEnabled);
    Animated.spring(hero, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    Animated.stagger(reduce ? 0 : 120, appear.map((value) => Animated.timing(value, { toValue: 1, duration: reduce ? 0 : 320, delay: 300, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }))).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const continueActivity = () => {
    const route = nextRoute as { pathname: string; params: Record<string, string> };
    router.replace({ pathname: route.pathname as never, params: { ...route.params, ...(kind === "bible" ? { journeyMode: params.journeyMode ?? "canonical", journeyBookId: params.journeyBookId ?? "" } : {}) } });
  };

  const title = !passed ? "Quase lá!" : perfect && !checkpoint ? "Lição perfeita!" : checkpoint ? "Checkpoint vencido!" : "Lição concluída!";
  const subtitle = !passed
    ? `Você acertou ${accuracy}%. Revise e tente de novo: falta pouco.`
    : accuracy < 60
      ? "Concluída! Os pontos que você errou vão aparecer na revisão para fixar melhor."
      : hasNext ? "A próxima lição já está liberada. Que tal continuar?" : "Você concluiu tudo o que estava disponível aqui.";
  const skin = equippedSkinId(progress.lumiWallet);
  const stats: { icon: IconName; color: string; value: string; label: string }[] = [
    { icon: "star", color: palette.xp, value: `+${xp}`, label: "XP" },
    { icon: "check", color: palette.success, value: `${accuracy}%`, label: "acertos" },
    { icon: "flame", color: palette.streak, value: `x${maxCombo}`, label: "combo máx." },
    { icon: "coin", color: palette.xp, value: `+${coins}`, label: "moedas" }
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.hero, { transform: [{ scale: hero.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }], opacity: hero }]}>
          {passed && skin === "lumi_base" ? (
            <Image source={checkpoint || perfect ? lumiAnimationAssets.trofeu : lumiAnimationAssets.pular} style={styles.heroLumi} contentFit="contain" autoplay={!still && !progress.settings.reduceMotionEnabled} accessibilityLabel="Lumi comemorando" />
          ) : (
            <LumiCharacter mood={passed ? "proud" : "encouragement"} motion={passed ? "celebrating" : "encouraging"} style={styles.heroLumi} accessibilityLabel={passed ? "Lumi comemorando" : "Lumi encorajando"} />
          )}
        </Animated.View>
        <Text style={[styles.title, { color: passed ? palette.xp : palette.text }]}>{title}</Text>
        <Text style={styles.lessonName}>{activity?.title ?? params.activityTitle}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.stats}>
          {stats.map((stat, index) => (
            <Animated.View key={stat.label} style={[styles.stat, { opacity: appear[index], transform: [{ translateY: appear[index].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]} accessible accessibilityLabel={`${stat.value} ${stat.label}`}>
              <Icon name={stat.icon} size={20} color={stat.color} strokeWidth={2.6} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.chain}>
          <View style={styles.chainRow}>
            <Icon name="flame" size={22} color={palette.streak} />
            <Text style={styles.chainTitle}>{progress.streak} {progress.streak === 1 ? "dia" : "dias"} seguidos</Text>
            <Text style={styles.chainMeta}>{lessonsToday} {lessonsToday === 1 ? "lição" : "lições"} hoje</Text>
          </View>
          <View style={styles.goalTrack}><View style={[styles.goalFill, { width: `${Math.round(Math.min(1, xpToday / dailyGoal) * 100)}%` }]} /></View>
          <Text style={styles.chainHint}>{xpToday >= dailyGoal ? "Meta do dia batida! Cada lição a mais fortalece sua sequência." : `Faltam ${dailyGoal - xpToday} XP para a meta de hoje.`}</Text>
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <Pressable accessibilityRole="button" onPress={continueActivity} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}>
          <Icon name="play" size={18} color={palette.ctaText} />
          <Text style={styles.primaryText}>{hasNext ? "Próxima lição" : passed ? "Revisar de novo" : "Tentar novamente"}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace(kind === "bible" ? "/" : mobileHubRoute(kind))} style={styles.secondary}>
          <Text style={styles.secondaryText}>Voltar à trilha</Text>
        </Pressable>
      </View>
      <LessonConfetti active={passed} />
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  content: { paddingHorizontal: 20, paddingTop: 16, alignItems: "center", gap: 10 },
  hero: { width: 200, height: 200, alignItems: "center", justifyContent: "center" },
  heroLumi: { width: 200, height: 200 },
  title: { fontSize: 30, fontWeight: "900", textAlign: "center" },
  lessonName: { color: p.text, fontSize: 16, fontWeight: "800", textAlign: "center" },
  subtitle: { color: p.textMuted, fontSize: 15, lineHeight: 21, textAlign: "center", marginBottom: 6 },
  stats: { flexDirection: "row", gap: 8, alignSelf: "stretch" },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 14, borderRadius: 18, backgroundColor: p.card, borderWidth: 2, borderColor: p.line, borderBottomWidth: 5 },
  statValue: { color: p.text, fontSize: 19, fontWeight: "900" },
  statLabel: { color: p.textMuted, fontSize: 11, fontWeight: "700" },
  chain: { alignSelf: "stretch", gap: 8, padding: 16, marginTop: 6, borderRadius: 18, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  chainRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chainTitle: { flex: 1, color: p.text, fontSize: 16, fontWeight: "900" },
  chainMeta: { color: p.textMuted, fontSize: 13, fontWeight: "800" },
  goalTrack: { height: 10, borderRadius: 5, backgroundColor: p.divider, overflow: "hidden" },
  goalFill: { height: "100%", borderRadius: 5, backgroundColor: p.xp },
  chainHint: { color: p.textMuted, fontSize: 12, fontWeight: "700" },
  actions: { gap: 6, paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.divider },
  primary: { flexDirection: "row", gap: 8, minHeight: 58, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryPressed: { borderBottomWidth: 2, marginTop: 3 },
  primaryText: { color: p.ctaText, fontSize: 18, fontWeight: "900" },
  secondary: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: p.accent, fontSize: 15, fontWeight: "900" }
});
