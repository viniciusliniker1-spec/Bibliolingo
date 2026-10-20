import type { ImageSourcePropType } from "react-native";
import type { ApprovedAchievementId } from "../../src/domain/achievements";

/** 01 and 13 intentionally use the neutral fallback until transparent exports are supplied. */
export const mobileAchievementAssets: Partial<Record<ApprovedAchievementId,ImageSourcePropType>> = {
 "02":require("../../design-assets/02_10_licoes.png"),"03":require("../../design-assets/03_7_dias_seguidos.png"),
 "04":require("../../design-assets/04_30_dias_seguidos.png"),"05":require("../../design-assets/05_50_dias_seguidos.png"),
 "06":require("../../design-assets/06_25_licoes.png"),"07":require("../../design-assets/07_1_livro.png"),
 "08":require("../../design-assets/08_5_livros.png"),"09":require("../../design-assets/09_formacao_pastoral.png"),
 "10":require("../../design-assets/10_rota_grego.png"),"11":require("../../design-assets/11_50_acertos_seguidos.png"),
 "12":require("../../design-assets/12_100_acertos_seguidos.png"),"14":require("../../design-assets/14_10_capitulos.png"),
 "15":require("../../design-assets/15_licao_servico.png"),"16":require("../../design-assets/16_licao_missoes.png"),
 "17":require("../../design-assets/17_licao_oracao.png"),"18":require("../../design-assets/18_20_perguntas_tutor.png"),
 "19":require("../../design-assets/19_50_perguntas_tutor.png"),"20":require("../../design-assets/20_50_licoes.png"),
 "21":require("../../design-assets/21_200_licoes.png"),"22":require("../../design-assets/22_100_dias_seguidos.png"),
 "23":require("../../design-assets/23_500_licoes.png"),"24":require("../../design-assets/24_todos_nt.png"),
 "25":require("../../design-assets/25_todos_at.png"),"26":require("../../design-assets/26_toda_biblia.png"),
 "27":require("../../design-assets/27_todas_rotas.png"),"28":require("../../design-assets/28_nivel_maximo.png"),
 "29":require("../../design-assets/29_100_porcento_rota.png"),"30":require("../../design-assets/30_100_porcento_app.png")
};
