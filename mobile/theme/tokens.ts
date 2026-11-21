export const colors = {
  navy: "#10243e",
  teal: "#18a999",
  tealDark: "#0b7f75",
  background: "#eef4f8",
  surface: "#ffffff",
  gold: "#f2b84b",
  goldDark: "#9a6410",
  rose: "#e45d72",
  success: "#18794e",
  error: "#b4233c",
  text: "#10243e",
  muted: "#5f7085",
  border: "#d7e2e9",
  disabled: "#9ba9b6"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999
} as const;

/** Paleta escura (tema noturno da jornada). */
export const darkPalette = {
  isDark: true,
  ground: "#0f2238",
  groundDeep: "#0b1a2c",
  card: "#16304d",
  line: "#2c4664",
  divider: "#1f3a5a",
  text: "#f4f8fb",
  textMuted: "#a9bdd1",
  accent: "#7fe3d5",
  activeTabBg: "#123f44",
  node: "#1c3653",
  nodeShadow: "#0a1828",
  lockIcon: "#7d92a8",
  cta: "#18a999",
  ctaShadow: "#0b7f75",
  ctaText: "#06231f",
  streak: "#ff9f43",
  streakText: "#ffb35c",
  xp: "#f2b84b",
  heart: "#e45d72",
  heartText: "#ff7a8f",
  goldSoft: "#3b2f12",
  medalBg: "#13283f",
  silhouette: "#2a4362",
  heat: ["#1a3350", "#1f5a5a", "#18a999", "#7fe3d5"],
  success: "#58cc8a",
  successSoft: "#12382a",
  error: "#ff7a8f",
  errorSoft: "#3d1a24",
  sheet: "#f7fafc",
  sheetText: "#10243e"
};

export type Palette = typeof darkPalette;

/** Paleta clara: mesmas chaves, contraste AA sobre fundo claro. */
export const lightPalette: Palette = {
  isDark: false,
  ground: "#f3f6fa",
  groundDeep: "#ffffff",
  card: "#ffffff",
  line: "#d9e3ec",
  divider: "#e6edf3",
  text: "#10243e",
  textMuted: "#55667a",
  accent: "#0b7f75",
  activeTabBg: "#dcefeb",
  node: "#e3eaf1",
  nodeShadow: "#c3cfdb",
  lockIcon: "#7f91a5",
  cta: "#18a999",
  ctaShadow: "#0b7f75",
  ctaText: "#06231f",
  streak: "#f08a24",
  streakText: "#c25e00",
  xp: "#d99a1e",
  heart: "#e45d72",
  heartText: "#c43c55",
  goldSoft: "#fff3d6",
  medalBg: "#eef2f6",
  silhouette: "#c5d0db",
  heat: ["#e6edf3", "#bfe6df", "#4fc9b9", "#0b7f75"],
  success: "#18794e",
  successSoft: "#e3f6ea",
  error: "#c43c55",
  errorSoft: "#fdeaee",
  sheet: "#ffffff",
  sheetText: "#10243e"
};

/** Compatibilidade: telas que ainda não usam o tema seguem a paleta escura. */
export const trail = darkPalette;
