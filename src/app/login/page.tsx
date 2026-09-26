"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.ok) router.push("/dashboard");
    else setError("Email ou mot de passe incorrect.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl2 bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-plum">Se connecter</h1>
        <div className="mt-6 flex flex-col gap-4">
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
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-plum py-3 font-medium text-cream disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="mt-4 text-center text-sm text-plum/60">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-rose-deep">
            Créer un compte
          </Link>
        </p>
      </form>
    </main>
  );
}
