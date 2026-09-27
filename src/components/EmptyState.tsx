import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  testId?: string;
};

export function EmptyState({ title, message, icon, action, testId }: EmptyStateProps) {
  return (
    <div
      className="card flex flex-col items-center px-6 py-12 text-center"
      data-testid={testId}
    >
      <div className="grid size-12 place-items-center rounded-full bg-canvas text-muted">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-fg">{title}</p>
      {message ? <p className="mt-1 max-w-sm text-sm text-muted">{message}</p> : null}
      {action ? (
        action.href ? (
          <a href={action.href} className="btn btn-primary mt-5">
            {action.label}
          </a>
        ) : (
          <button type="button" onClick={action.onClick} className="btn btn-primary mt-5">
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
