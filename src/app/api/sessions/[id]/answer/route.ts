import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { answerSchema } from "@/lib/validation";
import { resolveExpiredRounds } from "@/lib/expiry";
import { isExpired } from "@/lib/timer";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const parsed = answerSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Réponse invalide." }, { status: 400 });

  const gameSession = await db.gameSession.findUnique({ where: { id } });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (gameSession.hostId !== userId && gameSession.partnerId !== userId) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const round = await db.round.findUnique({
    where: { id: parsed.data.roundId },
    include: { answers: true },
  });
  if (!round || round.sessionId !== gameSession.id) {
    return NextResponse.json({ error: "Manche introuvable." }, { status: 404 });
  }
  if (round.status === "revealed") {
    return NextResponse.json({ error: "Cette manche est déjà révélée." }, { status: 400 });
  }
  if (isExpired(round.expiresAt, Date.now())) {
    await resolveExpiredRounds(gameSession.id);
    return NextResponse.json({ error: "Temps écoulé pour cette question.", expired: true }, { status: 400 });
  }
  if (round.answers.some((a) => a.userId === userId)) {
    return NextResponse.json({ error: "Vous avez déjà répondu à cette manche." }, { status: 400 });
  }

  await db.answer.create({
    data: { roundId: round.id, userId, choice: parsed.data.choice },
  });

  const allAnswers = await db.answer.findMany({ where: { roundId: round.id } });

  if (allAnswers.length === 2) {
    const matched = allAnswers[0].choice === allAnswers[1].choice;
    const nextTurnUserId =
      gameSession.turnUserId === gameSession.hostId ? gameSession.partnerId : gameSession.hostId;

    await db.round.update({ where: { id: round.id }, data: { status: "revealed", matched } });
    await db.gameSession.update({
      where: { id: gameSession.id },
      data: { turnUserId: nextTurnUserId ?? gameSession.hostId },
    });

    return NextResponse.json({ status: "revealed", matched });
  }

  return NextResponse.json({ status: "pending" });
}
