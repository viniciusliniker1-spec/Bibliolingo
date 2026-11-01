import { Tabs } from "expo-router";
import { StyleSheet, Text, View, type ColorValue } from "react-native";
import { colors } from "../../theme/tokens";

const tabSymbols = {
  index: "⌂",
  bible: "▤",
  study: "✦",
  achievements: "★",
  profile: "●"
} as const;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.tealDark,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { minHeight: 68, paddingTop: 6, paddingBottom: 8, backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "700" }
    }}>
      <Tabs.Screen name="index" options={{ title: "Jornada", tabBarIcon: ({ color, focused }) => <TabSymbol symbol={tabSymbols.index} color={color} focused={focused} /> }} />
      <Tabs.Screen name="bible" options={{ title: "Bíblia", tabBarIcon: ({ color, focused }) => <TabSymbol symbol={tabSymbols.bible} color={color} focused={focused} /> }} />
      <Tabs.Screen name="study" options={{ title: "Estudar", tabBarIcon: ({ color, focused }) => <TabSymbol symbol={tabSymbols.study} color={color} focused={focused} /> }} />
      <Tabs.Screen name="achievements" options={{ title: "Conquistas", tabBarIcon: ({ color, focused }) => <TabSymbol symbol={tabSymbols.achievements} color={color} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color, focused }) => <TabSymbol symbol={tabSymbols.profile} color={color} focused={focused} /> }} />
      <Tabs.Screen name="tracks" options={{ href: null }} />
      <Tabs.Screen name="review" options={{ href: null }} />
    </Tabs>
  );
}

function TabSymbol({ symbol, color, focused }: { symbol: string; color: ColorValue; focused: boolean }) {
  return (
    <View style={[styles.icon, focused && styles.iconFocused]}>
      <Text style={[styles.symbol, { color }]}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  iconFocused: { backgroundColor: "#d8f2ee" },
  symbol: { fontSize: 20, lineHeight: 23, fontWeight: "900" }
});
