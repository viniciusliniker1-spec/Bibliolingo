import a02 from "../../design-assets/02_10_licoes.png";
import a03 from "../../design-assets/03_7_dias_seguidos.png";
import a04 from "../../design-assets/04_30_dias_seguidos.png";
import a05 from "../../design-assets/05_50_dias_seguidos.png";
import a06 from "../../design-assets/06_25_licoes.png";
import a07 from "../../design-assets/07_1_livro.png";
import a08 from "../../design-assets/08_5_livros.png";
import a09 from "../../design-assets/09_formacao_pastoral.png";
import a10 from "../../design-assets/10_rota_grego.png";
import a11 from "../../design-assets/11_50_acertos_seguidos.png";
import a12 from "../../design-assets/12_100_acertos_seguidos.png";
import a14 from "../../design-assets/14_10_capitulos.png";
import a15 from "../../design-assets/15_licao_servico.png";
import a16 from "../../design-assets/16_licao_missoes.png";
import a17 from "../../design-assets/17_licao_oracao.png";
import a18 from "../../design-assets/18_20_perguntas_tutor.png";
import a19 from "../../design-assets/19_50_perguntas_tutor.png";
import a20 from "../../design-assets/20_50_licoes.png";
import a21 from "../../design-assets/21_200_licoes.png";
import a22 from "../../design-assets/22_100_dias_seguidos.png";
import a23 from "../../design-assets/23_500_licoes.png";
import a24 from "../../design-assets/24_todos_nt.png";
import a25 from "../../design-assets/25_todos_at.png";
import a26 from "../../design-assets/26_toda_biblia.png";
import a27 from "../../design-assets/27_todas_rotas.png";
import a28 from "../../design-assets/28_nivel_maximo.png";
import a29 from "../../design-assets/29_100_porcento_rota.png";
import a30 from "../../design-assets/30_100_porcento_app.png";
import type { ApprovedAchievementId } from "../domain/achievements";

/** 01 and 13 intentionally use the neutral fallback until transparent exports are supplied. */
export const webAchievementAssets: Partial<Record<ApprovedAchievementId,string>> = {
  "02":a02,"03":a03,"04":a04,"05":a05,"06":a06,"07":a07,"08":a08,"09":a09,"10":a10,
  "11":a11,"12":a12,"14":a14,"15":a15,"16":a16,"17":a17,"18":a18,"19":a19,"20":a20,
  "21":a21,"22":a22,"23":a23,"24":a24,"25":a25,"26":a26,"27":a27,"28":a28,"29":a29,"30":a30
};
