import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeCompatibility } from "@/lib/compatibility";

async function assertMember(sessionId: string, userId: string) {
  const s = await db.gameSession.findUnique({ where: { id: sessionId } });
  if (!s) return null;
  if (s.hostId !== userId && s.partnerId !== userId) return null;
  return s;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const gameSession = await assertMember(id, userId);
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });

  const full = await db.gameSession.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, displayName: true, avatarEmoji: true } },
      partner: { select: { id: true, displayName: true, avatarEmoji: true } },
      rounds: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { question: true, answers: true },
      },
    },
  });

  const compatibility = await computeCompatibility(id);
  const currentRound = full?.rounds[0] ?? null;

  // Ne jamais exposer le choix de l'autre tant que les deux n'ont pas répondu
  let safeCurrentRound = null;
  if (currentRound) {
    const bothAnswered = currentRound.status === "revealed";
    safeCurrentRound = {
      id: currentRound.id,
      level: currentRound.level,
      status: currentRound.status,
      matched: bothAnswered ? currentRound.matched : null,
      question: { id: currentRound.question.id, text: currentRound.question.text, options: currentRound.question.options },
      myAnswer: currentRound.answers.find((a) => a.userId === userId)?.choice ?? null,
      partnerAnswered: currentRound.answers.some((a) => a.userId !== userId),
      answers: bothAnswered
        ? currentRound.answers.map((a) => ({ userId: a.userId, choice: a.choice }))
        : [],
    };
  }

  return NextResponse.json({
    id: full!.id,
    code: full!.code,
    status: full!.status,
    currentLevel: full!.currentLevel,
    turnUserId: full!.turnUserId,
    host: full!.host,
    partner: full!.partner,
    currentRound: safeCurrentRound,
    compatibility,
  });
}
