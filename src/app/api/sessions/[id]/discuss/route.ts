import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { canInteract } from "@/lib/session-state";
import { discussSchema } from "@/lib/validation";

/** Action de conversation après une divergence (§20, §21). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const parsed = discussSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const gameSession = await db.gameSession.findUnique({ where: { id } });
  if (!gameSession) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Vous ne participez pas à cette partie." }, { status: 403 });
  }

  const round = await db.round.findUnique({ where: { id: parsed.data.roundId } });
  if (!round || round.sessionId !== gameSession.id) {
    return NextResponse.json({ error: "Manche introuvable." }, { status: 404 });
  }

  const guard = canInteract({ roundStatus: round.status });
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  await db.discussion.upsert({
    where: { roundId_userId: { roundId: round.id, userId } },
    create: { roundId: round.id, userId, type: parsed.data.type, content: parsed.data.content },
    update: { type: parsed.data.type, content: parsed.data.content },
  });

  return NextResponse.json({ ok: true });
}
