import { useEffect, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LessonConfetti } from "../../components/LessonConfetti";
import { PlanProgressCard } from "../../components/PlanProgressCard";
import { ShareScreen } from "../../components/ShareScreen";
import { planBackgroundBookId, planCaption, planMilestoneTitle, planStatus } from "../../domain/planMilestones";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { markPlanMilestoneCelebrated } from "../../services/planMilestones";

/** Cartão de progresso do plano de leitura, para compartilhar. */
export default function PlanCardScreen() {
  const { enrollmentId } = useLocalSearchParams<{ enrollmentId: string }>();
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const enrollment = progress.planEnrollments.find((item) => item.id === enrollmentId);
  const status = useMemo(() => (enrollment ? planStatus(enrollment, progress.planCompletionEvents) : undefined), [enrollment, progress.planCompletionEvents]);
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").trim() || undefined;

  useEffect(() => {
    if (!enrollment || !status) return;
    void markPlanMilestoneCelebrated(enrollment.id, status.percent);
    playFeedback("checkpoint");
  }, [enrollment?.id, status?.percent]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!enrollment || !status) {
    router.replace("/plans");
    return null;
  }
  const dateLabel = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  return (
    <ShareScreen
      title={planMilestoneTitle(status.percent)}
      subtitle={status.percent >= 100 ? "Você terminou o plano. Compartilhe e convide alguém para ler com você." : `${status.completed} de ${status.total} leituras feitas. Compartilhe seu avanço!`}
      caption={planCaption(enrollment.title, status, name)}
      filename={`bibliolingo-plano-${status.percent}`}
      cardLabel={`Cartão do plano ${enrollment.title}: ${status.percent}% lido`}
      renderCard={(width, ref) => <PlanProgressCard ref={ref} width={width} title={enrollment.title} status={status} name={name} dateLabel={dateLabel} backgroundBookId={planBackgroundBookId(enrollment)} />}
      secondary={{ label: "Voltar ao plano", onPress: () => router.replace("/plans") }}
      onClose={() => router.back()}
      closeLabel="Fechar"
      overlay={status.percent >= 25 ? <LessonConfetti active /> : undefined}
    />
  );
}
