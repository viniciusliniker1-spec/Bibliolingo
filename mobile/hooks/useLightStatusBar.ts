import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { usePalette } from "../providers/ThemeProvider";

/** Mantém os ícones da barra de status legíveis sobre o fundo do tema. */
export function useLightStatusBar() {
  const palette = usePalette();
  useFocusEffect(useCallback(() => {
    setStatusBarStyle(palette.isDark ? "light" : "dark");
  }, [palette.isDark]));
}
