import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAddMember, duoForCode, joinDuo } from "@/lib/duo";
import { joinSchema, normalizeCode } from "@/lib/validation";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const userId = (session.user as any).id as string;
  const parsed = joinSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Code invalide." }, { status: 400 });

  const code = normalizeCode(parsed.data.code);

  const duo = await duoForCode(code);
  if (!duo) return NextResponse.json({ error: "Aucun duo avec ce code." }, { status: 404 });

  const check = canAddMember(duo.memberUserIds, userId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const gameSession = await joinDuo(duo.id, userId);
  if (!gameSession) {
    return NextResponse.json({ error: "Aucune partie active dans ce duo." }, { status: 404 });
  }

  await trackEvent("session_joined", { userId, duoId: duo.id, sessionId: gameSession.id });

  return NextResponse.json({ id: gameSession.id });
}
