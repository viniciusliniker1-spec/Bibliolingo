import type { ImageSourcePropType } from "react-native";

export const mobileSceneAssets = {
  welcome: require("../../design-assets/01_boas_vindas_noturnas.png") as ImageSourcePropType,
  tracks: require("../../design-assets/02_jardim_do_aprendizado.png") as ImageSourcePropType,
  journey: require("../../design-assets/03_caminho_da_jornada.png") as ImageSourcePropType,
  study: require("../../design-assets/04_biblioteca_do_conhecimento.png") as ImageSourcePropType,
  goals: require("../../design-assets/05_horizonte_dos_propositos.png") as ImageSourcePropType,
  consistency: require("../../design-assets/06_santuario_da_constancia.png") as ImageSourcePropType,
  route: require("../../design-assets/07_portal_da_jornada.png") as ImageSourcePropType,
  formation: require("../../design-assets/09_formacao_pastoral.png") as ImageSourcePropType,
  greek: require("../../design-assets/10_rota_grego.png") as ImageSourcePropType
} as const;
