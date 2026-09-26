import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, ChevronRight, Hourglass, Layers, PartyPopper, Play } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserStats } from "@/lib/history";
import { clientSessionStatus } from "@/lib/session-state";
import AppHeader from "@/components/AppHeader";
import DashboardActions from "@/components/DashboardActions";
import Sparkline from "@/components/Sparkline";

const STATUS_META = {
  waiting: { label: "En attente", tone: "badge-gold" },
  active: { label: "En cours", tone: "badge-accent" },
  completed: { label: "Terminée", tone: "badge-sage" },
} as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const [sessions, evolution] = await Promise.all([
    db.gameSession.findMany({
      where: { duo: { members: { some: { userId } } } },
      orderBy: { createdAt: "desc" },
      include: {
        duo: {
          select: {
            code: true,
            status: true,
            members: {
              include: { user: { select: { displayName: true, avatarEmoji: true } } },
              orderBy: { joinedAt: "asc" },
            },
          },
        },
      },
    }),
    getUserStats(userId),
  ]);

  const stats = {
    total: sessions.length,
    running: sessions.filter((s) => s.status !== "completed").length,
    done: sessions.filter((s) => s.status === "completed").length,
  };

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader user={{ name: session!.user?.name, avatar: (session!.user as any).avatarEmoji }} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 sm:px-6">
        <section className="pt-10 sm:pt-14 animate-fade-up">
          <span className="badge badge-accent">
            <Play className="size-3.5" />
            Tableau de bord
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight font-semibold text-fg sm:text-4xl">
            Bonjour, {session!.user?.name}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Une partie, un code, deux joueurs. Chacun répond de son côté&nbsp;— les réponses ne se
            croisent qu&apos;une fois les deux ont tranché.
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-3 sm:max-w-md">
            {[
              { value: stats.total, label: "parties", icon: Layers },
              { value: stats.running, label: "en cours", icon: Hourglass },
              { value: stats.done, label: "terminées", icon: PartyPopper },
            ].map((stat) => (
              <div key={stat.label} className="card p-3.5 text-center sm:p-4">
                <dd className="font-display text-2xl font-semibold text-fg">{stat.value}</dd>
                <dd className="mt-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 animate-fade-up stagger-1">
          <DashboardActions />
        </section>

        <section className="mt-8 animate-fade-up stagger-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-fg">Votre évolution</h2>
            <Link
              href="/history"
              className="text-xs uppercase tracking-[0.16em] text-accent transition hover:text-fg"
            >
              Tout voir
            </Link>
          </div>

          <div className="card mt-4 flex items-center gap-5 px-5 py-4">
            <div className="shrink-0 text-center">
              <p className="font-display text-3xl font-semibold tabular-nums text-fg">
                {evolution.percentage}%
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">alignement</p>
            </div>
            <div className="min-w-0 flex-1">
              {evolution.totalRounds > 0 ? (
                <>
                  <Sparkline points={evolution.timeline} height={56} />
                  <p className="mt-1.5 text-xs text-muted">
                    {evolution.matchedRounds} réponse
                    {evolution.matchedRounds > 1 ? "s" : ""} alignée
                    {evolution.matchedRounds > 1 ? "s" : ""} sur {evolution.totalRounds} manche
                    {evolution.totalRounds > 1 ? "s" : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">
                  Jouez une première partie pour voir votre courbe apparaître ici.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-12 animate-fade-up stagger-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-fg">Vos parties</h2>
            <Link
              href="/history"
              className="text-xs uppercase tracking-[0.16em] text-muted transition hover:text-accent"
            >
              {stats.total} au total
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {sessions.length === 0 && (
              <div className="card flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full gradient-brand-soft">
                  <PartyPopper className="size-6 text-accent" strokeWidth={1.8} />
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-fg">
                  Aucune partie pour le moment
                </p>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
                  Crée ta première partie ci-dessus, ou rejoins celle de ton partenaire avec son
                  code.
                </p>
              </div>
            )}

            {sessions.map((s, index) => {
              const other =
                s.duo.members.find((member) => member.userId !== userId)?.user ?? null;
              const status =
                STATUS_META[clientSessionStatus(s.duo.status, s.status)];
              return (
                <Link
                  key={s.id}
                  href={`/game/${s.id}`}
                  className={`card card-hover group flex items-center justify-between gap-4 p-4 animate-fade-up sm:p-5 ${
                    index < 4 ? `stagger-${index + 1}` : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="gradient-brand-soft grid size-11 shrink-0 place-items-center rounded-full text-xl leading-none">
                      {other?.avatarEmoji ?? "⏳"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-fg">
                        {other ? other.displayName : "En attente d’un partenaire"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        Code {s.duo.code} · Niveau {s.currentLevel} / 3
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className={`badge ${status.tone}`}>{status.label}</span>
                    <ChevronRight className="size-4 text-muted transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rule mt-12" />
        <p className="mt-5 flex items-center gap-1.5 text-xs text-muted">
          <ArrowRight className="size-3.5" />
          Astuce&nbsp;: le score n&apos;augmente vraiment qu&apos;au troisième niveau.
        </p>
      </div>
    </main>
  );
}
