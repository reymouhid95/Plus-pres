import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { createChallenge, listChallengesForDuo } from "@/lib/challenges";
import { sanitizeText, sanitizeForDisplay } from "@/lib/sanitize";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const memberships = await db.duoMember.findMany({
    where: { userId },
    select: { duoId: true },
  });
  const duoIds = memberships.map((m) => m.duoId);

  const challenges = await db.challenge.findMany({
    where: { duoId: { in: duoIds } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(challenges);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const { duoId, title, description } = body;

  if (!duoId || !title) {
    return NextResponse.json({ error: "duoId et title requis." }, { status: 400 });
  }

  if (!(await isDuoMember(duoId, userId))) {
    return NextResponse.json({ error: "Vous ne faites pas partie de ce duo." }, { status: 403 });
  }

  // Sanitize user inputs
  const safeTitle = sanitizeText(title).slice(0, 100);
  const safeDescription = description ? sanitizeForDisplay(description).slice(0, 500) : null;

  if (!safeTitle) {
    return NextResponse.json({ error: "Titre invalide." }, { status: 400 });
  }

  const challenge = await createChallenge({
    duoId,
    title: safeTitle,
    description: safeDescription,
  });

  return NextResponse.json(challenge, { status: 201 });
}