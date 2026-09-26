import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pickUnusedQuestion } from "@/lib/questions";
import { expiryDate } from "@/lib/timer";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const gameSession = await db.gameSession.findUnique({
    where: { id },
    include: { rounds: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (gameSession.hostId !== userId && gameSession.partnerId !== userId) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }
  if (gameSession.status !== "active") {
    return NextResponse.json({ error: "La partie n'est pas encore active (en attente du partenaire)." }, { status: 400 });
  }
  if (gameSession.turnUserId !== userId) {
    return NextResponse.json({ error: "Ce n'est pas votre tour de tirer une carte." }, { status: 403 });
  }

  const pending = gameSession.rounds[0];
  if (pending && pending.status === "pending") {
    return NextResponse.json({ error: "Une carte est déjà en attente de réponses." }, { status: 400 });
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
