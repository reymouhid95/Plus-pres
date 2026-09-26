import { db } from "./db";
import { DUO_ROLES } from "./duo";
import { clientSessionStatus } from "./session-state";
import { scoreRounds } from "./compatibility";
import { byLevelCounts, timeline, topMismatches, type LevelStat, type MismatchStat, type RoundStat, type TimelinePoint } from "./stats";

export type PartnerRef = { id: string; displayName: string; avatarEmoji: string };

export type SessionSummary = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  partner: PartnerRef | null;
  rounds: number;
  matchedRounds: number;
  percentage: number;
};

export type UserStats = {
  totalSessions: number;
  completedSessions: number;
  runningSessions: number;
  totalRounds: number;
  matchedRounds: number;
  percentage: number;
  byLevel: LevelStat[];
  timeline: TimelinePoint[];
  mismatches: MismatchStat[];
};

export type ReviewRound = {
  id: string;
  level: number;
  createdAt: string;
  questionId: string;
  questionText: string;
  mine: string | null;
  theirs: string | null;
  matched: boolean;
};

export type SessionReview = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  host: PartnerRef;
  partner: PartnerRef | null;
  rounds: ReviewRound[];
  percentage: number;
  totalRounds: number;
  matchedRounds: number;
};

const PARTNER_FIELDS = { id: true, displayName: true, avatarEmoji: true } as const;

/** Clause : sessions des duos dont l'utilisateur est membre. */
function memberWhere(userId: string) {
  return { duo: { members: { some: { userId } } } };
}

/** L'autre membre du duo (ou null si le partenaire n'a pas encore rejoint). */
function otherUser(
  members: { userId: string; user: PartnerRef }[],
  userId: string,
): PartnerRef | null {
  return members.find((member) => member.userId !== userId)?.user ?? null;
}

/** Dernières parties de l'utilisateur, avec leur taux d'alignement pondéré. */
export async function listSessionsForUser(userId: string, limit = 50): Promise<SessionSummary[]> {
  const sessions = await db.gameSession.findMany({
    where: memberWhere(userId),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      duo: {
        select: {
          code: true,
          status: true,
          members: {
            include: { user: { select: PARTNER_FIELDS } },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
      rounds: { where: { status: "revealed" }, select: { level: true, matched: true } },
    },
  });

  return sessions.map((session) => {
    const score = scoreRounds(session.rounds);
    return {
      id: session.id,
      code: session.duo.code,
      // Statut côté client (waiting/active/completed) pour les pages existantes.
      status: clientSessionStatus(session.duo.status, session.status),
      createdAt: session.createdAt.toISOString(),
      partner: otherUser(session.duo.members, userId),
      rounds: score.totalRounds,
      matchedRounds: score.matchedRounds,
      percentage: score.percentage,
    };
  });
}

/** Agrégats globaux de l'utilisateur, en une seule passe sur les manches. */
export async function getUserStats(userId: string, days = 14): Promise<UserStats> {
  const where = memberWhere(userId);

  const [sessions, rounds] = await Promise.all([
    db.gameSession.findMany({ where, select: { status: true } }),
    db.round.findMany({
      where: { status: "revealed", session: where },
      orderBy: { createdAt: "asc" },
      select: {
        level: true,
        matched: true,
        createdAt: true,
        questionId: true,
        question: { select: { text: true } },
      },
    }),
  ]);

  const stats: RoundStat[] = rounds.map((round) => ({
    level: round.level,
    matched: round.matched,
    createdAt: round.createdAt,
    questionId: round.questionId,
    questionText: round.question.text,
  }));

  const score = scoreRounds(stats);

  return {
    totalSessions: sessions.length,
    completedSessions: sessions.filter((session) => session.status === "completed").length,
    runningSessions: sessions.filter((session) => session.status !== "completed").length,
    totalRounds: score.totalRounds,
    matchedRounds: score.matchedRounds,
    percentage: score.percentage,
    byLevel: byLevelCounts(stats),
    timeline: timeline(stats, days),
    mismatches: topMismatches(stats),
  };
}

/**
 * Revue complète d'une partie : uniquement les manches révélées.
 * `null` si la partie n'existe pas ou si l'utilisateur n'en fait pas partie.
 */
export async function getSessionReview(sessionId: string, userId: string): Promise<SessionReview | null> {
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      duo: {
        select: {
          code: true,
          status: true,
          members: {
            include: { user: { select: PARTNER_FIELDS } },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
      rounds: {
        where: { status: "revealed" },
        orderBy: { createdAt: "asc" },
        include: {
          question: { select: { id: true, text: true } },
          answers: { select: { userId: true, choice: true } },
        },
      },
    },
  });

  if (!session) return null;
  const memberIds = session.duo.members.map((member) => member.userId);
  if (!memberIds.includes(userId)) return null;
  const hostUser =
    session.duo.members.find((member) => member.role === DUO_ROLES.HOST)?.user ??
    session.duo.members[0]?.user ??
    null;
  if (!hostUser) return null;

  const rounds: ReviewRound[] = session.rounds.map((round) => ({
    id: round.id,
    level: round.level,
    createdAt: round.createdAt.toISOString(),
    questionId: round.question.id,
    questionText: round.question.text,
    mine: round.answers.find((answer) => answer.userId === userId)?.choice ?? null,
    theirs: round.answers.find((answer) => answer.userId !== userId)?.choice ?? null,
    matched: round.matched === true,
  }));

  const score = scoreRounds(rounds);

  return {
    id: session.id,
    code: session.duo.code,
    status: clientSessionStatus(session.duo.status, session.status),
    createdAt: session.createdAt.toISOString(),
    host: hostUser,
    partner: otherUser(session.duo.members, userId),
    rounds,
    percentage: score.percentage,
    totalRounds: score.totalRounds,
    matchedRounds: score.matchedRounds,
  };
}
