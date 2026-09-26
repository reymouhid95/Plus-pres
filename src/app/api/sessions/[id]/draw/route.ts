import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { pickUnusedQuestion } from "@/lib/questions";
import { canDraw } from "@/lib/session-state";
import { expiryDate } from "@/lib/timer";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const gameSession = await db.gameSession.findUnique({
    where: { id },
    include: {
      duo: { select: { status: true } },
      rounds: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const pending = gameSession.rounds[0];
  const guard = canDraw({
    duoStatus: gameSession.duo.status,
    sessionStatus: gameSession.status,
    turnUserId: gameSession.turnUserId,
    userId,
    hasPendingRound: Boolean(pending && pending.status === "pending"),
  });
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const [usedRounds, candidates] = await Promise.all([
    db.round.findMany({ where: { sessionId: gameSession.id }, select: { questionId: true } }),
    db.question.findMany({ where: { level: gameSession.currentLevel } }),
  ]);

  const question = pickUnusedQuestion(
    candidates,
    usedRounds.map((round) => round.questionId),
  );
  if (!question) {
    return NextResponse.json({ error: "Aucune question disponible pour ce niveau." }, { status: 400 });
  }

  const now = new Date();
  const round = await db.round.create({
    data: {
      sessionId: gameSession.id,
      questionId: question.id,
      level: gameSession.currentLevel,
      startedAt: now,
      expiresAt: expiryDate(gameSession.currentLevel, now),
    },
  });

  return NextResponse.json({ id: round.id });
}
