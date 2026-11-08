import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import { calloutPlacement, destinationFor, TOUR_ROUTES, TOUR_STEP_COUNT, tourStepsFor, typedText, type Rect, type TourRouteChoice, type TourRouteOption } from "../domain/appTour";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { LessonConfetti } from "./LessonConfetti";
import { Icon } from "./navigation/Icons";

const PAD = 8;

/**
 * Tutorial do primeiro acesso: boas-vindas da Lumi → “o que você quer estudar?” →
 * recursos da rota escolhida, destacando elementos reais da tela → libera o aluno já na rota.
 */
export function AppTour({ getTarget, scrollBy, onDone }: { getTarget: (id: string) => View | undefined; scrollBy: (name: string, dy: number) => boolean; onDone: () => void }) {
  const router = useRouter();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { width, height } = useWindowDimensions();
  const { progress } = useMobileProgress();
  const auth = useMobileAuth();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [route, setRoute] = useState<TourRouteChoice>();
  const [picked, setPicked] = useState<TourRouteChoice>();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect>();
  const [ready, setReady] = useState(false);
  const [cardHeight, setCardHeight] = useState(220);
  const [reduced, setReduced] = useState(false);
  const [typed, setTyped] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const options = useRef(TOUR_ROUTES.map(() => new Animated.Value(0))).current;
  const still = reduced || Boolean(progress.settings.reduceMotionEnabled);
  const steps = useMemo(() => tourStepsFor(route), [route]);
  const step = steps[index];
  const last = index === steps.length - 1 && Boolean(route);
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").split(" ")[0] || "amigo";
  const fill = (text: string) => text.replace("{nome}", name);
  const title = fill(step.title);
  const text = fill(step.text);
  const typing = step.id === "welcome" && !still;

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduced); }, []);

  // A cada passo: abre a aba, espera a tela montar, rola até o alvo e mede.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    fade.setValue(0);
    router.navigate(step.route);
    let attempts = 0;
    let scrolled = false;
    const measure = () => {
      if (cancelled) return;
      const node = step.target ? getTarget(step.target) : undefined;
      if (!step.target || (!node && attempts > 8)) { setRect(undefined); setReady(true); return; }
      if (!node) { attempts += 1; setTimeout(measure, 150); return; }
      node.measureInWindow((x, y, w, h) => {
        if (cancelled) return;
        const visible = w > 0 && h > 0 && y > -h / 2 && y + h / 2 < height;
        // Alvo abaixo/acima da tela: rola até ele ficar perto do topo e mede de novo.
        const offscreen = w > 0 && h > 0 && (y < 60 || y + Math.min(h, height * 0.5) > height - 40);
        if (step.scroll && offscreen && !scrolled && scrollBy(step.scroll, y - Math.round(height * 0.14))) {
          scrolled = true;
          setTimeout(measure, 480);
          return;
        }
        if (!visible && attempts <= 8) { attempts += 1; setTimeout(measure, 150); return; }
        setRect(visible ? { x: x - PAD, y: y - PAD, width: w + PAD * 2, height: h + PAD * 2 } : undefined);
        setReady(true);
      });
    };
    const timer = setTimeout(measure, step.kind === "spot" ? 420 : 120);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [index, route]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return;
    Animated.timing(fade, { toValue: 1, duration: still ? 0 : 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    if (step.kind === "choice") {
      options.forEach((value) => value.setValue(still ? 1 : 0));
      if (!still) Animated.stagger(110, options.map((value) => Animated.spring(value, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }))).start();
    }
  }, [ready, step.id, still]); // eslint-disable-line react-hooks/exhaustive-deps

  // Efeito de digitação nas boas-vindas (toque no texto para mostrar tudo).
  useEffect(() => {
    if (!ready || !typing) { setTyped(Array.from(text).length); return; }
    setTyped(0);
    const total = Array.from(text).length;
    const timer = setInterval(() => setTyped((value) => { if (value >= total) { clearInterval(timer); return value; } return value + 1; }), 26);
    return () => clearInterval(timer);
  }, [ready, typing, step.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (still) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [still, pulse]);

  const go = (next: number) => {
    if (next < 0) return;
    if (next >= steps.length) return;
    playFeedback("select");
    setIndex(next);
  };
  const pick = (option: TourRouteOption) => {
    if (picked) return;
    playFeedback("correct");
    setPicked(option.id);
    // A Lumi reage à escolha antes de seguir para os recursos da rota.
    setTimeout(() => { setRoute(option.id); setIndex(2); setPicked(undefined); }, still ? 0 : 560);
  };
  const finish = () => {
    playFeedback("complete");
    onDone();
    router.navigate("/(tabs)");
    const destination = route ? destinationFor(route) : "/(tabs)";
    // Libera o aluno já dentro da rota escolhida.
    if (destination !== "/(tabs)") setTimeout(() => router.push(destination), 80);
  };
  const skip = () => { router.navigate("/(tabs)"); onDone(); };

  const placement = calloutPlacement(rect, height, cardHeight);
  const centered = placement.side === "center";
  const pickedOption = TOUR_ROUTES.find((option) => option.id === picked);
  const lumiArt = pickedOption ? lumiMoodAssets[pickedOption.mood] : step.mood ? lumiMoodAssets[step.mood] : lumiAnimationAssets[step.animation];
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  const cardWidth = Math.min(width - 28, 460);

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* Escurece tudo menos o alvo */}
      {rect ? (
        <>
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, rect.y) }]} />
          <View style={[styles.dim, { top: rect.y + rect.height, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.dim, { top: rect.y, left: 0, width: Math.max(0, rect.x), height: rect.height }]} />
          <View style={[styles.dim, { top: rect.y, left: rect.x + rect.width, right: 0, height: rect.height }]} />
          <View pointerEvents="none" style={[styles.ring, { top: rect.y, left: rect.x, width: rect.width, height: rect.height }]} />
          {!still ? <Animated.View pointerEvents="none" style={[styles.ring, { top: rect.y, left: rect.x, width: rect.width, height: rect.height, opacity: ringOpacity, transform: [{ scale: ringScale }] }]} /> : null}
          <Pressable style={{ position: "absolute", top: rect.y, left: rect.x, width: rect.width, height: rect.height }} onPress={() => (last ? finish() : go(index + 1))} accessibilityElementsHidden />
        </>
      ) : <View style={[styles.dim, StyleSheet.absoluteFill]} />}

      <Animated.View
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
        accessibilityLiveRegion="polite"
        style={[styles.card, centered && styles.cardCentered, { top: placement.top, width: cardWidth, left: (width - cardWidth) / 2, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [placement.side === "above" ? -12 : 12, 0] }) }] }]}
      >
        {centered ? <Image source={lumiArt} style={step.kind === "choice" ? styles.lumiMedium : styles.lumiBig} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi" /> : null}
        <View style={styles.cardTop}>
          {!centered ? <Image source={lumiArt} style={styles.lumi} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi" /> : null}
          <View style={[styles.flex, centered && styles.centerText]}>
            <Text style={styles.eyebrow}>{step.eyebrow}</Text>
            <Text style={[styles.title, centered && styles.titleBig]} accessibilityRole="header">{title}</Text>
          </View>
        </View>

        <Pressable disabled={!typing} onPress={() => setTyped(Array.from(text).length)} accessibilityLabel={text}>
          <Text style={[styles.text, centered && styles.textCenter]}>{typing ? typedText(text, typed) : text}</Text>
        </Pressable>

        {step.kind === "choice" ? (
          <View style={styles.options} accessibilityRole="radiogroup">
            {TOUR_ROUTES.map((option, i) => (
              <Animated.View key={option.id} style={{ opacity: options[i], transform: [{ translateY: options[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { scale: picked === option.id ? 1.03 : 1 }] }}>
                <Pressable accessibilityRole="radio" accessibilityState={{ checked: picked === option.id }} accessibilityLabel={`${option.title}. ${option.note}`} disabled={Boolean(picked)} onPress={() => pick(option)}
                  style={({ pressed }) => [styles.option, picked === option.id && styles.optionPicked, picked && picked !== option.id && styles.optionDim, pressed && styles.optionPressed]}>
                  <View style={[styles.glyphBox, picked === option.id && styles.glyphBoxPicked]}>
                    <Text style={[styles.glyph, picked === option.id && { color: palette.ctaText }]} allowFontScaling={false}>{option.glyph}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionNote}>{option.note}</Text>
                  </View>
                  <Icon name={picked === option.id ? "check" : "chevronRight"} size={20} color={picked === option.id ? palette.success : palette.textMuted} strokeWidth={2.6} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        ) : null}

        <View style={styles.dots} accessibilityElementsHidden>
          {Array.from({ length: TOUR_STEP_COUNT }, (_, dot) => <View key={dot} style={[styles.dot, dot < index && styles.dotDone, dot === index && styles.dotActive]} />)}
        </View>

        <View style={styles.actions}>
          {!last ? <Pressable accessibilityRole="button" onPress={skip} hitSlop={8} style={styles.skip}><Text style={styles.skipText}>Pular tutorial</Text></Pressable> : null}
          {index > 1 && !last ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => go(index - 1)} style={styles.back}><Icon name="chevronLeft" size={22} color={palette.text} /></Pressable>
          ) : null}
          {step.kind !== "choice" ? (
            <Pressable accessibilityRole="button" onPress={() => (last ? finish() : go(index + 1))} style={({ pressed }) => [styles.next, last && styles.flex, pressed && styles.pressed]}>
              <Text style={styles.nextText}>{step.button ?? "Próximo"}</Text>
              {!last ? <Icon name="chevronRight" size={18} color={palette.ctaText} strokeWidth={2.8} /> : null}
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
      {last && ready ? <LessonConfetti active /> : null}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  flex: { flex: 1 },
  dim: { position: "absolute", backgroundColor: "rgba(3,10,20,0.74)" },
  ring: { position: "absolute", borderRadius: 18, borderWidth: 3, borderColor: p.cta },
  card: { position: "absolute", gap: 10, padding: 16, borderRadius: 24, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  cardCentered: { alignItems: "stretch", paddingTop: 20 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  lumi: { width: 72, height: 70 },
  lumiBig: { width: 170, height: 160, alignSelf: "center" },
  lumiMedium: { width: 110, height: 104, alignSelf: "center" },
  centerText: { alignItems: "center" },
  eyebrow: { color: p.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: p.text, fontSize: 19, lineHeight: 24, fontWeight: "900", marginTop: 2 },
  titleBig: { fontSize: 24, lineHeight: 30, textAlign: "center" },
  text: { color: p.textMuted, fontSize: 15, lineHeight: 22 },
  textCenter: { textAlign: "center" },
  options: { gap: 8, marginTop: 2 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.ground },
  optionPicked: { borderColor: p.success, backgroundColor: p.successSoft },
  optionDim: { opacity: 0.45 },
  optionPressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  glyphBox: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  glyphBoxPicked: { backgroundColor: p.success },
  glyph: { color: p.accent, fontSize: 24, fontWeight: "700" },
  optionTitle: { color: p.text, fontSize: 16, fontWeight: "900" },
  optionNote: { color: p.textMuted, fontSize: 13, lineHeight: 18 },
  dots: { flexDirection: "row", gap: 5, justifyContent: "center", marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: p.line },
  dotActive: { width: 22, backgroundColor: p.accent },
  dotDone: { backgroundColor: p.accent, opacity: 0.5 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  skip: { flex: 1, minHeight: 44, justifyContent: "center" },
  skipText: { color: p.textMuted, fontSize: 14, fontWeight: "800" },
  back: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: p.line },
  next: { flexDirection: "row", gap: 4, minHeight: 48, paddingHorizontal: 20, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 1 },
  nextText: { color: p.ctaText, fontSize: 16, fontWeight: "900" }
});
