import { useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import type { ScrambleLetter, SpotToken, SwipeCard } from "../../domain/lessonPlan";
import { normalizeAnswer } from "../../domain/lessonPlan";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";
import { Icon } from "../navigation/Icons";

/** Desembaralhe: toque nas letras, na ordem certa, para formar a palavra que completa a frase. */
export function ScrambleExercise({ before, after, answer, letters, onDone }: { before: string; after: string; answer: string; letters: ScrambleLetter[]; onDone: (correct: boolean) => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<"idle" | "right" | "wrong">("idle");
  const byId = useMemo(() => new Map(letters.map((letter) => [letter.id, letter])), [letters]);
  const word = picked.map((id) => byId.get(id)?.ch ?? "").join("");

  const pick = (id: string) => {
    if (result !== "idle") return;
    const next = [...picked, id];
    setPicked(next);
    if (next.length === letters.length) {
      const ok = normalizeAnswer(next.map((item) => byId.get(item)?.ch ?? "").join("")) === normalizeAnswer(answer);
      setResult(ok ? "right" : "wrong");
      onDone(ok);
    }
  };
  const remove = (index: number) => { if (result === "idle") setPicked(picked.filter((_, position) => position !== index)); };
  const color = result === "right" ? palette.success : result === "wrong" ? palette.error : palette.accent;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sentence}>{before} <Text style={[styles.blank, { color }]}>{result === "wrong" ? answer : word || "_ _ _"}</Text> {after}</Text>
      <View style={styles.slots} accessibilityLabel={`Palavra formada: ${word || "vazia"}`}>
        {letters.map((letter, index) => {
          const id = picked[index];
          return (
            <Pressable key={letter.id} accessibilityRole="button" accessibilityLabel={id ? `Remover letra ${byId.get(id)?.ch}` : "Espaço vazio"} disabled={!id || result !== "idle"} onPress={() => remove(index)} style={[styles.slot, { borderColor: id ? color : palette.line }, id && { backgroundColor: palette.activeTabBg }]}>
              <Text style={[styles.letter, { color: id ? color : palette.textMuted }]}>{id ? byId.get(id)?.ch.toLocaleUpperCase("pt-BR") : ""}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.tiles}>
        {letters.map((letter) => {
          const used = picked.includes(letter.id);
          return (
            <Pressable key={letter.id} accessibilityRole="button" accessibilityLabel={`Letra ${letter.ch}`} disabled={used || result !== "idle"} onPress={() => pick(letter.id)} style={({ pressed }) => [styles.tile, used && styles.tileUsed, pressed && { opacity: 0.8 }]}>
              <Text style={styles.tileText}>{letter.ch.toLocaleUpperCase("pt-BR")}</Text>
            </Pressable>
          );
        })}
      </View>
      {result === "wrong" ? <Text style={[styles.note, { color: palette.error }]}>A palavra era “{answer}”.</Text> : null}
      {result === "right" ? <Text style={[styles.note, { color: palette.success }]}>Isso! Palavra certa.</Text> : null}
    </View>
  );
}

/** Ache o erro: toque na palavra que foi trocada na frase. */
export function SpotExercise({ tokens, answer, reference, onDone }: { tokens: SpotToken[]; answer: string; reference: string; onDone: (correct: boolean) => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [picked, setPicked] = useState<string>();
  const checked = picked !== undefined;
  const ok = checked && Boolean(tokens.find((token) => token.id === picked)?.wrong);
  return (
    <View style={styles.wrap}>
      <View style={styles.words}>
        {tokens.map((token) => {
          const mine = token.id === picked;
          const reveal = checked && token.wrong;
          const bad = checked && mine && !token.wrong;
          return (
            <Pressable
              key={token.id}
              accessibilityRole="button"
              accessibilityLabel={`${token.text}${reveal ? ", era a palavra trocada" : ""}`}
              disabled={checked}
              onPress={() => { setPicked(token.id); onDone(token.wrong); }}
              style={[styles.word, reveal && { borderColor: palette.success, backgroundColor: palette.successSoft }, bad && { borderColor: palette.error, backgroundColor: palette.errorSoft }]}
            >
              <Text style={[styles.wordText, reveal && { color: palette.success, textDecorationLine: "line-through" }, bad && { color: palette.error }]}>{token.text}</Text>
            </Pressable>
          );
        })}
      </View>
      {checked ? <Text style={[styles.note, { color: ok ? palette.success : palette.error }]} accessibilityLiveRegion="polite">{ok ? "Achou! " : "Quase. "}O certo é “{answer}” ({reference}).</Text> : <Text style={styles.hint}>Uma palavra foi trocada. Toque nela.</Text>}
    </View>
  );
}

const SWIPE_DISTANCE = 90;
const PASS_RATIO = 0.75;

/** Deslize: arraste a carta para a direita (certo) ou para a esquerda (errado), ou use os botões. */
export function SwipeExercise({ cards, onDone }: { cards: SwipeCard[]; onDone: (correct: boolean) => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const x = useRef(new Animated.Value(0)).current;
  const busy = useRef(false);
  const state = useRef({ index: 0, results: [] as boolean[] });
  state.current = { index, results };
  const finished = index >= cards.length;

  const decide = (saysTrue: boolean) => {
    if (busy.current || state.current.index >= cards.length) return;
    busy.current = true;
    const card = cards[state.current.index];
    const nextResults = [...state.current.results, saysTrue === card.isTrue];
    Animated.timing(x, { toValue: saysTrue ? 420 : -420, duration: 200, useNativeDriver: true }).start(() => {
      x.setValue(0);
      setResults(nextResults);
      setIndex(nextResults.length);
      busy.current = false;
      if (nextResults.length === cards.length) onDone(nextResults.filter(Boolean).length >= Math.ceil(cards.length * PASS_RATIO));
    });
  };
  const decideRef = useRef(decide);
  decideRef.current = decide;

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 6,
    onPanResponderMove: (_event, gesture) => { if (!busy.current) x.setValue(gesture.dx); },
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dx > SWIPE_DISTANCE) decideRef.current(true);
      else if (gesture.dx < -SWIPE_DISTANCE) decideRef.current(false);
      else Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
    }
  })).current;

  const rotate = x.interpolate({ inputRange: [-200, 0, 200], outputRange: ["-8deg", "0deg", "8deg"] });
  const rightHint = x.interpolate({ inputRange: [0, SWIPE_DISTANCE], outputRange: [0, 1], extrapolate: "clamp" });
  const leftHint = x.interpolate({ inputRange: [-SWIPE_DISTANCE, 0], outputRange: [1, 0], extrapolate: "clamp" });
  const card = cards[index];
  const hits = results.filter(Boolean).length;

  if (finished) {
    const wrong = cards.filter((_, position) => !results[position]);
    return (
      <View style={styles.wrap} accessibilityLiveRegion="polite">
        <Text style={[styles.summary, { color: hits >= Math.ceil(cards.length * PASS_RATIO) ? palette.success : palette.error }]}>{hits} de {cards.length} certas</Text>
        {wrong.length ? <Text style={styles.hint}>Para fixar:</Text> : <Text style={[styles.note, { color: palette.success }]}>Sem nenhum erro. 🎉</Text>}
        {wrong.map((item) => (
          <View key={item.id} style={styles.fix}>
            <Text style={styles.fixQuestion}>{item.question}</Text>
            <Text style={styles.fixAnswer}>{item.truth}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>Carta {index + 1} de {cards.length}: a resposta está certa?</Text>
      <View style={styles.deck}>
        <Animated.View {...pan.panHandlers} style={[styles.card, { transform: [{ translateX: x }, { rotate }] }]} accessible accessibilityLabel={`${card.question}. Resposta proposta: ${card.claim}.`}>
          <Text style={styles.cardQuestion}>{card.question}</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.cardClaim}>{card.claim}</Text>
          <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampRight, { opacity: rightHint, borderColor: palette.success }]}><Text style={[styles.stampText, { color: palette.success }]}>CERTO</Text></Animated.View>
          <Animated.View pointerEvents="none" style={[styles.stamp, styles.stampLeft, { opacity: leftHint, borderColor: palette.error }]}><Text style={[styles.stampText, { color: palette.error }]}>ERRADO</Text></Animated.View>
        </Animated.View>
      </View>
      <View style={styles.swipeButtons}>
        <Pressable accessibilityRole="button" accessibilityLabel="Errado" onPress={() => decide(false)} style={({ pressed }) => [styles.swipeButton, { borderColor: palette.error, backgroundColor: palette.errorSoft }, pressed && { opacity: 0.85 }]}>
          <Icon name="close" size={22} color={palette.error} strokeWidth={3} /><Text style={[styles.swipeLabel, { color: palette.error }]}>Errado</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Certo" onPress={() => decide(true)} style={({ pressed }) => [styles.swipeButton, { borderColor: palette.success, backgroundColor: palette.successSoft }, pressed && { opacity: 0.85 }]}>
          <Icon name="check" size={22} color={palette.success} strokeWidth={3} /><Text style={[styles.swipeLabel, { color: palette.success }]}>Certo</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>Arraste a carta ou use os botões.</Text>
    </View>
  );
}

const makeStyles = (p: Palette) => StyleSheet.create({
  wrap: { gap: 18 },
  sentence: { color: p.text, fontSize: 20, lineHeight: 30, fontWeight: "800" },
  blank: { fontWeight: "900", textDecorationLine: "underline" },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  slot: { width: 42, height: 50, borderRadius: 12, borderWidth: 2, borderBottomWidth: 4, alignItems: "center", justifyContent: "center", backgroundColor: p.card },
  letter: { fontSize: 22, fontWeight: "900" },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingTop: 6 },
  tile: { width: 50, height: 54, borderRadius: 14, borderWidth: 2, borderBottomWidth: 5, borderColor: p.line, alignItems: "center", justifyContent: "center", backgroundColor: p.card },
  tileUsed: { opacity: 0.25 },
  tileText: { color: p.text, fontSize: 24, fontWeight: "900" },
  note: { fontSize: 15, fontWeight: "800", textAlign: "center" },
  hint: { color: p.textMuted, fontSize: 13, fontWeight: "700", textAlign: "center" },
  words: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  word: { minHeight: 46, paddingHorizontal: 12, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, alignItems: "center", justifyContent: "center", backgroundColor: p.card },
  wordText: { color: p.text, fontSize: 18, fontWeight: "800" },
  deck: { minHeight: 250, alignItems: "center", justifyContent: "center" },
  card: { width: "100%", minHeight: 230, padding: 22, borderRadius: 26, borderWidth: 2, borderBottomWidth: 6, borderColor: p.line, backgroundColor: p.card, justifyContent: "center", gap: 14 },
  cardQuestion: { color: p.textMuted, fontSize: 16, lineHeight: 22, fontWeight: "700", textAlign: "center" },
  cardDivider: { height: 2, borderRadius: 1, backgroundColor: p.line, alignSelf: "center", width: 48 },
  cardClaim: { color: p.text, fontSize: 24, lineHeight: 30, fontWeight: "900", textAlign: "center" },
  stamp: { position: "absolute", top: 14, borderWidth: 3, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 },
  stampRight: { left: 14, transform: [{ rotate: "-10deg" }] },
  stampLeft: { right: 14, transform: [{ rotate: "10deg" }] },
  stampText: { fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  swipeButtons: { flexDirection: "row", gap: 12 },
  swipeButton: { flex: 1, minHeight: 56, borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  swipeLabel: { fontSize: 17, fontWeight: "900" },
  summary: { fontSize: 28, fontWeight: "900", textAlign: "center" },
  fix: { gap: 4, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: p.line, backgroundColor: p.card },
  fixQuestion: { color: p.textMuted, fontSize: 14, lineHeight: 19, fontWeight: "700" },
  fixAnswer: { color: p.text, fontSize: 17, fontWeight: "900" }
});
