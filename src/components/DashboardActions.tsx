"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardActions() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createGame() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sessions", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Erreur.");
    router.push(`/game/${data.id}`);
  }

  async function joinGame(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sessions/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Erreur.");
    router.push(`/game/${data.id}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl2 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-medium text-plum">Nouvelle partie</h2>
        <p className="mt-1 text-sm text-plum/60">Créez une partie et invitez votre partenaire avec le code généré.</p>
        <button
          onClick={createGame}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-rose-deep py-3 font-medium text-cream disabled:opacity-60"
        >
          Créer une partie
        </button>
      </div>

      <form onSubmit={joinGame} className="rounded-xl2 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-medium text-plum">Rejoindre</h2>
        <p className="mt-1 text-sm text-plum/60">Entrez le code reçu de votre partenaire.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          maxLength={10}
          className="mt-4 w-full rounded-xl border border-plum/15 px-4 py-3 text-center tracking-widest outline-none focus:border-rose"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-plum/25 py-3 font-medium text-plum disabled:opacity-60"
        >
          Rejoindre
        </button>
      </form>

      {error && <p className="sm:col-span-2 text-sm text-rose-deep">{error}</p>}
    </div>
  );
}
