import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-5xl font-semibold text-plum">Plus Près</h1>
      <p className="mt-3 max-w-sm text-plum/70">
        Un jeu à deux, par paliers. Répondez chacun de votre côté, puis découvrez si vous êtes alignés.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="rounded-2xl bg-plum px-6 py-3 font-medium text-cream">
          Créer un compte
        </Link>
        <Link href="/login" className="rounded-2xl border border-plum/25 px-6 py-3 font-medium text-plum">
          Se connecter
        </Link>
      </div>
    </main>
  );
}
