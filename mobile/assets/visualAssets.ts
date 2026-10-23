import type { ImageSourcePropType } from "react-native";

export const mobileVisualAssets = {
  lumi: {
    welcome: require("../../design-assets/lumi_01_boas_vindas.png") as ImageSourcePropType,
    curious: require("../../design-assets/lumi_03_curiosa.png") as ImageSourcePropType,
    connectionError: require("../../design-assets/lumi_04_pensativa.png") as ImageSourcePropType,
    lessonStart: require("../../design-assets/lumi_05_animada.png") as ImageSourcePropType,
    praying: require("../../design-assets/lumi_07_orando.png") as ImageSourcePropType,
    surprised: require("../../design-assets/lumi_08_surpresa.png") as ImageSourcePropType,
    explaining: require("../../design-assets/lumi_09_explicando.png") as ImageSourcePropType,
    listening: require("../../design-assets/lumi_10_ouvindo.png") as ImageSourcePropType,
    sad: require("../../design-assets/lumi_11_triste.png") as ImageSourcePropType,
    encouragement: require("../../design-assets/lumi_12_determinada.png") as ImageSourcePropType,
    idea: require("../../design-assets/lumi_13_com_uma_ideia.png") as ImageSourcePropType,
    loading: require("../../design-assets/lumi_14_tecnologica.png") as ImageSourcePropType,
    achievement: require("../../design-assets/lumi_15_conquista.png") as ImageSourcePropType,
    returning: require("../../design-assets/lumi_16_acolhedora.png") as ImageSourcePropType,
    routeComplete: require("../../design-assets/lumi_17_aventureira.png") as ImageSourcePropType,
    sleepy: require("../../design-assets/lumi_18_sonolenta.png") as ImageSourcePropType,
    proud: require("../../design-assets/lumi_19_orgulhosa.png") as ImageSourcePropType
  }
} as const;
