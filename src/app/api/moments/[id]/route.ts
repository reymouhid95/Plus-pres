import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDuoMember } from "@/lib/duo";
import { getMomentById } from "@/lib/moments";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const moment = await getMomentById(id);
  if (!moment) return NextResponse.json({ error: "Moment introuvable." }, { status: 404 });

  if (!(await isDuoMember(moment.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  return NextResponse.json(moment);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { id } = await params;
  const moment = await getMomentById(id);
  if (!moment) return NextResponse.json({ error: "Moment introuvable." }, { status: 404 });

  if (!(await isDuoMember(moment.duoId, userId))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  await db.moment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}