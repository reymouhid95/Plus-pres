"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { toast } from "@/components/ui/ToastSystem";

/**
 * Conversion d'un joueur invité en compte complet (§29) :
 * « Crée ton compte pour conserver ton histoire. »
 * Le même user.id est conservé : parties et historique suivent.
 */
export default function UpgradeBanner({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Création impossible.");
        setLoading(false);
        return;
      }
      const login = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (login?.error) {
        setError("Compte créé — reconnectez-vous pour continuer.");
        return;
      }
      toast("Compte créé — votre histoire est conservée.", "success");
      router.refresh();
    } catch {
      setError("Connexion impossible, réessayez.");
      setLoading(false);
    }
  }

  return (
    <section
      data-testid="upgrade-banner"
      className="card mt-6 border-accent/40 p-6 animate-fade-up"
      style={{ borderColor: "color-mix(in oklab, var(--color-accent) 40%, transparent)" }}
    >
      <p className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
        <Sparkles className="size-5 text-accent" />
        Crée ton compte pour conserver ton histoire, {displayName}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Tes parties restent liées à ce compte : un email et un mot de passe suffisent.
      </p>
      <form onSubmit={upgrade} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.fr"
          aria-label="Email"
          data-testid="upgrade-email"
          className="input flex-1"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mot de passe (6 caractères min.)"
          aria-label="Mot de passe"
          data-testid="upgrade-password"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={loading || !email || password.length < 6}
          data-testid="upgrade-submit"
          className="btn btn-primary disabled:opacity-60"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      {error && (
        <p
          data-testid="upgrade-error"
          className="mt-3 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm text-accent animate-pop"
        >
          {error}
        </p>
      )}
    </section>
  );
}
