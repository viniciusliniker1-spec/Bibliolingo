import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LessonConfetti } from "../../components/LessonConfetti";
import { MilestoneCard } from "../../components/MilestoneCard";
import { ShareScreen } from "../../components/ShareScreen";
import { milestoneCaption, milestoneTitle, STREAK_MILESTONES } from "../../domain/milestones";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { markMilestoneCelebrated } from "../../services/milestones";

/** Cartão de marco de ofensiva (7, 14, 30… dias) para compartilhar. */
export default function MilestoneScreen() {
  const { days: raw } = useLocalSearchParams<{ days: string }>();
  const days = Number(raw);
  const router = useRouter();
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const valid = (STREAK_MILESTONES as readonly number[]).includes(days);
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").trim() || undefined;

  useEffect(() => {
    if (!valid) return;
    void markMilestoneCelebrated(days);
    playFeedback("checkpoint");
  }, [days, valid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!valid) {
    router.replace("/streak");
    return null;
  }
  const dateLabel = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  return (
    <ShareScreen
      title={milestoneTitle(days)}
      subtitle={`${days} dias seguidos com a Palavra. Compartilhe essa conquista com quem caminha com você.`}
      caption={milestoneCaption(days, name)}
      filename={`bibliolingo-${days}-dias`}
      cardLabel={`Cartão de marco: ${days} dias seguidos de estudo`}
      renderCard={(width, ref) => <MilestoneCard ref={ref} width={width} days={days} name={name} xp={progress.xp} dateLabel={dateLabel} />}
      onClose={() => router.replace("/")}
      closeLabel="Continuar"
      overlay={<LessonConfetti active />}
    />
  );
}
