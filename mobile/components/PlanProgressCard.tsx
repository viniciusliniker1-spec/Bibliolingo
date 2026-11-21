import { forwardRef } from "react";
import { Text, View } from "react-native";
import { planMilestoneTitle, planMood, type PlanStatus } from "../domain/planMilestones";
import { CARD_GOLD, CARD_GOLD_SOFT, ShareCardFrame } from "./ShareCardFrame";

interface Props {
  width: number;
  title: string;
  status: PlanStatus;
  name?: string;
  dateLabel: string;
  backgroundBookId?: string;
}

/** Cartão de progresso no plano de leitura (25%, 50%, 75%, 100%). */
export const PlanProgressCard = forwardRef<View, Props>(function PlanProgressCard({ width, title, status, name, dateLabel, backgroundBookId }, ref) {
  const done = status.percent >= 100;
  return (
    <ShareCardFrame ref={ref} width={width} backgroundBookId={backgroundBookId} dateLabel={dateLabel} mood={planMood(status.percent)} badge={done ? "PLANO CONCLUÍDO" : "PLANO DE LEITURA"}>
      {(u) => (
        <>
          {name ? <Text numberOfLines={1} adjustsFontSizeToFit style={{ maxWidth: "92%", color: "#ffffff", fontSize: u(26), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: u(8) }}>{name.split(" ")[0]}</Text> : null}
          <Text style={{ color: "#d4e1ee", fontSize: u(13), fontWeight: "800", letterSpacing: u(3), marginTop: u(2) }}>{done ? "CONCLUIU" : "JÁ LEU"}</Text>
          <Text style={{ color: CARD_GOLD_SOFT, fontSize: u(104), lineHeight: u(112), fontWeight: "900", marginTop: u(2), textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: u(14) }}>{status.percent}%</Text>
          <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7} style={{ maxWidth: "94%", textAlign: "center", color: "#ffffff", fontSize: u(24), lineHeight: u(28), fontWeight: "900" }}>{title}</Text>
          <View style={{ width: "76%", height: u(12), borderRadius: u(6), backgroundColor: "rgba(255,255,255,0.22)", marginTop: u(16), overflow: "hidden" }}>
            <View style={{ width: `${Math.max(4, status.percent)}%`, height: "100%", borderRadius: u(6), backgroundColor: CARD_GOLD }} />
          </View>
          <Text style={{ color: "#b9cbe0", fontSize: u(13), fontWeight: "800", marginTop: u(8) }}>{status.completed} de {status.total} leituras</Text>
          <Text style={{ color: CARD_GOLD, fontSize: u(15), fontWeight: "900", marginTop: u(10) }}>{planMilestoneTitle(status.percent)}</Text>
        </>
      )}
    </ShareCardFrame>
  );
});
