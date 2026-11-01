import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lumiRewardValues } from "../../src/domain/lumi";
import { getMobileLumiSkinAsset } from "../assets/lumiSkinAssets";
import { mobileFeedbackAssets } from "../assets/feedbackAssets";
import { Icon } from "../components/navigation/Icons";
import type { LumiSkinState } from "../domain/lumiWallet";
import { useLumiWallet } from "../hooks/useLumiWallet";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import type { Palette } from "../theme/tokens";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";

const rarityLabel = { common: "Comum", uncommon: "Incomum", rare: "Rara", epic: "Épica", legendary: "Lendária" } as const;
const stateBadge: Record<LumiSkinState, string> = { equipped: "Equipada", owned: "Sua", available: "", insufficient: "", locked: "Bloqueada" };

export default function LumiStoreScreen() {
  const trail = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const wallet = useLumiWallet();
  const [selectedId, setSelectedId] = useState(wallet.equippedSkinId);
  const selected = wallet.skins.find((skin) => skin.id === selectedId) ?? wallet.skins[0];
  const art = (id: typeof selected.id) => getMobileLumiSkinAsset(id) ?? mobileFeedbackAssets.proud;

  const buy = () => {
    Alert.alert("Comprar skin", `Comprar ${selected.name} por ${selected.price} moedas?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Comprar",
        onPress: () => {
          const result = wallet.purchase(selected.id);
          if (!result.ok) {
            const message = result.reason === "insufficient" ? `Faltam ${result.missing} moedas.`
              : result.reason === "locked" ? `${result.requirement ?? "Conclua o requisito"} para liberar esta skin.`
                : result.reason === "owned" ? "Esta skin já é sua." : "Skin indisponível.";
            Alert.alert("Não foi possível comprar", message);
            return;
          }
          Alert.alert("Skin adquirida!", `${selected.name} agora é sua. Quer equipar agora? Ela aparece na trilha e nas conclusões das lições.`, [
            { text: "Depois", style: "cancel" },
            { text: "Equipar agora", onPress: () => wallet.equip(selected.id) }
          ]);
        }
      }
    ]);
  };

  const action = (() => {
    switch (selected.state) {
      case "equipped": return { label: "Equipada", disabled: true };
      case "owned": return { label: "Equipar", disabled: false, onPress: () => wallet.equip(selected.id) };
      case "available": return { label: selected.price ? `Comprar por ${selected.price}` : "Resgatar", disabled: false, onPress: buy };
      case "insufficient": return { label: `Faltam ${selected.price - wallet.balance} moedas`, disabled: true };
      case "locked": return { label: selected.requirementLabel ?? "Requisito pendente", disabled: true };
    }
  })();

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.balanceCard} accessible accessibilityLabel={`Você tem ${wallet.balance} moedas Lumi`}>
        <View style={styles.coinBadge}><Text style={styles.coinGlyph}>◆</Text></View>
        <View style={styles.flex}>
          <Text style={styles.balanceValue}>{wallet.balance}</Text>
          <Text style={styles.balanceLabel}>moedas Lumi</Text>
        </View>
      </View>
      <Text style={styles.earnHint}>
        Ganhe {lumiRewardValues.completedLesson} por lição, {lumiRewardValues.checkpoint} por checkpoint, {lumiRewardValues.eligibleAchievement} por conquista e {lumiRewardValues.completedBook} por livro concluído.
      </Text>

      <View style={styles.preview}>
        <Image source={art(selected.id)} style={[styles.previewArt, selected.state === "locked" && styles.silhouette]} resizeMode="contain" accessibilityLabel={`Prévia: ${selected.name}`} />
        <Text style={styles.previewName}>{selected.name}</Text>
        <Text style={styles.previewMeta}>{rarityLabel[selected.rarity]} · {selected.price ? `${selected.price} moedas` : "Grátis"}</Text>
        <Text style={styles.previewDescription}>{selected.description}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: action.disabled }}
          disabled={action.disabled}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, action.disabled && styles.actionDisabled, pressed && styles.actionPressed]}
        >
          {selected.state === "locked" ? <Icon name="lock" size={18} color={trail.textMuted} /> : null}
          <Text style={[styles.actionText, action.disabled && styles.actionTextDisabled]}>{action.label}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Skins</Text>
      <View style={styles.grid}>
        {wallet.skins.map((skin) => {
          const active = skin.id === selected.id;
          return (
            <Pressable
              key={skin.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${skin.name}, ${stateBadge[skin.state] || `${skin.price} moedas`}`}
              onPress={() => setSelectedId(skin.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Image source={art(skin.id)} style={[styles.cardArt, skin.state === "locked" && styles.silhouette]} resizeMode="contain" />
              <Text style={styles.cardName} numberOfLines={1}>{skin.name}</Text>
              {stateBadge[skin.state] ? (
                <Text style={[styles.cardBadge, skin.state === "equipped" && { color: trail.accent }]}>{stateBadge[skin.state]}</Text>
              ) : (
                <Text style={[styles.cardPrice, skin.state === "insufficient" && { color: trail.textMuted }]}>◆ {skin.price}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const makeStyles = (trail: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: trail.ground },
  content: { padding: 16, gap: 14 },
  flex: { flex: 1 },
  balanceCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, backgroundColor: trail.card, borderWidth: 1, borderColor: trail.line },
  coinBadge: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: trail.goldSoft, borderWidth: 2, borderColor: trail.xp },
  coinGlyph: { color: trail.xp, fontSize: 24 },
  balanceValue: { color: trail.text, fontSize: 30, fontWeight: "900" },
  balanceLabel: { color: trail.textMuted, fontSize: 13, fontWeight: "800" },
  earnHint: { color: trail.textMuted, fontSize: 13, lineHeight: 19 },
  preview: { alignItems: "center", gap: 6, padding: 18, borderRadius: 24, backgroundColor: trail.sheet },
  previewArt: { width: 180, height: 180 },
  silhouette: { tintColor: "#3a4d63", opacity: 0.55 },
  previewName: { color: "#10243e", fontSize: 22, fontWeight: "900", marginTop: 4 },
  previewMeta: { color: "#9a6410", fontSize: 13, fontWeight: "800" },
  previewDescription: { color: "#3b4f64", fontSize: 14, lineHeight: 20, textAlign: "center" },
  action: { alignSelf: "stretch", marginTop: 8, minHeight: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: trail.cta, borderBottomWidth: 5, borderBottomColor: trail.ctaShadow },
  actionDisabled: { backgroundColor: "#dfe7ee", borderBottomColor: "#c9d5df" },
  actionPressed: { borderBottomWidth: 2, marginTop: 11 },
  actionText: { color: trail.ctaText, fontSize: 16, fontWeight: "900" },
  actionTextDisabled: { color: "#4f6378" },
  sectionTitle: { color: trail.text, fontSize: 18, fontWeight: "900", marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "31.5%", alignItems: "center", gap: 4, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 16, backgroundColor: trail.card, borderWidth: 2, borderColor: trail.line },
  cardActive: { borderColor: trail.accent },
  cardArt: { width: 72, height: 72 },
  cardName: { color: trail.text, fontSize: 12, fontWeight: "800" },
  cardBadge: { color: trail.textMuted, fontSize: 11, fontWeight: "900" },
  cardPrice: { color: trail.xp, fontSize: 12, fontWeight: "900" }
});
