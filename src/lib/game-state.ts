import { db } from "./db";
import { computeCompatibility } from "./compatibility";
import { resolveExpiredRounds } from "./expiry";
import { clientSessionStatus } from "./session-state";
import { DUO_ROLES, isDuoMember } from "./duo";

export type GameState = {
  id: string;
  code: string;
  duoId: string;
  status: string;
  currentLevel: number;
  maxRounds: number;
  roundsPlayed: number;
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
    reactions: { userId: string; emoji: string }[];
    discussions: { userId: string; type: string; content: string | null }[];
  } | null;
  compatibility: {
    percentage: number;
    totalRounds: number;
    matchedRounds: number;
    byLevel: Record<number, number>;
  };
  /** Bilan de fin de partie (§22) : points communs, différences, conversations, réactions. */
  results: {
    matched: number;
    mismatched: number;
    conversations: number;
    reactions: number;
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
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
    select: { duoId: true },
  });
  if (!session) return null;
  if (!(await isDuoMember(session.duoId, userId))) return null;

  await resolveExpiredRounds(sessionId);

  const full = await db.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      duo: {
        select: {
          code: true,
          status: true,
          members: {
            include: { user: { select: { id: true, displayName: true, avatarEmoji: true } } },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
      rounds: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          question: true,
          answers: true,
          reactions: { select: { userId: true, emoji: true } },
          discussions: { select: { userId: true, type: true, content: true } },
        },
      },
    },
  });
  if (!full) return null;

  const [conversationRounds, reactionCount] = await Promise.all([
    db.discussion.findMany({
      where: { round: { sessionId } },
      select: { roundId: true },
      distinct: ["roundId"],
    }),
    db.reaction.count({ where: { round: { sessionId } } }),
  ]);

  const hostMember =
    full.duo.members.find((member) => member.role === DUO_ROLES.HOST) ?? full.duo.members[0] ?? null;
  if (!hostMember) return null;
  const host = hostMember.user;
  const partner = full.duo.members.find((member) => member.userId !== userId)?.user ?? null;

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
      reactions: bothAnswered
        ? currentRound.reactions.map((reaction) => ({
            userId: reaction.userId,
            emoji: reaction.emoji,
          }))
        : [],
      discussions: bothAnswered
        ? currentRound.discussions.map((discussion) => ({
            userId: discussion.userId,
            type: discussion.type,
            content: discussion.content,
          }))
        : [],
    };
  }

  return {
    id: full.id,
    code: full.duo.code,
    duoId: full.duoId,
    // Statut dérivé pour le client existant : waiting = partenaire pas encore là.
    status: clientSessionStatus(full.duo.status, full.status),
    currentLevel: full.currentLevel,
    maxRounds: full.maxRounds,
    roundsPlayed: compatibility.totalRounds,
    turnUserId: full.turnUserId,
    host,
    partner,
    currentRound: safeCurrentRound,
    compatibility,
    results: {
      matched: compatibility.matchedRounds,
      mismatched: compatibility.totalRounds - compatibility.matchedRounds,
      conversations: conversationRounds.length,
      reactions: reactionCount,
    },
    serverNow: Date.now(),
  };
}
