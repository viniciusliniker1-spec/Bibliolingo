import { forwardRef } from "react";
import { Text, View } from "react-native";
import { CARD_GOLD, CARD_GOLD_SOFT, ShareCardFrame } from "./ShareCardFrame";

interface Props {
  width: number;
  title: string;
  /** Texto do versículo (da Bíblia local). */
  verse: string;
  reference: string;
  keyPhrase: string;
  dateLabel: string;
  backgroundBookId?: string;
}

/** Cartão 9:16 do devocional do dia: versículo e frase-chave para compartilhar. */
export const DevotionalCard = forwardRef<View, Props>(function DevotionalCard({ width, title, verse, reference, keyPhrase, dateLabel, backgroundBookId }, ref) {
  return (
    <ShareCardFrame ref={ref} width={width} backgroundBookId={backgroundBookId} dateLabel={dateLabel} mood="amor" badge="DEVOCIONAL DO DIA">
      {(u) => (
        <>
          <Text numberOfLines={2} adjustsFontSizeToFit style={{ maxWidth: "90%", textAlign: "center", color: "#ffffff", fontSize: u(22), fontWeight: "900", textShadowColor: "rgba(0,0,0,0.55)", textShadowRadius: u(8) }}>{title}</Text>
          <View style={{ maxWidth: "92%", marginTop: u(14), paddingVertical: u(12), paddingHorizontal: u(14), borderRadius: u(14), backgroundColor: "rgba(11,26,44,0.74)", borderWidth: 1, borderColor: "rgba(255,217,143,0.45)" }}>
            <Text numberOfLines={7} adjustsFontSizeToFit style={{ color: "#ffffff", fontSize: u(15), lineHeight: u(22), fontStyle: "italic", textAlign: "center" }}>{verse ? `“${verse}”` : ""}</Text>
            <Text style={{ color: CARD_GOLD_SOFT, fontSize: u(13), fontWeight: "900", textAlign: "center", marginTop: u(8) }}>{reference}</Text>
          </View>
          <Text numberOfLines={4} style={{ maxWidth: "88%", textAlign: "center", color: CARD_GOLD, fontSize: u(14), fontWeight: "800", marginTop: u(14) }}>{keyPhrase}</Text>
        </>
      )}
    </ShareCardFrame>
  );
});
