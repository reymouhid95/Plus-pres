import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { customAlphabet } from "nanoid";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const userId = (session.user as any).id as string;
  let code = genCode();
  // évite les collisions (rare, mais on vérifie)
  while (await db.gameSession.findUnique({ where: { code } })) {
    code = genCode();
  }

  const gameSession = await db.gameSession.create({
    data: { code, hostId: userId, turnUserId: userId },
  });

  return NextResponse.json(gameSession);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const userId = (session.user as any).id as string;
  const sessions = await db.gameSession.findMany({
    where: { OR: [{ hostId: userId }, { partnerId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      host: { select: { displayName: true, avatarEmoji: true } },
      partner: { select: { displayName: true, avatarEmoji: true } },
    },
  });

  return NextResponse.json(sessions);
}
