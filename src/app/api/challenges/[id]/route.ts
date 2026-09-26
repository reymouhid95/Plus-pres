import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { completeChallenge, deleteChallenge } from "@/lib/challenges";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const challenge = await db.challenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge introuvable." }, { status: 404 });

  if (!(await isDuoMember(challenge.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const completed = await completeChallenge(id, userId);
  if (!completed) return NextResponse.json({ error: "Impossible de compléter." }, { status: 400 });

  return NextResponse.json(completed);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const challenge = await db.challenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge introuvable." }, { status: 404 });

  if (!(await isDuoMember(challenge.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  await deleteChallenge(id, userId);
  return NextResponse.json({ ok: true });
}