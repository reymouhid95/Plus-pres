import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const gameSession = await db.gameSession.findUnique({ where: { id } });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (gameSession.hostId !== userId && gameSession.partnerId !== userId) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const nextLevel = Math.min(gameSession.currentLevel + 1, 3);
  const status = gameSession.currentLevel >= 3 ? "completed" : "active";

  const updated = await db.gameSession.update({
    where: { id },
    data: { currentLevel: nextLevel, status },
  });

  return NextResponse.json(updated);
}
