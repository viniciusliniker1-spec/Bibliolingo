import "expo-router/entry";
import { Platform } from "react-native";

// Widget da Lumi na tela inicial do Android: o sistema chama este handler em
// segundo plano para desenhar e atualizar o widget.
if (Platform.OS === "android") {
  const { registerWidgetTaskHandler } = require("react-native-android-widget") as typeof import("react-native-android-widget");
  const { widgetTaskHandler } = require("./widgets/widgetTaskHandler") as typeof import("./widgets/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}
