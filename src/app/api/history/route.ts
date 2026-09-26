import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listSessionsForUser } from "@/lib/history";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 100);

  const sessions = await listSessionsForUser(userId, limit);
  return NextResponse.json({ sessions });
}
