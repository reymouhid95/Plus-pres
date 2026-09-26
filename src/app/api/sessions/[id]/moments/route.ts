import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { createMoment } from "@/lib/moments";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const gameSession = await db.gameSession.findUnique({ where: { id }, select: { duoId: true } });
  if (!gameSession) return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const moments = await db.moment.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "desc" },
    include: { question: { select: { id: true, text: true, type: true, options: true } } },
  });

  return NextResponse.json(moments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const gameSession = await db.gameSession.findUnique({ where: { id }, select: { duoId: true } });
  if (!gameSession) return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, imageUrl, questionId } = body;

  if (!title) {
    return NextResponse.json({ error: "Titre requis." }, { status: 400 });
  }

  const moment = await createMoment({
    duoId: gameSession.duoId,
    sessionId: id,
    title,
    content: content ?? null,
    imageUrl: imageUrl ?? null,
    questionId: questionId ?? null,
  });

  return NextResponse.json(moment, { status: 201 });
}