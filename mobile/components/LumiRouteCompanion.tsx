import { usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LumiCharacter, type LumiMood } from "./LumiCharacter";

type CompanionState = { mood: LumiMood; motion: "thinking" | "encouraging" | "celebrating"; message: string };

function stateForRoute(pathname: string): CompanionState {
  if (pathname.includes("/result")) return { mood: "proud", motion: "celebrating", message: "Seu progresso foi salvo." };
  if (pathname.includes("/lesson/") || pathname.includes("/activity/")) return { mood: "listening", motion: "thinking", message: "Vamos por etapas." };
  if (pathname.includes("/achievements")) return { mood: "achievement", motion: "celebrating", message: "Cada passo conta." };
  if (pathname.includes("/bible")) return { mood: "explaining", motion: "thinking", message: "Vamos explorar o texto." };
  if (pathname.includes("/noah")) return { mood: "listening", motion: "thinking", message: "Posso ajudar a estudar." };
  if (pathname.includes("/profile")) return { mood: "returning", motion: "encouraging", message: "Sua jornada é sua." };
  return { mood: "welcome", motion: "encouraging", message: "Vamos continuar?" };
}

/** Persistent visual companion. Compact and never intercepts touches. */
export function LumiRouteCompanion() {
  const state = stateForRoute(usePathname());
  return <View pointerEvents="none" style={styles.root} accessibilityLiveRegion="polite">
    <View style={styles.message}><Text style={styles.messageText}>{state.message}</Text></View>
    <View style={styles.character}><LumiCharacter mood={state.mood} motion={state.motion} style={styles.lumi} accessibilityLabel={`Lumi: ${state.message}`} /></View>
  </View>;
}

const styles = StyleSheet.create({
  root: { position: "absolute", right: 10, bottom: 76, alignItems: "flex-end", zIndex: 20, elevation: 20 },
  message: { maxWidth: 136, paddingHorizontal: 10, paddingVertical: 7, marginRight: 58, marginBottom: -2, borderRadius: 14, borderWidth: 1, borderColor: "#3d6261", backgroundColor: "#183338", shadowColor: "#000", shadowOpacity: .18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  messageText: { color: "#effaf4", fontSize: 11, lineHeight: 15, fontWeight: "800", textAlign: "center" },
  character: { width: 76, height: 76, borderRadius: 38, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#74d65d", backgroundColor: "#102a2d", shadowColor: "#000", shadowOpacity: .22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  lumi: { width: 70, height: 70 }
});
