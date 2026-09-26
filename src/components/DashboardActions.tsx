"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Hash, Plus } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

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
    if (!res.ok) {
      setError(data.error ?? "Erreur.");
      toast(data.error ?? "Impossible de créer la partie.", "error");
      return;
    }
    toast("Partie créée — invite ton partenaire avec le code.", "success");
    router.push(`/game/${data.id}`);
  }

  async function joinGame(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sessions/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur.");
      toast(data.error ?? "Impossible de rejoindre la partie.", "error");
      return;
    }
    toast("Partie rejointe.", "success");
    router.push(`/game/${data.id}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card card-hover flex flex-col p-6">
        <span className="grid size-10 place-items-center rounded-2xl gradient-brand-soft">
          <Plus className="size-5 text-accent" strokeWidth={2} />
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold text-fg">Nouvelle partie</h2>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
          Crée une partie et invite ton partenaire avec le code généré.
        </p>
        <button onClick={createGame} disabled={loading} className="btn btn-primary btn-block mt-5">
          {loading ? "Création…" : "Créer une partie"}
          {!loading && <ArrowRight className="size-4" />}
        </button>
      </div>

      <form onSubmit={joinGame} className="card card-hover flex flex-col p-6">
        <span className="grid size-10 place-items-center rounded-2xl gradient-brand-soft">
          <Hash className="size-5 text-gold" strokeWidth={2} />
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold text-fg">Rejoindre</h2>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
          Entre le code reçu de ton partenaire.
        </p>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={10}
          aria-label="Code de la partie"
          className="input mt-5 text-center font-display text-lg tracking-[0.35em] uppercase"
        />
        <button type="submit" disabled={loading || code.trim().length < 4} className="btn btn-secondary btn-block mt-3">
          {loading ? "Recherche…" : "Rejoindre la partie"}
        </button>
      </form>

      {error && (
        <p className="rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm text-accent sm:col-span-2 animate-pop">
          {error}
        </p>
      )}
    </div>
  );
}
