import { useEffect, useRef } from "react";
import { isNewLearner } from "../../domain/appTour";
import { Redirect, Tabs } from "expo-router";
import { AppTabBar } from "../../components/navigation/AppTabBar";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { TourProvider, useTour } from "../../providers/TourProvider";

/** Primeiro acesso: a Lumi faz o tour guiado pelas telas uma única vez. */
function FirstAccessTour() {
  const { progress, hydrated, updatePreferences } = useMobileProgress();
  const tour = useTour();
  const started = useRef(false);
  const latest = useRef(progress);
  latest.current = progress;
  useEffect(() => {
    if (!hydrated || started.current || progress.settings.lumiTutorialSeen) return;
    // Espera a sincronização da conta trazer o progresso antes de decidir.
    const timer = setTimeout(() => {
      if (started.current || latest.current.settings.lumiTutorialSeen) return;
      started.current = true;
      // Só contas novas veem o tour sozinho; quem já estuda revê em Perfil › Rever tour.
      if (isNewLearner(latest.current)) tour.start();
      else updatePreferences({}, { lumiTutorialSeen: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [hydrated, progress.settings.lumiTutorialSeen, tour.start, updatePreferences]);
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
