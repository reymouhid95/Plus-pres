import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import GameClient from "./GameClient";

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const gameSession = await db.gameSession.findUnique({ where: { id } });
  if (!gameSession || (gameSession.hostId !== userId && gameSession.partnerId !== userId)) {
    redirect("/dashboard");
  }

  return <GameClient sessionId={id} userId={userId} />;
}
