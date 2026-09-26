import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember, otherMember } from "@/lib/duo";
import { answerSchema } from "@/lib/validation";
import { canAnswer } from "@/lib/session-state";
import { resolveExpiredRounds } from "@/lib/expiry";
import { isExpired } from "@/lib/timer";
import { rateLimit, rateLimitConfigs, identifiers } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  // Rate limiting modéré pour les actions de jeu (60 req/min par user)
  const rl = rateLimit(
    identifiers.userId({ userId } as any),
    rateLimitConfigs.gameAction
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop d'actions. Attendez un peu." },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
    );
  }

  const parsed = answerSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Réponse invalide." }, { status: 400 });

  const gameSession = await db.gameSession.findUnique({ where: { id } });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const round = await db.round.findUnique({
    where: { id: parsed.data.roundId },
    include: { answers: true, predictions: { select: { userId: true } } },
  });
  if (!round || round.sessionId !== gameSession.id) {
    return NextResponse.json({ error: "Manche introuvable." }, { status: 404 });
  }
  if (isExpired(round.expiresAt, Date.now())) {
    await resolveExpiredRounds(gameSession.id);
    return NextResponse.json({ error: "Temps écoulé pour cette question.", expired: true }, { status: 400 });
  }

  const guard = canAnswer({
    roundStatus: round.status,
    alreadyAnswered: round.answers.some((a) => a.userId === userId),
    predictionRequired: gameSession.predictionsEnabled,
    hasPredicted: round.predictions.some((p) => p.userId === userId),
  });
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  await db.answer.create({
    data: { roundId: round.id, userId, choice: parsed.data.choice },
  });

  const allAnswers = await db.answer.findMany({ where: { roundId: round.id } });

  if (allAnswers.length === 2) {
    const matched = allAnswers[0].choice === allAnswers[1].choice;
    const nextTurnUserId =
      (await otherMember(gameSession.duoId, gameSession.turnUserId ?? userId)) ??
      gameSession.turnUserId;

    await db.round.update({ where: { id: round.id }, data: { status: "revealed", matched } });
    await db.gameSession.update({
      where: { id: gameSession.id },
      data: { turnUserId: nextTurnUserId },
    });

    // Dernière carte de la session : place au bilan (§13, §22).
    const revealedCount = await db.round.count({
      where: { sessionId: gameSession.id, status: "revealed" },
    });
    if (revealedCount >= gameSession.maxRounds) {
      await db.gameSession.update({
        where: { id: gameSession.id },
        data: { status: "completed" },
      });
    }

    return NextResponse.json({ status: "revealed", matched });
  }

  return NextResponse.json({ status: "pending" });
}
