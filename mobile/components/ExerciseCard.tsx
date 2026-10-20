import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Exercise } from "../../src/types/content";
import { colors, radius, spacing } from "../theme/tokens";

interface ExerciseCardProps {
  exercise: Exercise;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  locked?: boolean;
}

export function ExerciseCard({ exercise, selectedIds, onChange, locked = false }: ExerciseCardProps) {
  if (exercise.type === "word-blocks") {
    const selectedBlocks = selectedIds
      .map((id) => exercise.blocks.find((block) => block.id === id))
      .filter((block): block is { id: string; text: string } => Boolean(block));

    return (
      <View style={styles.wrapper}>
        <Text style={styles.prompt}>Monte a frase na ordem correta.</Text>
        <View style={styles.answerArea}>
          {selectedBlocks.length === 0 ? (
            <Text style={styles.placeholder}>Toque nas palavras abaixo</Text>
          ) : selectedBlocks.map((block, index) => (
            <Pressable
              key={block.id}
              disabled={locked}
              onPress={() => onChange(selectedIds.filter((_, itemIndex) => itemIndex !== index))}
              style={styles.wordSelected}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${block.text}`}
            >
              <Text style={styles.wordText}>{block.text}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.wordList}>
          {exercise.blocks.map((block) => {
            const used = selectedIds.includes(block.id);
            return (
              <Pressable
                key={block.id}
                disabled={locked || used}
                onPress={() => onChange([...selectedIds, block.id])}
                style={[styles.word, used && styles.wordUsed]}
                accessibilityRole="button"
                accessibilityState={{ disabled: locked || used }}
              >
                <Text style={[styles.wordText, used && styles.wordUsedText]}>{block.text}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  const prompt = exercise.type === "fill-choice"
    ? `${exercise.sentenceBefore} _____ ${exercise.sentenceAfter}`
    : exercise.prompt;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.options}>
        {exercise.options.map((option, index) => {
          const selected = selectedIds[0] === option.id;
          return (
            <Pressable
              key={option.id}
              disabled={locked}
              onPress={() => onChange([option.id])}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && !locked && styles.optionPressed
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: locked }}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg
  },
  prompt: {
    color: colors.navy,
    fontSize: 22,
    lineHeight: 31,
    fontWeight: "800"
  },
  options: {
    gap: spacing.md
  },
  option: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  optionSelected: {
    borderColor: colors.teal,
    backgroundColor: "#e5f7f4"
  },
  optionPressed: {
    transform: [{ scale: 0.99 }]
  },
  optionLetter: {
    width: 30,
    color: colors.tealDark,
    fontWeight: "900",
    fontSize: 16
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600"
  },
  optionTextSelected: {
    color: colors.navy
  },
  answerArea: {
    minHeight: 90,
    padding: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radius.md
  },
  placeholder: {
    color: colors.muted,
    fontSize: 16
  },
  wordList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  word: {
    borderRadius: radius.sm,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  wordSelected: {
    borderRadius: radius.sm,
    backgroundColor: "#d8f2ee",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  wordUsed: {
    opacity: 0.35
  },
  wordText: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "700"
  },
  wordUsedText: {
    color: colors.muted
  }
});
