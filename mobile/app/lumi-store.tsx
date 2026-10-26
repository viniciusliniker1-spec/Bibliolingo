import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import {
  getLumiItemState,
  lumiCategories,
  lumiCategoryLabels,
  type LumiCategory,
  type LumiItem
} from "../../src/domain/lumi";
import { LumiCharacter } from "../components/LumiCharacter";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useMobileAuth } from "../providers/MobileAuthProvider";
import { useMobileLumi } from "../providers/MobileLumiProvider";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { colors, radius, spacing } from "../theme/tokens";

export default function LumiStoreScreen() {
  const auth = useMobileAuth();
  const lumi = useMobileLumi();
  const { progress } = useMobileProgress();
  const [category, setCategory] = useState<LumiCategory>("head");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const items = lumi.state.items.filter((item) => item.category === category);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusy(id); setNotice("");
    try { await action(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível concluir."); }
    finally { setBusy(""); }
  };

  if (!auth.session) {
    return <Screen><Text style={styles.title}>Loja Lumi</Text><Text style={styles.help}>Entre em sua conta para sincronizar moedas, itens e equipamentos entre dispositivos.</Text></Screen>;
  }

  return <Screen>
    <View style={styles.heading}>
      <View><Text style={styles.eyebrow}>PERSONALIZAÇÃO</Text><Text style={styles.title}>Loja Lumi</Text></View>
      <View style={styles.balance}><Text style={styles.coin}>◆</Text><Text style={styles.balanceText}>{lumi.state.balance}</Text></View>
    </View>
    <View style={styles.preview}>
      <LumiCharacter mood="proud" motion="encouraging" style={styles.lumi} accessibilityLabel="Prévia da Lumi personalizada" />
      <Text style={styles.previewTitle}>Sua companheira de jornada</Text>
      <Text style={styles.previewHelp}>Os itens equipados aparecem aqui e no ponto atual das trilhas.</Text>
    </View>
    <View style={styles.filters}>
      {lumiCategories.map((value) => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: category === value }} onPress={() => setCategory(value)} style={[styles.filter, category === value && styles.filterActive]}><Text style={[styles.filterText, category === value && styles.filterTextActive]}>{lumiCategoryLabels[value]}</Text></Pressable>)}
    </View>
    {lumi.loading ? <Text style={styles.help}>Carregando catálogo…</Text> : null}
    {lumi.error ? <View style={styles.error}><Text style={styles.errorText}>{lumi.error}</Text><PrimaryButton variant="secondary" onPress={() => void lumi.refresh()}>Tentar novamente</PrimaryButton></View> : null}
    <View style={styles.catalog}>
      {items.map((item) => <ItemCard key={item.id} item={item} busy={busy === item.id} state={getLumiItemState(item, lumi.state, progress.earnedAchievementIds)} onBuy={() => Alert.alert("Confirmar compra", `Comprar ${item.name} por ${item.price} moedas Lumi?`, [{ text: "Cancelar", style: "cancel" }, { text: "Comprar", onPress: () => void run(item.id, () => lumi.purchase(item.id)) }])} onEquip={() => void run(item.id, () => lumi.equip(item.id))} onRemove={() => void run(item.id, () => lumi.unequip(item.category))} />)}
      {!lumi.loading && !lumi.error && items.length === 0 ? <Text style={styles.help}>Nenhum item publicado nesta categoria.</Text> : null}
    </View>
    {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
  </Screen>;
}

function ItemCard({ item, state, busy, onBuy, onEquip, onRemove }: {
  item: LumiItem; state: "locked"|"available"|"owned"|"equipped"; busy: boolean;
  onBuy: () => void; onEquip: () => void; onRemove: () => void;
}) {
  const stateLabel={locked:"Bloqueado",available:"Disponível",owned:"Adquirido",equipped:"Equipado"}[state];
  return <View style={styles.item}>
    <View style={styles.placeholder}><Text style={styles.placeholderIcon}>◇</Text><Text style={styles.pending}>{item.assetStatus === "pending" ? "ARTE PENDENTE" : item.rarity.toUpperCase()}</Text></View>
    <View style={styles.itemCopy}><View style={styles.itemTop}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.state}>{stateLabel}</Text></View><Text style={styles.description}>{item.description}</Text><Text style={styles.meta}>{item.rarity} · {item.price ? item.price + " moedas" : "exclusivo"}</Text>
      {state === "available" ? <PrimaryButton disabled={busy} onPress={onBuy}>{busy ? "Aguarde…" : item.price ? "Comprar" : "Resgatar"}</PrimaryButton> : null}
      {state === "owned" ? <PrimaryButton disabled={busy} onPress={onEquip}>{busy ? "Aguarde…" : "Equipar"}</PrimaryButton> : null}
      {state === "equipped" ? <PrimaryButton variant="secondary" disabled={busy} onPress={onRemove}>{busy ? "Aguarde…" : "Remover"}</PrimaryButton> : null}
    </View>
  </View>;
}

const styles=StyleSheet.create({
 heading:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:spacing.md},eyebrow:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.navy,fontSize:30,fontWeight:"900"},help:{color:colors.muted,lineHeight:21},balance:{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:spacing.md,minHeight:44,borderRadius:radius.full,backgroundColor:"#10272b"},coin:{color:"#f2c766",fontSize:18},balanceText:{color:"#effaf4",fontSize:18,fontWeight:"900"},
 preview:{alignItems:"center",gap:spacing.xs,padding:spacing.lg,borderRadius:radius.lg,backgroundColor:"#dff4ee",borderWidth:1,borderColor:"#b8ded5"},lumi:{width:170,height:150},previewTitle:{color:colors.navy,fontSize:19,fontWeight:"900"},previewHelp:{color:colors.muted,textAlign:"center",fontSize:12},
 filters:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},filter:{minHeight:40,justifyContent:"center",paddingHorizontal:spacing.md,borderRadius:radius.full,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},filterActive:{backgroundColor:colors.teal,borderColor:colors.tealDark},filterText:{color:colors.navy,fontSize:12,fontWeight:"800"},filterTextActive:{color:"#071f22"},
 catalog:{gap:spacing.md},item:{flexDirection:"row",gap:spacing.md,padding:spacing.md,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},placeholder:{width:94,minHeight:110,alignItems:"center",justifyContent:"center",gap:6,borderRadius:radius.md,backgroundColor:"#edf2ef",borderWidth:1,borderColor:"#cad8d3",borderStyle:"dashed"},placeholderIcon:{fontSize:34,color:colors.tealDark},pending:{fontSize:8,fontWeight:"900",color:colors.muted,textAlign:"center"},itemCopy:{flex:1,gap:spacing.sm},itemTop:{flexDirection:"row",justifyContent:"space-between",gap:spacing.sm},itemName:{flex:1,color:colors.navy,fontSize:17,fontWeight:"900"},state:{color:colors.tealDark,fontSize:10,fontWeight:"900",textTransform:"uppercase"},description:{color:colors.muted,fontSize:12,lineHeight:18},meta:{color:"#9a6a17",fontSize:11,fontWeight:"800",textTransform:"capitalize"},notice:{padding:spacing.md,borderRadius:radius.md,backgroundColor:"#e8f7f4",color:colors.tealDark},error:{gap:spacing.sm,padding:spacing.md,borderRadius:radius.md,backgroundColor:"#fff1ed"},errorText:{color:colors.error}
});
