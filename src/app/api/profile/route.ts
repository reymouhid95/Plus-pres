import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, email: true, displayName: true, avatarEmoji: true, bio: true, birthdate: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const { birthdate, ...rest } = parsed.data;
  const user = await db.user.update({
    where: { id: (session.user as any).id },
    data: { ...rest, ...(birthdate ? { birthdate: new Date(birthdate) } : {}) },
  });

  return NextResponse.json({ ok: true, user: { displayName: user.displayName, avatarEmoji: user.avatarEmoji } });
}
