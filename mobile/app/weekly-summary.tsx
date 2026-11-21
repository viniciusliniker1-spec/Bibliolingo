import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ShareScreen } from "../components/ShareScreen";
import { WeeklySummaryCard } from "../components/WeeklySummaryCard";
import { weeklyCaption, weeklySummary } from "../domain/weeklySummary";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";

/** Resumo dos últimos 7 dias, em cartão para compartilhar. */
export default function WeeklySummaryScreen() {
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const summary = useMemo(() => weeklySummary(progress.activity), [progress.activity]);
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").trim() || undefined;
  const dateLabel = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  return (
    <ShareScreen
      title="Sua semana"
      subtitle={summary.activeDays ? `Você estudou em ${summary.activeDays} de 7 dias. Compartilhe e convide alguém para caminhar com você.` : "Ainda não houve estudo nesta semana. Que tal uma lição hoje?"}
      caption={weeklyCaption(summary, name)}
      filename="bibliolingo-semana"
      cardLabel={`Resumo da semana: ${summary.activeDays} de 7 dias, ${summary.lessons} etapas, ${summary.xp} XP`}
      renderCard={(width, ref) => <WeeklySummaryCard ref={ref} width={width} summary={summary} name={name} dateLabel={dateLabel} />}
      secondary={{ label: "Estudar agora", onPress: () => router.replace("/") }}
      onClose={() => router.back()}
      closeLabel="Voltar"
    />
  );
}
