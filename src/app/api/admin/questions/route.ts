import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionSchema } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const questions = await db.question.findMany({
    orderBy: [{ level: "asc" }, { category: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const parsed = questionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const question = await db.question.create({ data: parsed.data });
  return NextResponse.json(question, { status: 201 });
}