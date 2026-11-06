import { Redirect, useLocalSearchParams } from "expo-router";
import { MobileActivityPlayer } from "../../../components/MobileActivityPlayer";
import { isFormationUnlocked } from "../../../domain/accessCodes";
import { useMobileProgress } from "../../../providers/MobileProgressProvider";

export default function ActivityScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const { progress } = useMobileProgress();
  // A Formação Pastoral só abre depois do código de acesso no Perfil.
  if (kind === "formation" && !isFormationUnlocked(progress.settings)) return <Redirect href="/formation" />;
  return <MobileActivityPlayer />;
}
