import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { setStatusBarStyle } from "expo-status-bar";
import { darkPalette, lightPalette, type Palette } from "../theme/tokens";
import { useMobileProgress } from "./MobileProgressProvider";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeValue { palette: Palette; mode: ThemeMode }
const ThemeContext = createContext<ThemeValue>({ palette: darkPalette, mode: "system" });

/** Tema do app: segue o sistema, ou a escolha feita no Perfil. */
export function AppThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const { progress } = useMobileProgress();
  const mode: ThemeMode = progress.settings.themeMode ?? "system";
  const dark = mode === "dark" || (mode === "system" && system !== "light");
  const value = useMemo(() => ({ palette: dark ? darkPalette : lightPalette, mode }), [dark, mode]);
  useEffect(() => { setStatusBarStyle(dark ? "light" : "dark"); }, [dark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function usePalette() {
  return useContext(ThemeContext).palette;
}

export function useThemeMode() {
  return useContext(ThemeContext).mode;
}

/** Estilos dependentes do tema, recalculados só quando o tema muda. */
export function useThemedStyles<T>(factory: (palette: Palette) => T): T {
  const palette = usePalette();
  return useMemo(() => factory(palette), [factory, palette]);
}
