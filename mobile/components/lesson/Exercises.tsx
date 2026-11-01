import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Exercise, FillChoiceExercise, MultipleChoiceExercise, WordBlocksExercise } from "../../../src/types/content";
import type { MatchPair, OrderItem, PassageOption, TrueFalseSetup } from "../../domain/lessonPlan";
import { shuffledRights } from "../../domain/lessonPlan";
import { usePalette, useThemedStyles } from "../../providers/ThemeProvider";
import type { Palette } from "../../theme/tokens";
import { Icon } from "../navigation/Icons";

export type AnswerState = "idle" | "correct" | "wrong";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Múltipla escolha em cartões com letra. */
export function ChoiceExercise({ exercise, selectedIds, onSelect, answer }: { exercise: MultipleChoiceExercise; selectedIds: string[]; onSelect: (ids: string[]) => void; answer: AnswerState }) {
  const styles = useThemedStyles(makeStyles);
  const locked = answer !== "idle";
  return (
    <View style={styles.options}>
      {exercise.options.map((option, index) => {
        const selected = selectedIds[0] === option.id;
        const isCorrect = option.id === exercise.correctOptionId;
        const state = !locked ? (selected ? "selected" : "idle") : isCorrect ? "correct" : selected ? "wrong" : "dim";
        return (
          <OptionCard key={option.id} letter={LETTERS[index]} text={option.text} state={state} disabled={locked} onPress={() => onSelect([option.id])} />
        );
      })}
    </View>
  );
}

type OptionState = "idle" | "selected" | "correct" | "wrong" | "dim";

function OptionCard({ letter, text, state, disabled, onPress }: { letter?: string; text: string; state: OptionState; disabled?: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const scale = useRef(new Animated.Value(1)).current;
  const border = state === "selected" ? palette.accent : state === "correct" ? palette.success : state === "wrong" ? palette.error : palette.line;
  const background = state === "selected" ? palette.activeTabBg : state === "correct" ? palette.successSoft : state === "wrong" ? palette.errorSoft : palette.card;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: state === "selected", disabled }}
        accessibilityLabel={`${letter ? `Alternativa ${letter}: ` : ""}${text}${state === "correct" ? ", resposta correta" : state === "wrong" ? ", resposta errada" : ""}`}
        disabled={disabled}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
        onPress={onPress}
        style={[styles.option, { borderColor: border, backgroundColor: background, borderBottomColor: state === "idle" || state === "dim" ? palette.line : border }, state === "dim" && styles.dim]}
      >
        {letter ? (
          <View style={[styles.letter, { borderColor: border, backgroundColor: state === "selected" ? palette.accent : "transparent" }]}>
            {state === "correct" ? <Icon name="check" size={16} color={palette.success} strokeWidth={3.2} />
              : state === "wrong" ? <Icon name="close" size={16} color={palette.error} strokeWidth={3.2} />
                : <Text style={[styles.letterText, state === "selected" && { color: palette.isDark ? palette.ctaText : "#ffffff" }]}>{letter}</Text>}
          </View>
        ) : null}
        <Text style={styles.optionText}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Certo ou errado? — uma resposta para julgar, com dois botões grandes. */
export function TrueFalseExercise({ setup, selectedIds, onAnswer, answer }: { setup: TrueFalseSetup; selectedIds: string[]; onAnswer: (value: "true" | "false") => void; answer: AnswerState }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const locked = answer !== "idle";
  const chosen = selectedIds[0];
  return (
    <View style={styles.tfWrap}>
      <View style={styles.tfQuote}>
        <Text style={styles.tfQuoteMark}>“</Text>
        <Text style={styles.tfQuoteText}>{setup.optionText}</Text>
      </View>
      <View style={styles.tfButtons}>
        {(["true", "false"] as const).map((value) => {
          const isRight = (value === "true") === setup.isTrue;
          const state = !locked ? "idle" : isRight ? "correct" : chosen === value ? "wrong" : "dim";
          const tint = value === "true" ? palette.success : palette.error;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={value === "true" ? "Certo" : "Errado"}
              disabled={locked}
              onPress={() => onAnswer(value)}
              style={({ pressed }) => [styles.tfButton, { borderColor: state === "idle" ? tint : state === "correct" ? palette.success : state === "wrong" ? palette.error : palette.line, backgroundColor: state === "correct" ? palette.successSoft : state === "wrong" ? palette.errorSoft : palette.card }, state === "dim" && styles.dim, pressed && { transform: [{ translateY: 3 }] }]}
            >
              <View style={[styles.tfIcon, { backgroundColor: tint }]}><Icon name={value === "true" ? "check" : "close"} size={26} color="#ffffff" strokeWidth={3.4} /></View>
              <Text style={[styles.tfLabel, { color: tint }]}>{value === "true" ? "Certo" : "Errado"}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Complete a frase: lacuna dentro do texto e palavras para tocar. */
export function FillExercise({ exercise, selectedIds, onSelect, answer }: { exercise: FillChoiceExercise; selectedIds: string[]; onSelect: (ids: string[]) => void; answer: AnswerState }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const locked = answer !== "idle";
  const chosen = exercise.options.find((option) => option.id === selectedIds[0]);
  const blankColor = answer === "correct" ? palette.success : answer === "wrong" ? palette.error : palette.accent;
  return (
    <View style={styles.fillWrap}>
      <Text style={styles.sentence}>
        {exercise.sentenceBefore}{" "}
        <Text style={[styles.blank, { color: blankColor, borderColor: blankColor }]}>{chosen ? ` ${chosen.text} ` : " ______ "}</Text>
        {" "}{exercise.sentenceAfter}
      </Text>
      <View style={styles.chips}>
        {exercise.options.map((option) => {
          const selected = option.id === selectedIds[0];
          const isCorrect = option.id === exercise.correctOptionId;
          const state = !locked ? (selected ? "selected" : "idle") : isCorrect ? "correct" : selected ? "wrong" : "dim";
          return (
            <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: selected }} disabled={locked} onPress={() => onSelect([option.id])}
              style={[styles.chip, state === "selected" && { borderColor: palette.accent, backgroundColor: palette.activeTabBg }, state === "correct" && { borderColor: palette.success, backgroundColor: palette.successSoft }, state === "wrong" && { borderColor: palette.error, backgroundColor: palette.errorSoft }, state === "dim" && styles.dim]}>
              <Text style={styles.chipText}>{option.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Monte a frase com blocos de palavras. */
export function BlocksExercise({ exercise, selectedIds, onSelect, answer }: { exercise: WordBlocksExercise; selectedIds: string[]; onSelect: (ids: string[]) => void; answer: AnswerState }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const locked = answer !== "idle";
  const placed = selectedIds.map((id) => exercise.blocks.find((block) => block.id === id)).filter((block): block is { id: string; text: string } => Boolean(block));
  const lineColor = answer === "correct" ? palette.success : answer === "wrong" ? palette.error : palette.line;
  return (
    <View style={styles.blocksWrap}>
      <View style={[styles.answerLine, { borderColor: lineColor }]}>
        {placed.length === 0 ? <Text style={styles.placeholder}>Toque nas palavras na ordem certa</Text> : placed.map((block, index) => (
          <Pressable key={block.id} accessibilityRole="button" accessibilityLabel={`Remover ${block.text}`} disabled={locked} onPress={() => onSelect(selectedIds.filter((_, i) => i !== index))} style={styles.tile}>
            <Text style={styles.tileText}>{block.text}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.bank}>
        {exercise.blocks.map((block) => {
          const used = selectedIds.includes(block.id);
          return (
            <Pressable key={block.id} accessibilityRole="button" accessibilityState={{ disabled: locked || used }} disabled={locked || used} onPress={() => onSelect([...selectedIds, block.id])} style={[styles.tile, used && styles.tileUsed]}>
              <Text style={[styles.tileText, used && { color: "transparent" }]}>{block.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Ligue os pares: toque numa pergunta e depois na resposta. */
export function MatchExercise({ pairs, seed, onPair, onDone }: { pairs: MatchPair[]; seed: string; onPair: (correct: boolean) => void; onDone: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const rights = useMemo(() => shuffledRights(pairs, seed), [pairs, seed]);
  const [leftId, setLeftId] = useState<string>();
  const [rightId, setRightId] = useState<string>();
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!leftId || !rightId) return;
    const ok = leftId === rightId;
    onPair(ok);
    if (ok) {
      const next = [...matched, leftId];
      setMatched(next);
      if (next.length === pairs.length) setTimeout(onDone, 350);
    } else {
      setWrong([leftId, "r:" + rightId]);
      Animated.sequence([-8, 8, -6, 6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 45, useNativeDriver: true }))).start();
      setTimeout(() => setWrong([]), 450);
    }
    setLeftId(undefined); setRightId(undefined);
  }, [leftId, rightId]); // eslint-disable-line react-hooks/exhaustive-deps

  const tone = (id: string, side: "l" | "r") => {
    const key = side === "l" ? id : "r:" + id;
    if (matched.includes(id)) return { borderColor: palette.success, backgroundColor: palette.successSoft, opacity: 0.55 };
    if (wrong.includes(key)) return { borderColor: palette.error, backgroundColor: palette.errorSoft };
    if ((side === "l" ? leftId : rightId) === id) return { borderColor: palette.accent, backgroundColor: palette.activeTabBg };
    return null;
  };
  return (
    <Animated.View style={[styles.matchWrap, { transform: [{ translateX: shake }] }]}>
      <View style={styles.matchColumn}>
        {pairs.map((pair) => (
          <Pressable key={pair.id} accessibilityRole="button" accessibilityState={{ selected: leftId === pair.id, disabled: matched.includes(pair.id) }} disabled={matched.includes(pair.id)} onPress={() => setLeftId(pair.id)} style={[styles.matchCard, tone(pair.id, "l")]}>
            <Text style={styles.matchLeftText}>{pair.left}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.matchRights}>
        {rights.map((pair) => (
          <Pressable key={pair.id} accessibilityRole="button" accessibilityState={{ selected: rightId === pair.id, disabled: matched.includes(pair.id) }} disabled={matched.includes(pair.id)} onPress={() => setRightId(pair.id)} style={[styles.matchChip, tone(pair.id, "r")]}>
            {matched.includes(pair.id) ? <Icon name="check" size={14} color={palette.success} strokeWidth={3} /> : null}
            <Text style={styles.matchRightText}>{pair.right}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

/** Digite a resposta: lembrar sem ver as opções. Acentos e maiúsculas não contam. */
export function TypeExercise({ exercise, value, onChange, onSubmit, answer }: { exercise: FillChoiceExercise; value: string; onChange: (text: string) => void; onSubmit: () => void; answer: AnswerState }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const locked = answer !== "idle";
  const tone = answer === "correct" ? palette.success : answer === "wrong" ? palette.error : palette.accent;
  return (
    <View style={styles.fillWrap}>
      <Text style={styles.sentence}>
        {exercise.sentenceBefore}{" "}
        <Text style={[styles.blank, { color: tone, borderColor: tone }]}>{value.trim() ? ` ${value.trim()} ` : " ______ "}</Text>
        {" "}{exercise.sentenceAfter}
      </Text>
      <View style={[styles.typeBox, { borderColor: locked ? tone : palette.line }]}>
        <Icon name="edit" size={20} color={palette.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={!locked}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          placeholder="Digite a palavra"
          placeholderTextColor={palette.textMuted}
          accessibilityLabel="Sua resposta"
          style={styles.typeInput}
        />
      </View>
      <Text style={styles.typeHint}>Dica: começa com “{exerciseFirstLetter(exercise)}” · {exerciseAnswerLength(exercise)} letras</Text>
    </View>
  );
}

function correctFillText(exercise: FillChoiceExercise) {
  return exercise.options.find((option) => option.id === exercise.correctOptionId)?.text.trim() ?? "";
}
function exerciseFirstLetter(exercise: FillChoiceExercise) { return correctFillText(exercise).charAt(0).toLocaleUpperCase("pt-BR"); }
function exerciseAnswerLength(exercise: FillChoiceExercise) { return [...correctFillText(exercise)].length; }

/** Ordene os acontecimentos: toque na ordem em que aconteceram. */
export function OrderExercise({ items, correctOrder, onDone }: { items: OrderItem[]; correctOrder: string[]; onDone: (correct: boolean) => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [sequence, setSequence] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const toggle = (id: string) => {
    if (checked) return;
    const next = sequence.includes(id) ? sequence.filter((item) => item !== id) : [...sequence, id];
    setSequence(next);
    if (next.length === items.length) {
      const ok = next.every((item, index) => item === correctOrder[index]);
      setChecked(true);
      if (!ok) Animated.sequence([-8, 8, -6, 6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 45, useNativeDriver: true }))).start();
      onDone(ok);
    }
  };
  return (
    <Animated.View style={[styles.orderWrap, { transform: [{ translateX: shake }] }]}>
      {items.map((item) => {
        const position = sequence.indexOf(item.id);
        const right = correctOrder.indexOf(item.id);
        const ok = checked && position === right;
        const color = !checked ? (position >= 0 ? palette.accent : palette.line) : ok ? palette.success : palette.error;
        return (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.text}${position >= 0 ? `, posição ${position + 1}` : ""}`} disabled={checked} onPress={() => toggle(item.id)}
            style={[styles.orderCard, { borderColor: color }, position >= 0 && !checked && { backgroundColor: palette.activeTabBg }, checked && { backgroundColor: ok ? palette.successSoft : palette.errorSoft }]}>
            <View style={[styles.orderBadge, { borderColor: color, backgroundColor: position >= 0 ? color : "transparent" }]}>
              <Text style={[styles.orderBadgeText, position >= 0 && { color: "#ffffff" }]}>{position >= 0 ? position + 1 : ""}</Text>
            </View>
            <Text style={styles.orderText}>{item.text}</Text>
            {checked && !ok ? <Text style={styles.orderFix}>{right + 1}º</Text> : null}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

/** Em qual passagem? Um fato da lição e três referências. */
export function PassageExercise({ statement, options, correctId, onDone }: { statement: string; options: PassageOption[]; correctId: string; onDone: (correct: boolean) => void }) {
  const styles = useThemedStyles(makeStyles);
  const palette = usePalette();
  const [picked, setPicked] = useState<string>();
  return (
    <View style={styles.tfWrap}>
      <View style={styles.tfQuote}>
        <Text style={styles.tfQuoteMark}>“</Text>
        <Text style={styles.tfQuoteText}>{statement}</Text>
      </View>
      <View style={styles.options}>
        {options.map((option) => {
          const state: OptionState = !picked ? "idle" : option.id === correctId ? "correct" : option.id === picked ? "wrong" : "dim";
          return (
            <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: picked === option.id }} disabled={Boolean(picked)} onPress={() => { setPicked(option.id); onDone(option.id === correctId); }}
              style={[styles.passage, state === "correct" && { borderColor: palette.success, backgroundColor: palette.successSoft }, state === "wrong" && { borderColor: palette.error, backgroundColor: palette.errorSoft }, state === "dim" && styles.dim]}>
              <Icon name="book" size={20} color={state === "correct" ? palette.success : state === "wrong" ? palette.error : palette.accent} />
              <Text style={styles.passageText}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function exerciseTitle(presentation: string) {
  switch (presentation) {
    case "true-false": return "Certo ou errado?";
    case "fill": return "Complete a frase";
    case "type": return "Digite a resposta";
    case "blocks": return "Monte a frase";
    case "match": return "Ligue os pares";
    case "order": return "Ordene os acontecimentos";
    case "passage": return "Em qual passagem?";
    default: return "Escolha a resposta";
  }
}

export function isChoice(exercise: Exercise): exercise is MultipleChoiceExercise { return exercise.type === "multiple-choice"; }

const makeStyles = (p: Palette) => StyleSheet.create({
  options: { gap: 12 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 62, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, borderWidth: 2, borderBottomWidth: 5 },
  dim: { opacity: 0.45 },
  letter: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  letterText: { color: p.textMuted, fontWeight: "900", fontSize: 14 },
  optionText: { flex: 1, color: p.text, fontSize: 17, fontWeight: "700", lineHeight: 23 },
  tfWrap: { gap: 18 },
  tfQuote: { flexDirection: "row", gap: 8, padding: 18, borderRadius: 20, backgroundColor: p.card, borderWidth: 1, borderColor: p.line },
  tfQuoteMark: { color: p.accent, fontSize: 44, lineHeight: 44, fontWeight: "900" },
  tfQuoteText: { flex: 1, color: p.text, fontSize: 20, lineHeight: 28, fontWeight: "800", paddingTop: 6 },
  tfButtons: { flexDirection: "row", gap: 12 },
  tfButton: { flex: 1, alignItems: "center", gap: 10, paddingVertical: 18, borderRadius: 20, borderWidth: 2, borderBottomWidth: 6 },
  tfIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  tfLabel: { fontSize: 18, fontWeight: "900" },
  fillWrap: { gap: 22 },
  sentence: { color: p.text, fontSize: 21, lineHeight: 34, fontWeight: "700" },
  blank: { fontWeight: "900", borderBottomWidth: 2, textDecorationLine: "underline" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { minHeight: 48, justifyContent: "center", paddingHorizontal: 16, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  chipText: { color: p.text, fontSize: 16, fontWeight: "800" },
  blocksWrap: { gap: 22 },
  answerLine: { minHeight: 110, flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", gap: 8, padding: 12, borderRadius: 18, borderWidth: 2, borderStyle: "dashed" },
  placeholder: { color: p.textMuted, fontSize: 15, fontWeight: "600" },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  tile: { minHeight: 46, justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  tileUsed: { backgroundColor: p.divider, borderColor: p.divider },
  tileText: { color: p.text, fontSize: 16, fontWeight: "800" },
  matchWrap: { gap: 16 },
  matchColumn: { gap: 8 },
  matchCard: { minHeight: 56, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, borderColor: p.line, backgroundColor: p.card },
  matchLeftText: { color: p.text, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  matchRights: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  matchChip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 46, paddingHorizontal: 14, borderRadius: 23, borderWidth: 2, borderBottomWidth: 4, borderColor: p.accent, backgroundColor: p.card },
  matchRightText: { color: p.text, fontSize: 15, fontWeight: "900" },
  typeBox: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 60, paddingHorizontal: 16, borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, backgroundColor: p.card },
  typeInput: { flex: 1, color: p.text, fontSize: 20, fontWeight: "800", paddingVertical: 12 },
  typeHint: { color: p.textMuted, fontSize: 14, fontWeight: "700" },
  orderWrap: { gap: 10 },
  orderCard: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, backgroundColor: p.card },
  orderBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  orderBadgeText: { color: p.textMuted, fontSize: 15, fontWeight: "900" },
  orderText: { flex: 1, color: p.text, fontSize: 16, fontWeight: "800", lineHeight: 22 },
  orderFix: { color: p.success, fontSize: 15, fontWeight: "900" },
  passage: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58, paddingHorizontal: 16, borderRadius: 18, borderWidth: 2, borderBottomWidth: 5, borderColor: p.line, backgroundColor: p.card },
  passageText: { flex: 1, color: p.text, fontSize: 17, fontWeight: "900" }
});
