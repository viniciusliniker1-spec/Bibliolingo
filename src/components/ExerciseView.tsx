import { useEffect, useMemo, useState } from "react";
import type { Exercise } from "../types/content";

interface ExerciseViewProps {
  exercise: Exercise;
  result?: boolean;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
  continueLabel?: string;
  successXp?: string;
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
  successXp = "+5 XP"
}: ExerciseViewProps) {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const answered = typeof result === "boolean";

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
    if (canSubmit && !answered) onAnswer(isCorrect);
  };

  return (
    <section className="exercise-card" aria-labelledby={"prompt-" + exercise.id}>
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
          <div className="sentence-zone" aria-label="Frase montada">
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
          {exercise.options.map((option) => (
            <button
              type="button"
              key={option.id}
              disabled={answered}
              className={"answer-option " + (selectedOption === option.id ? "selected" : "")}
              aria-pressed={selectedOption === option.id}
              onClick={() => setSelectedOption(option.id)}
            >
              <span className="option-marker" aria-hidden="true" />
              {option.text}
            </button>
          ))}
        </div>
      )}

      {answered ? (
        <div className={"feedback " + (result ? "correct" : "incorrect")} aria-live="polite">
          <div className="feedback-title">
            <span aria-hidden="true">{result ? "✓" : "!"}</span>
            {result ? "Resposta correta" : "Vamos aprender com este erro"}
          </div>
          {!result && <p><strong>Resposta correta:</strong> {correctAnswer(exercise)}</p>}
          <p>{exercise.explanation}</p>
          <p className="reference">{exercise.reference.label}</p>
          <div className="feedback-xp">{result ? successXp : "Pergunta adicionada à revisão"}</div>
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
