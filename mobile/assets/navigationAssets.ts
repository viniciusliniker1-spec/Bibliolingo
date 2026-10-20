import type { ImageSourcePropType } from "react-native";

/**
 * Only the five assets rendered by the tab bar live in this module.
 * Keeping this registry small prevents unrelated artwork from entering startup.
 */
export const mobileNavigationAssets = {
  home: require("../../design-assets/01_Inicio.png") as ImageSourcePropType,
  bible: require("../../design-assets/03_Biblia.png") as ImageSourcePropType,
  study: require("../../design-assets/06_Estudos.png") as ImageSourcePropType,
  achievements: require("../../design-assets/11_Conquistas.png") as ImageSourcePropType,
  profile: require("../../design-assets/15_Perfil.png") as ImageSourcePropType
} as const;
