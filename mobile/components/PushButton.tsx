/**
 * Botão “de apertar”: face com brilho no topo sobre uma base mais escura; ao toque,
 * a face afunda com mola até a base. Aceita o mesmo `style` de um Pressable
 * (objeto ou função), então substitui `<Pressable style={styles.cta}>` direto.
 */
import { useRef, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, View, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import { useStill } from "./motion";

const LAYOUT_KEYS = ["margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginHorizontal", "marginVertical", "flex", "flexGrow", "flexShrink", "flexBasis", "alignSelf", "width", "minWidth", "maxWidth", "position", "top", "bottom", "left", "right", "zIndex"] as const;

/** Escurece uma cor #rrggbb (para a base, quando o estilo não informa). */
export function darken(hex: string, amount = 0.28) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const value = parseInt(match[1], 16);
  const channel = (shift: number) => Math.round(((value >> shift) & 255) * (1 - amount)).toString(16).padStart(2, "0");
  return `#${channel(16)}${channel(8)}${channel(0)}`;
}

type Props = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  /** Altura da base (quanto o botão afunda). */
  depth?: number;
};

export function PushButton({ children, style, depth, disabled, onPressIn, onPressOut, ...props }: Props) {
  const still = useStill();
  const sink = useRef(new Animated.Value(0)).current;
  const resolved = typeof style === "function" ? style({ pressed: false } as PressableStateCallbackType) : style;
  const flat = (StyleSheet.flatten(resolved) ?? {}) as ViewStyle;
  const outer: ViewStyle = {};
  const face: ViewStyle = {};
  for (const [key, value] of Object.entries(flat)) {
    if ((LAYOUT_KEYS as readonly string[]).includes(key)) (outer as Record<string, unknown>)[key] = value;
    else (face as Record<string, unknown>)[key] = value;
  }
  const lip = depth ?? (typeof flat.borderBottomWidth === "number" && flat.borderBottomWidth >= 3 ? flat.borderBottomWidth + 1 : 5);
  const background = typeof flat.backgroundColor === "string" ? flat.backgroundColor : "#18a999";
  const filled = background !== "transparent" && flat.borderWidth === undefined;
  const lipColor = typeof flat.borderBottomColor === "string" ? flat.borderBottomColor : filled ? darken(background) : typeof flat.borderColor === "string" ? flat.borderColor : darken(background);
  const radius = typeof flat.borderRadius === "number" ? flat.borderRadius : 16;
  // A base faz o papel da borda de baixo.
  face.borderBottomWidth = flat.borderWidth ?? 0;
  if (flat.borderWidth === undefined) delete face.borderBottomColor;

  const move = (toValue: number) => {
    if (still) { sink.setValue(toValue); return; }
    Animated.spring(sink, { toValue, friction: 6, tension: 320, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => { move(1); onPressIn?.(event); }}
      onPressOut={(event) => { move(0); onPressOut?.(event); }}
      style={[outer, { paddingBottom: lip }, disabled && styles.disabled]}
    >
      <View pointerEvents="none" style={[styles.lip, { top: lip, borderRadius: radius, backgroundColor: lipColor }]} />
      <Animated.View style={[face, styles.face, { transform: [{ translateY: sink.interpolate({ inputRange: [0, 1], outputRange: [0, lip - 1] }) }] }]}>
        {filled ? <View pointerEvents="none" style={[styles.gloss, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} /> : null}
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lip: { position: "absolute", left: 0, right: 0, bottom: 0 },
  face: { overflow: "hidden" },
  gloss: { position: "absolute", top: 0, left: 0, right: 0, height: "46%", backgroundColor: "rgba(255,255,255,0.16)" },
  disabled: { opacity: 0.55 }
});
