import type { ImageSourcePropType } from "react-native";

export const mobileSceneAssets = {
  welcome: require("./generated/01_boas_vindas_noturnas.png") as ImageSourcePropType,
  tracks: require("./generated/02_jardim_do_aprendizado.png") as ImageSourcePropType,
  journey: require("./generated/03_caminho_da_jornada.png") as ImageSourcePropType,
  study: require("./generated/04_biblioteca_do_conhecimento.png") as ImageSourcePropType,
  goals: require("./generated/05_horizonte_dos_propositos.png") as ImageSourcePropType,
  consistency: require("./generated/06_santuario_da_constancia.png") as ImageSourcePropType,
  route: require("./generated/07_portal_da_jornada.png") as ImageSourcePropType
} as const;
