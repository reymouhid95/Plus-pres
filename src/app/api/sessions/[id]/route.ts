import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildGameState } from "@/lib/game-state";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const state = await buildGameState(id, userId);
  if (!state) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });

  return NextResponse.json(state);
}
