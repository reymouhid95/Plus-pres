"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";

type AnswerOptionProps = {
  children: ReactNode;
  indicator?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
  className?: string;
};

export function AnswerOption({
  children,
  indicator,
  selected = false,
  disabled = false,
  onClick,
  testId,
  className = "",
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`btn btn-secondary justify-start text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ${
        selected
          ? "border-accent/60 bg-accent/10 shadow-sm"
          : "border-line bg-canvas/60 disabled:opacity-60"
      } ${className}`}
    >
      {indicator !== undefined ? (
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full border text-[0.7rem] font-semibold transition-colors duration-200 ${
            selected ? "border-accent/60 text-accent" : "border-line text-muted"
          }`}
        >
          {indicator}
        </span>
      ) : null}
      {children}
      {selected && indicator === undefined ? <Check className="ml-auto size-4 text-sage" /> : null}
    </button>
  );
}
