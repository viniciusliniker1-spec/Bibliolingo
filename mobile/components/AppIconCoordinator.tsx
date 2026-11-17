import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { recordAppOpen, syncAppIcon } from "../services/appIcon";
import { registerAppIconTask } from "../services/appIconTask";

/** Registra o acesso do dia e atualiza o ícone do app quando ele vai para segundo plano. */
export function AppIconCoordinator() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void recordAppOpen().then(registerAppIconTask);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") void syncAppIcon();
      else if (state === "active") void recordAppOpen();
    });
    return () => subscription.remove();
  }, []);
  return null;
}
