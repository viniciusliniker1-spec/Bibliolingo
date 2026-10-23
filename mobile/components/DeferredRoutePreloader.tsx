import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { loadMobileCurriculum } from "../services/mobileCurriculum";

const warmups: Array<() => Promise<unknown>> = [
  () => loadMobileCurriculum(),
  () => import("../../src/content/bible/catalog"),
  () => import("../../src/content/formation/catalog"),
  () => import("../../src/content/greek/catalog"),
  () => import("../../src/content/deepen/catalog")
];

/**
 * Warms the main educational domains one at a time after interactions. The
 * sequence is automatic, but never mounts screens or calculates adaptive
 * recommendations while the learner is trying to navigate.
 */
export function DeferredRoutePreloader() {
  useEffect(() => {
    let active = true;
    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let task: { cancel: () => void } | undefined;

    const warmNext = () => {
      if (!active || index >= warmups.length) return;
      task = InteractionManager.runAfterInteractions(() => {
        const warmup = warmups[index++];
        void warmup()
          .catch(() => undefined)
          .finally(() => {
            if (active && index < warmups.length) timer = setTimeout(warmNext, 450);
          });
      });
    };

    timer = setTimeout(warmNext, 1_200);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      task?.cancel();
    };
  }, []);

  return null;
}
