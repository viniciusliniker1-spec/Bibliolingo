import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useStill } from "../motion";
import type { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Palette } from "../../theme/tokens";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { Icon, type IconName } from "./Icons";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/** Abas visíveis, na ordem em que aparecem. Rotas fora desta lista ficam ocultas. */
export const MAIN_TABS: { name: string; label: string; icon: IconName; hint: string }[] = [
  { name: "index", label: "Trilha", icon: "trail", hint: "Sua jornada e a próxima lição" },
  { name: "bible", label: "Bíblia", icon: "bible", hint: "Leitura, notas e marcações" },
  { name: "study", label: "Estudar", icon: "study", hint: "Revisão, Noah e outras rotas" },
  { name: "achievements", label: "Conquistas", icon: "trophy", hint: "Medalhas e progresso" },
  { name: "profile", label: "Perfil", icon: "profile", hint: "Conta, metas e preferências" }
];

/** O ícone dá um pulinho com mola quando a aba é escolhida. */
function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  const still = useStill();
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!focused || still) return;
    scale.setValue(0.8);
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
  }, [focused, still, scale]);
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

export function AppTabBar({ state, navigation }: TabBarProps) {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {MAIN_TABS.map((tab) => {
        const route = state.routes.find((item) => item.name === tab.name);
        if (!route) return null;
        const focused = activeName === tab.name;
        const color = focused ? trail.accent : trail.textMuted;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            accessibilityHint={tab.hint}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <TabIcon focused={focused}>
              <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                <Icon name={tab.icon} size={22} color={color} strokeWidth={focused ? 2.6 : 2.2} />
              </View>
            </TabIcon>
            <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  bar: { flexDirection: "row", paddingTop: 6, paddingHorizontal: 6, backgroundColor: trail.groundDeep, borderTopWidth: 1, borderTopColor: trail.divider },
  item: { flex: 1, minHeight: 52, alignItems: "center", justifyContent: "center", gap: 2 },
  pressed: { opacity: 0.75 },
  iconPill: { width: 52, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  iconPillActive: { backgroundColor: trail.activeTabBg },
  label: { color: trail.textMuted, fontSize: 11, fontWeight: "700" },
  labelActive: { color: trail.accent, fontWeight: "900" }
});
