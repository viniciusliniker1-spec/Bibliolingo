import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";

/** Telas de fundo escuro: ícones claros na barra de status enquanto estão em foco. */
export function useLightStatusBar() {
  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    return () => setStatusBarStyle("dark");
  }, []));
}
