import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAuthProvider } from "../providers/MobileAuthProvider";
import { MobileProgressProvider } from "../providers/MobileProgressProvider";
import { MobileLumiProvider } from "../providers/MobileLumiProvider";
import { DeferredMobileNotificationCoordinator } from "../components/DeferredMobileNotificationCoordinator";
import { AppThemeProvider, usePalette } from "../providers/ThemeProvider";

export const unstable_settings = {
  initialRouteName: "index"
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <MobileLumiProvider>
        <MobileProgressProvider>
          <DeferredMobileNotificationCoordinator />
          <AppThemeProvider>
          <ThemedStack />
          </AppThemeProvider>
        </MobileProgressProvider>
        </MobileLumiProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}

function ThemedStack() {
  const palette = usePalette();
  return (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: palette.groundDeep },
              headerTintColor: palette.text,
              headerTitleStyle: { fontWeight: "800", color: palette.text },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: palette.ground }
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="book/[bookId]" options={{ headerShown: false }} />
            <Stack.Screen name="lesson/[activityId]" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="activity/[kind]/[activityId]" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="result" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="notification-settings" options={{ title: "Notificações" }} />
            <Stack.Screen name="noah" options={{ title: "Professor Noah" }} />
            <Stack.Screen name="hebrew/index" options={{ headerShown: false }} />
            <Stack.Screen name="greek/index" options={{ headerShown: false }} />
            <Stack.Screen name="hebrew/dictionary" options={{ title: "Dicionário Hebraico/Aramaico" }} />
            <Stack.Screen name="study/notebook" options={{ title: "Meu caderno" }} />
            <Stack.Screen name="study/memory" options={{ title: "Memorizar" }} />
            <Stack.Screen name="study/search" options={{ title: "Busca bíblica" }} />
            <Stack.Screen name="deepen/index" options={{ title: "Aprofundar" }} />
            <Stack.Screen name="formation/index" options={{ title: "Formação Pastoral" }} />
            <Stack.Screen name="study/maps/index" options={{ title: "Mapas bíblicos" }} />
            <Stack.Screen name="kids/index" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="kids/story/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="kids/album" options={{ headerShown: false }} />
            <Stack.Screen name="study/context" options={{ title: "Linha do tempo" }} />
            <Stack.Screen name="feedback-settings" options={{ title: "Sons e feedback" }} />
            <Stack.Screen name="lumi-store" options={{ title: "Loja Lumi", presentation: "card" }} />
            <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: "Página não encontrada" }} />
          </Stack>
  );
}
