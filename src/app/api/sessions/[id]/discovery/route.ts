import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { generateDailyDiscovery, getDailyDiscovery } from "@/lib/discovery";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const gameSession = await db.gameSession.findUnique({ where: { id }, select: { duoId: true, status: true } });
  if (!gameSession) return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  if (gameSession.status !== "completed") {
    return NextResponse.json({ error: "La session n'est pas terminée." }, { status: 400 });
  }

  const discovery = await getDailyDiscovery(id);
  if (!discovery) return NextResponse.json({ error: "Aucune découverte pour cette session." }, { status: 404 });

  return NextResponse.json(discovery);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const gameSession = await db.gameSession.findUnique({ where: { id }, select: { duoId: true, status: true } });
  if (!gameSession) return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  if (!(await isDuoMember(gameSession.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  if (gameSession.status !== "completed") {
    return NextResponse.json({ error: "La session n'est pas terminée." }, { status: 400 });
  }

  const discovery = await generateDailyDiscovery(id);
  return NextResponse.json(discovery, { status: 201 });
}