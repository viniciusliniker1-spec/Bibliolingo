import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAuthProvider } from "../providers/MobileAuthProvider";
import { MobileProgressProvider } from "../providers/MobileProgressProvider";
import { colors } from "../theme/tokens";
import { DeferredMobileNotificationCoordinator } from "../components/DeferredMobileNotificationCoordinator";
import { LumiRouteCompanion } from "../components/LumiRouteCompanion";
import { View } from "react-native";

export const unstable_settings = {
  initialRouteName: "index"
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <MobileProgressProvider>
          <DeferredMobileNotificationCoordinator />
          <View style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#10272b" },
              headerTintColor: "#effaf4",
              headerTitleStyle: { fontWeight: "800", color: "#effaf4" },
              contentStyle: { backgroundColor: colors.background }
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="book/[bookId]" options={{ title: "Trilha bíblica" }} />
            <Stack.Screen name="lesson/[activityId]" options={{ title: "Lição" }} />
            <Stack.Screen name="result" options={{ title: "Resultado", headerBackVisible: false }} />
            <Stack.Screen name="notification-settings" options={{ title: "Notificações" }} />
            <Stack.Screen name="noah" options={{ title: "Professor Noah" }} />
            <Stack.Screen name="hebrew/index" options={{ title: "Hebraico e Aramaico" }} />
            <Stack.Screen name="hebrew/dictionary" options={{ title: "Dicionário Hebraico/Aramaico" }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: "Página não encontrada" }} />
          </Stack>
          <LumiRouteCompanion />
          </View>
        </MobileProgressProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}
