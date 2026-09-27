import Link from "next/link";
import { UserRound } from "lucide-react";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/notre-histoire", label: "Notre histoire" },
] as const;

export default function AppHeader({
  user,
}: {
  user: { name?: string | null; avatar?: string | null };
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-4">
          <Logo href="/dashboard" />
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="btn btn-ghost btn-sm">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/profile" className="btn btn-ghost btn-sm">
            <span className="grid size-7 place-items-center rounded-full gradient-brand-soft text-sm leading-none">
              {user.avatar ?? <UserRound className="size-3.5 text-accent" />}
            </span>
            <span className="hidden max-w-[9rem] truncate sm:inline">{user.name}</span>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
