import { webVisualAssets } from "../assets/visualAssets";
import { getEquippedLumiSkinId, type LumiSkinId } from "../domain/lumi";
import { useLumi } from "./LumiContext";
import { getWebLumiSkinAsset } from "./lumiSkinAssets";

export function PersonalizedLumi({className="",skinId}:{className?:string;skinId?:LumiSkinId}){
 const {state}=useLumi();const selected=skinId??getEquippedLumiSkinId(state);
 return <div className={`personalized-lumi ${className}`} aria-label="Lumi personalizada">
  <img src={getWebLumiSkinAsset(selected)??webVisualAssets.lumi.returning} alt="" loading="lazy" />
 </div>;
}
