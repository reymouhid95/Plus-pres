import type { ReactNode } from "react";

type QuestionCardProps = {
  text: string;
  badge?: string;
  hint?: string;
  children?: ReactNode;
  footer?: ReactNode;
  testId?: string;
};

export function QuestionCard({ text, badge, hint, children, footer, testId }: QuestionCardProps) {
  return (
    <div className="card p-5 sm:p-6" data-testid={testId}>
      {badge ? <span className="badge">{badge}</span> : null}
      <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-fg sm:text-2xl">
        {text}
      </h2>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
      {children}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}
