import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { pickUnusedQuestion } from "@/lib/questions";
import { levelForRound } from "@/lib/interactions";
import { canDraw } from "@/lib/session-state";
import { expiryDate } from "@/lib/timer";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { rateLimit, rateLimitConfigs, identifiers } from "@/lib/rate-limit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const played = await db.round.count({
    where: { sessionId: gameSession.id, status: "revealed" },
  });
  const guard = canDraw({
    duoStatus: gameSession.duo.status,
    sessionStatus: gameSession.status,
    turnUserId: gameSession.turnUserId,
    userId,
    hasPendingRound: Boolean(pending && pending.status === "pending"),
    played,
    maxRounds: gameSession.maxRounds,
  });
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  // Le niveau avance tout seul : 2 cartes par palier (§13).
  const level = levelForRound(played);

  // Types de questions compatibles avec le mode standard (prédiction + réponse des deux joueurs)
  // "prediction" (Devine ma réponse) a un flux différent (un seul joueur prédit), on l'exclut pour l'instant.
  // "scale", "open", "ranking" ont des UI différentes.
  const standardTypes = ["single", "multiple"];

  const [usedRounds, candidates] = await Promise.all([
    db.round.findMany({ where: { sessionId: gameSession.id }, select: { questionId: true } }),
    db.question.findMany({ 
      where: { 
        level,
        type: { in: standardTypes },
        active: true,
      } 
    }),
  ]);

  const question = pickUnusedQuestion(
    candidates,
    usedRounds.map((round) => round.questionId),
  );
  if (!question) {
    return NextResponse.json({ error: "Aucune question disponible pour ce niveau." }, { status: 400 });
  }

  const now = new Date();
  try {
    const [round] = await db.$transaction([
      db.round.create({
        data: {
          sessionId: gameSession.id,
          questionId: question.id,
          level,
          startedAt: now,
          expiresAt: expiryDate(level, now),
        },
      }),
      db.gameSession.update({
        where: { id: gameSession.id },
        data: { currentLevel: level },
      }),
    ]);
    return NextResponse.json({ id: round.id });
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Une carte est déjà en attente de réponses." },
        { status: 400 },
      );
    }
    throw error;
  }
}
