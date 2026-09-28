"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import Logo from "@/components/Logo";

/**
 * Écran de création minimaliste (Sprint UX 3) : une seule action,
 * puis redirection vers le lobby qui affiche le code à partager.
 */
export default function CreateClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Impossible de créer l'expérience.";
        setError(message);
        toast(message, "error");
        setLoading(false);
        return;
      }
      toast("Code généré — invite ton partenaire.", "success");
      router.push(`/game/${data.id}`);
    } catch {
      setError("Connexion impossible, réessayez.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-14">
      <header className="flex items-center justify-between gap-3 py-5 animate-fade-in">
        <Logo />
        <Link href="/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeft className="size-4" />
          Tableau de bord
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
        <span className="grid size-16 place-items-center rounded-full gradient-brand-soft">
          <Sparkles className="size-7 text-accent" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-fg" data-testid="create-title">
          Créer une expérience
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          On génère un code à 6 caractères. Ton partenaire l&apos;ouvre&nbsp;— un simple pseudo
          suffit pour jouer.
        </p>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          data-testid="generate-code"
          className="btn btn-primary btn-block mt-8 disabled:opacity-60"
        >
          {loading ? "Génération…" : "Générer mon code"}
          {!loading && <ArrowRight className="size-4" />}
        </button>

        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"
        >
          <Mail className="size-4" />
          J&apos;ai déjà un code à saisir
        </Link>

        {error && (
          <p
            data-testid="create-error"
            className="mt-5 w-full rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm text-accent animate-pop"
          >
            {error}
          </p>
        )}
      </section>

      <footer className="flex items-center justify-center gap-2 pb-2 text-xs text-muted">
        Une partie, un code, deux joueurs.
      </footer>
    </main>
  );
}
