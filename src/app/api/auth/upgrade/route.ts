import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { upgradeSchema } from "@/lib/validation";

/**
 * Conversion d'un joueur invité en compte complet (§29).
 * Le même `user.id` est conservé : parties, réponses et historique suivent.
 * Le client doit ensuite rappeler `signIn("credentials")` pour rafraîchir le JWT.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  let parsed: ReturnType<typeof upgradeSchema.safeParse>;
  try {
    parsed = upgradeSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (!user.isGuest) {
    return NextResponse.json({ error: "Ce compte est déjà complet." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.update({
    where: { id: userId },
    data: {
      email,
      passwordHash,
      isGuest: false,
      displayName: parsed.data.displayName ?? user.displayName,
    },
  });

  return NextResponse.json({ ok: true });
}
