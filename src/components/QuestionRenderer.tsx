"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, GripVertical, Check } from "lucide-react";
import { AnswerOption } from "@/components/AnswerOption";

type QuestionRendererProps = {
  question: {
    id: string;
    text: string;
    type: "single" | "multiple" | "scale" | "ranking" | "open" | "prediction";
    options: string[];
    scaleMin?: number;
    scaleMax?: number;
  };
  myAnswer?: string | string[] | number | null;
  disabled?: boolean;
  onAnswer: (answer: string | string[] | number) => void;
  testIdPrefix?: "answer" | "predict";
};

function SingleChoice({ question, myAnswer, disabled, onAnswer, testIdPrefix = "answer" }: QuestionRendererProps) {
  return (
    <div className="mt-5 flex flex-col gap-2.5">
      {question.options.map((option, index) => (
        <AnswerOption
          key={option}
          indicator={String.fromCharCode(65 + index)}
          selected={myAnswer === option}
          disabled={disabled}
          onClick={() => onAnswer(option)}
          testId={`${testIdPrefix}-option`}
        >
          {option}
        </AnswerOption>
      ))}
    </div>
  );
}

function MultipleChoice({ question, myAnswer, disabled, onAnswer, testIdPrefix = "answer" }: QuestionRendererProps) {
  const [selected, setSelected] = useState<string[]>(Array.isArray(myAnswer) ? myAnswer : []);

  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    setSelected(next);
    onAnswer(next);
  };

  return (
    <div className="mt-5 flex flex-col gap-2.5">
      <p className="text-xs text-muted">
        {selected.length} / {question.options.length} — plusieurs choix possibles
      </p>
      {question.options.map((option, index) => (
        <AnswerOption
          key={option}
          indicator={selected.includes(option) ? <Check className="size-3.5 text-sage" /> : String.fromCharCode(65 + index)}
          selected={selected.includes(option)}
          disabled={disabled}
          onClick={() => !disabled && toggle(option)}
          testId={`${testIdPrefix}-option`}
        >
          {option}
        </AnswerOption>
      ))}
    </div>
  );
}

function ScaleChoice({ question, myAnswer, disabled, onAnswer, testIdPrefix = "answer" }: QuestionRendererProps) {
  const min = question.scaleMin ?? 1;
  const max = question.scaleMax ?? 5;
  const value = typeof myAnswer === "number" ? myAnswer : min;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((v) => (
          <button
            key={v}
            type="button"
            data-testid={`${testIdPrefix}-option`}
            onClick={() => !disabled && onAnswer(v)}
            disabled={disabled}
            className={`btn btn-secondary w-full h-12 text-lg font-semibold ${
              value === v ? "bg-accent text-white border-accent" : "bg-canvas/60 border-line"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{min} — Pas du tout</span>
        <span>{max} — Énormément</span>
      </div>
    </div>
  );
}

function RankingChoice({ question, myAnswer, disabled, onAnswer, testIdPrefix = "answer" }: QuestionRendererProps) {
  const [ranked, setRanked] = useState<string[]>(
    Array.isArray(myAnswer) && myAnswer.length === question.options.length
      ? myAnswer
      : [...question.options].sort(() => Math.random() - 0.5)
  );

  const move = (index: number, direction: -1 | 1) => {
    const next = [...ranked];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRanked(next);
    onAnswer(next);
  };

  return (
    <div className="mt-5 flex flex-col gap-2">
      <p className="text-xs text-muted">Glisse pour classer (1 = favori)</p>
      {ranked.map((option, i) => (
        <div
          key={option}
          className="btn btn-secondary flex items-center gap-3"
          data-testid={`${testIdPrefix}-option`}
        >
          <span className="grid size-8 place-items-center rounded-full border border-line text-[0.7rem] font-semibold text-muted">
            {i + 1}
          </span>
          <span className="flex-1 text-left">{option}</span>
          <button
            type="button"
            onClick={() => !disabled && move(i, -1)}
            disabled={disabled || i === 0}
            className="btn btn-ghost btn-sm"
            aria-label="Monter"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => !disabled && move(i, 1)}
            disabled={disabled || i === ranked.length - 1}
            className="btn btn-ghost btn-sm"
            aria-label="Descendre"
          >
            <ChevronDown className="size-4" />
          </button>
          <GripVertical className="size-4 text-muted" />
        </div>
      ))}
    </div>
  );
}

function OpenChoice({ question, myAnswer, disabled, onAnswer, testIdPrefix = "answer" }: QuestionRendererProps) {
  const [text, setText] = useState<string>(typeof myAnswer === "string" ? myAnswer : "");

  return (
    <div className="mt-5">
      <textarea
        data-testid={`${testIdPrefix}-option`}
        value={text}
        onChange={(e) => { setText(e.target.value); onAnswer(e.target.value); }}
        disabled={disabled}
        rows={4}
        placeholder="Votre réponse libre..."
        className="input w-full resize-y"
      />
      <p className="mt-1 text-xs text-muted">{text.length} / 500 caractères</p>
    </div>
  );
}

export function QuestionRenderer({
  question,
  myAnswer,
  disabled,
  onAnswer,
  testIdPrefix = "answer",
}: QuestionRendererProps) {
  switch (question.type) {
    case "single":
    case "prediction":
      return <SingleChoice question={question} myAnswer={myAnswer as string | null} disabled={disabled} onAnswer={onAnswer} testIdPrefix={testIdPrefix} />;
    case "multiple":
      return <MultipleChoice question={question} myAnswer={myAnswer as string[] | null} disabled={disabled} onAnswer={onAnswer} testIdPrefix={testIdPrefix} />;
    case "scale":
      return <ScaleChoice question={question} myAnswer={myAnswer as number | null} disabled={disabled} onAnswer={onAnswer} testIdPrefix={testIdPrefix} />;
    case "ranking":
      return <RankingChoice question={question} myAnswer={myAnswer as string[] | null} disabled={disabled} onAnswer={onAnswer} testIdPrefix={testIdPrefix} />;
    case "open":
      return <OpenChoice question={question} myAnswer={myAnswer as string | null} disabled={disabled} onAnswer={onAnswer} testIdPrefix={testIdPrefix} />;
    default:
      return <SingleChoice question={question} myAnswer={myAnswer as string | null} disabled={disabled} onAnswer={onAnswer} testIdPrefix={testIdPrefix} />;
  }
}