import { db } from "./db";
import { computeCompatibility } from "./compatibility";
import { resolveExpiredRounds } from "./expiry";

export type GameState = {
  id: string;
  code: string;
  status: string;
  currentLevel: number;
  turnUserId: string | null;
  host: { id: string; displayName: string; avatarEmoji: string };
  partner: { id: string; displayName: string; avatarEmoji: string } | null;
  currentRound: {
    id: string;
    level: number;
    status: string;
    matched: boolean | null;
    startedAt: string | null;
    expiresAt: string | null;
    question: { id: string; text: string; options: string[] };
    myAnswer: string | null;
    partnerAnswered: boolean;
    answers: { userId: string; choice: string }[];
  } | null;
  compatibility: {
    percentage: number;
    totalRounds: number;
    matchedRounds: number;
    byLevel: Record<number, number>;
  };
  /** Horodatage serveur, pour que le compte à rebours ne dépende pas de l'horloge client. */
  serverNow: number;
};

/**
 * Construit l'état complet d'une partie pour un joueur.
 *
 * `null` signifie soit « partie inexistante », soit « ce joueur n'en fait pas
 * partie » : la route décide du statut à renvoyer. Résout au passage les
 * manches expirées pour que le SSE et le polling de secours convergent.
 */
export async function buildGameState(sessionId: string, userId: string): Promise<GameState | null> {
  const membership = await db.gameSession.findUnique({
    where: { id: sessionId },
    select: { hostId: true, partnerId: true },
  });
  if (!membership) return null;
  if (membership.hostId !== userId && membership.partnerId !== userId) return null;

  await resolveExpiredRounds(sessionId);

  const full = await db.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      host: { select: { id: true, displayName: true, avatarEmoji: true } },
      partner: { select: { id: true, displayName: true, avatarEmoji: true } },
      rounds: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { question: true, answers: true },
      },
    },
  });
  if (!full) return null;

  const compatibility = await computeCompatibility(sessionId);
  const currentRound = full.rounds[0] ?? null;

  // Ne jamais exposer le choix de l'autre tant que les deux n'ont pas répondu
  let safeCurrentRound: GameState["currentRound"] = null;
  if (currentRound) {
    const bothAnswered = currentRound.status === "revealed";
    safeCurrentRound = {
      id: currentRound.id,
      level: currentRound.level,
      status: currentRound.status,
      matched: bothAnswered ? currentRound.matched : null,
      startedAt: currentRound.startedAt?.toISOString() ?? null,
      expiresAt: currentRound.expiresAt?.toISOString() ?? null,
      question: {
        id: currentRound.question.id,
        text: currentRound.question.text,
        options: currentRound.question.options,
      },
      myAnswer: currentRound.answers.find((a) => a.userId === userId)?.choice ?? null,
      partnerAnswered: currentRound.answers.some((a) => a.userId !== userId),
      answers: bothAnswered
        ? currentRound.answers.map((a) => ({ userId: a.userId, choice: a.choice }))
        : [],
    };
  }

  return {
    id: full.id,
    code: full.code,
    status: full.status,
    currentLevel: full.currentLevel,
    turnUserId: full.turnUserId,
    host: full.host,
    partner: full.partner,
    currentRound: safeCurrentRound,
    compatibility,
    serverNow: Date.now(),
  };
}
