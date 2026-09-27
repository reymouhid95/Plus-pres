import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotreHistoirePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <span className="badge badge-accent">Notre histoire</span>
        <h1 className="t-display mt-5">
          Une application née d&apos;une conviction simple
        </h1>

        <div className="t-body mt-8 space-y-5 text-muted">
          <p>
            Les conversations les plus importantes sont souvent celles que l&apos;on ne
            commence pas. On croit se connaître, on suppose, on évite — et les années
            passent sans avoir posé les questions qui comptent.
          </p>
          <p>
            Plus Près est né de l&apos;envie de créer un espace où répondre ensemble,
            sans enjeu et sans jugement. Chacun répond de son côté, personne ne voit le
            choix de l&apos;autre, puis tout se révèle : les points d&apos;accord
            rassurent, les écarts ouvrent la discussion.
          </p>
          <p>
            Trois paliers, pas de saut d&apos;étape : <strong className="text-fg">Découverte</strong>{" "}
            pour se rencontrer, <strong className="text-fg">Complicité</strong> pour rire
            ensemble, <strong className="text-fg">Connexion</strong> pour aller au fond
            des choses. Le score reste caché pendant la partie : l&apos;important n&apos;est
            pas de gagner, mais de se rapprocher.
          </p>
          <p>
            Une expérience se joue en quelques minutes, à deux, sur un canapé, à table,
            ou à distance. Le résultat se garde dans votre journal : un historique de vos
            moments à deux.
          </p>
        </div>

        <div className="mt-10">
          <Link href="/register" className="btn btn-primary">
            Commencer une expérience à deux
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
