import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { joinSchema, normalizeCode } from "@/lib/validation";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = joinSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Code invalide." }, { status: 400 });

  const userId = (session.user as any).id as string;
  const code = normalizeCode(parsed.data.code);

  const gameSession = await db.gameSession.findUnique({ where: { code } });
  if (!gameSession) return NextResponse.json({ error: "Aucune partie avec ce code." }, { status: 404 });
  if (gameSession.hostId === userId) {
    return NextResponse.json({ error: "Vous êtes déjà l'hôte de cette partie." }, { status: 400 });
  }
  if (gameSession.partnerId && gameSession.partnerId !== userId) {
    return NextResponse.json({ error: "Cette partie a déjà deux joueurs." }, { status: 400 });
  }

  const updated = await db.gameSession.update({
    where: { code },
    data: { partnerId: userId, status: "active" },
  });

  return NextResponse.json(updated);
}
