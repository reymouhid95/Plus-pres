import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createDuoWithSession, otherMemberId } from "@/lib/duo";
import { SESSION_STATUS } from "@/lib/session-state";
import { rateLimit, rateLimitConfigs, identifiers } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: Request) {
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

  const body = await req.json().catch(() => ({}));
  const duoId = typeof body?.duoId === "string" ? body.duoId : null;

  if (duoId) {
    // Rematch : nouvelle session sur le même duo, même code (§44).
    // Le joueur qui n'a pas démarré la précédente commence celle-ci.
    const duo = await db.duo.findUnique({
      where: { id: duoId },
      select: { code: true, members: { select: { userId: true } } },
    });
    if (!duo) return NextResponse.json({ error: "Duo introuvable." }, { status: 404 });
    const memberIds = duo.members.map((member) => member.userId);
    if (!memberIds.includes(userId)) {
      return NextResponse.json({ error: "Vous ne faites pas partie de ce duo." }, { status: 403 });
    }
    const last = await db.gameSession.findFirst({
      where: { duoId },
      orderBy: { createdAt: "desc" },
      select: { turnUserId: true },
    });
    const gameSession = await db.gameSession.create({
      data: {
        duoId,
        status: SESSION_STATUS.LOBBY,
        turnUserId: otherMemberId(memberIds, last?.turnUserId ?? userId) ?? userId,
      },
    });
    await trackEvent("rematch_started", { userId, duoId, sessionId: gameSession.id });
    return NextResponse.json({ ...gameSession, code: duo.code });
  }

  // Phase B : une « nouvelle partie » crée un duo (hôte seul) et sa session.
  const { duo, session: gameSession } = await createDuoWithSession(userId);
  await trackEvent("session_created", { userId, duoId: duo.id, sessionId: gameSession.id });

  return NextResponse.json({ ...gameSession, code: duo.code });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const userId = (session.user as any).id as string;
  const sessions = await db.gameSession.findMany({
    where: { duo: { members: { some: { userId } } } },
    orderBy: { createdAt: "desc" },
    include: {
      duo: {
        select: {
          code: true,
          status: true,
          members: {
            include: { user: { select: { displayName: true, avatarEmoji: true } } },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json(sessions);
}
