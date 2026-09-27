"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import Logo from "@/components/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "#etapes", label: "Comment ça marche" },
  { href: "#modes", label: "Modes de jeu" },
  { href: "/notre-histoire", label: "Notre histoire" },
] as const;

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn btn-ghost btn-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            <span className="hidden sm:inline">Se connecter</span>
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Commencer une expérience à deux
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Ouvrir le menu"
                className="btn btn-ghost btn-sm md:hidden"
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-canvas text-fg">
              <SheetHeader>
                <SheetTitle className="font-display text-fg">Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Navigation mobile" className="mt-6 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="btn btn-secondary justify-start">
                    {link.label}
                  </Link>
                ))}
                <Link href="/login" className="btn btn-secondary justify-start">
                  Se connecter
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Commencer une expérience à deux
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
