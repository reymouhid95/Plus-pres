import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createDuoWithSession } from "@/lib/duo";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const userId = (session.user as any).id as string;
  // Phase A : une « nouvelle partie » crée un duo (hôte seul) et sa session.
  const { duo, session: gameSession } = await createDuoWithSession(userId);

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
