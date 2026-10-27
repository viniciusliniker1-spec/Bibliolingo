import type { ImageSourcePropType } from "react-native";
import type { LumiSkinId } from "../../src/domain/lumi";

/**
 * Registro estático exigido pelo Metro. A Lumi Original usa o visual contextual
 * existente até o arquivo oficial lumi_base.png ser entregue.
 */
export const mobileLumiSkinAssets: Partial<Record<LumiSkinId,ImageSourcePropType>> = {
  lumi_oculos: require("../../assets/lumi/skins/lumi_oculos.png") as ImageSourcePropType,
  lumi_hiphop: require("../../assets/lumi/skins/lumi_hiphop.png") as ImageSourcePropType,
  lumi_eva: require("../../assets/lumi/skins/lumi_eva_folhas.png") as ImageSourcePropType,
  lumi_moises: require("../../assets/lumi/skins/lumi_moises.png") as ImageSourcePropType,
  lumi_levitico: require("../../assets/lumi/skins/lumi_levitico.png") as ImageSourcePropType,
  lumi_numeros: require("../../assets/lumi/skins/lumi_numeros.png") as ImageSourcePropType,
  lumi_deuteronomio: require("../../assets/lumi/skins/lumi_deuteronomio.png") as ImageSourcePropType
};
export function getMobileLumiSkinAsset(id:LumiSkinId){return mobileLumiSkinAssets[id];}
