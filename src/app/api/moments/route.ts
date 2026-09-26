import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { createMoment, listMomentsForDuo } from "@/lib/moments";
import { sanitizeText, sanitizeForDisplay, sanitizeUrl } from "@/lib/sanitize";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  // Récupérer les duos de l'utilisateur
  const memberships = await db.duoMember.findMany({
    where: { userId },
    select: { duoId: true },
  });
  const duoIds = memberships.map((m) => m.duoId);

  const moments = await db.moment.findMany({
    where: { duoId: { in: duoIds } },
    orderBy: { createdAt: "desc" },
    include: {
      session: { select: { id: true, createdAt: true } },
      question: { select: { id: true, text: true, type: true, options: true } },
    },
  });

  return NextResponse.json(moments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const { duoId, sessionId, title, content, imageUrl, questionId } = body;

  if (!duoId || !title) {
    return NextResponse.json({ error: "duoId et title requis." }, { status: 400 });
  }

  if (!(await isDuoMember(duoId, userId))) {
    return NextResponse.json({ error: "Vous ne faites pas partie de ce duo." }, { status: 403 });
  }

  // Sanitize user inputs
  const safeTitle = sanitizeText(title).slice(0, 100);
  const safeContent = content ? sanitizeForDisplay(content).slice(0, 2000) : null;
  const safeImageUrl = imageUrl ? sanitizeUrl(imageUrl) : null;

  if (!safeTitle) {
    return NextResponse.json({ error: "Titre invalide." }, { status: 400 });
  }

  const moment = await createMoment({
    duoId,
    sessionId: sessionId ?? null,
    title: safeTitle,
    content: safeContent,
    imageUrl: safeImageUrl,
    questionId: questionId ?? null,
  });

  return NextResponse.json(moment, { status: 201 });
}