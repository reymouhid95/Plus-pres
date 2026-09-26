import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getUserStats, listSessionsForUser, type SessionSummary } from "@/lib/history";
import AppHeader from "@/components/AppHeader";
import Sparkline from "@/components/Sparkline";
import ShareCard from "@/components/ShareCard";
import { levelMeta } from "@/lib/levels";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  waiting: "En attente",
  active: "En cours",
  completed: "Terminée",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

function SessionRow({ session, index }: { session: SessionSummary; index: number }) {
  return (
    <Link
      href={`/game/${session.id}/review`}
      className="card card-hover group flex items-center justify-between gap-4 p-4 animate-fade-up sm:p-5"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="gradient-brand-soft grid size-11 shrink-0 place-items-center rounded-full text-xl leading-none">
          {session.partner?.avatarEmoji ?? "⏳"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">
            {session.partner?.displayName ?? "En attente d’un partenaire"}
          </p>
          <p className="truncate text-xs text-muted">
            {STATUS_LABEL[session.status] ?? session.status} · {formatDate(session.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="font-display text-lg font-semibold tabular-nums text-fg">
            {session.rounds > 0 ? `${session.percentage} %` : "—"}
          </p>
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">
            {session.rounds} manche{session.rounds > 1 ? "s" : ""}
          </p>
        </div>
        <ArrowUpRight className="size-4 text-muted transition group-hover:text-accent" />
      </div>
    </Link>
  );
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/history");
  const userId = (session.user as any).id as string;

  const [stats, sessions] = await Promise.all([
    getUserStats(userId),
    listSessionsForUser(userId),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader user={{ name: session.user?.name, avatar: (session.user as any).avatarEmoji }} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 sm:px-6">
        <section className="pt-10 sm:pt-14 animate-fade-up">
          <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
            <ArrowLeft className="size-4" />
            Tableau de bord
          </Link>

          <span className="badge badge-accent mt-6">
            <TrendingUp className="size-3.5" />
            Historique
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight font-semibold text-fg sm:text-4xl">
            Votre évolution
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Tout ce que vous avez joué ensemble, en un coup d&apos;œil&nbsp;: le taux d&apos;alignement
            pondéré, la courbe des {stats.timeline.length} derniers jours et les questions qui vous
            séparent le plus.
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-3">
            <div className="card p-3.5 text-center sm:p-4">
              <dd className="font-display text-2xl font-semibold text-fg">{stats.percentage} %</dd>
              <dd className="mt-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                alignement
              </dd>
            </div>
            <div className="card p-3.5 text-center sm:p-4">
              <dd className="font-display text-2xl font-semibold text-fg">{stats.totalRounds}</dd>
              <dd className="mt-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                manche{stats.totalRounds > 1 ? "s" : ""}
              </dd>
            </div>
            <div className="card p-3.5 text-center sm:p-4">
              <dd className="font-display text-2xl font-semibold text-fg">{stats.totalSessions}</dd>
              <dd className="mt-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                partie{stats.totalSessions > 1 ? "s" : ""}
              </dd>
            </div>
          </dl>
        </section>

        {stats.totalRounds > 0 ? (
          <>
            <section className="card mt-6 p-5 animate-fade-up stagger-1 sm:p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold text-fg">Courbe</h2>
                <span className="text-xs uppercase tracking-[0.16em] text-muted">
                  {stats.timeline.length} jours
                </span>
              </div>
              <div className="mt-4">
                <Sparkline points={stats.timeline} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                <span>{formatDate(stats.timeline[0].date)}</span>
                <span>Aujourd&apos;hui</span>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card p-5 animate-fade-up stagger-2 sm:p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
                  <Layers className="size-4 text-accent" />
                  Par niveau
                </h2>
                <div className="mt-4 space-y-3.5">
                  {stats.byLevel.map((level) => (
                    <div key={level.level}>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-medium text-fg">{level.label}</span>
                        <span className="tabular-nums text-muted">
                          {level.matched} / {level.total} · {level.percentage} %
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-fg/10">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000 ease-out"
                          style={{
                            width: `${level.percentage}%`,
                            backgroundColor: levelMeta(level.level).color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 animate-fade-up stagger-3 sm:p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
                  <Sparkles className="size-4 text-accent" />
                  Points de friction
                </h2>
                {stats.mismatches.length === 0 ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    Aucune question ne vous oppose pour le moment. Continuez comme ça.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {stats.mismatches.map((mismatch) => (
                      <li key={mismatch.questionId} className="text-sm">
                        <p className="truncate text-fg">{mismatch.questionText}</p>
                        <p className="text-xs text-muted">
                          {mismatch.missed} réponse{mismatch.missed > 1 ? "s" : ""} divergente
                          {mismatch.missed > 1 ? "s" : ""} sur {mismatch.total}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="card mt-6 p-5 animate-fade-up stagger-4 sm:p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold text-fg">Votre carte</h2>
                <span className="text-xs uppercase tracking-[0.16em] text-muted">PNG</span>
              </div>
              <p className="mt-1.5 text-sm text-muted">
                À garder, à envoyer, à afficher&nbsp;: votre score du moment en image.
              </p>
              <div className="mt-4 overflow-hidden rounded-3xl border border-line">
                <ShareCard
                  percentage={stats.percentage}
                  totalRounds={stats.totalRounds}
                  matchedRounds={stats.matchedRounds}
                  totalSessions={stats.totalSessions}
                  byLevel={stats.byLevel}
                  date={today}
                />
              </div>
            </section>
          </>
        ) : (
          <section className="card mt-6 flex flex-col items-center px-6 py-12 text-center animate-fade-up stagger-1">
            <span className="grid size-14 place-items-center rounded-full gradient-brand-soft">
              <CalendarDays className="size-6 text-accent" strokeWidth={1.8} />
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-fg">Pas encore de manches</p>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
              Jouez votre première partie&nbsp;: votre courbe et votre carte apparaîtront ici.
            </p>
            <Link href="/dashboard" className="btn btn-primary mt-6">
              Créer une partie
            </Link>
          </section>
        )}

        <section className="mt-12 animate-fade-up">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-fg">Vos parties</h2>
            <span className="text-xs uppercase tracking-[0.16em] text-muted">
              {sessions.length} au total
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted">Aucune partie enregistrée pour le moment.</p>
            ) : (
              sessions.map((item, index) => <SessionRow key={item.id} session={item} index={index} />)
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
