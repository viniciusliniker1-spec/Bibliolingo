import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { lumiMoodAssets } from "../assets/lumiMoodAssets";
import { APP_TOUR, calloutPlacement, tourChapters, type Rect } from "../domain/appTour";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { Icon } from "./navigation/Icons";

const PAD = 8;
const CHAPTERS = tourChapters();

/** Tour guiado: navega por cada aba e destaca o elemento real de cada recurso. */
export function AppTour({ getTarget, scrollBy, onDone }: { getTarget: (id: string) => View | undefined; scrollBy: (name: string, dy: number) => boolean; onDone: () => void }) {
  const router = useRouter();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { width, height } = useWindowDimensions();
  const { progress } = useMobileProgress();
  const auth = useMobileAuth();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect>();
  const [ready, setReady] = useState(false);
  const [cardHeight, setCardHeight] = useState(220);
  const [reduced, setReduced] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const still = reduced || Boolean(progress.settings.reduceMotionEnabled);
  const step = APP_TOUR[index];
  const last = index === APP_TOUR.length - 1;
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").split(" ")[0] || "amigo";

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduced); }, []);

  // A cada passo: abre a aba, espera a tela montar e mede o alvo.
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
    const timer = setTimeout(measure, 420);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return;
    Animated.timing(fade, { toValue: 1, duration: still ? 0 : 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [ready, still, fade]);

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
    if (next >= APP_TOUR.length) { playFeedback("complete"); onDone(); return; }
    if (next < 0) return;
    playFeedback("select");
    setIndex(next);
  };
  const skip = () => { router.navigate("/(tabs)"); onDone(); };

  const lumiArt = step.mood ? lumiMoodAssets[step.mood] : lumiAnimationAssets[step.animation];
  const placement = calloutPlacement(rect, height, cardHeight);
  const centered = placement.side === "center";
  const chapter = CHAPTERS.indexOf(step.chapter);
  const fill = (text: string) => text.replace("{nome}", name);
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

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
          <Pressable style={{ position: "absolute", top: rect.y, left: rect.x, width: rect.width, height: rect.height }} onPress={() => go(index + 1)} accessibilityElementsHidden />
        </>
      ) : <View style={[styles.dim, StyleSheet.absoluteFill]} />}

      <Animated.View
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
        accessibilityLiveRegion="polite"
        style={[styles.card, centered && styles.cardCentered, { top: placement.top, width: Math.min(width - 28, 460), left: (width - Math.min(width - 28, 460)) / 2, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [placement.side === "above" ? -12 : 12, 0] }) }] }]}
      >
        {centered ? <Image source={lumiArt} style={styles.lumiBig} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi" /> : null}
        <View style={styles.cardTop}>
          {!centered ? <Image source={lumiArt} style={styles.lumi} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi" /> : null}
          <View style={[styles.flex, centered && styles.centerText]}>
            <Text style={styles.chapter}>{step.chapter.toLocaleUpperCase("pt-BR")} · {index + 1}/{APP_TOUR.length}</Text>
            <Text style={[styles.title, centered && styles.titleBig]} accessibilityRole="header">{fill(step.title)}</Text>
          </View>
        </View>
        <Text style={[styles.text, centered && styles.textCenter]}>{fill(step.text)}</Text>
        <View style={styles.dots} accessibilityElementsHidden>
          {CHAPTERS.map((item, dot) => <View key={item} style={[styles.dot, dot < chapter && styles.dotDone, dot === chapter && styles.dotActive]} />)}
        </View>
        <View style={styles.actions}>
          {!last ? <Pressable accessibilityRole="button" onPress={skip} hitSlop={8} style={styles.skip}><Text style={styles.skipText}>Pular tour</Text></Pressable> : null}
          {index > 0 && !last ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => go(index - 1)} style={styles.back}><Icon name="chevronLeft" size={22} color={palette.text} /></Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => go(index + 1)} style={({ pressed }) => [styles.next, last && styles.flex, pressed && styles.pressed]}>
            <Text style={styles.nextText}>{last ? "Começar a jornada" : index === 0 ? "Vamos lá" : "Próximo"}</Text>
            {!last ? <Icon name="chevronRight" size={18} color={palette.ctaText} strokeWidth={2.8} /> : null}
          </Pressable>
        </View>
      </Animated.View>
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
  centerText: { alignItems: "center" },
  chapter: { color: p.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: p.text, fontSize: 19, lineHeight: 24, fontWeight: "900", marginTop: 2 },
  titleBig: { fontSize: 24, lineHeight: 30, textAlign: "center" },
  text: { color: p.textMuted, fontSize: 15, lineHeight: 22 },
  textCenter: { textAlign: "center" },
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
