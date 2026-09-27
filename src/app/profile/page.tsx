"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Heart, Save } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Skeleton } from "@/components/ui/Skeleton";
import Logo from "@/components/Logo";

const EMOJIS = ["🙂", "😄", "😍", "🥰", "😎", "🦋", "🌸", "🔥", "🌙", "⭐"];

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🙂");
  const [bio, setBio] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => {
        setDisplayName(data.displayName ?? "");
        setAvatarEmoji(data.avatarEmoji ?? "🙂");
        setBio(data.bio ?? "");
        setBirthdate(data.birthdate ? data.birthdate.slice(0, 10) : "");
        setLoading(false);
      });
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    setSaving(true);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, avatarEmoji, bio, birthdate }),
    });
    setSaving(false);
    if (!response.ok) {
      toast("Impossible d’enregistrer le profil.", "error");
      return;
    }
    setSaved(true);
    toast("Profil mis à jour.", "success");
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-16 sm:px-6">
      <div className="flex items-center justify-between py-5">
        <Logo href="/dashboard" />
        <Link href="/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeft className="size-4" />
          Tableau de bord
        </Link>
      </div>

      <section className="animate-fade-up">
        <span className="badge badge-accent">
          <Heart className="size-3.5" />
          Votre profil
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-fg">Votre profil</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          C&apos;est ce que verra votre partenaire en tête de partie.
        </p>
      </section>

      {loading ? (
        <div className="card mt-7 flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex gap-2.5">
            {EMOJIS.map((emoji) => (
              <Skeleton key={emoji} className="size-11 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="card mt-7 flex flex-col gap-5 p-6 animate-fade-up stagger-1 sm:p-7">
          <div className="field">
            <span className="label">Avatar</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  aria-pressed={avatarEmoji === emoji}
                  aria-label={`Choisir ${emoji}`}
                  onClick={() => setAvatarEmoji(emoji)}
                  className="emoji-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="label">Nom affiché</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Votre prénom"
              maxLength={40}
              className="input"
            />
          </label>

          <label className="field">
            <span className="label">Date de naissance</span>
            <input
              type="date"
              value={birthdate}
              onChange={(event) => setBirthdate(event.target.value)}
              className="input"
            />
            <span className="hint">Reste privée : elle n&apos;est jamais affichée.</span>
          </label>

          <label className="field">
            <span className="flex items-center justify-between">
              <span className="label">Bio</span>
              <span className="hint tabular-nums">{bio.length} / 280</span>
            </span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Un mot sur vous…"
              className="input resize-none"
            />
          </label>

          <button type="submit" disabled={saving} className="btn btn-primary btn-block">
            {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
            <Save className="size-4" />
          </button>

          {saved && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-sage animate-pop">
              <Check className="size-4" />
              Profil mis à jour.
            </p>
          )}
        </form>
      )}
    </main>
  );
}
