import type { ImageSourcePropType } from "react-native";

/** Contextual artwork only; masters are resized during the Android build. */
export const mobileFeedbackAssets = {
  welcome: require("./generated/lumi_01_boas_vindas.png") as ImageSourcePropType,
  connectionError: require("./generated/lumi_04_pensativa.png") as ImageSourcePropType,
  lessonStart: require("./generated/lumi_05_animada.png") as ImageSourcePropType,
  surprised: require("./generated/lumi_08_surpresa.png") as ImageSourcePropType,
  explaining: require("./generated/lumi_09_explicando.png") as ImageSourcePropType,
  listening: require("./generated/lumi_10_ouvindo.png") as ImageSourcePropType,
  encouragement: require("./generated/lumi_12_determinada.png") as ImageSourcePropType,
  idea: require("./generated/lumi_13_com_uma_ideia.png") as ImageSourcePropType,
  loading: require("./generated/lumi_14_tecnologica.png") as ImageSourcePropType,
  achievement: require("./generated/lumi_15_conquista.png") as ImageSourcePropType,
  returning: require("./generated/lumi_16_acolhedora.png") as ImageSourcePropType,
  routeComplete: require("./generated/lumi_17_aventureira.png") as ImageSourcePropType,
  proud: require("./generated/lumi_19_orgulhosa.png") as ImageSourcePropType
} as const;
