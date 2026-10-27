import { describe, expect, it } from "vitest";
import { filterLumiItems, getEquippedLumiSkinId, getLumiItemState, lumiRewardValues, normalizeLumiItem, type LumiAccountState } from "../../src/domain/lumi";

const item=normalizeLumiItem({id:"lumi_oculos",name:"Lumi Intelectual",description:"Teste",category:"skin",price:100,rarity:"common",asset_path:"assets/lumi/skins/lumi_oculos.png",asset_status:"approved",unlock_rule:{kind:"none"},active:true,layer_order:10,anchor:{x:.5,y:.5,scale:1}});
const base:LumiAccountState={balance:120,items:[item],inventory:[],equipment:[],transactions:[]};

describe("Lumi skins mobile",()=>{
 it("mantém XP e moedas independentes e configuráveis",()=>{expect(lumiRewardValues).toEqual({firstLesson:10,checkpoint:25,completedBook:100,eligibleAchievement:30});});
 it("compra e equipa uma skin completa",()=>{expect(getLumiItemState(item,base,[])).toBe("available");const owned={...base,inventory:[{itemId:item.id,acquiredAt:new Date(0).toISOString(),acquisitionType:"purchase" as const}]};expect(getLumiItemState(item,owned,[])).toBe("owned");const equipped={...owned,equipment:[{category:"skin" as const,itemId:item.id,updatedAt:new Date(0).toISOString()}]};expect(getLumiItemState(item,equipped,[])).toBe("equipped");expect(getEquippedLumiSkinId(equipped)).toBe("lumi_oculos");});
 it("respeita condição de livro antes da compra",()=>{const themed={...item,id:"lumi_eva",unlockRule:{kind:"achievement_purchase" as const,achievement_id:"genesis-complete"}};expect(getLumiItemState(themed,base,[])).toBe("locked");expect(getLumiItemState(themed,base,["genesis-complete"])).toBe("available");});
 it("oferece filtros estáveis",()=>{expect(filterLumiItems([item],"all",base,[])).toHaveLength(1);expect(filterLumiItems([item],"owned",base,[])).toHaveLength(0);});
});
