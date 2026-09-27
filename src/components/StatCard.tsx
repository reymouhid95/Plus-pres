type StatCardProps = {
  label: string;
  value: string | number;
  caption?: string;
  testId?: string;
};

export function StatCard({ label, value, caption, testId }: StatCardProps) {
  return (
    <div className="card p-3.5 text-center sm:p-4" data-testid={testId}>
      <p className="font-display text-2xl font-semibold text-fg">{value}</p>
      <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-muted">{label}</p>
      {caption ? <p className="mt-1 text-xs text-muted">{caption}</p> : null}
    </div>
  );
}
