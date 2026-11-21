import { forwardRef } from "react";
import { Text, View } from "react-native";
import type { WeeklySummary } from "../domain/weeklySummary";
import { CARD_GOLD, CARD_GOLD_SOFT, ShareCardFrame } from "./ShareCardFrame";

interface Props {
  width: number;
  summary: WeeklySummary;
  name?: string;
  dateLabel: string;
  backgroundBookId?: string;
}

export const WeeklySummaryCard = forwardRef<View, Props>(function WeeklySummaryCard({ width, summary, name, dateLabel, backgroundBookId }, ref) {
  const maxXp = Math.max(1, ...summary.days.map((day) => day.xp));
  const stats = [
    { value: summary.lessons.toLocaleString("pt-BR"), label: summary.lessons === 1 ? "etapa" : "etapas" },
    { value: summary.xp.toLocaleString("pt-BR"), label: "XP" },
    ...(summary.minutes > 0 ? [{ value: String(summary.minutes), label: "min" }] : [])
  ];
  return (
    <ShareCardFrame ref={ref} width={width} backgroundBookId={backgroundBookId} dateLabel={dateLabel} mood={summary.mood} badge="RESUMO DA SEMANA">
      {(u) => (
        <>
          {name ? <Text numberOfLines={1} adjustsFontSizeToFit style={{ maxWidth: "92%", color: "#ffffff", fontSize: u(26), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: u(8) }}>{name.split(" ")[0]}</Text> : null}
          <Text style={{ color: "#d4e1ee", fontSize: u(13), fontWeight: "800", letterSpacing: u(3), marginTop: u(2) }}>ESTUDOU</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: u(4) }}>
            <Text style={{ color: CARD_GOLD_SOFT, fontSize: u(84), lineHeight: u(92), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: u(12) }}>{summary.activeDays}</Text>
            <Text style={{ color: "#ffffff", fontSize: u(26), fontWeight: "900", marginLeft: u(6) }}>de 7 dias</Text>
          </View>
          <Text numberOfLines={2} style={{ maxWidth: "92%", textAlign: "center", color: "#ffffff", fontSize: u(16), fontWeight: "800", marginTop: u(2) }}>{summary.headline}</Text>

          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: u(7), height: u(86), marginTop: u(20) }}>
            {summary.days.map((day) => (
              <View key={day.date} style={{ alignItems: "center", width: u(30) }}>
                <View style={{ width: u(22), height: Math.max(u(6), (day.xp / maxXp) * u(58)), borderRadius: u(6), backgroundColor: day.active ? CARD_GOLD : "rgba(255,255,255,0.22)" }} />
                <Text style={{ color: day.active ? CARD_GOLD_SOFT : "#b9cbe0", fontSize: u(12), fontWeight: "900", marginTop: u(4) }}>{day.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: u(8), marginTop: u(18) }}>
            {stats.map((stat) => (
              <View key={stat.label} style={{ minWidth: u(76), alignItems: "center", paddingVertical: u(8), paddingHorizontal: u(10), borderRadius: u(14), backgroundColor: "rgba(11,26,44,0.72)", borderWidth: 1, borderColor: "rgba(255,217,143,0.45)" }}>
                <Text style={{ color: "#ffffff", fontSize: u(19), fontWeight: "900" }}>{stat.value}</Text>
                <Text style={{ color: "#b9cbe0", fontSize: u(11), fontWeight: "700" }}>{stat.label}</Text>
              </View>
            ))}
          </View>
          {summary.xpChange !== undefined && summary.xpChange > 0 ? <Text style={{ color: CARD_GOLD, fontSize: u(12), fontWeight: "800", marginTop: u(10) }}>+{summary.xpChange}% de XP em relação à semana passada</Text> : null}
        </>
      )}
    </ShareCardFrame>
  );
});
