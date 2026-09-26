import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { rateLimit, rateLimitConfigs, identifiers } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  // Rate limiting strict pour l'inscription (5 req/15min par IP)
  const rl = rateLimit(
    identifiers.ip(req as any),
    rateLimitConfigs.auth
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives d'inscription. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
    );
  }
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  const { email, password, displayName } = parsed.data;
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email: email.toLowerCase(), passwordHash, displayName },
  });

  // Track user registration
  await trackEvent("user_registered", { userId: user.id });

  return NextResponse.json({ id: user.id, email: user.email });
}
