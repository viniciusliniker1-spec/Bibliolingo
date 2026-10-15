import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { colors } from "../../theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tealDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          minHeight: 68,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="⌂" />
        }}
      />
      <Tabs.Screen
        name="tracks"
        options={{
          title: "Trilhas",
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="◉" />
        }}
      />
    </Tabs>
  );
}

function TabGlyph({ color, glyph }: { color: string; glyph: string }) {
  return <Text style={[styles.icon, { color }]} aria-hidden>{glyph}</Text>;
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
    fontWeight: "800"
  }
});
