import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { canStart, SESSION_STATUS } from "@/lib/session-state";
import { rateLimit, rateLimitConfigs, identifiers } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";

/** Démarrer une expérience depuis le lobby (§11). Chaque membre peut lancer. */
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
    include: { duo: { select: { status: true } } },
  });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const guard = canStart({
    duoStatus: gameSession.duo.status,
    sessionStatus: gameSession.status,
  });
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const updated = await db.gameSession.update({
    where: { id },
    data: { status: SESSION_STATUS.PLAYING },
  });

  await trackEvent("session_started", { userId, duoId: gameSession.duoId, sessionId: id });

  return NextResponse.json(updated);
}
