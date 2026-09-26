import Link from "next/link";
import { ArrowRight, HeartHandshake, Layers, Sparkles, Timer } from "lucide-react";
import Logo from "@/components/Logo";

const FEATURES = [
  {
    icon: Layers,
    title: "Trois paliers",
    text: "Découverte, Complicité, Connexion : on avance niveau par niveau, jamais en sautant d'étape.",
    tone: "text-gold",
  },
  {
    icon: HeartHandshake,
    title: "Réponses croisées",
    text: "Chacun répond de son côté. Personne ne voit le choix de l'autre avant la révélation.",
    tone: "text-accent",
  },
  {
    icon: Timer,
    title: "Score en direct",
    text: "Un pourcentage pondéré se recalcule à chaque manche, avec le détail par niveau.",
    tone: "text-sage",
  },
] as const;

const STATS = [
  { value: "3", label: "niveaux" },
  { value: "36", label: "questions" },
  { value: "2", label: "joueurs" },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5">
      <header className="flex items-center justify-between py-5 animate-fade-in">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">
            Se connecter
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Créer un compte
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
        <span className="badge badge-accent animate-fade-up">
          <Sparkles className="size-3.5" />
          Un jeu à deux, par paliers
        </span>

        <h1 className="mt-7 max-w-3xl font-display text-4xl leading-[1.05] font-semibold animate-fade-up stagger-1 sm:text-6xl">
          Se rapprocher,
          <br className="sm:hidden" /> <span className="text-gradient">une question à la fois.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted animate-fade-up stagger-2 sm:text-lg">
          Vous répondez chacun de votre côté à des questions choisies selon le niveau en cours. Une
          fois les deux réponses déposées, l&apos;application révèle si vous étiez alignés — et met
          votre compatibilité à jour.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-up stagger-3">
          <Link href="/register" className="btn btn-primary">
            Commencer à jouer
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/login" className="btn btn-secondary">
            J&apos;ai déjà un compte
          </Link>
        </div>

        <dl className="mt-12 flex items-center gap-8 text-center animate-fade-up stagger-4 sm:gap-14">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-3xl font-semibold text-fg">{stat.value}</dd>
              <dd className="mt-0.5 text-xs uppercase tracking-[0.18em] text-muted">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <article
            key={feature.title}
            className={`card card-hover p-6 animate-fade-up stagger-${index + 2}`}
          >
            <span className="grid size-11 place-items-center rounded-2xl gradient-brand-soft">
              <feature.icon className={`size-5 ${feature.tone}`} strokeWidth={1.9} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-fg">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.text}</p>
          </article>
        ))}
      </section>

      <footer className="rule mb-8" />
    </main>
  );
}
