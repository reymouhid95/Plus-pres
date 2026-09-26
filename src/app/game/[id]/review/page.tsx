import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Check, History, Play, X } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getSessionReview } from "@/lib/history";
import AppHeader from "@/components/AppHeader";
import ProgressRing from "@/components/ui/ProgressRing";
import { levelMeta } from "@/lib/levels";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?callbackUrl=/game/${id}/review`);
  const userId = (session.user as any).id as string;

  const review = await getSessionReview(id, userId);
  if (!review) notFound();

  const partnerName = review.partner?.displayName ?? "votre partenaire";

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader user={{ name: session.user?.name, avatar: (session.user as any).avatarEmoji }} />

      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 sm:px-6">
        <section className="pt-10 sm:pt-14 animate-fade-up">
          <Link href="/history" className="btn btn-ghost btn-sm -ml-2">
            <ArrowLeft className="size-4" />
            Historique
          </Link>

          <span className="badge badge-accent mt-6">
            <History className="size-3.5" />
            Revue de partie
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight font-semibold text-fg sm:text-4xl">
            Code {review.code}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            avec {review.partner?.avatarEmoji} {partnerName} · {dateFormatter.format(new Date(review.createdAt))}
          </p>
        </section>

        <section className="card mt-6 flex flex-col items-center gap-4 px-6 py-7 text-center animate-fade-up stagger-1">
          <ProgressRing value={review.percentage} size={132} stroke={11} />
          <p className="text-sm text-muted">
            <span className="font-semibold text-fg">{review.matchedRounds}</span> alignement
            {review.matchedRounds > 1 ? "s" : ""} sur{" "}
            <span className="font-semibold text-fg">{review.totalRounds}</span> question
            {review.totalRounds > 1 ? "s" : ""}
            {review.totalRounds === 0 && " — rejouez pour remplir cette revue"}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-fg">
            Les questions {review.rounds.length > 0 && <span className="text-muted">({review.rounds.length})</span>}
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {review.rounds.length === 0 ? (
              <p className="text-sm text-muted">
                Aucune manche révélée dans cette partie pour le moment.
              </p>
            ) : (
              review.rounds.map((round, index) => {
                const meta = levelMeta(round.level);
                return (
                  <article
                    key={round.id}
                    className="card p-5 animate-fade-up"
                    style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold ${
                          round.matched ? "text-sage" : "text-accent"
                        }`}
                        data-testid="review-verdict"
                      >
                        {round.matched ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                        {round.matched ? "Alignés" : "Divergents"}
                      </span>
                    </div>

                    <p className="mt-2.5 font-display text-lg leading-snug font-semibold text-fg">
                      {round.questionText}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-line bg-canvas/60 px-3.5 py-3">
                        <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">Vous</p>
                        <p className="mt-1 text-sm font-medium text-fg">{round.mine ?? "—"}</p>
                      </div>
                      <div className="rounded-2xl border border-line bg-canvas/60 px-3.5 py-3">
                        <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                          {partnerName}
                        </p>
                        <p className="mt-1 text-sm font-medium text-fg">{round.theirs ?? "—"}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-3 animate-fade-up">
          <Link href={`/game/${review.id}`} className="btn btn-primary btn-block">
            <Play className="size-4" />
            Rejouer cette partie
          </Link>
          <Link href="/history" className="btn btn-secondary btn-block">
            Voir tout l&apos;historique
          </Link>
        </section>
      </div>
    </main>
  );
}
