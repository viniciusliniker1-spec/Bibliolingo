import { FlexWidget, ImageWidget, TextWidget } from "react-native-android-widget";
import type { WidgetMood, WidgetView } from "../domain/lumiWidget";

export const LUMI_WIDGET_NAME = "LumiStreak";

const LUMI_BY_MOOD: Record<WidgetMood, number> = {
  goal: require("../assets/generated/lumi_15_conquista.png"),
  proud: require("../assets/generated/lumi_19_orgulhosa.png"),
  risk: require("../assets/generated/lumi_08_surpresa.png"),
  sleepy: require("../assets/generated/lumi_18_sonolenta.png"),
  morning: require("../assets/generated/lumi_05_animada.png"),
  invite: require("../assets/generated/lumi_01_boas_vindas.png")
};

const COLORS = {
  ground: "#0f2238",
  card: "#16304d",
  text: "#ffffff",
  muted: "#a9bdd6",
  accent: "#5fe0c6",
  streak: "#ff9f43",
  risk: "#ff7a59",
  track: "#24476b",
  fill: "#21c8a8"
} as const;

/**
 * Widget da tela inicial. Fica compacto (2×2) ou largo (4×2): no largo a Lumi
 * aparece ao lado da mensagem e da barra da meta do dia.
 */
export function LumiWidget({ view, width, height }: { view: WidgetView; width: number; height: number }) {
  const wide = width >= 230;
  const lumiSize = Math.max(56, Math.min(height - 24, wide ? 120 : 86));
  const barWidth = Math.max(60, wide ? width - lumiSize - 52 : width - 32);
  const titleColor = view.mood === "risk" ? COLORS.risk : COLORS.text;

  const flame = (
    <FlexWidget style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
      <TextWidget text={`🔥 ${view.streak}`} style={{ fontSize: 13, fontWeight: "900", color: view.streak > 0 ? COLORS.streak : COLORS.muted }} />
    </FlexWidget>
  );
  const goalBar = (
    <FlexWidget style={{ width: barWidth, height: 8, borderRadius: 4, backgroundColor: COLORS.track }}>
      <FlexWidget style={{ width: Math.max(view.goalRatio > 0 ? 8 : 0, Math.round(barWidth * view.goalRatio)), height: 8, borderRadius: 4, backgroundColor: COLORS.fill }} />
    </FlexWidget>
  );

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`${view.title}. ${view.message}`}
      style={{ height: "match_parent", width: "match_parent", flexDirection: wide ? "row" : "column", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.ground, borderRadius: 24, padding: 12 }}
    >
      <ImageWidget image={LUMI_BY_MOOD[view.mood]} imageWidth={lumiSize} imageHeight={Math.round(lumiSize * 0.91)} />
      <FlexWidget style={{ flex: 1, flexDirection: "column", justifyContent: "center", marginLeft: wide ? 10 : 0, marginTop: wide ? 0 : 6, width: wide ? "wrap_content" : "match_parent" }}>
        {wide ? flame : null}
        <TextWidget text={view.title} maxLines={2} truncate="END" style={{ fontSize: wide ? 16 : 14, fontWeight: "900", color: titleColor, marginTop: wide ? 6 : 0, textAlign: wide ? "left" : "center" }} />
        {wide ? <TextWidget text={view.message} maxLines={2} truncate="END" style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }} /> : null}
        <FlexWidget style={{ marginTop: 8, flexDirection: "column", alignItems: wide ? "flex-start" : "center", width: "match_parent" }}>
          {goalBar}
          <TextWidget text={`${Math.min(view.xpToday, view.dailyGoal)}/${view.dailyGoal} XP hoje${wide ? "" : ` · 🔥 ${view.streak}`}`} style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, marginTop: 4 }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
