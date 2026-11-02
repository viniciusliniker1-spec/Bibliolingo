import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";
import { REMINDER_TIME_PRESETS } from "../domain/lumiNotifications";
import { useReminderContext } from "../hooks/useReminderContext";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { useThemedStyles } from "../providers/ThemeProvider";
import { reconcileMobileStudyNotifications } from "../services/mobileNotifications";
import { loadMobileNotificationPreferences, saveMobileNotificationPreferences } from "../services/notificationPreferences";
import type { Palette } from "../theme/tokens";

const ASKED_KEY = "@bibliolingo/notification-primer/v1";

/**
 * Depois da primeira lição concluída, a Lumi pergunta se pode lembrar a pessoa
 * (antes do pedido de permissão do Android, que só aparece se ela aceitar).
 */
export function NotificationPrimer() {
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const context = useReminderContext();
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState("19:00");

  useEffect(() => {
    if (progress.completedLessonIds.length < 1) return;
    let active = true;
    void (async () => {
      const [asked, prefs] = await Promise.all([AsyncStorage.getItem(ASKED_KEY), loadMobileNotificationPreferences()]);
      if (active && !asked && !prefs.enabled) setTimeout(() => active && setVisible(true), 1400);
    })();
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = async () => { setVisible(false); await AsyncStorage.setItem(ASKED_KEY, new Date().toISOString()); };
  const accept = async () => {
    const prefs = { ...(await loadMobileNotificationPreferences()), enabled: true, time };
    await saveMobileNotificationPreferences(prefs);
    await close();
    await reconcileMobileStudyNotifications(progress, prefs, { requestPermission: true, context });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => void close()} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Image source={lumiAnimationAssets.acenar} style={styles.lumi} contentFit="contain" accessibilityLabel="Lumi acenando" />
          <Text style={styles.title}>Posso te lembrar amanhã?</Text>
          <Text style={styles.text}>Quem estuda um pouquinho todo dia aprende muito mais. Eu aviso uma vez por dia, no horário que você preferir.</Text>
          <View style={styles.times}>
            {REMINDER_TIME_PRESETS.map((preset) => (
              <Pressable key={preset.id} accessibilityRole="radio" accessibilityState={{ checked: time === preset.time }} onPress={() => setTime(preset.time)} style={[styles.time, time === preset.time && styles.timeActive]}>
                <Text style={[styles.timeLabel, time === preset.time && styles.timeLabelActive]}>{preset.label}</Text>
                <Text style={[styles.timeValue, time === preset.time && styles.timeLabelActive]}>{preset.time.replace(":", "h")}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={() => void accept()} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Sim, me lembre!</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => void close()} style={styles.secondary}><Text style={styles.secondaryText}>Agora não</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(4,12,22,0.7)" },
  card: { alignItems: "center", gap: 10, padding: 22, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: p.card },
  lumi: { width: 140, height: 130 },
  title: { color: p.text, fontSize: 23, fontWeight: "900", textAlign: "center" },
  text: { color: p.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  times: { flexDirection: "row", gap: 8, alignSelf: "stretch", marginTop: 4 },
  time: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14, borderWidth: 2, borderColor: p.line, backgroundColor: p.groundDeep },
  timeActive: { borderColor: p.cta, backgroundColor: p.activeTabBg },
  timeLabel: { color: p.textMuted, fontSize: 12, fontWeight: "800" },
  timeValue: { color: p.text, fontSize: 15, fontWeight: "900" },
  timeLabelActive: { color: p.accent },
  primary: { alignSelf: "stretch", minHeight: 54, marginTop: 6, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 2 },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" },
  secondary: { minHeight: 44, justifyContent: "center" },
  secondaryText: { color: p.textMuted, fontSize: 14, fontWeight: "800" }
});
