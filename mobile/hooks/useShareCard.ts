import { useCallback, useRef, useState } from "react";
import { Platform, Share, type View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { trackEvent } from "../services/funnel";

/** Tamanho da imagem compartilhada: formato de story (9:16). */
const SHARE_WIDTH = 1080;
const SHARE_HEIGHT = 1920;

/** Captura um cartão como PNG e abre o compartilhamento (na web, baixa a imagem). */
export function useShareCard({ filename, caption, dialogTitle = "Compartilhar" }: { filename: string; caption: string; dialogTitle?: string }) {
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const share = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy(true);
    setMessage("");
    try {
      if (Platform.OS === "web") {
        const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "data-uri" });
        const doc = (globalThis as { document?: { createElement: (tag: string) => { href: string; download: string; click: () => void } } }).document;
        const link = doc?.createElement("a");
        if (!link) throw new Error("download indisponível");
        link.href = uri;
        link.download = `${filename}.png`;
        link.click();
        setMessage("Imagem baixada! É só postar nas suas redes.");
        void trackEvent("first_share");
        return;
      }
      const uri = await captureRef(cardRef, { format: "png", quality: 1, width: SHARE_WIDTH, height: SHARE_HEIGHT, result: "tmpfile" });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle, UTI: "public.png" });
      else await Share.share({ message: caption });
      void trackEvent("first_share");
    } catch (error) {
      console.warn("Não foi possível gerar o cartão", error);
      setMessage("Não foi possível gerar a imagem agora. Tente de novo em instantes.");
    } finally {
      setBusy(false);
    }
  }, [caption, dialogTitle, filename]);

  const copyCaption = useCallback(async () => {
    await Clipboard.setStringAsync(caption);
    setMessage("Legenda copiada! É só colar na sua publicação.");
  }, [caption]);

  return { cardRef, busy, message, share, copyCaption };
}
