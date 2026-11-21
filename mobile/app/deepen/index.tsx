import { useMemo } from "react";
import { deepenActivityIds, deepenGenesisUnit } from "../../../src/content/deepen/catalog";
import { ActivityHub, HubScreen, hubProgress } from "../../components/ActivityHub";
import { useMobileProgress } from "../../providers/MobileProgressProvider";

const TINT = "#c9a7ff";

export default function DeepenHubScreen() {
  const { progress } = useMobileProgress();
  const groups = useMemo(() => [{
    id: deepenGenesisUnit.id, title: deepenGenesisUnit.title, subtitle: deepenGenesisUnit.subtitle,
    activities: [
      ...deepenGenesisUnit.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, subtitle: `${lesson.estimatedMinutes} min` })),
      { id: deepenGenesisUnit.checkpoint.id, title: deepenGenesisUnit.checkpoint.title, subtitle: "Checkpoint avançado", checkpoint: true }
    ]
  }], []);
  const completed = useMemo(() => new Set([...progress.completedLessonIds, ...progress.completedCheckpointIds]), [progress.completedLessonIds, progress.completedCheckpointIds]);
  return (
    <HubScreen eyebrow="ESTUDO AVANÇADO" title="Aprofundar" icon="study" tint={TINT} progress={hubProgress(groups, completed)}
      subtitle="Exegese progressiva, fontes rastreáveis, limites interpretativos e aplicação responsável.">
      <ActivityHub kind="deepen" groups={groups} orderedIds={deepenActivityIds} tint={TINT} />
    </HubScreen>
  );
}
