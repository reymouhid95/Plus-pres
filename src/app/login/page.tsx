"use client";

import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import PasswordField from "@/components/ui/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.ok) router.push("/dashboard");
    else setError("Email ou mot de passe incorrect.");
  }

  return (
    <main className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
      <section className="brand-panel relative hidden flex-col justify-between p-10 lg:flex">
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[13px] border border-white/25 bg-white/10 font-display text-[13px] font-semibold text-cream">
            PP
          </span>
          <span className="font-display text-lg font-semibold text-cream">Plus Près</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="font-display text-4xl leading-tight font-semibold text-cream">
            « On ne se rapproche pas par hasard. »
          </p>
          <p className="mt-5 text-sm leading-relaxed text-cream/75">
            Trois niveaux de questions, des réponses croisées en aveugle, et un score qui se révèle
            seulement quand les deux ont tranché.
          </p>
        </div>

        <ul className="relative z-10 flex flex-wrap gap-2">
          {["Découverte", "Complicité", "Connexion"].map((level, index) => (
            <li
              key={level}
              className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-cream backdrop-blur"
            >
              {index + 1}. {level}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted">
            <ArrowLeft className="size-4" />
            Accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:py-12">
          <form onSubmit={handleSubmit} className="card w-full max-w-sm p-7 animate-fade-up sm:p-8">
            <span className="badge badge-accent">Déjà un compte</span>
            <h1 className="mt-4 font-display text-3xl font-semibold text-fg">Se connecter</h1>
            <p className="mt-2 text-sm text-muted">
              Reprenez la partie là où vous l&apos;avez laissée.
            </p>

            <div className="mt-7 flex flex-col gap-4">
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
                  autoComplete="current-password"
                />
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm text-accent animate-pop">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block mt-6">
              {loading ? "Connexion…" : "Se connecter"}
              {!loading && <ArrowRight className="size-4" />}
            </button>

            <div className="rule my-6" />

            <p className="text-center text-sm text-muted">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-semibold text-accent hover:underline">
                Créer un compte
              </Link>
            </p>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock className="size-3.5" />
              Vos réponses restent privées jusqu&apos;à la révélation.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
