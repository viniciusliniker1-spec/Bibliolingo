import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, type StyleProp, View, type ViewStyle } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { LumiCharacter } from "./LumiCharacter";

const welcomeVideo = require("../assets/video/lumi-welcome.mp4");

export function LumiWelcome({ style }: { style?: StyleProp<ViewStyle> }) {
  const { progress } = useMobileProgress();
  const [systemReduceMotion, setSystemReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setSystemReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setSystemReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const reduceMotion = Boolean(progress.settings.reduceMotionEnabled) || systemReduceMotion !== false;
  return (
    <View style={[styles.frame, style]} accessible accessibilityLabel="Lumi saudando você na entrada">
      {reduceMotion ? (
        <LumiCharacter mood="welcome" motion="calm" style={styles.fallback} accessibilityLabel="Lumi saudando você na entrada" />
      ) : (
        <LumiWelcomePlayer />
      )}
    </View>
  );
}

function LumiWelcomePlayer() {
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(welcomeVideo, (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.play();
  });

  return (
    <View style={styles.player}>
      <LumiCharacter mood="welcome" motion="calm" style={styles.fallback} accessibilityLabel="Lumi saudando você na entrada" />
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="contain"
        onFirstFrameRender={() => setReady(true)}
        style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  player: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  fallback: { width: "100%", height: "100%" }
});
