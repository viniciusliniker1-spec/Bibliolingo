import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultStudyNotificationPreferences, type StudyNotificationPreferences } from "../../src/services/notificationPolicy";
import { lumiAnimationAssets } from "../assets/lumiAnimationAssets";

const lumiFace = require("../assets/generated/lumi_01_boas_vindas.png");
const notificationIcon = require("../assets/generated/lumi_01_boas_vindas.png");
import { LumiWidgetCard } from "../components/LumiWidgetCard";
import { Icon, type IconName } from "../components/navigation/Icons";
import { lumiReminder, REMINDER_TIME_PRESETS, shiftTime } from "../domain/lumiNotifications";
import { useLightStatusBar } from "../hooks/useLightStatusBar";
import { useReminderContext } from "../hooks/useReminderContext";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { cancelMobileStudyNotifications, reconcileMobileStudyNotifications, sendLumiTestNotification } from "../services/mobileNotifications";
import { loadMobileNotificationPreferences, saveMobileNotificationPreferences } from "../services/notificationPreferences";
import type { Palette } from "../theme/tokens";

const CATEGORIES: { key: "daily" | "streak" | "review" | "inactivity"; icon: IconName; title: string; note: string }[] = [
  { key: "daily", icon: "book", title: "Lição do dia", note: "Só se você ainda não estudou hoje." },
  { key: "streak", icon: "flame", title: "Sequência", note: "E um aviso às 21h se ela estiver para acabar." },
  { key: "review", icon: "memory", title: "Revisões", note: "Quando algo estiver quase esquecido." },
  { key: "inactivity", icon: "heart", title: "Saudade da Lumi", note: "Depois de 3 dias longe, sem culpa." }
];

function formatTime(time: string) {
  return time.replace(":", "h");
}

export default function NotificationSettingsScreen() {
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const context = useReminderContext();
  const [preferences, setPreferences] = useState(defaultStudyNotificationPreferences);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { void loadMobileNotificationPreferences().then((value) => { setPreferences(value); setLoaded(true); }); }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const update = <K extends keyof StudyNotificationPreferences>(key: K, value: StudyNotificationPreferences[K]) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  // Prévia ao vivo: o mesmo texto que a Lumi mandaria amanhã nesse horário.
  const sample = useMemo(() => {
    const morning = Number(preferences.time.split(":")[0]) < 11;
    return lumiReminder(morning ? "morning" : progress.streak > 0 ? "streak" : "daily", preferences.time, { nome: context.name?.split(" ")[0], dias: progress.streak, licao: context.nextLessonTitle });
  }, [preferences.time, progress.streak, context]);

  const save = async () => {
    setSaving(true);
    try {
      await saveMobileNotificationPreferences(preferences);
      if (!preferences.enabled) {
        await cancelMobileStudyNotifications();
        setNotice("Lembretes desligados. A Lumi fica quietinha.");
        return;
      }
      const result = await reconcileMobileStudyNotifications(progress, preferences, { requestPermission: true, context });
      setNotice(result.status === "permission-required"
        ? "O Android bloqueou as notificações. Libere em Configurações › Apps › Bibliolingo."
        : result.scheduled > 0
          ? `Pronto! Próximo lembrete ${result.next ? result.next.date.toLocaleDateString("pt-BR", { weekday: "long" }) + " às " + formatTime(preferences.time) : "agendado"}.`
          : "Salvo! Hoje você já estudou, então a Lumi só volta amanhã.");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    const ok = await sendLumiTestNotification({ ...context, streak: progress.streak });
    setNotice(ok ? "Olha a notificação chegando em 2 segundos!" : "Permita as notificações para ver o teste.");
  };

  const off = !preferences.enabled;
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Lembretes" }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
        {/* Herói com prévia */}
        <View style={styles.hero}>
          <Image source={lumiAnimationAssets.acenar} style={styles.heroLumi} contentFit="contain" accessibilityLabel="Lumi" />
          <Text style={styles.title}>Lembretes da Lumi</Text>
          <Text style={styles.subtitle}>Um toque por dia, no horário que você escolher. Nada de spam, prometo pela lã!</Text>
        </View>
        <View style={[styles.mock, off && styles.dim]} accessible accessibilityLabel={`Exemplo de notificação: ${sample.title}. ${sample.body}`}>
          <View style={styles.mockTop}>
            <View style={styles.mockIcon}><Image source={notificationIcon} style={styles.mockIconImage} contentFit="contain" /></View>
            <Text style={styles.mockApp}>Bibliolingo · {formatTime(preferences.time)}</Text>
          </View>
          <View style={styles.mockRow}>
            <View style={styles.flex}>
              <Text style={styles.mockTitle}>{sample.title}</Text>
              <Text style={styles.mockBody}>{sample.body}</Text>
            </View>
            <Image source={lumiFace} style={styles.mockLumi} contentFit="contain" accessibilityElementsHidden />
          </View>
        </View>

        {/* Liga/desliga */}
        <View style={[styles.card, styles.masterCard]}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>Receber lembretes</Text>
            <Text style={styles.note}>{off ? "Desligados" : "Ligados · até 1 por dia, mais o aviso de sequência"}</Text>
          </View>
          <Switch value={preferences.enabled} onValueChange={(value) => update("enabled", value)} trackColor={{ false: palette.line, true: palette.cta }} thumbColor="#ffffff" disabled={!loaded} />
        </View>

        {/* Horário */}
        <Text style={styles.section}>Horário</Text>
        <View style={[styles.card, off && styles.dim]} pointerEvents={off ? "none" : "auto"}>
          <View style={styles.presets}>
            {REMINDER_TIME_PRESETS.map((preset) => {
              const active = preferences.time === preset.time;
              return (
                <Pressable key={preset.id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => update("time", preset.time)} style={[styles.preset, active && styles.presetActive]}>
                  <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>{preset.label}</Text>
                  <Text style={[styles.presetTime, active && styles.presetLabelActive]}>{formatTime(preset.time)}</Text>
                </Pressable>
              );
            })}
          </View>
          <Stepper label="Ajuste fino" value={formatTime(preferences.time)} onMinus={() => update("time", shiftTime(preferences.time, -15))} onPlus={() => update("time", shiftTime(preferences.time, 15))} />
        </View>

        {/* Categorias */}
        <Text style={styles.section}>Sobre o que a Lumi pode avisar</Text>
        <View style={[styles.card, off && styles.dim]} pointerEvents={off ? "none" : "auto"}>
          {CATEGORIES.map((category, index) => (
            <View key={category.key} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.rowIcon}><Icon name={category.icon} size={18} color={palette.accent} /></View>
              <View style={styles.flex}><Text style={styles.rowTitle}>{category.title}</Text><Text style={styles.note}>{category.note}</Text></View>
              <Switch value={preferences[category.key]} onValueChange={(value) => update(category.key, value)} trackColor={{ false: palette.line, true: palette.cta }} thumbColor="#ffffff" />
            </View>
          ))}
        </View>

        {/* Silêncio */}
        <Text style={styles.section}>Modo silêncio</Text>
        <View style={[styles.card, off && styles.dim]} pointerEvents={off ? "none" : "auto"}>
          <Text style={styles.note}>Nenhum lembrete entre esses horários. Bom sono!</Text>
          <Stepper label="Começa" value={formatTime(preferences.quietStart)} onMinus={() => update("quietStart", shiftTime(preferences.quietStart, -30))} onPlus={() => update("quietStart", shiftTime(preferences.quietStart, 30))} />
          <Stepper label="Termina" value={formatTime(preferences.quietEnd)} onMinus={() => update("quietEnd", shiftTime(preferences.quietEnd, -30))} onPlus={() => update("quietEnd", shiftTime(preferences.quietEnd, 30))} />
        </View>

        <Text style={styles.section}>Tela inicial</Text>
        <LumiWidgetCard onNotice={setNotice} />

        <Pressable accessibilityRole="button" onPress={() => void test()} style={styles.testButton}>
          <Icon name="bell" size={18} color={palette.accent} />
          <Text style={styles.testText}>Enviar uma notificação de teste</Text>
        </Pressable>
        <Text style={styles.limit}>Os lembretes são locais e gratuitos: nada é enviado a servidores. Em alguns Androids é preciso tirar o Bibliolingo da economia de bateria.</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
        <Pressable accessibilityRole="button" disabled={saving || !loaded} onPress={() => void save()} style={({ pressed }) => [styles.primary, pressed && styles.pressed, (saving || !loaded) && styles.dim]}>
          <Text style={styles.primaryText}>{saving ? "Salvando…" : "Salvar lembretes"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stepper}>
      <Text style={[styles.rowTitle, styles.flex]}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: mais cedo`} onPress={onMinus} hitSlop={6} style={styles.stepButton}><Text style={styles.stepGlyph}>−</Text></Pressable>
      <Text style={styles.stepValue} accessibilityLiveRegion="polite">{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: mais tarde`} onPress={onPlus} hitSlop={6} style={styles.stepButton}><Text style={[styles.stepGlyph, { color: palette.accent }]}>+</Text></Pressable>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  content: { padding: 18, gap: 12 },
  hero: { alignItems: "center", gap: 6 },
  heroLumi: { width: 150, height: 140 },
  title: { color: p.text, fontSize: 26, fontWeight: "900", textAlign: "center" },
  subtitle: { color: p.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center", maxWidth: 380 },
  mock: { gap: 4, padding: 14, borderRadius: 20, backgroundColor: p.isDark ? "#e9eef5" : "#ffffff", borderWidth: 1, borderColor: p.line, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6, marginTop: 4 },
  mockTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  mockIcon: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#21A675" },
  mockIconImage: { width: 16, height: 16 },
  mockRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mockLumi: { width: 46, height: 46 },
  mockApp: { color: "#5b6b7f", fontSize: 12, fontWeight: "700" },
  mockTitle: { color: "#0f2238", fontSize: 15, fontWeight: "900", marginTop: 2 },
  mockBody: { color: "#324458", fontSize: 14, lineHeight: 19 },
  section: { color: p.textMuted, fontSize: 13, fontWeight: "900", letterSpacing: 0.8, marginTop: 10, textTransform: "uppercase" },
  card: { gap: 12, padding: 16, borderRadius: 22, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  masterCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  dim: { opacity: 0.45 },
  presets: { flexDirection: "row", gap: 8 },
  preset: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 10, borderRadius: 14, borderWidth: 2, borderColor: p.line, backgroundColor: p.groundDeep },
  presetActive: { borderColor: p.cta, backgroundColor: p.activeTabBg },
  presetLabel: { color: p.textMuted, fontSize: 12, fontWeight: "800" },
  presetTime: { color: p.text, fontSize: 15, fontWeight: "900" },
  presetLabelActive: { color: p.accent },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: p.divider, paddingTop: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  rowTitle: { color: p.text, fontSize: 15, fontWeight: "900" },
  note: { color: p.textMuted, fontSize: 13, lineHeight: 18, marginTop: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: p.line, backgroundColor: p.groundDeep },
  stepGlyph: { color: p.text, fontSize: 22, fontWeight: "900", lineHeight: 24 },
  stepValue: { minWidth: 64, textAlign: "center", color: p.text, fontSize: 18, fontWeight: "900" },
  testButton: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: 8, borderRadius: 16, borderWidth: 2, borderColor: p.line },
  testText: { color: p.accent, fontSize: 15, fontWeight: "900" },
  limit: { color: p.textMuted, fontSize: 12, lineHeight: 18, textAlign: "center", paddingHorizontal: 10 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, gap: 8, paddingHorizontal: 18, paddingTop: 10, backgroundColor: p.ground, borderTopWidth: 1, borderTopColor: p.divider },
  notice: { color: p.text, fontSize: 14, fontWeight: "700", textAlign: "center", padding: 10, borderRadius: 12, backgroundColor: p.activeTabBg },
  primary: { minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  pressed: { borderBottomWidth: 2 },
  primaryText: { color: p.ctaText, fontSize: 16, fontWeight: "900" }
});
