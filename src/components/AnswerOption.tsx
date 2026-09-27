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
      className={`btn btn-secondary justify-start text-left disabled:opacity-60 ${
        selected ? "border-accent/60 bg-accent/10" : "border-line bg-canvas/60"
      } ${className}`}
    >
      {indicator !== undefined ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-[0.7rem] font-semibold text-muted">
          {indicator}
        </span>
      ) : null}
      {children}
      {selected && indicator === undefined ? <Check className="ml-auto size-4 text-sage" /> : null}
    </button>
  );
}
