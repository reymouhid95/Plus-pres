import { Check } from "lucide-react";

type ChallengeCardProps = {
  title: string;
  description?: string | null;
  completed?: boolean;
  completedAt?: string | null;
  testId?: string;
};

export function ChallengeCard({ title, description, completed = false, completedAt, testId }: ChallengeCardProps) {
  return (
    <article
      className={`card flex items-start gap-3 p-4 ${completed ? "border-sage/40 bg-sage/5" : ""}`}
      data-testid={testId}
    >
      <span
        aria-hidden
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${
          completed ? "border-sage bg-sage text-white" : "border-line text-muted"
        }`}
      >
        {completed ? <Check className="size-3.5" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${completed ? "text-sage" : "text-fg"}`}>{title}</p>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
        <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
          {completed ? `Accompli${completedAt ? ` — ${completedAt}` : ""}` : "À faire"}
        </p>
      </div>
    </article>
  );
}
