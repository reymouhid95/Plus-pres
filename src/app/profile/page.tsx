"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EMOJIS = ["🙂", "😄", "😍", "🥰", "😎", "🦋", "🌸", "🔥", "🌙", "⭐"];

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🙂");
  const [bio, setBio] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setDisplayName(data.displayName ?? "");
        setAvatarEmoji(data.avatarEmoji ?? "🙂");
        setBio(data.bio ?? "");
        setBirthdate(data.birthdate ? data.birthdate.slice(0, 10) : "");
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, avatarEmoji, bio, birthdate }),
    });
    setSaved(true);
  }

  if (loading) return null;

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link href="/dashboard" className="text-sm text-plum/50">
        ← Retour
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold text-plum">Votre profil</h1>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5 rounded-xl2 bg-card p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-plum/70">Avatar</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setAvatarEmoji(e)}
                className={`h-11 w-11 rounded-full text-xl ${avatarEmoji === e ? "bg-rose text-cream" : "bg-cream"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-plum/70">Nom affiché</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-rose"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-plum/70">Date de naissance</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-rose"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-plum/70">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            className="mt-1 w-full rounded-xl border border-plum/15 px-4 py-3 outline-none focus:border-rose"
          />
        </div>

        <button type="submit" className="rounded-xl bg-plum py-3 font-medium text-cream">
          Enregistrer
        </button>
        {saved && <p className="text-center text-sm text-sage">Profil mis à jour.</p>}
      </form>
    </main>
  );
}
