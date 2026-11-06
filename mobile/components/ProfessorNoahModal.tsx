import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { noahPortrait } from "../assets/noahAssets";
import type { NoahContext, NoahMode } from "../domain/noah";
import { noahSuggestions, parseNoahAnswer, type NoahSuggestion } from "../domain/noahSuggestions";
import { useFeedbackEffects } from "../hooks/useFeedbackEffects";
import { useMobileProgress } from "../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../providers/ThemeProvider";
import { askRemoteNoah } from "../services/noahRemote";
import { clearNoahThread, loadNoahThread, saveNoahThread, type SavedNoahMessage } from "../services/noahHistory";
import type { Palette } from "../theme/tokens";
import { Icon } from "./navigation/Icons";

type Message = SavedNoahMessage;

interface ProfessorNoahModalProps {
  visible: boolean;
  context: NoahContext;
  contextKey: string;
  autoQuestion?: string;
  onClose: () => void;
}

const MAX_LENGTH = 1200;

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Professor Noah: conversa em tela cheia, com atalhos do momento e respostas formatadas. */
export function ProfessorNoahModal({ visible, context, contextKey, autoQuestion, onClose }: ProfessorNoahModalProps) {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { progress } = useMobileProgress();
  const playFeedback = useFeedbackEffects(progress.settings);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const [lastFailed, setLastFailed] = useState<{ question: string; mode: NoahMode }>();
  const [contextOpen, setContextOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const sessionIdRef = useRef(createId());
  const autoSentRef = useRef<string | undefined>(undefined);
  const loadedContextRef = useRef<string | undefined>(undefined);
  const suggestions = useMemo(() => noahSuggestions(context), [context]);
  const still = reduced || Boolean(progress.settings.reduceMotionEnabled);

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduced); }, []);

  useEffect(() => {
    let active = true;
    loadedContextRef.current = undefined;
    setMessages([]); setDraft(""); setError(undefined); setLastFailed(undefined); setContextOpen(false);
    sessionIdRef.current = createId();
    autoSentRef.current = undefined;
    void loadNoahThread(contextKey).then((saved) => {
      if (!active) return;
      setMessages(saved);
      loadedContextRef.current = contextKey;
    });
    return () => { active = false; };
  }, [contextKey]);

  useEffect(() => {
    if (loadedContextRef.current !== contextKey) return;
    void saveNoahThread(contextKey, messages);
  }, [contextKey, messages]);

  const send = useCallback(async (rawQuestion: string, mode: NoahMode = "ask", retry = false) => {
    const question = rawQuestion.trim();
    if (!question || sending) return;
    const historySource = retry && messages[messages.length - 1]?.role === "user" ? messages.slice(0, -1) : messages;
    const history = historySource.map(({ role, content }) => ({ role, content }));
    if (!retry) {
      setMessages((current) => [...current, { id: createId(), role: "user", content: question, createdAt: new Date().toISOString() }]);
      setDraft("");
    }
    setError(undefined);
    setSending(true);
    try {
      const response = await askRemoteNoah({ question, mode, context, history, sessionId: sessionIdRef.current });
      setMessages((current) => [...current, { id: createId(), role: "assistant", content: response.answer, createdAt: new Date().toISOString() }]);
      setLastFailed(undefined);
      playFeedback("noah");
    } catch (cause) {
      setLastFailed({ question, mode });
      setError(cause instanceof Error ? cause.message : "Noah está indisponível agora.");
    } finally {
      setSending(false);
    }
  }, [context, messages, sending, playFeedback]);

  useEffect(() => {
    if (!visible || !autoQuestion || autoSentRef.current === contextKey) return;
    autoSentRef.current = contextKey;
    void send(autoQuestion, "error");
  }, [autoQuestion, contextKey, send, visible]);

  const ask = (suggestion: NoahSuggestion) => void send(suggestion.question, suggestion.mode);
  const reset = () => { void clearNoahThread(contextKey); setMessages([]); setError(undefined); setLastFailed(undefined); };
  const canSend = !sending && Boolean(draft.trim());
  const empty = messages.length === 0 && !sending;

  return (
    <Modal visible={visible} animationType={still ? "none" : "slide"} statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Cabeçalho */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Fechar Professor Noah">
            <Icon name="chevronDown" size={26} color={palette.text} />
          </Pressable>
          <View style={styles.avatarWrap}>
            <Image source={noahPortrait} style={styles.avatar} contentFit="cover" accessibilityElementsHidden />
            <View style={[styles.status, { backgroundColor: sending ? palette.xp : palette.success }]} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Professor Noah</Text>
            <Text style={styles.subtitle}>{sending ? "Preparando a explicação…" : "Tutor bíblico · responde com fontes"}</Text>
          </View>
          {messages.length ? (
            <Pressable onPress={reset} disabled={sending} hitSlop={10} style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Nova conversa">
              <Icon name="refresh" size={22} color={palette.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Contexto atual */}
        <Pressable onPress={() => setContextOpen((open) => !open)} accessibilityRole="button" accessibilityState={{ expanded: contextOpen }} style={styles.context}>
          <View style={styles.contextIcon}><Icon name="book" size={16} color={palette.accent} /></View>
          <View style={styles.flex}>
            <Text style={styles.contextTitle} numberOfLines={contextOpen ? undefined : 1}>{context.title}</Text>
            {context.reference ? <Text style={styles.contextReference}>{context.reference}</Text> : null}
          </View>
          {context.sources?.length ? <Icon name={contextOpen ? "chevronDown" : "chevronRight"} size={18} color={palette.textMuted} /> : null}
        </Pressable>
        {contextOpen && context.sources?.length ? (
          <View style={styles.sources}>
            <Text style={styles.sourcesTitle}>FONTES DESTA CONVERSA</Text>
            <Text style={styles.sourcesText}>{context.sources.join(" · ")}</Text>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.history}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: !still })}
        >
          {empty ? (
            <View style={styles.empty}>
              <Image source={noahPortrait} style={styles.emptyPortrait} contentFit="cover" accessibilityLabel="Professor Noah" />
              <Text style={styles.emptyTitle}>Shalom! Como posso ajudar?</Text>
              <Text style={styles.emptyText}>Eu explico com a Bíblia aberta: contexto, sentido das palavras e por que uma resposta está certa. Escolha um atalho ou pergunte do seu jeito.</Text>
              <View style={styles.starters}>
                {suggestions.slice(0, 4).map((suggestion) => (
                  <Pressable key={suggestion.id} onPress={() => ask(suggestion)} accessibilityRole="button" style={({ pressed }) => [styles.starter, pressed && styles.pressed]}>
                    <View style={styles.starterIcon}><Icon name={suggestion.icon} size={18} color={palette.accent} /></View>
                    <Text style={styles.starterText}>{suggestion.label}</Text>
                    <Icon name="chevronRight" size={18} color={palette.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {messages.map((message) => message.role === "user" ? (
            <View key={message.id} style={styles.userBubble}>
              <Text style={styles.userText} selectable>{message.content}</Text>
            </View>
          ) : (
            <View key={message.id} style={styles.noahRow}>
              <Image source={noahPortrait} style={styles.noahMini} contentFit="cover" accessibilityElementsHidden />
              <View style={styles.noahBubble}>
                {parseNoahAnswer(message.content).map((block, index) => (
                  <View key={index} style={block.kind === "bullet" ? styles.bulletRow : undefined}>
                    {block.kind === "bullet" ? <Text style={styles.bulletMarker}>{block.marker}</Text> : null}
                    <Text style={[styles.noahText, block.kind === "bullet" && styles.flex]} selectable>
                      {block.segments.map((segment, part) => <Text key={part} style={segment.bold ? styles.bold : undefined}>{segment.text}</Text>)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {sending ? <TypingIndicator still={still} /> : null}

          {error ? (
            <View style={styles.error} accessibilityLiveRegion="assertive">
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorHint}>Sua pergunta foi guardada. Tente de novo ou continue a lição.</Text>
              {lastFailed ? (
                <Pressable accessibilityRole="button" disabled={sending} onPress={() => void send(lastFailed.question, lastFailed.mode, true)} style={styles.retry}>
                  <Icon name="refresh" size={16} color={palette.error} /><Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        {/* Atalhos + campo de pergunta */}
        <View style={[styles.composerArea, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
          {!empty && suggestions.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
              {suggestions.map((suggestion) => (
                <Pressable key={suggestion.id} disabled={sending} onPress={() => ask(suggestion)} accessibilityRole="button" style={({ pressed }) => [styles.chip, sending && styles.disabled, pressed && styles.pressed]}>
                  <Icon name={suggestion.icon} size={15} color={palette.accent} />
                  <Text style={styles.chipText}>{suggestion.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              editable={!sending}
              maxLength={MAX_LENGTH}
              multiline
              placeholder="Pergunte ao Professor Noah…"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              accessibilityLabel="Pergunta para o Professor Noah"
              onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 220)}
            />
            <Pressable onPress={() => void send(draft)} disabled={!canSend} accessibilityRole="button" accessibilityLabel="Enviar pergunta" style={[styles.send, !canSend && styles.sendDisabled]}>
              <Icon name="send" size={22} color={canSend ? palette.ctaText : palette.textMuted} strokeWidth={2.8} />
            </Pressable>
          </View>
          {draft.length > MAX_LENGTH - 200 ? <Text style={styles.counter}>{draft.length}/{MAX_LENGTH}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Três pontinhos "digitando". */
function TypingIndicator({ still }: { still: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    if (still) return;
    const loop = Animated.loop(Animated.stagger(160, dots.map((dot) => Animated.sequence([
      Animated.timing(dot, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(dot, { toValue: 0.3, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true })
    ]))));
    loop.start();
    return () => loop.stop();
  }, [dots, still]);
  return (
    <View style={styles.noahRow} accessibilityLiveRegion="polite" accessibilityLabel="Noah está escrevendo">
      <Image source={noahPortrait} style={styles.noahMini} contentFit="cover" accessibilityElementsHidden />
      <View style={[styles.noahBubble, styles.typing]}>
        {dots.map((dot, index) => <Animated.View key={index} style={[styles.typingDot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0.3, 1], outputRange: [0, -4] }) }] }]} />)}
      </View>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: p.divider, backgroundColor: p.groundDeep },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarWrap: { width: 46, height: 46 },
  avatar: { width: 46, height: 46, borderRadius: 14 },
  status: { position: "absolute", right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: p.groundDeep },
  headerCopy: { flex: 1 },
  title: { color: p.text, fontSize: 19, fontWeight: "900" },
  subtitle: { color: p.textMuted, fontSize: 13, fontWeight: "700", marginTop: 1 },
  context: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 14, marginTop: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  contextIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  contextTitle: { color: p.text, fontSize: 14, fontWeight: "800" },
  contextReference: { color: p.accent, fontSize: 12, fontWeight: "800", marginTop: 2 },
  sources: { marginHorizontal: 14, marginTop: 6, paddingHorizontal: 12, gap: 2 },
  sourcesTitle: { color: p.xp, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  sourcesText: { color: p.textMuted, fontSize: 12, lineHeight: 17 },
  history: { gap: 14, paddingHorizontal: 14, paddingVertical: 16 },
  empty: { alignItems: "center", gap: 10, paddingTop: 12 },
  emptyPortrait: { width: 96, height: 96, borderRadius: 26 },
  emptyTitle: { color: p.text, fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: 6 },
  emptyText: { color: p.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center", maxWidth: 420 },
  starters: { alignSelf: "stretch", gap: 8, marginTop: 10 },
  starter: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: 16, backgroundColor: p.card, borderWidth: 1, borderColor: p.line, borderBottomWidth: 3 },
  starterIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: p.activeTabBg },
  starterText: { flex: 1, color: p.text, fontSize: 15, fontWeight: "800" },
  userBubble: { alignSelf: "flex-end", maxWidth: "84%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderBottomRightRadius: 6, backgroundColor: p.accent },
  userText: { color: p.isDark ? p.ground : "#ffffff", fontSize: 16, lineHeight: 22, fontWeight: "600" },
  noahRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "92%" },
  noahMini: { width: 30, height: 30, borderRadius: 9 },
  noahBubble: { flexShrink: 1, gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, borderBottomLeftRadius: 6, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  noahText: { color: p.text, fontSize: 16, lineHeight: 24 },
  bold: { fontWeight: "900" },
  bulletRow: { flexDirection: "row", gap: 8 },
  bulletMarker: { color: p.accent, fontSize: 16, lineHeight: 24, fontWeight: "900", minWidth: 14 },
  typing: { flexDirection: "row", gap: 6, paddingVertical: 16 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: p.textMuted },
  error: { gap: 6, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: p.error, backgroundColor: p.errorSoft },
  errorText: { color: p.error, fontSize: 14, fontWeight: "900" },
  errorHint: { color: p.text, fontSize: 13, lineHeight: 18 },
  retry: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: p.error },
  retryText: { color: p.error, fontSize: 13, fontWeight: "900" },
  composerArea: { gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: p.divider, backgroundColor: p.groundDeep },
  chips: { gap: 8, paddingHorizontal: 14 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 38, paddingHorizontal: 12, borderRadius: 19, borderWidth: 1, borderColor: p.line, backgroundColor: p.card },
  chipText: { color: p.text, fontSize: 13, fontWeight: "800" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 14 },
  input: { flex: 1, minHeight: 48, maxHeight: 120, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 13, borderRadius: 24, borderWidth: 1, borderColor: p.line, backgroundColor: p.card, color: p.text, fontSize: 16, lineHeight: 21, textAlignVertical: "top" },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: p.cta },
  sendDisabled: { backgroundColor: p.divider },
  counter: { color: p.textMuted, fontSize: 12, textAlign: "right", paddingHorizontal: 18 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 }
});
