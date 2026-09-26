"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, PartyPopper, Users } from "lucide-react";

type JoinClientProps = {
  code: string;
  hostName: string | null;
  hostEmoji: string | null;
  memberCount: number;
  alreadyMember: boolean;
  currentUserName: string | null;
  sessionId: string | null;
};

/**
 * Rejoindre un duo via son lien (§9, §10).
 * Sans compte : un simple pseudo crée un joueur invité (§29) ; la conversion
 * en compte complet est proposée ensuite sur le tableau de bord.
 */
export default function JoinClient({
  code,
  hostName,
  hostEmoji,
  memberCount,
  alreadyMember,
  currentUserName,
  sessionId,
}: JoinClientProps) {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join(asGuest: boolean) {
    setLoading(true);
    setError(null);
    try {
      if (asGuest) {
        const login = await signIn("guest", { displayName: pseudo.trim(), code, redirect: false });
        if (login?.error) {
          setError("Ce pseudo ne convient pas ou le code est invalide (2 à 30 caractères).");
          setLoading(false);
          return;
        }
      }
      const res = await fetch("/api/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible de rejoindre ce duo.");
        setLoading(false);
        return;
      }
      router.push(`/game/${data.id}`);
    } catch {
      setError("Connexion impossible, réessayez.");
      setLoading(false);
    }
  }

  if (alreadyMember) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
        <span className="grid size-16 place-items-center rounded-full gradient-brand-soft">
          <PartyPopper className="size-7 text-accent" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-fg">
          Vous faites déjà partie de ce duo
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Retrouvez votre expérience là où vous l&apos;aviez laissée.
        </p>
        {sessionId ? (
          <Link href={`/game/${sessionId}`} className="btn btn-primary btn-block mt-8">
            Ouvrir la partie
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link href="/dashboard" className="btn btn-primary btn-block mt-8">
            Voir mes parties
          </Link>
        )}
      </section>
    );
  }

  if (memberCount >= 2) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
        <span className="grid size-16 place-items-center rounded-full gradient-brand-soft">
          <Users className="size-7 text-muted" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-fg" data-testid="join-full">
          Ce duo est déjà complet
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Deux joueurs participent déjà à cette expérience.
        </p>
        <Link href="/dashboard" className="btn btn-secondary btn-block mt-8">
          Voir mes parties
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
      <span className="grid size-16 place-items-center rounded-full gradient-brand-soft text-3xl leading-none">
        {hostEmoji ?? "💌"}
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold text-fg">
        {hostName ? `${hostName} vous invite` : "On vous invite"}
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        Une expérience à deux vous attend. {currentUserName ? "" : "Un simple pseudo suffit — aucun compte requis pour jouer."}
      </p>

      {currentUserName ? (
        <button
          type="button"
          onClick={() => join(false)}
          disabled={loading}
          data-testid="join-as-member"
          className="btn btn-primary btn-block mt-8 disabled:opacity-60"
        >
          {loading ? "Connexion…" : `Rejoindre en tant que ${currentUserName}`}
          {!loading && <ArrowRight className="size-4" />}
        </button>
      ) : (
        <form
          className="mt-8 flex w-full flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            join(true);
          }}
        >
          <input
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value)}
            placeholder="Votre pseudo"
            maxLength={30}
            aria-label="Votre pseudo"
            data-testid="guest-name"
            className="input text-center font-display text-lg"
          />
          <button
            type="submit"
            disabled={loading || pseudo.trim().length < 2}
            data-testid="join-as-guest"
            className="btn btn-primary btn-block disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Rejoindre la partie"}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>
      )}

      {error && (
        <p
          data-testid="join-error"
          className="mt-4 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm text-accent animate-pop"
        >
          {error}
        </p>
      )}
    </section>
  );
}
