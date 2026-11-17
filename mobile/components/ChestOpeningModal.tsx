import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LessonConfetti } from "./LessonConfetti";
import { Icon } from "./navigation/Icons";
import { PushButton } from "./PushButton";
import { STICKER_RARITY_COLOR, rewardNote, rewardTitle, stickerById, type ChestReward } from "../domain/chestRewards";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useMobileProgress } from "../providers/MobileProgressProvider";

interface Props {
  visible: boolean;
  /** Prêmio já sorteado (chega logo depois do toque). A animação espera por ele para abrir. */
  reward?: ChestReward;
  onClose: () => void;
}

const GOLD = "#f2b84b";
const WOOD = "#8a5a2b";
const WOOD_DARK = "#5e3a18";
const PARTICLES = 14;

type Phase = "closed" | "opening" | "revealed";

function rewardGlyph(reward: ChestReward) {
  if (reward.kind === "coins") return "🪙";
  if (reward.kind === "shield") return "🛡️";
  return stickerById(reward.id)?.emoji ?? "⭐";
}

/**
 * Abertura do baú: o baú balança, a tampa levanta, uma luz sobe e o prêmio aparece com um estouro de partículas.
 * Com “reduzir movimento”, pula direto para o prêmio.
 */
export function ChestOpeningModal({ visible, reward, onClose }: Props) {
  const router = useRouter();
  const { progress } = useMobileProgress();
  const play = useFeedbackEffects(progress.settings);
  const [phase, setPhase] = useState<Phase>("closed");
  const [still, setStill] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const lid = useRef(new Animated.Value(0)).current;
  const light = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setStill); }, []);
  useEffect(() => {
    if (!visible) { started.current = false; setPhase("closed"); [shake, lid, light, burst, card].forEach((value) => value.setValue(0)); }
  }, [visible, shake, lid, light, burst, card]);

  // O baú balança enquanto espera o prêmio e abre quando ele chega.
  useEffect(() => {
    if (!visible || still || phase !== "closed") return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 180, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 90, useNativeDriver: true }),
      Animated.delay(220)
    ]));
    loop.start();
    return () => loop.stop();
  }, [visible, still, phase, shake]);

  useEffect(() => {
    if (!visible || !reward || started.current) return;
    started.current = true;
    if (still) { setPhase("revealed"); card.setValue(1); play("achievement"); return; }
    setPhase("opening");
    play("chest");
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.sequence([
      Animated.delay(650), // balança mais um pouco antes de abrir
      Animated.parallel([
        Animated.timing(lid, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
        Animated.timing(light, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]),
      Animated.delay(150),
      Animated.spring(card, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true })
    ]).start(() => { setPhase("revealed"); play("achievement"); });
  }, [visible, reward, still, play, lid, light, burst, card, spin]);

  const particles = useMemo(() => Array.from({ length: PARTICLES }, (_, index) => {
    const angle = (index / PARTICLES) * Math.PI * 2;
    return { dx: Math.cos(angle) * (90 + (index % 3) * 28), dy: Math.sin(angle) * (80 + (index % 4) * 22) - 30, size: 8 + (index % 3) * 3, color: index % 3 === 0 ? "#ffffff" : index % 3 === 1 ? GOLD : "#ffd98f" };
  }), []);

  const rotate = shake.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-7deg", "0deg", "7deg"] });
  const lidRotate = lid.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-62deg"] });
  const rays = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const sticker = reward?.kind === "sticker" ? stickerById(reward.id) : undefined;
  const accent = sticker ? STICKER_RARITY_COLOR[sticker.rarity] : GOLD;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={phase === "revealed" ? onClose : undefined} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.stage} accessibilityLiveRegion="polite">
          <Animated.View pointerEvents="none" style={[styles.rays, { opacity: light, transform: [{ rotate: rays }] }]}>
            {Array.from({ length: 8 }, (_, index) => <View key={index} style={[styles.ray, { transform: [{ rotate: `${index * 22.5}deg` }] }]} />)}
          </Animated.View>

          <Animated.View style={[styles.chest, { transform: [{ rotate }] }]} accessible accessibilityLabel={phase === "revealed" ? "Baú aberto" : "Baú sendo aberto"}>
            <Animated.View style={[styles.glow, { opacity: light }]} />
            <Animated.View style={[styles.lid, { transform: [{ rotate: lidRotate }] }]}>
              <View style={styles.band} />
              <View style={styles.lidTop} />
            </Animated.View>
            <View style={styles.body}>
              <View style={styles.bodyBand} />
              <View style={styles.lock}><View style={styles.keyhole} /></View>
            </View>
          </Animated.View>

          {particles.map((particle, index) => (
            <Animated.View
              key={index}
              pointerEvents="none"
              style={[styles.particle, { width: particle.size, height: particle.size, borderRadius: particle.size / 2, backgroundColor: particle.color, opacity: burst.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }), transform: [{ translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, particle.dx] }) }, { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, particle.dy] }) }, { scale: burst.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.3, 0.6] }) }] }]}
            />
          ))}

          {reward ? (
            <Animated.View style={[styles.reward, { borderColor: accent, opacity: card, transform: [{ scale: card.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }, { translateY: card.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
              <Text style={[styles.glyph, reward.kind === "coins" && { color: GOLD }]} allowFontScaling={false}>{rewardGlyph(reward)}</Text>
              <Text style={styles.rewardTitle}>{rewardTitle(reward)}</Text>
              <Text style={styles.rewardNote}>{rewardNote(reward)}</Text>
            </Animated.View>
          ) : <Text style={styles.waiting}>Abrindo o baú…</Text>}
        </View>

        {phase === "revealed" ? (
          <View style={styles.actions}>
            {sticker ? (
              <Pressable accessibilityRole="button" onPress={() => { onClose(); router.push("/stickers"); }} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.85 }]}>
                <Icon name="star" size={16} color={GOLD} />
                <Text style={styles.ghostText}>Ver meu álbum</Text>
              </Pressable>
            ) : null}
            <PushButton accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryText}>Continuar</Text>
            </PushButton>
          </View>
        ) : null}
        {phase === "revealed" ? <LessonConfetti active /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(4, 10, 20, 0.9)", paddingHorizontal: 24 },
  stage: { width: 300, height: 400, alignItems: "center", justifyContent: "flex-end" },
  rays: { position: "absolute", top: 20, width: 320, height: 320, alignItems: "center", justifyContent: "center" },
  ray: { position: "absolute", width: 34, height: 320, backgroundColor: "rgba(242, 184, 75, 0.16)", borderRadius: 17 },
  chest: { width: 140, height: 120, marginBottom: 190 },
  glow: { position: "absolute", top: -26, left: 12, right: 12, height: 60, borderRadius: 30, backgroundColor: "#ffe9a8", opacity: 0.8 },
  lid: { position: "absolute", top: 0, left: 0, width: 140, height: 46, borderTopLeftRadius: 56, borderTopRightRadius: 56, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: WOOD, borderWidth: 3, borderColor: WOOD_DARK, overflow: "hidden", transformOrigin: "left bottom" },
  lidTop: { position: "absolute", top: 0, left: 0, right: 0, height: 14, backgroundColor: "rgba(255,255,255,0.16)" },
  band: { position: "absolute", top: 0, bottom: 0, left: 58, width: 24, backgroundColor: GOLD },
  body: { position: "absolute", top: 44, left: 0, width: 140, height: 76, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, backgroundColor: WOOD, borderWidth: 3, borderColor: WOOD_DARK, overflow: "hidden" },
  bodyBand: { position: "absolute", top: 0, bottom: 0, left: 58, width: 24, backgroundColor: GOLD },
  lock: { position: "absolute", top: 8, left: 54, width: 32, height: 30, borderRadius: 8, backgroundColor: "#ffd98f", borderWidth: 3, borderColor: "#9a6410", alignItems: "center", justifyContent: "center" },
  keyhole: { width: 8, height: 12, borderRadius: 4, backgroundColor: "#5e3a18" },
  particle: { position: "absolute", bottom: 235 },
  reward: { position: "absolute", top: 0, width: 280, alignItems: "center", gap: 6, paddingVertical: 18, paddingHorizontal: 16, borderRadius: 24, borderWidth: 3, backgroundColor: "#10243e" },
  glyph: { fontSize: 64, lineHeight: 76 },
  rewardTitle: { color: "#ffffff", fontSize: 22, fontWeight: "900", textAlign: "center" },
  rewardNote: { color: "#b9cbe0", fontSize: 14, lineHeight: 19, fontWeight: "700", textAlign: "center" },
  waiting: { position: "absolute", top: 40, color: "#d4e1ee", fontSize: 18, fontWeight: "800" },
  actions: { width: "100%", maxWidth: 320, gap: 10, marginTop: 8 },
  primary: { minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#f2b84b", borderBottomWidth: 5, borderBottomColor: "#9a6410" },
  primaryText: { color: "#10243e", fontSize: 18, fontWeight: "900" },
  ghost: { minHeight: 48, borderRadius: 14, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#f2b84b" },
  ghostText: { color: "#f2b84b", fontSize: 16, fontWeight: "900" }
});
