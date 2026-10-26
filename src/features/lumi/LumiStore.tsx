import { useState } from "react";
import { getLumiItemState, lumiCategories, lumiCategoryLabels, type LumiCategory } from "../../domain/lumi";
import { useLumi } from "../../lumi/LumiContext";
import { PersonalizedLumi } from "../../lumi/PersonalizedLumi";
import { useApp } from "../../state/AppContext";
import { useAuth } from "../../auth/AuthContext";

export function LumiStore(){
 const auth=useAuth();const lumi=useLumi();const {state:progress}=useApp();const [category,setCategory]=useState<LumiCategory>("head");const [busy,setBusy]=useState("");const [notice,setNotice]=useState("");
 if(!auth.session)return <main className="page-shell"><h1>Loja Lumi</h1><p>Entre em sua conta para sincronizar moedas, itens e equipamentos.</p></main>;
 const act=async(id:string,job:()=>Promise<void>)=>{setBusy(id);setNotice("");try{await job();}catch(e){setNotice(e instanceof Error?e.message:"Não foi possível concluir.");}finally{setBusy("");}};
 return <main className="page-shell lumi-store-page">
  <header className="lumi-store-header"><div><p className="eyebrow">PERSONALIZAÇÃO</p><h1>Loja Lumi</h1></div><strong className="lumi-balance">◆ {lumi.state.balance}</strong></header>
  <section className="lumi-store-preview"><PersonalizedLumi/><div><h2>Sua companheira de jornada</h2><p>Os itens equipados aparecem aqui e no ponto atual das trilhas.</p></div></section>
  <div className="lumi-filters" role="tablist">{lumiCategories.map(value=><button role="tab" aria-selected={category===value} className={category===value?"active":""} key={value} onClick={()=>setCategory(value)}>{lumiCategoryLabels[value]}</button>)}</div>
  {lumi.loading?<p>Carregando catálogo…</p>:null}{lumi.error?<p role="alert">{lumi.error} <button onClick={()=>void lumi.refresh()}>Tentar novamente</button></p>:null}
  <section className="lumi-catalog">{lumi.state.items.filter(item=>item.category===category).map(item=>{const status=getLumiItemState(item,lumi.state,progress.earnedAchievementIds);return <article className="lumi-item-card" key={item.id}><div className="lumi-item-art"><b>◇</b><small>{item.assetStatus==="pending"?"ARTE PENDENTE":item.rarity}</small></div><div><div className="lumi-item-title"><h3>{item.name}</h3><span>{status}</span></div><p>{item.description}</p><small>{item.rarity} · {item.price?item.price+" moedas":"exclusivo"}</small>{status==="available"?<button disabled={busy===item.id} onClick={()=>{if(window.confirm(`Comprar ${item.name} por ${item.price} moedas Lumi?`))void act(item.id,()=>lumi.purchase(item.id));}}>Comprar</button>:null}{status==="owned"?<button disabled={busy===item.id} onClick={()=>void act(item.id,()=>lumi.equip(item.id))}>Equipar</button>:null}{status==="equipped"?<button disabled={busy===item.id} onClick={()=>void act(item.id,()=>lumi.unequip(item.category))}>Remover</button>:null}</div></article>;})}</section>
  {notice?<p role="status" className="notice">{notice}</p>:null}
 </main>;
}
