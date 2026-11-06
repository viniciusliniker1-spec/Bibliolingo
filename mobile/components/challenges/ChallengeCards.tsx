import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { lumiMoodAssets } from "../../assets/lumiMoodAssets";
import { nextStreakTier, STREAK_CHALLENGES } from "../../domain/challenges";
import type { useChallenges } from "../../hooks/useChallenges";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";
import { Icon } from "../navigation/Icons";

type Challenges = ReturnType<typeof useChallenges>;
const FLAME = "#ff9f1c";
const COIN = "#f2b84b";

function useReward() {
  const { progress } = useMobileProgress();
  const feedback = useFeedbackEffects(progress.settings);
  const [toast, setToast] = useState("");
  const show = (text: string) => { setToast(text); setTimeout(() => setToast(""), 2400); };
  return { feedback, toast, show };
}

/** Desafio de ofensiva: escolher a meta de dias, acompanhar e receber a recompensa. */
export function StreakChallengeCard({ challenges, compact = false }: { challenges: Challenges; compact?: boolean }) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { feedback, toast, show } = useReward();
  const { streak } = challenges;

  if (!streak) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>DESAFIO DE OFENSIVA</Text>
        <Text style={styles.title}>Quantos dias seguidos você topa?</Text>
        <Text style={styles.note}>Escolha uma meta. Estude todo dia e ganhe moedas Lumi no fim.</Text>
        <View style={styles.tiers}>
          {STREAK_CHALLENGES.slice(0, compact ? 3 : undefined).map((tier) => (
            <Pressable key={tier.days} accessibilityRole="button" accessibilityLabel={`Desafio de ${tier.days} dias, ${tier.reward} moedas`}
              onPress={() => { feedback("select"); void challenges.startStreak(tier.days); show(`Desafio de ${tier.days} dias começou! Cada dia de estudo, a partir de hoje, conta.`); }}
              style={({ pressed }) => [styles.tier, pressed && styles.pressed]}>
              <Image source={lumiMoodAssets[tier.mood]} style={styles.tierLumi} contentFit="contain" />
              <Text style={styles.tierDays}>{tier.days}</Text>
              <Text style={styles.tierUnit}>dias</Text>
              <Text style={styles.tierReward}>◆ {tier.reward}</Text>
            </Pressable>
          ))}
        </View>
        {toast ? <Text style={styles.toast}>{toast}</Text> : null}
      </View>
    );
  }

  const ratio = streak.done / streak.tier.days;
  const next = nextStreakTier(streak.tier.days);
  return (
    <View style={[styles.card, streak.state === "completed" && styles.cardWin]}>
      <View style={styles.row}>
        <Image source={lumiMoodAssets[streak.state === "failed" ? "chuva" : streak.state === "completed" ? "pulo" : streak.dueToday ? "pedindo" : streak.tier.mood]} style={styles.bigLumi} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>DESAFIO DE {streak.tier.days} DIAS</Text>
          <Text style={styles.title}>{streak.tier.title}</Text>
          <Text style={styles.note}>
            {streak.state === "completed" ? "Você conseguiu! Receba sua recompensa."
              : streak.state === "failed" ? "A sequência quebrou. Recomeçar faz parte!"
              : streak.dueToday ? "Falta a lição de hoje para manter o desafio."
              : "Hoje já está garantido. Volte amanhã!"}
          </Text>
        </View>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: streak.state === "failed" ? palette.error : FLAME }]} /></View>
      <Text style={styles.meta}>{streak.done} de {streak.tier.days} dias · prêmio ◆ {streak.tier.reward}</Text>
      {streak.tier.days <= 14 ? (
        <View style={styles.dots}>
          {streak.days.map((day) => (
            <View key={day.key} style={[styles.dayDot, day.state === "done" && styles.dayDone, day.state === "missed" && styles.dayMissed, day.state === "today" && styles.dayToday]}>
              {day.state === "done" ? <Icon name="flame" size={12} color="#ffffff" /> : null}
            </View>
          ))}
        </View>
      ) : null}
      {streak.state === "completed" ? (
        <Pressable accessibilityRole="button" onPress={async () => { feedback("complete"); await challenges.finishStreak(); show(`+${streak.tier.reward} moedas Lumi!${next ? ` Que tal o desafio de ${next.days} dias?` : ""}`); }} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>Receber ◆ {streak.tier.reward}</Text>
        </Pressable>
      ) : streak.state === "failed" ? (
        <Pressable accessibilityRole="button" onPress={() => void challenges.startStreak(streak.tier.days)} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>Recomeçar hoje</Text>
        </Pressable>
      ) : !compact ? (
        <Pressable accessibilityRole="button" onPress={() => Alert.alert("Desistir do desafio?", "Sua ofensiva continua; só o desafio é cancelado.", [{ text: "Continuar no desafio", style: "cancel" }, { text: "Desistir", style: "destructive", onPress: () => void challenges.quitStreak() }])} style={styles.link}>
          <Text style={styles.linkText}>Trocar ou desistir do desafio</Text>
        </Pressable>
      ) : null}
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}
    </View>
  );
}

/** Missões do dia com barras e baú de bônus. */
export function QuestsCard({ challenges }: { challenges: Challenges }) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { feedback, toast, show } = useReward();
  const hoursLeft = 24 - new Date().getHours();
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.eyebrow}>MISSÕES DE HOJE</Text>
        <Text style={styles.meta}>renovam em {hoursLeft}h</Text>
      </View>
      {challenges.quests.map((quest) => {
        const done = quest.current >= quest.target;
        const claimed = challenges.isClaimed(quest.id);
        return (
          <View key={quest.id} style={styles.quest}>
            <View style={[styles.questIcon, done && styles.questIconDone]}><Icon name={done ? "check" : quest.icon} size={18} color={done ? "#ffffff" : palette.accent} /></View>
            <View style={styles.flex}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <View style={styles.questTrack}><View style={[styles.questFill, { width: `${Math.round((quest.current / quest.target) * 100)}%` }]} /></View>
              <Text style={styles.meta}>{quest.current}/{quest.target}</Text>
            </View>
            {done && !claimed ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Receber ${quest.reward} moedas`} onPress={async () => { feedback("correct"); if (await challenges.claim(quest.id, quest.reward)) show(`+${quest.reward} moedas Lumi!`); }} style={styles.claim}>
                <Text style={styles.claimText}>◆ {quest.reward}</Text>
              </Pressable>
            ) : <Text style={[styles.reward, claimed && styles.rewardClaimed]}>{claimed ? "✓" : `◆ ${quest.reward}`}</Text>}
          </View>
        );
      })}
      <Pressable accessibilityRole="button" disabled={!challenges.allQuestsDone || challenges.isClaimed(challenges.bonusId)}
        onPress={async () => { feedback("complete"); if (await challenges.claim(challenges.bonusId, challenges.bonusReward)) show(`Baú aberto: +${challenges.bonusReward} moedas!`); }}
        style={[styles.chest, challenges.allQuestsDone && !challenges.isClaimed(challenges.bonusId) && styles.chestReady]}>
        <Text style={styles.chestEmoji}>{challenges.isClaimed(challenges.bonusId) ? "🎉" : "🎁"}</Text>
        <Text style={styles.chestText}>{challenges.isClaimed(challenges.bonusId) ? "Baú do dia aberto!" : challenges.allQuestsDone ? `Abrir o baú: ◆ ${challenges.bonusReward}` : "Complete as 3 missões para abrir o baú"}</Text>
      </Pressable>
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}
    </View>
  );
}

/** Desafio do mês. */
export function MonthlyCard({ challenges }: { challenges: Challenges }) {
  const styles = useThemedStyles(makeStyles);
  const { feedback, toast, show } = useReward();
  const { month } = challenges;
  const id = `month:${month.id}`;
  const done = month.current >= month.target;
  const claimed = challenges.isClaimed(id);
  return (
    <View style={[styles.card, done && styles.cardWin]}>
      <View style={styles.row}>
        <Image source={lumiMoodAssets[month.mood]} style={styles.bigLumi} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>DESAFIO DO MÊS</Text>
          <Text style={styles.title}>{month.title}</Text>
          <Text style={styles.note}>Estude em {month.target} dias deste mês. {month.daysLeft > 0 ? `Faltam ${month.daysLeft} dias para acabar.` : "Último dia!"}</Text>
        </View>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.round((month.current / month.target) * 100)}%`, backgroundColor: COIN }]} /></View>
      <Text style={styles.meta}>{month.current} de {month.target} dias · prêmio ◆ {month.reward} e um troféu no perfil</Text>
      {done && !claimed ? (
        <Pressable accessibilityRole="button" onPress={async () => { feedback("complete"); if (await challenges.claim(id, month.reward)) show(`+${month.reward} moedas Lumi!`); }} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>Receber ◆ {month.reward}</Text>
        </Pressable>
      ) : claimed ? <Text style={styles.won}>🏆 Desafio do mês concluído!</Text> : null}
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  cardWin: { borderColor: COIN, borderWidth: 2 },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pressed: { opacity: 0.88, transform: [{ translateY: 2 }] },
  eyebrow: { color: p.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: p.text, fontSize: 18, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 19 },
  meta: { color: p.textMuted, fontSize: 12, fontWeight: "800" },
  tiers: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tier: { flexGrow: 1, minWidth: 92, alignItems: "center", paddingVertical: 10, borderRadius: 18, backgroundColor: p.ground, borderWidth: 2, borderColor: p.line, borderBottomWidth: 4 },
  tierLumi: { width: 64, height: 64 },
  tierDays: { color: FLAME, fontSize: 26, fontWeight: "900", lineHeight: 28 },
  tierUnit: { color: p.text, fontSize: 12, fontWeight: "900" },
  tierReward: { color: COIN, fontSize: 13, fontWeight: "900", marginTop: 2 },
  bigLumi: { width: 92, height: 92 },
  track: { height: 14, borderRadius: 7, backgroundColor: p.ground, overflow: "hidden" },
  fill: { height: 14, borderRadius: 7 },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dayDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: p.ground, borderWidth: 1.5, borderColor: p.line },
  dayDone: { backgroundColor: FLAME, borderColor: FLAME },
  dayMissed: { backgroundColor: p.errorSoft, borderColor: p.error },
  dayToday: { borderColor: FLAME, borderWidth: 2.5 },
  cta: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: p.cta, borderBottomWidth: 4, borderBottomColor: p.ctaShadow },
  ctaText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  link: { alignItems: "center", paddingVertical: 4 },
  linkText: { color: p.textMuted, fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  toast: { color: p.success, fontSize: 14, fontWeight: "900", textAlign: "center" },
  won: { color: p.text, fontSize: 15, fontWeight: "900", textAlign: "center" },
  quest: { flexDirection: "row", alignItems: "center", gap: 12 },
  questIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  questIconDone: { backgroundColor: p.success },
  questTitle: { color: p.text, fontSize: 15, fontWeight: "900" },
  questTrack: { height: 10, borderRadius: 5, backgroundColor: p.ground, overflow: "hidden", marginVertical: 4 },
  questFill: { height: 10, borderRadius: 5, backgroundColor: COIN },
  reward: { color: COIN, fontSize: 14, fontWeight: "900", minWidth: 44, textAlign: "right" },
  rewardClaimed: { color: p.success },
  claim: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: COIN, borderBottomWidth: 3, borderBottomColor: "#c98d22" },
  claimText: { color: "#3a2600", fontSize: 14, fontWeight: "900" },
  chest: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, backgroundColor: p.ground, borderWidth: 1.5, borderColor: p.line, borderStyle: "dashed" },
  chestReady: { borderStyle: "solid", borderColor: COIN, backgroundColor: p.goldSoft },
  chestEmoji: { fontSize: 28 },
  chestText: { flex: 1, color: p.text, fontSize: 14, fontWeight: "900" }
});
