import Link from "next/link";
import { ArrowRight, Heart, HelpCircle, PartyPopper, Sparkles, UserRound } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const STEPS = [
  {
    title: "Créez votre expérience",
    text: "Un clic suffit : votre code d’invitation est prêt en quelques secondes.",
  },
  {
    title: "Invitez votre partenaire",
    text: "Partagez le lien ou le code. Un simple pseudo suffit pour jouer, sans compte.",
  },
  {
    title: "Répondez chacun de votre côté",
    text: "Six questions, réponses secrètes : personne ne voit le choix de l’autre.",
  },
  {
    title: "Révélez et échangez",
    text: "Vos choix apparaissent côte à côte — et la discussion s’enchaîne naturellement.",
  },
] as const;

const MODES = [
  {
    icon: UserRound,
    title: "Se découvrir",
    text: "Des questions douces pour apprendre à vous connaître, du premier café aux petits riens.",
    tone: "text-accent",
  },
  {
    icon: PartyPopper,
    title: "Rigoler",
    text: "Souvenirs, bêtises et confessions légères : pour rire ensemble, vraiment.",
    tone: "text-gold",
  },
  {
    icon: HelpCircle,
    title: "Devine ma réponse",
    text: "Devinez ce que l’autre a répondu : la connaissance mutuelle, manche après manche.",
    tone: "text-sage",
  },
  {
    icon: Heart,
    title: "Connexion",
    text: "Les questions qui creusent : habitudes, valeurs, et ce qui compte vraiment.",
    tone: "text-rose-deep",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:py-24">
          <span className="badge badge-accent animate-fade-up">
            <Sparkles className="size-3.5" />
            Un jeu à deux, par paliers
          </span>

          <h1 className="t-display mt-7 max-w-3xl animate-fade-up stagger-1">
            Se rapprocher,
            <br className="sm:hidden" /> <span className="text-gradient">une question à la fois.</span>
          </h1>

          <p className="t-body mt-6 max-w-xl text-muted animate-fade-up stagger-2">
            Vous répondez chacun de votre côté à des questions pensées pour deux. Une
            fois les deux réponses déposées, l&apos;application les révèle côte à côte —
            pour comparer, raconter, et découvrir ce que vos choix disent de vous.
          </p>

          <div className="mt-9 animate-fade-up stagger-3">
            <Link href="/create" className="btn btn-primary">
              Commencer une expérience à deux
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="t-small mt-5 max-w-md text-muted animate-fade-up stagger-4">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-fg underline underline-offset-4">
              Se connecter
            </Link>
            <br />
            Un lien d&apos;invitation&nbsp;? Ouvrez-le : un simple pseudo suffit pour jouer.
          </p>
        </section>

        <section id="etapes" className="border-t border-line/70 bg-surface/60">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <h2 className="t-heading text-center">Comment ça marche</h2>
            <p className="t-body mx-auto mt-3 max-w-xl text-center text-muted">
              Quatre étapes, une expérience à deux — de l&apos;invitation à la révélation.
            </p>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="card card-hover p-6 animate-fade-up">
                  <span className="gradient-brand grid size-9 place-items-center rounded-full font-display text-sm font-semibold text-cream">
                    {index + 1}
                  </span>
                  <h3 className="t-subheading mt-4">{step.title}</h3>
                  <p className="t-small mt-2 text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="modes" className="border-t border-line/70">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <h2 className="t-heading text-center">Modes de jeu</h2>
            <p className="t-body mx-auto mt-3 max-w-xl text-center text-muted">
              Quatre ambiances, une seule règle : on ne triche pas sur les réponses.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {MODES.map((mode) => (
                <article key={mode.title} className="card card-hover flex gap-4 p-6 animate-fade-up">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl gradient-brand-soft">
                    <mode.icon className={`size-5 ${mode.tone}`} strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="t-subheading">{mode.title}</h3>
                    <p className="t-small mt-2 text-muted">{mode.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line/70 bg-surface/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-16 text-center sm:py-20">
            <h2 className="t-heading">Prêt à vous rapprocher&nbsp;?</h2>
            <p className="t-body mt-3 max-w-md text-muted">
              Créez votre expérience et invitez votre partenaire en moins d’une minute.
            </p>
            <div className="mt-7">
              <Link href="/create" className="btn btn-primary">
                Commencer une expérience à deux
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
