import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardActions from "@/components/DashboardActions";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const sessions = await db.gameSession.findMany({
    where: { OR: [{ hostId: userId }, { partnerId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      host: { select: { displayName: true, avatarEmoji: true } },
      partner: { select: { displayName: true, avatarEmoji: true } },
    },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-plum">Bonjour, {session!.user?.name}</h1>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-sm font-medium text-rose-deep">
            Profil
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8">
        <DashboardActions />
      </div>

      <h2 className="mt-10 font-display text-lg font-medium text-plum">Vos parties</h2>
      <div className="mt-4 flex flex-col gap-3">
        {sessions.length === 0 && <p className="text-sm text-plum/50">Aucune partie pour le moment.</p>}
        {sessions.map((s) => {
          const other = s.hostId === userId ? s.partner : s.host;
          return (
            <Link
              key={s.id}
              href={`/game/${s.id}`}
              className="flex items-center justify-between rounded-xl2 bg-card p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-plum">
                  {other ? `${other.avatarEmoji} ${other.displayName}` : "En attente d'un partenaire"}
                </p>
                <p className="text-xs text-plum/50">
                  Code {s.code} · Niveau {s.currentLevel} · {s.status === "completed" ? "Terminée" : s.status === "waiting" ? "En attente" : "En cours"}
                </p>
              </div>
              <span className="text-rose-deep">→</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
