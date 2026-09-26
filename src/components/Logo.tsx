import Link from "next/link";

export default function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span className="gradient-brand grid size-9 place-items-center rounded-[13px] font-display text-[13px] font-semibold tracking-tight text-cream shadow-glow transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        PP
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-fg">Plus Près</span>
      )}
    </Link>
  );
}
