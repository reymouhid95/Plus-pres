import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <p className="text-sm text-muted">© {new Date().getFullYear()} Plus Près</p>
        <nav aria-label="Liens légaux" className="flex items-center gap-5">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted transition hover:text-fg">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
