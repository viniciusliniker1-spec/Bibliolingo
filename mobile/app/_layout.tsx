import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAuthProvider } from "../providers/MobileAuthProvider";
import { MobileProgressProvider } from "../providers/MobileProgressProvider";
import { colors } from "../theme/tokens";
import { DeferredMobileNotificationCoordinator } from "../components/DeferredMobileNotificationCoordinator";
import { DeferredRoutePreloader } from "../components/DeferredRoutePreloader";

export const unstable_settings = {
  initialRouteName: "index"
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <MobileProgressProvider>
          <DeferredRoutePreloader />
          <DeferredMobileNotificationCoordinator />
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.navy,
              headerTitleStyle: { fontWeight: "800" },
              contentStyle: { backgroundColor: colors.background }
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="book/[bookId]" options={{ title: "Trilha bíblica" }} />
            <Stack.Screen name="lesson/[activityId]" options={{ title: "Lição" }} />
            <Stack.Screen name="result" options={{ title: "Resultado", headerBackVisible: false }} />
            <Stack.Screen name="notification-settings" options={{ title: "Notificações" }} />
            <Stack.Screen name="plans" options={{ title: "Planos de Estudo" }} />
            <Stack.Screen name="missions" options={{ title: "Minhas Missões" }} />
            <Stack.Screen name="dashboard" options={{ title: "Meu Aprendizado" }} />
            <Stack.Screen name="noah" options={{ title: "Professor Noah" }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: "Página não encontrada" }} />
          </Stack>
        </MobileProgressProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}
