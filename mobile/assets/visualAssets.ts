import type { ImageSourcePropType } from "react-native";

export const mobileVisualAssets = {
  navigation: {
    tracks: require("../../design-assets/02_Trilhas.png") as ImageSourcePropType,
    greek: require("../../design-assets/04_Grego_Biblico.png") as ImageSourcePropType,
    dictionary: require("../../design-assets/05_Dicionario.png") as ImageSourcePropType,
    study: require("../../design-assets/06_Estudos.png") as ImageSourcePropType,
    formation: require("../../design-assets/07_Formacao_Pastoral.png") as ImageSourcePropType,
    review: require("../../design-assets/09_Revisao.png") as ImageSourcePropType,
    goals: require("../../design-assets/10_Metas.png") as ImageSourcePropType,
    achievements: require("../../design-assets/11_Conquistas.png") as ImageSourcePropType,
    learning: require("../../design-assets/12_Progresso.png") as ImageSourcePropType,
    plans: require("../../design-assets/13_Plano_de_Estudos.png") as ImageSourcePropType,
    favorites: require("../../design-assets/14_Favoritos.png") as ImageSourcePropType,
    settings: require("../../design-assets/16_Configuracoes.png") as ImageSourcePropType,
    help: require("../../design-assets/20_Ajuda.png") as ImageSourcePropType
  },
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
