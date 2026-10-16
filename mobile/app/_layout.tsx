import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileProgressProvider } from "../providers/MobileProgressProvider";
import { colors } from "../theme/tokens";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileProgressProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.navy,
            headerTitleStyle: { fontWeight: "800" },
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="book/[bookId]" options={{ title: "Trilha bíblica" }} />
          <Stack.Screen name="lesson/[activityId]" options={{ title: "Lição" }} />
          <Stack.Screen name="result" options={{ title: "Resultado", headerBackVisible: false }} />
          <Stack.Screen name="+not-found" options={{ title: "Página não encontrada" }} />
        </Stack>
      </MobileProgressProvider>
    </SafeAreaProvider>
  );
}
