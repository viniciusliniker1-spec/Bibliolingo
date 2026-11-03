import { useEffect, useRef } from "react";
import { Redirect, Tabs } from "expo-router";
import { AppTabBar } from "../../components/navigation/AppTabBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { TourProvider, useTour } from "../../providers/TourProvider";

/** Primeiro acesso: a Lumi faz o tour guiado pelas telas uma única vez. */
function FirstAccessTour() {
  const { progress, hydrated } = useMobileProgress();
  const tour = useTour();
  const started = useRef(false);
  useEffect(() => {
    if (!hydrated || started.current || progress.settings.lumiTutorialSeen) return;
    started.current = true;
    const timer = setTimeout(tour.start, 600);
    return () => clearTimeout(timer);
  }, [hydrated, progress.settings.lumiTutorialSeen, tour.start]);
  return null;
}

export default function TabsLayout() {
  const { progress, hydrated, updatePreferences } = useMobileProgress();
  // Modo criança: o app abre direto nas histórias (sair exige o portão dos pais).
  if (hydrated && progress.settings.kidsMode?.enabled) return <Redirect href="/kids" />;
  return (
    <TourProvider onFinish={() => updatePreferences({}, { lumiTutorialSeen: true })}>
      <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: "Trilha" }} />
        <Tabs.Screen name="bible" options={{ title: "Bíblia" }} />
        <Tabs.Screen name="study" options={{ title: "Estudar" }} />
        <Tabs.Screen name="achievements" options={{ title: "Conquistas" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
        <Tabs.Screen name="tracks" options={{ href: null, title: "Livros" }} />
        <Tabs.Screen name="review" options={{ href: null, title: "Revisão" }} />
      </Tabs>
      <FirstAccessTour />
    </TourProvider>
  );
}
