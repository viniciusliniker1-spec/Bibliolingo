import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { getMobileLumiSkinAsset } from "../../assets/lumiSkinAssets";
import { isLumiSkinId } from "../../../src/domain/lumi";
import { usePalette } from "../../providers/ThemeProvider";

const BASE = require("../../assets/generated/lumi_01_boas_vindas.png");

/** Avatar de um aluno: a Lumi com a skin que ele equipou (as fotos de perfil são privadas). */
export function LumiAvatar({ skinId, size = 44, ring }: { skinId: string; size?: number; ring?: string }) {
  const palette = usePalette();
  const skin = isLumiSkinId(skinId) ? getMobileLumiSkinAsset(skinId) : undefined;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.activeTabBg, borderColor: ring ?? palette.line }]}>
      <Image source={skin ?? BASE} style={{ width: size * 0.92, height: size * 0.92 }} contentFit="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center", borderWidth: 2.5, overflow: "hidden" }
});
