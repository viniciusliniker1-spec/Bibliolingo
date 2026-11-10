import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { lumiAnimationAssets, lumiAnimationLabels } from "../assets/lumiAnimationAssets";
import { LUMI_IDLE_SLEEP_MS, nextReaction, type LumiEvent, type LumiReaction, type LumiVars, type PhraseRotation } from "../domain/lumiBehavior";
import { LUMI_RULES } from "../domain/lumiPhrases";

export interface LumiTrigger {
  event: LumiEvent;
  id: number;
}

interface Props {
  trigger?: LumiTrigger;
  /** Evento usado quando uma reação termina (espera, checkpoint ou livro concluído). */
  restingEvent: LumiEvent;
  vars: LumiVars;
  /** Muda sempre que a pessoa interage com a tela: adia o cochilo da Lumi. */
  activityKey: number;
  reduceMotion: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LUMI_COMPANION_WIDTH = 168;

/** Lumi que acompanha a trilha: reage a eventos, fala e cochila quando tudo fica parado. */
export function LumiTrailCompanion({ trigger, restingEvent, vars, activityKey, reduceMotion, style }: Props) {
  const [reaction, setReaction] = useState<LumiReaction>();
  const [systemReduced, setSystemReduced] = useState(false);
  // Cada visita começa numa piada diferente.
  const rotation = useRef<PhraseRotation>({ toque: Math.floor(Math.random() * LUMI_RULES.toque.phrases.length) });
  const varsRef = useRef(vars);
  varsRef.current = vars;
  const restingRef = useRef(restingEvent);
  restingRef.current = restingEvent;
  const backTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleScale = useRef(new Animated.Value(1)).current;
  const still = reduceMotion || systemReduced;


  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduced);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setSystemReduced);
    return () => subscription.remove();
  }, []);

  const fireRef = useRef<(event: LumiEvent) => void>(() => undefined);
  const fire = useCallback((event: LumiEvent) => {
    const next = nextReaction(event, rotation.current, varsRef.current, LUMI_RULES);
    rotation.current = next.rotation;
    setReaction(next);
    clearTimeout(backTimer.current);
    if (next.returnAfterMs) backTimer.current = setTimeout(() => fireRef.current(restingRef.current), next.returnAfterMs);
  }, []);
  fireRef.current = fire;

  useEffect(() => {
    if (trigger) fire(trigger.event);
  }, [trigger?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cochilo depois de um tempo sem interação.
  useEffect(() => {
    clearTimeout(sleepTimer.current);
    if (!reaction || reaction.animation === "dormir") return;
    sleepTimer.current = setTimeout(() => fireRef.current("parado"), LUMI_IDLE_SLEEP_MS);
    return () => clearTimeout(sleepTimer.current);
  }, [activityKey, reaction]);

  useEffect(() => () => {
    clearTimeout(backTimer.current);
    clearTimeout(sleepTimer.current);
  }, []);

  // O balão "salta" a cada fala nova.
  useEffect(() => {
    if (still) { bubbleScale.setValue(1); return; }
    bubbleScale.setValue(0.86);
    Animated.spring(bubbleScale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [reaction?.text, still, bubbleScale]);

  if (!reaction) return null;
  return (
    <View style={[styles.root, style]} pointerEvents="box-none">
      <Animated.View style={[styles.bubble, { transform: [{ scale: bubbleScale }] }]} accessibilityLiveRegion="polite">
        <Text style={styles.bubbleText}>{reaction.text}</Text>
      </Animated.View>
      <View style={styles.tail} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Lumi: ${reaction.text}`}
        accessibilityHint="Toque para conversar com a Lumi"
        onPress={() => fire(reaction.animation === "dormir" ? "acordar" : "toque")}
        hitSlop={8}
      >
        <Image
          source={lumiAnimationAssets[reaction.animation]}
          style={styles.animation}
          contentFit="contain"
          autoplay={!still}
          accessibilityLabel={lumiAnimationLabels[reaction.animation]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: LUMI_COMPANION_WIDTH, alignItems: "center" },
  bubble: { maxWidth: LUMI_COMPANION_WIDTH, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: "#ffffff", shadowColor: "#000000", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  bubbleText: { color: "#10243e", fontSize: 13, lineHeight: 17, fontWeight: "800", textAlign: "center" },
  tail: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#ffffff" },
  animation: { width: 132, height: 124 }
});
