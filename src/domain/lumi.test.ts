import { describe, expect, it } from "vitest";
import { filterLumiItems, getEquippedLumiSkinId, getLumiItemState, normalizeLumiItem, type LumiItem } from "./lumi";

const item:LumiItem={id:"lumi_oculos",name:"Lumi Intelectual",description:"Teste",category:"skin",price:100,rarity:"common",assetStatus:"approved",assetPath:"assets/lumi/skins/lumi_oculos.png",unlockRule:{kind:"none"},layerOrder:10,anchor:{x:.5,y:.5,scale:1},active:true};
const state={balance:120,inventory:[],equipment:[]};

describe("Lumi skins domain",()=>{
 it("separa bloqueada, disponível, adquirida e equipada",()=>{
  expect(getLumiItemState(item,state,[])).toBe("available");
  const locked={...item,unlockRule:{kind:"achievement_purchase" as const,achievement_id:"genesis-complete"}};
  expect(getLumiItemState(locked,state,[])).toBe("locked");
  expect(getLumiItemState(locked,state,["genesis-complete"])).toBe("available");
  const owned={...state,inventory:[{itemId:item.id,acquiredAt:"",acquisitionType:"purchase" as const}]};
  expect(getLumiItemState(item,owned,[])).toBe("owned");
  expect(getLumiItemState(item,{...owned,equipment:[{itemId:item.id,category:"skin" as const,updatedAt:""}]},[])).toBe("equipped");
 });
 it("usa Lumi Original como fallback e uma única skin equipada",()=>{
  expect(getEquippedLumiSkinId(state)).toBe("lumi_base");
  expect(getEquippedLumiSkinId({...state,equipment:[{itemId:"lumi_hiphop",category:"skin",updatedAt:""}]})).toBe("lumi_hiphop");
 });
 it("filtra o catálogo sem misturar itens legados",()=>{
  expect(filterLumiItems([item],"available",state,[]).map(x=>x.id)).toEqual(["lumi_oculos"]);
  expect(filterLumiItems([{...item,id:"head.old",category:"head"}],"all",state,[])).toEqual([]);
 });
 it("normaliza linhas do servidor com segurança",()=>{
  expect(normalizeLumiItem({id:"x",category:"skin",price:-10}).price).toBe(0);
  expect(normalizeLumiItem({id:"x",category:"skin"}).assetStatus).toBe("pending");
 });
});
