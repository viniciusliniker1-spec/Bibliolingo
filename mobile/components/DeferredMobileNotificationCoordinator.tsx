import { useEffect, useState, type ComponentType } from "react";
import { InteractionManager } from "react-native";

/**
 * expo-notifications and scheduling code are not part of the first Android
 * frame. Notifications remain active as soon as initial interactions settle.
 */
export function DeferredMobileNotificationCoordinator() {
  const [Coordinator, setCoordinator] = useState<ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    const task = InteractionManager.runAfterInteractions(() => {
      void import("./MobileNotificationCoordinator")
        .then((module) => {
          if (active) setCoordinator(() => module.MobileNotificationCoordinator);
        })
        .catch(() => undefined);
    });
    return () => {
      active = false;
      task.cancel();
    };
  }, []);

  return Coordinator ? <Coordinator /> : null;
}
