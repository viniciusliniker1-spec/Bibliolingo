/**
 * Peças de movimento do app: entradas em cascata, toque com mola, barras que enchem,
 * números que contam e pulso. Tudo respeita "Reduzir movimento" (do app e do sistema).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useMobileProgress } from "../providers/MobileProgressProvider";

let systemReduced = false;
void AccessibilityInfo.isReduceMotionEnabled().then((value) => { systemReduced = value; }).catch(() => undefined);
AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => { systemReduced = value; });

/** Verdadeiro quando o aluno (ou o sistema) pediu menos movimento. */
export function useStill() {
  const { progress } = useMobileProgress();
  return systemReduced || Boolean(progress.settings.reduceMotionEnabled);
}

/** Entrada suave: o conteúdo sobe e aparece. Use `index` para a cascata entre irmãos. */
export function Enter({ children, index = 0, delay = 0, from = 14, style }: { children: ReactNode; index?: number; delay?: number; from?: number; style?: StyleProp<ViewStyle> }) {
  const still = useStill();
  const value = useRef(new Animated.Value(still ? 1 : 0)).current;
  useEffect(() => {
    if (still) { value.setValue(1); return; }
    const animation = Animated.timing(value, { toValue: 1, duration: 380, delay: delay + Math.min(index, 8) * 55, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[style, { opacity: value, transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}>{children}</Animated.View>;
}

/** Surge crescendo com mola (medalhas, pódio, selos). */
export function Pop({ children, index = 0, delay = 0, style }: { children: ReactNode; index?: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  const still = useStill();
  const value = useRef(new Animated.Value(still ? 1 : 0)).current;
  useEffect(() => {
    if (still) { value.setValue(1); return; }
    const animation = Animated.sequence([Animated.delay(delay + Math.min(index, 12) * 45), Animated.spring(value, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true })]);
    animation.start();
    return () => animation.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[style, { opacity: value.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }), transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}>{children}</Animated.View>;
}

/** Botão que afunda com mola ao toque. */
export function PressScale({ children, style, scaleTo = 0.96, ...props }: Omit<PressableProps, "style" | "children"> & { children: ReactNode; style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const still = useStill();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (toValue: number) => { if (!still) Animated.spring(scale, { toValue, friction: 5, tension: 220, useNativeDriver: true }).start(); };
  return (
    <Pressable {...props} onPressIn={(event) => { to(scaleTo); props.onPressIn?.(event); }} onPressOut={(event) => { to(1); props.onPressOut?.(event); }}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * Barra de progresso que enche. Troca direta de `<View style={[estilo, { width: "40%" }]} />`
 * (ou `height`, para barras verticais): anima do valor anterior até o novo.
 */
export function GrowBar({ style, delay = 120 }: { style: StyleProp<ViewStyle>; delay?: number }) {
  const still = useStill();
  const flat = StyleSheet.flatten(style) ?? {};
  const vertical = typeof flat.height === "string" && flat.height.endsWith("%");
  const raw = vertical ? flat.height : flat.width;
  const target = typeof raw === "string" && raw.endsWith("%") ? Math.max(0, Math.min(100, parseFloat(raw))) : 0;
  const value = useRef(new Animated.Value(still ? target : 0)).current;
  const first = useRef(true);
  useEffect(() => {
    if (still) { value.setValue(target); return; }
    const animation = Animated.timing(value, { toValue: target, duration: 650, delay: first.current ? delay : 0, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    first.current = false;
    animation.start();
    return () => animation.stop();
  }, [target, still]); // eslint-disable-line react-hooks/exhaustive-deps
  const size = value.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return <Animated.View style={[style, vertical ? { height: size } : { width: size }]} />;
}

/** Número que conta até o valor (XP, moedas). Aceita prefixo e sufixo. */
export function CountUp({ value, style, prefix = "", suffix = "", duration = 800 }: { value: number; style?: StyleProp<TextStyle>; prefix?: string; suffix?: string; duration?: number }) {
  const still = useStill();
  const [shown, setShown] = useState(still ? value : 0);
  const from = useRef(0);
  useEffect(() => {
    if (still) { setShown(value); from.current = value; return; }
    const start = from.current;
    const began = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - began) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (t >= 1) { clearInterval(timer); from.current = value; }
    }, 32);
    return () => { clearInterval(timer); from.current = value; };
  }, [value, still, duration]);
  return <Text style={style}>{prefix}{shown}{suffix}</Text>;
}

/** Halo que pulsa atrás de um elemento (próxima lição, botão principal). */
export function PulseHalo({ size, color, borderRadius }: { size: number; color: string; borderRadius?: number }) {
  const still = useStill();
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (still) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(value, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [still, value]);
  if (still) return null;
  return <Animated.View pointerEvents="none" style={{ position: "absolute", width: size, height: size, borderRadius: borderRadius ?? size / 2, backgroundColor: color, opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }), transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }] }} />;
}

/** Balanço leve e contínuo (ícones de chama, baú pronto). */
export function Wiggle({ children, active = true }: { children: ReactNode; active?: boolean }) {
  const still = useStill();
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (still || !active) { value.setValue(0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(value, { toValue: 1, duration: 110, useNativeDriver: true }),
      Animated.timing(value, { toValue: -1, duration: 220, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.delay(1600)
    ]));
    loop.start();
    return () => loop.stop();
  }, [still, active, value]);
  return <Animated.View style={{ transform: [{ rotate: value.interpolate({ inputRange: [-1, 1], outputRange: ["-9deg", "9deg"] }) }] }}>{children}</Animated.View>;
}
