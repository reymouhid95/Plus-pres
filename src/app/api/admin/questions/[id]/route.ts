import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionSchema } from "@/lib/validation";

async function checkAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "admin";
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!(await checkAdmin((session.user as any).id))) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const parsed = questionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const question = await db.question.update({ where: { id }, data: parsed.data });
  return NextResponse.json(question);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!(await checkAdmin((session.user as any).id))) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  await db.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}