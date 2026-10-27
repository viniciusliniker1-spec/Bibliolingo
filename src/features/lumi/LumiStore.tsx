import { useMemo, useState } from "react";
import { filterLumiItems, getLumiItemState, isLumiSkinId, lumiStoreFilterLabels, type LumiStoreFilter, type LumiSkinId } from "../../domain/lumi";
import { useLumi } from "../../lumi/LumiContext";
import { PersonalizedLumi } from "../../lumi/PersonalizedLumi";
import { getWebLumiSkinAsset } from "../../lumi/lumiSkinAssets";
import { useApp } from "../../state/AppContext";
import { useAuth } from "../../auth/AuthContext";

const unlockLabels:Record<string,string>={"genesis-complete":"Conclua Gênesis","exodus-complete":"Conclua Êxodo","leviticus-complete":"Conclua Levítico","numbers-complete":"Conclua Números","deuteronomy-complete":"Conclua Deuteronômio"};

export function LumiStore(){
 const auth=useAuth();const lumi=useLumi();const {state:progress}=useApp();const [filter,setFilter]=useState<LumiStoreFilter>("all");const [preview,setPreview]=useState<LumiSkinId>("lumi_base");const [busy,setBusy]=useState("");const [notice,setNotice]=useState("");
 const items=useMemo(()=>filterLumiItems(lumi.state.items,filter,lumi.state,progress.earnedAchievementIds),[filter,lumi.state,progress.earnedAchievementIds]);
 if(!auth.session)return <main className="page-shell"><h1>Loja Lumi</h1><p>Entre em sua conta para sincronizar moedas, skins e equipamentos.</p></main>;
 const act=async(id:string,job:()=>Promise<void>)=>{setBusy(id);setNotice("");try{await job();}catch(e){setNotice(e instanceof Error?e.message:"Não foi possível concluir.");}finally{setBusy("");}};
 return <main className="page-shell lumi-store-page">
  <header className="lumi-store-header"><div><p className="eyebrow">PERSONALIZAÇÃO</p><h1>Loja Lumi</h1></div><strong className="lumi-balance">◆ {lumi.state.balance}</strong></header>
  <section className="lumi-store-preview"><PersonalizedLumi skinId={preview}/><div><h2>{lumi.state.items.find(x=>x.id===preview)?.name??"Lumi Original"}</h2><p>Selecione uma skin para visualizar. A equipada acompanha você nas trilhas.</p></div></section>
  <div className="lumi-filters" role="tablist">{(Object.keys(lumiStoreFilterLabels) as LumiStoreFilter[]).map(value=><button role="tab" aria-selected={filter===value} className={filter===value?"active":""} key={value} onClick={()=>setFilter(value)}>{lumiStoreFilterLabels[value]}</button>)}</div>
  {lumi.loading?<p>Carregando catálogo…</p>:null}{lumi.error?<p role="alert">{lumi.error} <button onClick={()=>void lumi.refresh()}>Tentar novamente</button></p>:null}
  <section className="lumi-catalog">{items.map(item=>{const status=getLumiItemState(item,lumi.state,progress.earnedAchievementIds);const src=isLumiSkinId(item.id)?getWebLumiSkinAsset(item.id):undefined;const insufficient=status==="available"&&item.price>lumi.state.balance;const requirement=item.unlockRule.kind==="none"?"Disponível para todos":unlockLabels[item.unlockRule.achievement_id]??"Conclua o requisito indicado";return <article className="lumi-item-card" key={item.id}>
   <button type="button" className="lumi-item-art" onClick={()=>{if(isLumiSkinId(item.id))setPreview(item.id)}} aria-label={"Ver prévia de "+item.name}>{src?<img src={src} alt="" loading="lazy"/>:<><b>◇</b><small>ARTE PENDENTE</small></>}</button>
   <div><div className="lumi-item-title"><h3>{item.name}</h3><span>{{locked:"Bloqueada",available:"Disponível",owned:"Adquirida",equipped:"Equipada"}[status]}</span></div><p>{item.description}</p><small className="lumi-requirement">{requirement}</small><small>{item.price===0?"Grátis":item.price+" moedas"} · {item.rarity}</small>
    {status==="locked"?<button disabled>Requisito pendente</button>:null}
    {status==="available"?<button disabled={busy===item.id||insufficient} onClick={()=>{if(window.confirm("Comprar "+item.name+" por "+item.price+" moedas Lumi?"))void act(item.id,()=>lumi.purchase(item.id));}}>{busy===item.id?"Aguarde…":insufficient?"Saldo insuficiente":item.price?"Comprar":"Resgatar"}</button>:null}
    {status==="owned"?<button disabled={busy===item.id} onClick={()=>void act(item.id,()=>lumi.equip(item.id))}>Equipar</button>:null}
    {status==="equipped"?<button disabled>Skin equipada</button>:null}
   </div></article>;})}{!lumi.loading&&!lumi.error&&items.length===0?<p>Nenhuma skin neste filtro.</p>:null}</section>
  {notice?<p role="status" className="notice">{notice}</p>:null}
 </main>;
}
