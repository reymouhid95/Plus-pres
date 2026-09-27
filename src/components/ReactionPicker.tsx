"use client";

import { REACTION_EMOJIS } from "@/lib/interactions";

type ReactionPickerProps = {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  label?: string;
  testId?: string;
  className?: string;
};

export function ReactionPicker({
  onSelect,
  disabled = false,
  label = "Réagir à la réponse",
  testId,
  className = "",
}: ReactionPickerProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-testid={testId}
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`Réagir ${emoji}`}
          onClick={() => onSelect(emoji)}
          disabled={disabled}
          className="grid size-10 place-items-center rounded-full border border-line bg-canvas/60 text-lg transition hover:border-accent/50 hover:bg-accent/10 disabled:opacity-50"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
