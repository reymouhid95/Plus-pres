import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStats } from "@/lib/history";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  return NextResponse.json(await getUserStats(userId));
}
