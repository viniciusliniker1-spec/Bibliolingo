import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type NoahContext,
  type NoahMode
} from "../domain/noah";
import { askRemoteNoah } from "../services/noahRemote";
import { clearNoahThread, loadNoahThread, saveNoahThread, type SavedNoahMessage } from "../services/noahHistory";
import { colors, radius, spacing } from "../theme/tokens";
import { PrimaryButton } from "./PrimaryButton";

type Message = SavedNoahMessage;

interface ProfessorNoahModalProps {
  visible: boolean;
  context: NoahContext;
  contextKey: string;
  autoQuestion?: string;
  onClose: () => void;
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function ProfessorNoahModal({
  visible,
  context,
  contextKey,
  autoQuestion,
  onClose
}: ProfessorNoahModalProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const [lastFailed, setLastFailed] = useState<{ question: string; mode: NoahMode }>();
  const scrollRef = useRef<ScrollView>(null);
  const sessionIdRef = useRef(createId());
  const autoSentRef = useRef<string | undefined>(undefined);
  const loadedContextRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let active=true;loadedContextRef.current=undefined;setMessages([]);setDraft("");setError(undefined);setLastFailed(undefined);sessionIdRef.current=createId();autoSentRef.current=undefined;
    void loadNoahThread(contextKey).then(saved=>{if(!active)return;setMessages(saved);loadedContextRef.current=contextKey;});
    return()=>{active=false;};
  }, [contextKey]);

  useEffect(()=>{if(loadedContextRef.current!==contextKey)return;void saveNoahThread(contextKey,messages);},[contextKey,messages]);

  const send = useCallback(async (rawQuestion: string, mode: NoahMode = "ask", retry = false) => {
    const question = rawQuestion.trim();
    if (!question || sending) return;

    const historySource = retry && messages[messages.length - 1]?.role === "user" ? messages.slice(0, -1) : messages;
    const history = historySource.map(({ role, content }) => ({ role, content }));
    if (!retry) {
      const userMessage: Message = { id: createId(), role: "user", content: question, createdAt: new Date().toISOString() };
      setMessages((current) => [...current, userMessage]);
      setDraft("");
    }
    setError(undefined);
    setSending(true);

    try {
      const response = await askRemoteNoah({
        question,
        mode,
        context,
        history,
        sessionId: sessionIdRef.current
      });
      setMessages((current) => [
        ...current,
        { id: createId(), role: "assistant", content: response.answer, createdAt: new Date().toISOString() }
      ]);
      setLastFailed(undefined);
    } catch (cause) {
      setLastFailed({ question, mode });
      setError(cause instanceof Error ? cause.message : "Noah está indisponível agora.");
    } finally {
      setSending(false);
    }
  }, [context, messages, sending]);

  useEffect(() => {
    if (!visible || !autoQuestion || autoSentRef.current === contextKey) return;
    autoSentRef.current = contextKey;
    void send(autoQuestion, "error");
  }, [autoQuestion, contextKey, send, visible]);

  const askForHint = () => {
    void send(
      "Dê uma pista progressiva para eu raciocinar sobre esta questão sem revelar a resposta correta.",
      "practice"
    );
  };

  const askForContext = () => {
    void send(
      "Explique o contexto bíblico necessário para compreender esta questão, usando referências verificáveis.",
      "deepen"
    );
  };

  const askForReview = () => {
    void send(
      "Com base somente no meu perfil pedagógico autorizado, indique uma prioridade de revisão e explique por quê. Não altere XP ou progresso.",
      "practice"
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <Pressable
          style={styles.dismissArea}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar Professor Noah"
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} accessibilityElementsHidden />
          <View style={styles.header}>
            <View style={styles.avatar} accessibilityElementsHidden>
              <Text style={styles.avatarText}>N</Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>TUTOR BÍBLICO CONTEXTUAL</Text>
              <Text style={styles.title}>Professor Noah</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel="Fechar conversa"
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.contextChip}>
            <Text style={styles.contextTitle} numberOfLines={2}>{context.title}</Text>
            {context.reference ? <Text style={styles.contextReference}>{context.reference}</Text> : null}
          </View>
          {context.sources?.length ? <View style={styles.sources}><Text style={styles.sourcesTitle}>Fontes desta conversa</Text><Text style={styles.sourcesText}>{context.sources.join(" · ")}</Text></View> : null}

          <View style={styles.quickActions}>
            {context.answerStatus === "unanswered" ? (
              <Pressable style={styles.quickAction} onPress={askForHint} disabled={sending}>
                <Text style={styles.quickActionText}>Dê uma pista</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.quickAction} onPress={askForContext} disabled={sending}>
              <Text style={styles.quickActionText}>Mostrar contexto bíblico</Text>
            </Pressable>
            {context.learningProfile ? (
              <Pressable style={styles.quickAction} onPress={askForReview} disabled={sending}>
                <Text style={styles.quickActionText}>O que devo revisar?</Text>
              </Pressable>
            ) : null}
            {messages.length ? <Pressable style={styles.quickAction} onPress={()=>{void clearNoahThread(contextKey);setMessages([]);}} disabled={sending}><Text style={styles.quickActionText}>Nova conversa</Text></Pressable> : null}
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.history}
            contentContainerStyle={styles.historyContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 && !sending ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Como posso ajudar?</Text>
                <Text style={styles.emptyText}>
                  Posso oferecer uma pista, explicar o contexto ou ajudar você a compreender um erro.
                </Text>
              </View>
            ) : null}
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.role === "user" ? styles.userMessage : styles.noahMessage
                ]}
              >
                <Text style={styles.messageAuthor}>
                  {message.role === "user" ? "Você" : "Noah"}
                </Text>
                <Text style={styles.messageText} selectable>{message.content}</Text>
              </View>
            ))}
            {sending ? (
              <View style={styles.thinking} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.tealDark} />
                <Text style={styles.thinkingText}>Noah está preparando uma explicação…</Text>
              </View>
            ) : null}
            {error ? (
              <View style={styles.error} accessibilityLiveRegion="assertive">
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>Sua pergunta foi preservada. Tente novamente ou continue a lição.</Text>
                {lastFailed ? <Pressable accessibilityRole="button" disabled={sending} onPress={() => void send(lastFailed.question, lastFailed.mode, true)} style={styles.quickAction}><Text style={styles.quickActionText}>Tentar novamente</Text></Pressable> : null}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              editable={!sending}
              maxLength={1200}
              multiline
              placeholder="O que você quer compreender?"
              placeholderTextColor={colors.muted}
              style={styles.input}
              accessibilityLabel="Pergunta para o Professor Noah"
              onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 220)}
            />
            <View style={styles.composerFooter}>
              <Text style={styles.counter}>{draft.length}/1200</Text>
              <PrimaryButton
                onPress={() => void send(draft)}
                disabled={sending || !draft.trim()}
                style={styles.sendButton}
              >
                Enviar
              </PrimaryButton>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(8, 22, 38, 0.45)"
  },
  dismissArea: {
    flex: 1
  },
  sheet: {
    height: "92%",
    maxHeight: "92%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal
  },
  avatarText: {
    color: colors.navy,
    fontSize: 21,
    fontWeight: "900"
  },
  headerCopy: {
    flex: 1
  },
  eyebrow: {
    color: colors.tealDark,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  title: {
    color: colors.navy,
    fontSize: 21,
    fontWeight: "900"
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.background
  },
  closeText: {
    color: colors.navy,
    fontSize: 28,
    lineHeight: 30
  },
  contextChip: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    gap: spacing.xs
  },
  contextTitle: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "800"
  },
  contextReference: {
    color: colors.tealDark,
    fontSize: 12,
    fontWeight: "700"
  },
  sources:{paddingHorizontal:spacing.sm,gap:2},
  sourcesTitle:{color:colors.goldDark,fontSize:10,fontWeight:"900",letterSpacing:.6},
  sourcesText:{color:colors.muted,fontSize:11,lineHeight:16},
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickAction: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.teal,
    backgroundColor: colors.surface
  },
  quickActionText: {
    color: colors.tealDark,
    fontSize: 13,
    fontWeight: "800"
  },
  history: {
    flex: 1,
    minHeight: 0
  },
  historyContent: {
    gap: spacing.md,
    paddingVertical: spacing.sm
  },
  empty: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    gap: spacing.sm
  },
  emptyTitle: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  message: {
    maxWidth: "92%",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d8f2ee"
  },
  noahMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.background
  },
  messageAuthor: {
    color: colors.tealDark,
    fontSize: 12,
    fontWeight: "900"
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md
  },
  thinkingText: {
    color: colors.muted,
    fontSize: 14
  },
  error: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: "#fff0f2",
    padding: spacing.md,
    gap: spacing.xs
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "800"
  },
  errorHint: {
    color: colors.text,
    fontSize: 13
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm
  },
  input: {
    minHeight: 52,
    maxHeight: 92,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface
  },
  composerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  counter: {
    color: colors.muted,
    fontSize: 12
  },
  sendButton: {
    minWidth: 116,
    minHeight: 48
  }
});
