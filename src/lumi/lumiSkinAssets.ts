import lumiOculos from "../../assets/lumi/skins/lumi_oculos.png";
import lumiHiphop from "../../assets/lumi/skins/lumi_hiphop.png";
import lumiEva from "../../assets/lumi/skins/lumi_eva_folhas.png";
import lumiMoises from "../../assets/lumi/skins/lumi_moises.png";
import lumiLevitico from "../../assets/lumi/skins/lumi_levitico.png";
import lumiNumeros from "../../assets/lumi/skins/lumi_numeros.png";
import lumiDeuteronomio from "../../assets/lumi/skins/lumi_deuteronomio.png";
import type { LumiSkinId } from "../domain/lumi";

export const webLumiSkinAssets:Partial<Record<LumiSkinId,string>>={
 lumi_oculos:lumiOculos,lumi_hiphop:lumiHiphop,lumi_eva:lumiEva,lumi_moises:lumiMoises,
 lumi_levitico:lumiLevitico,lumi_numeros:lumiNumeros,lumi_deuteronomio:lumiDeuteronomio
};
export function getWebLumiSkinAsset(id:LumiSkinId){return webLumiSkinAssets[id];}
