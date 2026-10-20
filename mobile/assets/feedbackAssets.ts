import type { ImageSourcePropType } from "react-native";

/**
 * Feedback artwork is isolated from the complete asset inventory so importing
 * one learning screen does not register every navigation and achievement PNG.
 */
export const mobileFeedbackAssets = {
  welcome: require("../../design-assets/lumi_01_boas_vindas.png") as ImageSourcePropType,
  encouragement: require("../../design-assets/lumi_12_determinada.png") as ImageSourcePropType,
  loading: require("../../design-assets/lumi_14_tecnologica.png") as ImageSourcePropType,
  achievement: require("../../design-assets/lumi_15_conquista.png") as ImageSourcePropType,
  proud: require("../../design-assets/lumi_19_orgulhosa.png") as ImageSourcePropType
} as const;
