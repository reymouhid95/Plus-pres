import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft, HeartHandshake, TriangleAlert } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeCode } from "@/lib/validation";
import Logo from "@/components/Logo";
import JoinClient from "./JoinClient";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = normalizeCode(decodeURIComponent(raw));
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;

  const duo = await db.duo.findUnique({
    where: { code },
    include: {
      members: {
        include: { user: { select: { id: true, displayName: true, avatarEmoji: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-14">
      <header className="flex items-center justify-between gap-3 py-5 animate-fade-in">
        <Logo />
        <Link href="/" className="btn btn-ghost btn-sm">
          <ArrowLeft className="size-4" />
          Accueil
        </Link>
      </header>

      {!duo ? (
        <section className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
          <span className="grid size-16 place-items-center rounded-full gradient-brand-soft">
            <TriangleAlert className="size-7 text-gold" strokeWidth={1.8} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold text-fg" data-testid="join-invalid">
            Lien invalide
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Aucun duo ne correspond au code <span className="font-semibold text-fg">{code}</span>.
            Vérifiez le lien reçu.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <Link href="/register" className="btn btn-primary btn-block">
              Créer une expérience
            </Link>
            <Link href="/login" className="btn btn-secondary btn-block">
              J&apos;ai déjà un compte
            </Link>
          </div>
        </section>
      ) : (
        <JoinClient
          code={code}
          hostName={duo.members[0]?.user.displayName ?? null}
          hostEmoji={duo.members[0]?.user.avatarEmoji ?? null}
          memberCount={duo.members.length}
          alreadyMember={currentUserId ? duo.members.some((m) => m.userId === currentUserId) : false}
          currentUserName={session?.user?.name ?? null}
          sessionId={
            (
              await db.gameSession.findFirst({
                where: { duoId: duo.id },
                orderBy: { createdAt: "desc" },
                select: { id: true },
              })
            )?.id ?? null
          }
        />
      )}

      <footer className="flex items-center justify-center gap-2 pb-2 text-xs text-muted">
        <HeartHandshake className="size-3.5" />
        Jouez. Découvrez-vous. Rapprochez-vous.
      </footer>
    </main>
  );
}
