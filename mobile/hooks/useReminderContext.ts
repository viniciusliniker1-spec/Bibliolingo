import { useMemo } from "react";
import { nextActivityForKind, resolveMobileActivity } from "../domain/activityCatalog";
import type { ReminderContext } from "../domain/notificationSchedule";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";

/** Nome e próxima lição, para os lembretes e o widget falarem com a pessoa. */
export function useReminderContext(): ReminderContext {
  const { progress } = useMobileProgress();
  const auth = useMobileAuth();
  const name = (auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name;
  const nextLessonTitle = useMemo(() => {
    try {
      const id = nextActivityForKind("bible", progress.completedLessonIds, progress.completedCheckpointIds);
      return id ? resolveMobileActivity("bible", id)?.title : undefined;
    } catch {
      return undefined;
    }
  }, [progress.completedLessonIds, progress.completedCheckpointIds]);
  return useMemo(() => ({ name, nextLessonTitle }), [name, nextLessonTitle]);
}
