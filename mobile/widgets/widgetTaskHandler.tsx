import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { widgetView } from "../domain/lumiWidget";
import { loadWidgetSnapshot } from "../services/widgetSnapshot";
import { LUMI_WIDGET_NAME, LumiWidget } from "./LumiWidget";

/** Roda em segundo plano quando o Android pede para desenhar o widget. */
export async function widgetTaskHandler({ widgetInfo, widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetInfo.widgetName !== LUMI_WIDGET_NAME) return;
  if (widgetAction === "WIDGET_ADDED" || widgetAction === "WIDGET_UPDATE" || widgetAction === "WIDGET_RESIZED") {
    const snapshot = await loadWidgetSnapshot();
    renderWidget(<LumiWidget view={widgetView(snapshot)} width={widgetInfo.width} height={widgetInfo.height} />);
  }
}
