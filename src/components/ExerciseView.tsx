import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playFeedbackSound } from "../services/feedbackSound";
import { playHapticFeedback } from "../services/haptics";
import type { Exercise } from "../types/content";

interface ExerciseViewProps {
  exercise: Exercise;
  result?: boolean;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
  continueLabel?: string;
  successXp?: string;
  referenceHref?: string;
  onPreviewReference?: () => void;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  failureNote?: string;
}

function correctAnswer(exercise: Exercise): string {
  if (exercise.type === "word-blocks") {
    return exercise.correctOrder
      .map((id) => exercise.blocks.find((block) => block.id === id)?.text ?? "")
      .join(" ");
  }
  return exercise.options.find((option) => option.id === exercise.correctOptionId)?.text ?? "";
}

export function ExerciseView({
  exercise,
  result,
  onAnswer,
  onContinue,
  continueLabel = "Continuar",
  successXp = "+5 XP",
  referenceHref,
  onPreviewReference,
  soundEnabled = true,
  hapticsEnabled = true,
  failureNote = "Pergunta adicionada à revisão"
}: ExerciseViewProps) {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const answered = typeof result === "boolean";
  const selectedFeedback =
    exercise.type !== "word-blocks" && selectedOption
      ? exercise.optionExplanations?.[selectedOption]
      : undefined;

  useEffect(() => {
    setSelectedOption(undefined);
    setSelectedBlocks([]);
  }, [exercise.id]);

  const canSubmit =
    exercise.type === "word-blocks" ? selectedBlocks.length === exercise.blocks.length : Boolean(selectedOption);

  const isCorrect = useMemo(() => {
    if (exercise.type === "word-blocks") {
      return (
        selectedBlocks.length === exercise.correctOrder.length &&
        selectedBlocks.every((id, index) => id === exercise.correctOrder[index])
      );
    }
    return selectedOption === exercise.correctOptionId;
  }, [exercise, selectedBlocks, selectedOption]);

  const submit = () => {
    if (!canSubmit || answered) return;
    const kind = isCorrect ? "correct" : "incorrect";
    if (soundEnabled) void playFeedbackSound(kind);
    if (hapticsEnabled) playHapticFeedback(kind);
    onAnswer(isCorrect);
  };

  const optionClass = (optionId: string) => {
    if (!answered) return selectedOption === optionId ? "selected" : "";
    if (exercise.type === "word-blocks") return "";
    if (optionId === exercise.correctOptionId) return "correct-answer";
    if (optionId === selectedOption) return "wrong-answer";
    return "";
  };

  return (
    <section className={"exercise-card " + (answered ? (result ? "answered-correct" : "answered-incorrect") : "")} aria-labelledby={"prompt-" + exercise.id}>
      <div className="eyebrow">
        {exercise.type === "multiple-choice"
          ? "Múltipla escolha"
          : exercise.type === "fill-choice"
            ? "Complete a frase"
            : "Monte a frase"}
        <span className={"difficulty " + exercise.difficulty}>{exercise.difficulty}</span>
      </div>

      <h2 id={"prompt-" + exercise.id}>{exercise.prompt}</h2>

      {exercise.type === "fill-choice" && (
        <p className="fill-sentence">
          {exercise.sentenceBefore} <strong>{selectedOption ? exercise.options.find((item) => item.id === selectedOption)?.text : "______"}</strong>
          {exercise.sentenceAfter}
        </p>
      )}

      {exercise.type === "word-blocks" ? (
        <>
          <div className={"sentence-zone " + (answered ? (result ? "correct-order" : "wrong-order") : "")} aria-label="Frase montada">
            {selectedBlocks.length === 0 && <span>Toque nas palavras para montar a frase</span>}
            {selectedBlocks.map((id) => {
              const block = exercise.blocks.find((item) => item.id === id);
              return (
                <button
                  type="button"
                  className="word-chip selected"
                  key={id}
                  disabled={answered}
                  onClick={() => setSelectedBlocks((items) => items.filter((item) => item !== id))}
                >
                  {block?.text}
                </button>
              );
            })}
            {answered && <span className="sentence-result" aria-label={result ? "Ordem correta" : "Ordem incorreta"}>{result ? "✓" : "×"}</span>}
          </div>
          <div className="word-bank">
            {exercise.blocks.map((block) => {
              const used = selectedBlocks.includes(block.id);
              return (
                <button
                  type="button"
                  className="word-chip"
                  key={block.id}
                  disabled={answered || used}
                  aria-pressed={used}
                  onClick={() => setSelectedBlocks((items) => [...items, block.id])}
                >
                  {block.text}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="answer-grid" role="group" aria-label="Alternativas">
          {exercise.options.map((option) => {
            const stateClass = optionClass(option.id);
            const isRightAnswer = answered && option.id === exercise.correctOptionId;
            const isWrongSelection = answered && option.id === selectedOption && !isCorrect;
            return (
              <button
                type="button"
                key={option.id}
                disabled={answered}
                className={"answer-option " + stateClass}
                aria-pressed={selectedOption === option.id}
                onClick={() => setSelectedOption(option.id)}
              >
                <span className="option-marker" aria-hidden="true">
                  {isRightAnswer ? "✓" : isWrongSelection ? "×" : ""}
                </span>
                <span>{option.text}</span>
                {isRightAnswer && <span className="sr-only">Resposta correta</span>}
                {isWrongSelection && <span className="sr-only">Sua resposta incorreta</span>}
              </button>
            );
          })}
        </div>
      )}

      {answered ? (
        <div className={"feedback " + (result ? "correct" : "incorrect")} aria-live="polite">
          {result && <div className="feedback-spark" aria-hidden="true">✦</div>}
          <div className="feedback-title">
            <span aria-hidden="true">{result ? "✓" : "!"}</span>
            {result ? "Resposta correta" : "Vamos aprender com este erro"}
          </div>
          {!result && <p><strong>Resposta correta:</strong> {correctAnswer(exercise)}</p>}
          <p>{!result && selectedFeedback ? selectedFeedback : exercise.explanation}</p>
          {!result && selectedFeedback && <p><strong>Por que a correta é adequada:</strong> {exercise.explanation}</p>}
          {onPreviewReference ? (
            <button type="button" className="reference reference-link" onClick={onPreviewReference}>
              <span aria-hidden="true">▣</span>
              <span>{exercise.reference.label}</span>
              <small>Ler sem sair →</small>
            </button>
          ) : referenceHref ? (
            <Link className="reference reference-link" to={referenceHref}>
              <span aria-hidden="true">▣</span>
              <span>{exercise.reference.label}</span>
              <small>Abrir na Bíblia →</small>
            </Link>
          ) : (
            <p className="reference">{exercise.reference.label}</p>
          )}
          <div className="feedback-xp">{result ? successXp : failureNote}</div>
          <button type="button" className="primary-button" onClick={onContinue}>
            {continueLabel}
          </button>
        </div>
      ) : (
        <button type="button" className="primary-button sticky-action" disabled={!canSubmit} onClick={submit}>
          Verificar
        </button>
      )}
    </section>
  );
}
