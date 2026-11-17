import { forwardRef } from "react";
import { Text, View } from "react-native";
import { milestoneMood, milestoneTitle } from "../domain/milestones";
import { CARD_GOLD, CARD_GOLD_SOFT, ShareCardFrame } from "./ShareCardFrame";

interface Props {
  width: number;
  days: number;
  name?: string;
  xp: number;
  dateLabel: string;
  backgroundBookId?: string;
}

export const MilestoneCard = forwardRef<View, Props>(function MilestoneCard({ width, days, name, xp, dateLabel, backgroundBookId }, ref) {
  return (
    <ShareCardFrame ref={ref} width={width} backgroundBookId={backgroundBookId} dateLabel={dateLabel} mood={milestoneMood(days)} badge="MARCO DE OFENSIVA">
      {(u) => (
        <>
          {name ? <Text numberOfLines={1} adjustsFontSizeToFit style={{ maxWidth: "92%", color: "#ffffff", fontSize: u(28), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: u(8) }}>{name.split(" ")[0]}</Text> : null}
          <Text style={{ color: "#d4e1ee", fontSize: u(13), fontWeight: "800", letterSpacing: u(3), marginTop: u(2) }}>{name ? "ESTÁ HÁ" : "ESTOU HÁ"}</Text>
          <Text style={{ color: CARD_GOLD_SOFT, fontSize: u(120), lineHeight: u(128), fontWeight: "900", marginTop: u(2), textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: u(14) }}>{days}</Text>
          <Text style={{ color: "#ffffff", fontSize: u(26), fontWeight: "900" }}>dias seguidos</Text>
          <Text numberOfLines={2} style={{ maxWidth: "92%", textAlign: "center", color: CARD_GOLD, fontSize: u(15), fontWeight: "800", marginTop: u(10) }}>{milestoneTitle(days)}</Text>
          <View style={{ marginTop: u(18), alignItems: "center", paddingVertical: u(8), paddingHorizontal: u(18), borderRadius: u(14), backgroundColor: "rgba(11,26,44,0.72)", borderWidth: 1, borderColor: "rgba(255,217,143,0.45)" }}>
            <Text style={{ color: "#ffffff", fontSize: u(19), fontWeight: "900" }}>{xp.toLocaleString("pt-BR")}</Text>
            <Text style={{ color: "#b9cbe0", fontSize: u(11), fontWeight: "700" }}>XP no total</Text>
          </View>
        </>
      )}
    </ShareCardFrame>
  );
});
