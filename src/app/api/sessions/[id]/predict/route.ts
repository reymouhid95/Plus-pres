import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { canPredict } from "@/lib/session-state";
import { predictSchema } from "@/lib/validation";
import { resolveExpiredRounds } from "@/lib/expiry";
import { isExpired } from "@/lib/timer";

/**
 * Prédiction de la réponse de l'autre, avant de répondre (§18).
 * Verrouillée côté serveur : invisible pour l'autre joueur jusqu'au reveal.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const parsed = predictSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Prédiction invalide." }, { status: 400 });
  }

  const gameSession = await db.gameSession.findUnique({ where: { id } });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const round = await db.round.findUnique({
    where: { id: parsed.data.roundId },
    include: { predictions: true },
  });
  if (!round || round.sessionId !== gameSession.id) {
    return NextResponse.json({ error: "Manche introuvable." }, { status: 404 });
  }
  if (isExpired(round.expiresAt, Date.now())) {
    await resolveExpiredRounds(gameSession.id);
    return NextResponse.json({ error: "Temps écoulé pour cette question.", expired: true }, { status: 400 });
  }

  const guard = canPredict({
    roundStatus: round.status,
    alreadyPredicted: round.predictions.some((p) => p.userId === userId),
  });
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  await db.prediction.create({
    data: { roundId: round.id, userId, choice: parsed.data.choice },
  });

  return NextResponse.json({ ok: true });
}
