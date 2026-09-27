import { Check, Sparkles } from "lucide-react";

type RevealAnswer = {
  label: string;
  value: string;
};

type RevealCardProps = {
  question: string;
  matched: boolean;
  answers: RevealAnswer[];
  matchedLabel?: string;
  differentLabel?: string;
  testId?: string;
};

export function RevealCard({
  question,
  matched,
  answers,
  matchedLabel = "Vous êtes alignés",
  differentLabel = "Vous avez choisi différemment.",
  testId,
}: RevealCardProps) {
  return (
    <div
      className="card animate-pop p-6 text-center"
      data-testid={testId}
      style={{
        borderColor: matched ? "color-mix(in oklab, var(--color-sage) 45%, transparent)" : undefined,
        backgroundColor: matched
          ? "color-mix(in oklab, var(--color-sage) 10%, var(--color-surface))"
          : undefined,
      }}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Question révélée</p>
      <p className="mt-2 text-sm leading-relaxed text-fg">{question}</p>

      <p
        data-testid={testId ? `${testId}-result` : undefined}
        className={`mt-4 font-display text-2xl font-semibold ${matched ? "text-sage" : "text-fg"}`}
      >
        {matched ? (
          <span className="inline-flex items-center gap-2">
            <Check className="size-6" /> {matchedLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-6 text-gold" /> {differentLabel}
          </span>
        )}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-left">
        {answers.map((answer) => (
          <div key={answer.label} className="rounded-2xl border border-line bg-canvas/60 px-3.5 py-3">
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{answer.label}</p>
            <p className="mt-1 text-sm font-medium text-fg">{answer.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
