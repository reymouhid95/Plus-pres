import { db } from "./db";
import { isExpired, resolveRoundOutcome } from "./timer";

/**
 * Résout les manches dont le minuteur est écoulé.
 *
 * Appelée par le flux SSE, par le polling de secours et par la route `answer`,
 * afin que les trois chemins convergent vers exactement la même décision.
 * La transition est revendiquée par un `updateMany` conditionné sur
 * `status: "pending"` : une seule résolution peut gagner.
 */
export async function resolveExpiredRounds(sessionId: string): Promise<void> {
  const round = await db.round.findFirst({
    where: { sessionId, status: "pending", expiresAt: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  if (!round || !isExpired(round.expiresAt, Date.now())) return;

  await db.$transaction(async (tx) => {
    const current = await tx.round.findUnique({
      where: { id: round.id },
      include: { answers: { select: { choice: true } } },
    });
    if (!current || current.status !== "pending" || !isExpired(current.expiresAt, Date.now())) {
      return;
    }

    const outcome = resolveRoundOutcome(
      current.answers.map((answer) => answer.choice),
      true,
    );

    if (outcome === "abandoned") {
      // Aucune réponse : on retire la manche pour que le joueur puisse retirer.
      const claimed = await tx.round.updateMany({
        where: { id: current.id, status: "pending" },
        data: { status: "revealed" },
      });
      if (claimed.count === 0) return;
      await tx.answer.deleteMany({ where: { roundId: current.id } });
      await tx.round.delete({ where: { id: current.id } });
      return;
    }

    const claimed = await tx.round.updateMany({
      where: { id: current.id, status: "pending" },
      data: { status: "revealed", matched: outcome === "matched" },
    });
    if (claimed.count === 0) return;

    const session = await tx.gameSession.findUnique({
      where: { id: sessionId },
      select: { turnUserId: true, hostId: true, partnerId: true },
    });
    if (!session) return;

    const nextTurnUserId =
      session.turnUserId === session.hostId ? session.partnerId : session.hostId;
    await tx.gameSession.update({
      where: { id: sessionId },
      data: { turnUserId: nextTurnUserId ?? session.hostId },
    });
  });
}
