import type { ImageSourcePropType } from "react-native";
import type { ApprovedAchievementId } from "../../src/domain/achievements";

/** 01 and 13 intentionally use the neutral fallback until transparent exports are supplied. */
export const mobileAchievementAssets: Partial<Record<ApprovedAchievementId,ImageSourcePropType>> = {
 "02":require("./generated/02_10_licoes.png"),"03":require("./generated/03_7_dias_seguidos.png"),
 "04":require("./generated/04_30_dias_seguidos.png"),"05":require("./generated/05_50_dias_seguidos.png"),
 "06":require("./generated/06_25_licoes.png"),"07":require("./generated/07_1_livro.png"),
 "08":require("./generated/08_5_livros.png"),"09":require("./generated/09_formacao_pastoral.png"),
 "10":require("./generated/10_rota_grego.png"),"11":require("./generated/11_50_acertos_seguidos.png"),
 "12":require("./generated/12_100_acertos_seguidos.png"),"14":require("./generated/14_10_capitulos.png"),
 "15":require("./generated/15_licao_servico.png"),"16":require("./generated/16_licao_missoes.png"),
 "17":require("./generated/17_licao_oracao.png"),"18":require("./generated/18_20_perguntas_tutor.png"),
 "19":require("./generated/19_50_perguntas_tutor.png"),"20":require("./generated/20_50_licoes.png"),
 "21":require("./generated/21_200_licoes.png"),"22":require("./generated/22_100_dias_seguidos.png"),
 "23":require("./generated/23_500_licoes.png"),"24":require("./generated/24_todos_nt.png"),
 "25":require("./generated/25_todos_at.png"),"26":require("./generated/26_toda_biblia.png"),
 "27":require("./generated/27_todas_rotas.png"),"28":require("./generated/28_nivel_maximo.png"),
 "29":require("./generated/29_100_porcento_rota.png"),"30":require("./generated/30_100_porcento_app.png")
};
