"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl2 bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-plum">Créer un compte</h1>
        <div className="mt-6 flex flex-col gap-4">
          <input
            className="rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-rose"
            placeholder="Prénom / pseudo"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input
            type="email"
            className="rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-rose"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-rose"
            placeholder="Mot de passe (6 caractères min.)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-plum py-3 font-medium text-cream disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
        <p className="mt-4 text-center text-sm text-plum/60">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-rose-deep">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
