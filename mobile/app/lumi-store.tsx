import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { filterLumiItems, getLumiItemState, isLumiSkinId, lumiStoreFilterLabels, type LumiItem, type LumiStoreFilter, type LumiSkinId } from "../../src/domain/lumi";
import { getMobileLumiSkinAsset } from "../assets/lumiSkinAssets";
import { LumiCharacter } from "../components/LumiCharacter";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileLumi } from "../providers/MobileLumiProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

const unlockLabels:Record<string,string>={"genesis-complete":"Conclua Gênesis","exodus-complete":"Conclua Êxodo","leviticus-complete":"Conclua Levítico","numbers-complete":"Conclua Números","deuteronomy-complete":"Conclua Deuteronômio"};

export default function LumiStoreScreen(){
 const auth=useMobileAuth();const lumi=useMobileLumi();const api=useMobileProgress();const {progress}=api;
 const [filter,setFilter]=useState<LumiStoreFilter>("all");const [preview,setPreview]=useState<LumiSkinId>("lumi_base");
 const [busy,setBusy]=useState("");const [notice,setNotice]=useState("");
 const items=useMemo(()=>filterLumiItems(lumi.state.items,filter,lumi.state,progress.earnedAchievementIds),[filter,lumi.state,progress.earnedAchievementIds]);
 const run=async(id:string,action:()=>Promise<void>)=>{setBusy(id);setNotice("");try{await action();}catch(error){setNotice(error instanceof Error?error.message:"Não foi possível concluir.");}finally{setBusy("");}};
 if(!auth.session)return <Screen><Text style={styles.title}>Loja Lumi</Text><Text style={styles.help}>Entre em sua conta para sincronizar moedas, skins e equipamentos entre dispositivos.</Text></Screen>;
 return <Screen>
  <View style={styles.heading}><View><Text style={styles.eyebrow}>PERSONALIZAÇÃO</Text><Text style={styles.title}>Loja Lumi</Text></View><View style={styles.balance}><Text style={styles.coin}>◆</Text><Text style={styles.balanceText}>{lumi.confirmedBalance}</Text>{lumi.pendingBalance>0?<Text style={styles.pendingBalance}>+{lumi.pendingBalance} sincronizando</Text>:null}</View></View>
  <View style={styles.preview}><LumiCharacter mood="proud" motion="encouraging" skinId={preview} style={styles.lumi} accessibilityLabel="Prévia ampliada da skin selecionada"/><Text style={styles.previewTitle}>{lumi.state.items.find(x=>x.id===preview)?.name??"Lumi Original"}</Text><Text style={styles.previewHelp}>Toque em uma skin para visualizar. A equipada acompanha você nas trilhas.</Text></View>
  <View style={styles.filters}>{(Object.keys(lumiStoreFilterLabels) as LumiStoreFilter[]).map(value=><Pressable key={value} accessibilityRole="tab" accessibilityState={{selected:filter===value}} onPress={()=>setFilter(value)} style={[styles.filter,filter===value&&styles.filterActive]}><Text style={[styles.filterText,filter===value&&styles.filterTextActive]}>{lumiStoreFilterLabels[value]}</Text></Pressable>)}</View>
  {lumi.loading?<Text style={styles.help}>Carregando catálogo…</Text>:null}
  {lumi.error?<View style={styles.error}><Text style={styles.errorText}>{lumi.error}</Text><PrimaryButton variant="secondary" onPress={()=>void lumi.refresh()}>Tentar novamente</PrimaryButton></View>:null}
  <View style={styles.catalog}>{items.map(item=><ItemCard key={item.id} item={item} balance={lumi.confirmedBalance} availableBalance={lumi.state.balance} busy={busy===item.id} state={getLumiItemState(item,lumi.state,progress.earnedAchievementIds)} onPreview={()=>{if(isLumiSkinId(item.id))setPreview(item.id);}} onBuy={()=>Alert.alert("Confirmar compra","Comprar "+item.name+" por "+item.price+" moedas Lumi?",[{text:"Cancelar",style:"cancel"},{text:"Comprar",onPress:()=>void run(item.id,async()=>{await api.syncNow();await lumi.purchase(item.id);})}])} onEquip={()=>void run(item.id,()=>lumi.equip(item.id))}/>)}
   {!lumi.loading&&!lumi.error&&items.length===0?<Text style={styles.help}>Nenhuma skin neste filtro.</Text>:null}
  </View>
  {notice?<Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>:null}
 </Screen>;
}
function ItemCard({item,state,balance,availableBalance,busy,onPreview,onBuy,onEquip}:{item:LumiItem;state:"locked"|"available"|"owned"|"equipped";balance:number;availableBalance:number;busy:boolean;onPreview:()=>void;onBuy:()=>void;onEquip:()=>void}){
 const skin=isLumiSkinId(item.id)?getMobileLumiSkinAsset(item.id):undefined;const insufficient=state==="available"&&item.price>availableBalance;const needsSync=state==="available"&&item.price>balance&&!insufficient;
 const requirement=item.unlockRule.kind==="none"?"Disponível para todos":unlockLabels[item.unlockRule.achievement_id]??"Conclua o requisito indicado";
 const stateLabel={locked:"Bloqueada",available:"Disponível",owned:"Adquirida",equipped:"Equipada"}[state];
 return <View style={styles.item}><Pressable accessibilityRole="button" accessibilityLabel={"Ver prévia de "+item.name} onPress={onPreview} style={styles.art}>{skin?<Image source={skin} resizeMode="contain" style={styles.artImage}/>:<><Text style={styles.pendingIcon}>◇</Text><Text style={styles.pending}>ARTE PENDENTE</Text></>}</Pressable>
  <View style={styles.itemCopy}><View style={styles.itemTop}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.state}>{stateLabel}</Text></View><Text style={styles.description}>{item.description}</Text><Text style={styles.requirement}>{requirement}</Text><Text style={styles.meta}>{item.price===0?"Grátis":item.price+" moedas"} · {item.rarity}</Text>
   {state==="locked"?<PrimaryButton disabled onPress={()=>{}}>Requisito pendente</PrimaryButton>:null}
   {state==="available"?<PrimaryButton disabled={busy||insufficient} onPress={onBuy}>{busy?"Aguarde…":insufficient?"Saldo insuficiente":needsSync?"Sincronizar e comprar":item.price?"Comprar":"Resgatar"}</PrimaryButton>:null}
   {state==="owned"?<PrimaryButton disabled={busy} onPress={onEquip}>{busy?"Aguarde…":"Equipar"}</PrimaryButton>:null}
   {state==="equipped"?<PrimaryButton disabled onPress={()=>{}}>Skin equipada</PrimaryButton>:null}
  </View></View>;
}
const styles=StyleSheet.create({
 heading:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:spacing.md},eyebrow:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},help:{color:colors.muted,lineHeight:21},balance:{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:spacing.md,minHeight:44,borderRadius:radius.full,backgroundColor:"#10272b"},coin:{color:"#f2c766",fontSize:18},balanceText:{color:"#effaf4",fontSize:18,fontWeight:"900"},pendingBalance:{color:"#f2c766",fontSize:9,fontWeight:"800"},
 preview:{alignItems:"center",gap:spacing.xs,padding:spacing.lg,borderRadius:radius.lg,backgroundColor:"#dff4ee",borderWidth:1,borderColor:"#b8ded5"},lumi:{width:190,height:190},previewTitle:{color:colors.navy,fontSize:19,fontWeight:"900"},previewHelp:{color:colors.muted,textAlign:"center",fontSize:12},
 filters:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},filter:{minHeight:40,justifyContent:"center",paddingHorizontal:spacing.md,borderRadius:radius.full,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},filterActive:{backgroundColor:colors.teal,borderColor:colors.tealDark},filterText:{color:colors.navy,fontSize:12,fontWeight:"800"},filterTextActive:{color:"#071f22"},
 catalog:{gap:spacing.md},item:{flexDirection:"row",gap:spacing.md,padding:spacing.md,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},art:{width:112,height:132,alignItems:"center",justifyContent:"center",borderRadius:radius.md,backgroundColor:"#edf2ef",overflow:"hidden"},artImage:{width:"100%",height:"100%"},pendingIcon:{fontSize:34,color:colors.tealDark},pending:{fontSize:8,fontWeight:"900",color:colors.muted},itemCopy:{flex:1,gap:spacing.sm},itemTop:{flexDirection:"row",justifyContent:"space-between",gap:spacing.sm},itemName:{flex:1,color:colors.navy,fontSize:17,fontWeight:"900"},state:{color:colors.tealDark,fontSize:10,fontWeight:"900",textTransform:"uppercase"},description:{color:colors.muted,fontSize:12,lineHeight:18},requirement:{color:colors.navy,fontSize:11,fontWeight:"800"},meta:{color:"#9a6a17",fontSize:11,fontWeight:"800",textTransform:"capitalize"},notice:{padding:spacing.md,borderRadius:radius.md,backgroundColor:"#e8f7f4",color:colors.tealDark},error:{gap:spacing.sm,padding:spacing.md,borderRadius:radius.md,backgroundColor:"#fff1ed"},errorText:{color:colors.error}
});
