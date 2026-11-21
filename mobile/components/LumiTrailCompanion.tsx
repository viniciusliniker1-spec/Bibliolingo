import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { lumiAnimationAssets, lumiAnimationLabels } from "../assets/lumiAnimationAssets";
import { LUMI_IDLE_SLEEP_MS, type LumiContext, type LumiEvent, type LumiReaction, type LumiVars } from "../domain/lumiBehavior";
import { newMemory, quickReplies, think, type LumiMemory, type QuickReply } from "../domain/lumiBrain";
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
  /** O que a Lumi sabe sobre o momento da pessoa (livro, ofensiva, tempo fora…). */
  context: LumiContext;
  /** Quando existe, aparece o botão “Bora estudar” nas respostas rápidas. */
  onStudy?: () => void;
  /** Muda sempre que a pessoa interage com a tela: adia o cochilo da Lumi. */
  activityKey: number;
  reduceMotion: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LUMI_COMPANION_WIDTH = 168;
/** Altura reservada: a animação fica fixa embaixo e o balão cresce para cima. */
const ANIMATION_HEIGHT = 124;
const ROOT_HEIGHT = 178;

/** A memória sobrevive à troca de livro: a Lumi não repete a mesma fala só porque a pessoa mudou de tela. */
let sessionMemory: LumiMemory = newMemory();

/** Lumi que acompanha a trilha: reage a eventos, conversa, varia as falas e cochila quando tudo fica parado. */
export function LumiTrailCompanion({ trigger, restingEvent, vars, context, onStudy, activityKey, reduceMotion, style }: Props) {
  const [reaction, setReaction] = useState<LumiReaction>();
  const [systemReduced, setSystemReduced] = useState(false);
  const varsRef = useRef(vars);
  varsRef.current = vars;
  const contextRef = useRef(context);
  contextRef.current = context;
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
    const result = think({ event, memory: sessionMemory, vars: varsRef.current, context: contextRef.current, rules: LUMI_RULES });
    sessionMemory = result.memory;
    setReaction(result.reaction);
    clearTimeout(backTimer.current);
    if (result.reaction.returnAfterMs) backTimer.current = setTimeout(() => fireRef.current(restingRef.current), result.reaction.returnAfterMs);
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
  const replies = quickReplies(reaction.event, { canStudy: Boolean(onStudy) });
  const answer = (reply: QuickReply) => {
    if (reply.action.kind === "study") onStudy?.();
    else fire(reply.action.event);
  };

  return (
    <View style={[styles.root, style]} pointerEvents="box-none">
      <View style={styles.bubbleDock} pointerEvents="box-none">
        <Animated.View style={[styles.bubble, { transform: [{ scale: bubbleScale }] }]}>
          <Text style={styles.bubbleText} accessibilityLiveRegion="polite">{reaction.text}</Text>
          {replies.length ? (
            <View style={styles.replies}>
              {replies.map((reply) => (
                <Pressable
                  key={reply.id}
                  accessibilityRole="button"
                  accessibilityLabel={reply.label}
                  onPress={() => answer(reply)}
                  hitSlop={5}
                  style={({ pressed }) => [styles.reply, reply.action.kind === "study" && styles.replyStudy, pressed && styles.replyPressed]}
                >
                  <Text style={[styles.replyIcon, reply.action.kind === "study" && styles.replyStudyIcon]} allowFontScaling={false}>{reply.icon}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Animated.View>
        <View style={styles.tail} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Lumi: ${reaction.text}`}
        accessibilityHint="Toque para conversar com a Lumi"
        onPress={() => fire(reaction.animation === "dormir" ? "acordar" : "toque")}
        hitSlop={8}
        style={styles.animationDock}
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
  root: { width: LUMI_COMPANION_WIDTH, height: ROOT_HEIGHT },
  bubbleDock: { position: "absolute", left: 0, right: 0, bottom: ANIMATION_HEIGHT, alignItems: "center" },
  bubble: { maxWidth: LUMI_COMPANION_WIDTH, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: "#ffffff", shadowColor: "#000000", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  bubbleText: { color: "#10243e", fontSize: 13, lineHeight: 17, fontWeight: "800", textAlign: "center" },
  tail: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#ffffff" },
  animationDock: { position: "absolute", left: (LUMI_COMPANION_WIDTH - 132) / 2, bottom: 0 },
  animation: { width: 132, height: ANIMATION_HEIGHT },
  replies: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 7 },
  reply: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#e8f6f4", borderWidth: 1.5, borderColor: "#18a999", alignItems: "center", justifyContent: "center" },
  replyPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
  replyIcon: { fontSize: 15, lineHeight: 19 },
  replyStudy: { backgroundColor: "#18a999", borderColor: "#0b7f75" },
  replyStudyIcon: { color: "#06231f", fontSize: 13, fontWeight: "900" }
});
