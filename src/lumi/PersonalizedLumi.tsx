import { webVisualAssets } from "../assets/visualAssets";
import type { LumiCategory } from "../domain/lumi";
import { useLumi } from "./LumiContext";

const symbols:Record<LumiCategory,string>={head:"◒",glasses:"◎",outfit:"◆",backpack:"▣",special:"✦",celebration:"★"};
export function PersonalizedLumi({className=""}:{className?:string}){
 const {state}=useLumi();
 return <div className={`personalized-lumi ${className}`} aria-label="Lumi personalizada">
  <img src={webVisualAssets.lumi.returning} alt="" />
  {state.equipment.map(entry=><span key={entry.category} className={`lumi-layer lumi-layer-${entry.category}`} aria-hidden="true">{symbols[entry.category]}</span>)}
 </div>;
}
