"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Mail, Sparkles, UserRound } from "lucide-react";
import PasswordField from "@/components/ui/PasswordField";

const SELLING_POINTS = [
  "36 questions écrites en français",
  "Aucune réponse visible avant la révélation",
  "Un score pondéré, niveau par niveau",
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (signInRes?.ok) router.push("/dashboard");
    else setError("Compte créé, mais la connexion a échoué. Réessayez de vous connecter.");
  }

  return (
    <main className="grid flex-1 lg:grid-cols-[1fr_1.05fr]">
      <section className="flex flex-col">
        <div className="px-5 py-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted">
            <ArrowLeft className="size-4" />
            Accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:py-12">
          <form onSubmit={handleSubmit} className="card w-full max-w-sm p-7 animate-fade-up sm:p-8">
            <span className="badge badge-gold">
              <Sparkles className="size-3.5" />
              2 minutes
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold text-fg">Créer un compte</h1>
            <p className="mt-2 text-sm text-muted">
              Invite ensuite ton partenaire avec un code à 6 caractères.
            </p>

            <div className="mt-7 flex flex-col gap-4">
              <label className="field">
                <span className="label">Prénom ou pseudo</span>
                <span className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
                  <input
                    className="input pl-11"
                    placeholder="Camille"
                    value={displayName}
                    autoComplete="nickname"
                    required
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </span>
              </label>

              <label className="field">
                <span className="label">Email</span>
                <span className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    className="input pl-11"
                    placeholder="vous@exemple.fr"
                    value={email}
                    autoComplete="email"
                    required
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </span>
              </label>

              <label className="field">
                <span className="label">Mot de passe</span>
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  placeholder="6 caractères minimum"
                  minLength={6}
                  autoComplete="new-password"
                />
                <span className="hint">6 caractères minimum.</span>
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm text-accent animate-pop">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block mt-6">
              {loading ? "Création…" : "Créer mon compte"}
              {!loading && <ArrowRight className="size-4" />}
            </button>

            <div className="rule my-6" />

            <p className="text-center text-sm text-muted">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Se connecter
              </Link>
            </p>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock className="size-3.5" />
              Vos réponses restent privées jusqu&apos;à la révélation.
            </p>
          </form>
        </div>
      </section>

      <section className="brand-panel relative hidden flex-col justify-between p-10 lg:flex">
        <div className="relative z-10 max-w-md">
          <p className="font-display text-4xl leading-tight font-semibold text-cream">
            Trois paliers.
            <br />
            Une seule question&nbsp;: sommes-nous alignés&nbsp;?
          </p>
          <p className="mt-5 text-sm leading-relaxed text-cream/75">
            Chacun répond de son côté. L&apos;application ne croise les réponses qu&apos;une fois les
            deux joueurs ont tranché.
          </p>
        </div>

        <ul className="relative z-10 flex flex-col gap-3">
          {SELLING_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-cream backdrop-blur"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
              {point}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
