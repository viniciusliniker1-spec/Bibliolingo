import brandHorizontal from "../../design-assets/02_logotipo_horizontal.png";
import navHome from "../../design-assets/01_Inicio.png";
import navBible from "../../design-assets/03_Biblia.png";
import navProfile from "../../design-assets/15_Perfil.png";
import sceneWelcome from "../../design-assets/01_boas_vindas_noturnas.png";
import sceneGarden from "../../design-assets/02_jardim_do_aprendizado.png";
import sceneJourney from "../../design-assets/03_caminho_da_jornada.png";
import sceneLibrary from "../../design-assets/04_biblioteca_do_conhecimento.png";
import scenePurpose from "../../design-assets/05_horizonte_dos_propositos.png";
import sceneConsistency from "../../design-assets/06_santuario_da_constancia.png";
import scenePortal from "../../design-assets/07_portal_da_jornada.png";
import navTracks from "../../design-assets/02_Trilhas.png";
import navGreek from "../../design-assets/04_Grego_Biblico.png";
import navDictionary from "../../design-assets/05_Dicionario.png";
import navStudy from "../../design-assets/06_Estudos.png";
import navFormation from "../../design-assets/07_Formacao_Pastoral.png";
import navReview from "../../design-assets/09_Revisao.png";
import navGoals from "../../design-assets/10_Metas.png";
import navAchievements from "../../design-assets/11_Conquistas.png";
import navLearning from "../../design-assets/12_Progresso.png";
import navPlans from "../../design-assets/13_Plano_de_Estudos.png";
import navFavorites from "../../design-assets/14_Favoritos.png";
import navSettings from "../../design-assets/16_Configuracoes.png";
import navHelp from "../../design-assets/20_Ajuda.png";

import lumiWelcome from "../../design-assets/lumi_01_boas_vindas.png";
import lumiCurious from "../../design-assets/lumi_03_curiosa.png";
import lumiThoughtful from "../../design-assets/lumi_04_pensativa.png";
import lumiAnimated from "../../design-assets/lumi_05_animada.png";
import lumiPraying from "../../design-assets/lumi_07_orando.png";
import lumiSurprised from "../../design-assets/lumi_08_surpresa.png";
import lumiExplaining from "../../design-assets/lumi_09_explicando.png";
import lumiListening from "../../design-assets/lumi_10_ouvindo.png";
import lumiSad from "../../design-assets/lumi_11_triste.png";
import lumiDetermined from "../../design-assets/lumi_12_determinada.png";
import lumiIdea from "../../design-assets/lumi_13_com_uma_ideia.png";
import lumiTechnology from "../../design-assets/lumi_14_tecnologica.png";
import lumiAchievement from "../../design-assets/lumi_15_conquista.png";
import lumiWelcoming from "../../design-assets/lumi_16_acolhedora.png";
import lumiAdventurous from "../../design-assets/lumi_17_aventureira.png";
import lumiSleepy from "../../design-assets/lumi_18_sonolenta.png";
import lumiProud from "../../design-assets/lumi_19_orgulhosa.png";

export const webVisualAssets = {
  identity: { horizontal: brandHorizontal },
  navigation: {
    home: navHome,
    bible: navBible,
    profile: navProfile,
    tracks: navTracks,
    greek: navGreek,
    dictionary: navDictionary,
    study: navStudy,
    formation: navFormation,
    review: navReview,
    goals: navGoals,
    achievements: navAchievements,
    learning: navLearning,
    plans: navPlans,
    favorites: navFavorites,
    settings: navSettings,
    help: navHelp
  },
  scenes: {
    welcome: sceneWelcome,
    garden: sceneGarden,
    journey: sceneJourney,
    library: sceneLibrary,
    purpose: scenePurpose,
    consistency: sceneConsistency,
    portal: scenePortal
  },
  lumi: {
    welcome: lumiWelcome,
    curious: lumiCurious,
    connectionError: lumiThoughtful,
    lessonStart: lumiAnimated,
    praying: lumiPraying,
    surprised: lumiSurprised,
    explaining: lumiExplaining,
    listening: lumiListening,
    sad: lumiSad,
    encouragement: lumiDetermined,
    idea: lumiIdea,
    loading: lumiTechnology,
    achievement: lumiAchievement,
    returning: lumiWelcoming,
    routeComplete: lumiAdventurous,
    sleepy: lumiSleepy,
    proud: lumiProud
  }
} as const;

export type LumiMoment = keyof typeof webVisualAssets.lumi;
