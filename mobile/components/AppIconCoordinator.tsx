import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { recordAppOpen, syncAppIcon } from "../services/appIcon";
import { registerAppIconTask } from "../services/appIconTask";
import { trackOpen } from "../services/funnel";

/** Registra o acesso do dia e atualiza o ícone do app quando ele vai para segundo plano. */
export function AppIconCoordinator() {
  useEffect(() => {
    void trackOpen();
    const funnel = AppState.addEventListener("change", (state) => { if (state === "active") void trackOpen(); });
    if (Platform.OS !== "android") return () => funnel.remove();
    void recordAppOpen().then(registerAppIconTask);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") void syncAppIcon();
      else if (state === "active") void recordAppOpen();
    });
    return () => { subscription.remove(); funnel.remove(); };
  }, []);
  return null;
}
