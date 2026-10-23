import { useEffect, useState, type ComponentType } from "react";
import { InteractionManager } from "react-native";

/**
 * Notification scheduling is intentionally kept away from startup and the
 * learner's first navigation. It remains available after the app is idle.
 */
export function DeferredMobileNotificationCoordinator() {
  const [Coordinator, setCoordinator] = useState<ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    let task: { cancel: () => void } | undefined;
    const timer = setTimeout(() => {
      task = InteractionManager.runAfterInteractions(() => {
        void import("./MobileNotificationCoordinator")
          .then((module) => {
            if (active) setCoordinator(() => module.MobileNotificationCoordinator);
          })
          .catch(() => undefined);
      });
    }, 8_000);
    return () => {
      active = false;
      clearTimeout(timer);
      task?.cancel();
    };
  }, []);

  return Coordinator ? <Coordinator /> : null;
}
