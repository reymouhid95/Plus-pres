type MomentCardProps = {
  title: string;
  content?: string | null;
  date?: string;
  questionLabel?: string;
  testId?: string;
};

export function MomentCard({ title, content, date, questionLabel, testId }: MomentCardProps) {
  return (
    <article className="card p-5" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-fg">{title}</h3>
        {date ? <time className="shrink-0 text-xs text-muted">{date}</time> : null}
      </div>
      {content ? <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{content}</p> : null}
      {questionLabel ? <p className="mt-3 text-xs italic text-muted">« {questionLabel} »</p> : null}
    </article>
  );
}
