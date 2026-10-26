import { describe, expect, it } from "vitest";
import { getLumiItemState, lumiRewardValues, normalizeLumiItem, type LumiAccountState } from "../../src/domain/lumi";

const item=normalizeLumiItem({id:"hat-1",name:"Chapéu",description:"Teste",category:"head",price:50,rarity:"common",asset_path:null,asset_status:"pending",unlock_rule:{kind:"none"},active:true,layer_order:10,anchor_x:0.5,anchor_y:0.2});
const base:LumiAccountState={balance:60,items:[item],inventory:[],equipment:[],transactions:[]};

describe("Lumi economy domain",()=>{
 it("keeps XP and coin rewards independent and configurable",()=>{expect(lumiRewardValues.firstLesson).toBe(10);expect(lumiRewardValues.checkpoint).toBe(25);expect(lumiRewardValues.completedBook).toBe(100);expect(lumiRewardValues.eligibleAchievement).toBe(30);});
 it("moves catalog items through available, owned and equipped states",()=>{expect(getLumiItemState(item,base,[])).toBe("available");const owned={...base,inventory:[{itemId:item.id,acquiredAt:new Date(0).toISOString(),acquisitionType:"purchase" as const}]};expect(getLumiItemState(item,owned,[])).toBe("owned");expect(getLumiItemState(item,{...owned,equipment:[{category:"head" as const,itemId:item.id,updatedAt:new Date(0).toISOString()}]},[])).toBe("equipped");});
 it("never treats pending artwork as a published sprite",()=>{expect(item.assetStatus).toBe("pending");expect(item.assetPath).toBeUndefined();});
});
