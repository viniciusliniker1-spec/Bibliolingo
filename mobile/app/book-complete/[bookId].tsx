import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { journeyBooks } from "../../../src/content/catalog";
import { BookCompleteCard, type BookCardData } from "../../components/BookCompleteCard";
import { LessonConfetti } from "../../components/LessonConfetti";
import { Icon } from "../../components/navigation/Icons";
import { PushButton } from "../../components/PushButton";
import { bookActivityIds, nextBookOf } from "../../domain/bookCompletion";
import { useFeedbackEffects } from "../../hooks/useFeedbackEffects";
import { useLightStatusBar } from "../../hooks/useLightStatusBar";
import { useLumiWallet } from "../../hooks/useLumiWallet";
import { useMobileAuth } from "../../providers/MobileAuthProvider";
import { useMobileLumi } from "../../providers/MobileLumiProvider";
import { useMobileProgress } from "../../providers/MobileProgressProvider";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import { markBookCelebrated } from "../../services/bookCelebrations";
import type { Palette } from "../../theme/tokens";

/** Tamanho da imagem compartilhada: formato de story (9:16). */
const SHARE_WIDTH = 1080;
const SHARE_HEIGHT = 1920;

export default function BookCompleteScreen() {
  useLightStatusBar();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const palette = usePalette();
  const styles = useThemedStyles(makeStyles);
  const auth = useMobileAuth();
  const { progress } = useMobileProgress();
  const lumi = useMobileLumi();
  const wallet = useLumiWallet();
  const playFeedback = useFeedbackEffects(progress.settings);
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const book = useMemo(() => journeyBooks.find((item) => item.id === bookId), [bookId]);
  const next = useMemo(() => (book ? nextBookOf(journeyBooks, book.id) : undefined), [book]);
  const name = ((auth.session?.user.user_metadata?.display_name as string | undefined) ?? progress.profile.name ?? "").trim() || undefined;

  const data: BookCardData | undefined = book ? {
    name,
    bookId: book.id,
    bookTitle: book.title,
    activities: bookActivityIds(book).length,
    xp: progress.xp,
    streak: progress.streak,
    dateLabel: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }),
    photoUrl: lumi.profilePhotoUrl,
    skinId: wallet.equippedSkinId,
    lastOfBible: !next
  } : undefined;

  const caption = book
    ? `${name ? `${name} concluiu` : "Concluí"} ${book.title} no Bibliolingo! ${data?.activities ?? 0} etapas estudadas. Estude a Bíblia de um jeito divertido, com a Lumi. 🐑📖`
    : "";

  useEffect(() => {
    if (!book) return;
    void markBookCelebrated(book.id);
    playFeedback("checkpoint");
  }, [book?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const share = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy(true);
    setMessage("");
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        width: SHARE_WIDTH,
        height: SHARE_HEIGHT,
        result: Platform.OS === "web" ? "data-uri" : "tmpfile"
      });
      if (Platform.OS !== "web" && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Compartilhar minha conquista", UTI: "public.png" });
      } else {
        await Share.share({ message: caption });
      }
    } catch {
      setMessage("Não foi possível gerar a imagem agora. Tente de novo em instantes.");
    } finally {
      setBusy(false);
    }
  }, [caption]);

  const copyCaption = useCallback(async () => {
    await Clipboard.setStringAsync(caption);
    setMessage("Legenda copiada! É só colar na sua publicação.");
  }, [caption]);

  if (!book || !data) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Livro não encontrado</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/")} style={styles.link}><Text style={styles.linkText}>Voltar à trilha</Text></Pressable>
      </View>
    );
  }

  const cardWidth = Math.min(width - 56, 300);
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{data.lastOfBible ? "Você terminou a Bíblia!" : "Livro concluído!"}</Text>
        <Text style={styles.subtitle}>{data.lastOfBible ? "Uma jornada e tanto. Compartilhe essa conquista!" : `Parabéns${name ? `, ${name.split(" ")[0]}` : ""}! Compartilhe essa conquista com quem caminha com você.`}</Text>
        <View style={[styles.cardFrame, { width: cardWidth }]} accessible accessibilityLabel={`Cartão de conquista: ${name ?? "Você"} concluiu ${book.title}`}>
          <BookCompleteCard ref={cardRef} width={cardWidth} data={data} />
        </View>
        {message ? <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text> : null}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <PushButton accessibilityRole="button" disabled={busy} onPress={() => void share()} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, busy && styles.disabled]}>
          <Icon name="share" size={20} color={palette.ctaText} />
          <Text style={styles.primaryText}>{busy ? "Preparando imagem…" : "Compartilhar"}</Text>
        </PushButton>
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={() => void copyCaption()} style={styles.ghost}>
            <Icon name="copy" size={17} color={palette.accent} />
            <Text style={styles.ghostText}>Copiar legenda</Text>
          </Pressable>
          {next ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Começar ${next.title}`} onPress={() => router.replace({ pathname: "/book/[bookId]", params: { bookId: next.id } })} style={[styles.ghost, styles.ghostStrong]}>
              <Text style={styles.ghostStrongText} numberOfLines={1}>Começar {next.title}</Text>
              <Icon name="chevronRight" size={17} color={palette.accent} />
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.replace("/")} style={[styles.ghost, styles.ghostStrong]}>
              <Text style={styles.ghostStrongText}>Voltar à trilha</Text>
            </Pressable>
          )}
        </View>
        {next ? (
          <Pressable accessibilityRole="button" onPress={() => router.replace("/")} style={styles.link}><Text style={styles.linkText}>Agora não</Text></Pressable>
        ) : null}
      </View>
      <LessonConfetti active />
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: p.ground },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  content: { alignItems: "center", paddingHorizontal: 20, paddingTop: 18, gap: 10 },
  title: { color: p.xp, fontSize: 28, fontWeight: "900", textAlign: "center" },
  subtitle: { color: p.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 6, paddingHorizontal: 12 },
  cardFrame: { borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: p.line, shadowColor: "#000000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  message: { color: p.accent, fontSize: 13, fontWeight: "800", textAlign: "center", marginTop: 4 },
  actions: { gap: 8, paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: p.divider },
  primary: { flexDirection: "row", gap: 8, minHeight: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: p.cta, borderBottomWidth: 5, borderBottomColor: p.ctaShadow },
  primaryPressed: { borderBottomWidth: 2, marginTop: 3 },
  disabled: { opacity: 0.6 },
  primaryText: { color: p.ctaText, fontSize: 18, fontWeight: "900" },
  row: { flexDirection: "row", gap: 8 },
  ghost: { flex: 1, minHeight: 48, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  ghostText: { color: p.accent, fontSize: 14, fontWeight: "900" },
  ghostStrong: { borderColor: p.accent },
  ghostStrongText: { flexShrink: 1, color: p.accent, fontSize: 14, fontWeight: "900" },
  link: { minHeight: 40, alignItems: "center", justifyContent: "center" },
  linkText: { color: p.textMuted, fontSize: 14, fontWeight: "800" }
});
