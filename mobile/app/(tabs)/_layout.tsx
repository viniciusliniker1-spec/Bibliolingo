import { Tabs } from "expo-router";
import { LumiTutorial } from "../../components/LumiTutorial";
import { AppTabBar } from "../../components/navigation/AppTabBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";

export default function TabsLayout() {
  const { progress, hydrated, updatePreferences } = useMobileProgress();
  return (
    <>
      <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: "Trilha" }} />
        <Tabs.Screen name="bible" options={{ title: "Bíblia" }} />
        <Tabs.Screen name="study" options={{ title: "Estudar" }} />
        <Tabs.Screen name="achievements" options={{ title: "Conquistas" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
        <Tabs.Screen name="tracks" options={{ href: null, title: "Livros" }} />
        <Tabs.Screen name="review" options={{ href: null, title: "Revisão" }} />
      </Tabs>
      {/* Primeiro acesso: a Lumi apresenta o app uma única vez. */}
      <LumiTutorial visible={hydrated && !progress.settings.lumiTutorialSeen} onDone={() => updatePreferences({}, { lumiTutorialSeen: true })} />
    </>
  );
}
