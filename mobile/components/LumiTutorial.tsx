import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import type { LumiAnimationId } from "../domain/lumiBehavior";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import type { Palette } from "../theme/tokens";
import { Icon, type IconName } from "./navigation/Icons";

interface Slide {
  animation: LumiAnimationId;
  eyebrow: string;
  title: string;
  text: string;
  points?: { icon: IconName; text: string }[];
}

export const LUMI_TUTORIAL_SLIDES: Slide[] = [
  {
    animation: "acenar",
    eyebrow: "Boas-vindas",
    title: "Oi, {nome}! Eu sou a Lumi.",
    text: "Vou caminhar com você pela Bíblia inteira, uma lição curtinha por vez. Prometo não ser tão demorada quanto os 40 anos no deserto."
  },
  {
    animation: "ler",
    eyebrow: "Sua trilha",
    title: "Um passo de cada vez",
    text: "Cada círculo é uma lição de poucos minutos. No fim da unidade vem o checkpoint, que libera a próxima.",
    points: [
      { icon: "play", text: "Toque no círculo brilhante para começar" },
      { icon: "book", text: "Troque de livro pelo topo da trilha" }
    ]
  },
  {
    animation: "ensinar",
    eyebrow: "Lições",
    title: "Cada lição do seu jeito",
    text: "Os exercícios mudam conforme o conteúdo, para você lembrar de verdade.",
    points: [
      { icon: "check", text: "Escolher, certo ou errado e digitar" },
      { icon: "edit", text: "Montar frases e ligar pares" },
      { icon: "trail", text: "Ordenar acontecimentos e achar a passagem" }
    ]
  },
  {
    animation: "dormir",
    eyebrow: "Corações",
    title: "Errou? Faz parte.",
    text: "Cada erro custa um coração. Se acabarem, a revisão devolve um a cada acerto e fixa o que você errou. Até Pedro afundou um pouquinho!",
    points: [{ icon: "heart", text: "Sem corações, a trilha espera a revisão" }]
  },
  {
    animation: "trofeu",
    eyebrow: "Recompensas",
    title: "Constância vale ouro",
    text: "Estude todo dia para manter a sequência, ganhe moedas para vestir a Lumi e desbloqueie conquistas.",
    points: [
      { icon: "flame", text: "Sequência de dias" },
      { icon: "coin", text: "Moedas e skins da Lumi" },
      { icon: "memory", text: "Professor Noah tira suas dúvidas" }
    ]
  }
];

interface Props {
  visible: boolean;
  onDone: () => void;
}

/** Tutorial de primeiro acesso: a Lumi apresenta o app em cinco telas. */
export function LumiTutorial({ visible, onDone }: Props) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { progress } = useMobileProgress();
  const auth = useMobileAuth();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const still = reduced || Boolean(progress.settings.reduceMotionEnabled);
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").split(" ")[0] || "amigo";
  const slide = LUMI_TUTORIAL_SLIDES[index];
  const last = index === LUMI_TUTORIAL_SLIDES.length - 1;

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduced); }, []);
  useEffect(() => { if (visible) setIndex(0); }, [visible]);

  const go = (next: number) => {
    if (next < 0) return;
    if (next >= LUMI_TUTORIAL_SLIDES.length) { playFeedback("complete"); onDone(); return; }
    playFeedback("select");
    if (still) { setIndex(next); return; }
    Animated.timing(fade, { toValue: 0, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
      setIndex(next);
      Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };

  const shift = fade.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  return (
    <Modal visible={visible} animationType={still ? "none" : "fade"} onRequestClose={onDone} statusBarTranslucent>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.top}>
          <View style={styles.dots} accessibilityLabel={`Passo ${index + 1} de ${LUMI_TUTORIAL_SLIDES.length}`}>
            {LUMI_TUTORIAL_SLIDES.map((item, dot) => <View key={item.eyebrow} style={[styles.dot, dot === index && styles.dotActive, dot < index && styles.dotDone]} />)}
          </View>
          {!last ? <Pressable accessibilityRole="button" onPress={onDone} hitSlop={12}><Text style={styles.skip}>Pular</Text></Pressable> : <View style={styles.skipSpace} />}
        </View>

        <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: shift }] }]}>
          <View style={styles.stage}>
            <View style={styles.halo} />
            <Image source={lumiAnimationAssets[slide.animation]} style={styles.lumi} contentFit="contain" autoplay={!still} accessibilityLabel="Lumi" />
          </View>
          <Text style={styles.eyebrow}>{slide.eyebrow.toLocaleUpperCase("pt-BR")}</Text>
          <Text style={styles.title} accessibilityRole="header">{slide.title.replace("{nome}", name)}</Text>
          <Text style={styles.text}>{slide.text}</Text>
          {slide.points ? (
            <View style={styles.points}>
              {slide.points.map((point) => (
                <View key={point.text} style={styles.point}>
                  <View style={styles.pointIcon}><Icon name={point.icon} size={18} color={palette.accent} /></View>
                  <Text style={styles.pointText}>{point.text}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.actions}>
          {index > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => go(index - 1)} style={styles.back}><Icon name="chevronLeft" size={24} color={palette.text} /></Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => go(index + 1)} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>{last ? "Começar a jornada" : index === 0 ? "Vamos lá" : "Continuar"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 22, backgroundColor: p.ground },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: p.line },
  dotActive: { width: 26, backgroundColor: p.accent },
  dotDone: { backgroundColor: p.accent, opacity: 0.5 },
  skip: { color: p.textMuted, fontSize: 15, fontWeight: "800" },
  skipSpace: { width: 40 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  stage: { width: 240, height: 220, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  halo: { position: "absolute", width: 210, height: 210, borderRadius: 105, backgroundColor: p.activeTabBg },
  lumi: { width: 220, height: 210 },
  eyebrow: { color: p.accent, fontSize: 13, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: p.text, fontSize: 28, lineHeight: 34, fontWeight: "900", textAlign: "center" },
  text: { color: p.textMuted, fontSize: 16, lineHeight: 24, textAlign: "center", maxWidth: 420 },
  points: { alignSelf: "stretch", gap: 8, marginTop: 10 },
  point: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  pointIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  pointText: { flex: 1, color: p.text, fontSize: 15, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 12, alignItems: "center" },
  back: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: p.line, backgroundColor: p.card },
  primary: { flex: 1, minHeight: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 2 },
  primaryText: { color: p.ctaText, fontSize: 17, fontWeight: "900" }
});
