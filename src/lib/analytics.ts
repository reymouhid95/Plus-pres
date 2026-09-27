import { db } from "./db";

export type AnalyticsEventName =
  | "user_registered"
  | "user_logged_in"
  | "user_logged_out"
  | "session_created"
  | "session_joined"
  | "session_started"
  | "card_drawn"
  | "prediction_made"
  | "answer_submitted"
  | "round_revealed"
  | "reaction_added"
  | "discussion_started"
  | "session_completed"
  | "moment_created"
  | "moment_exported"
  | "challenge_created"
  | "challenge_completed"
  | "rematch_started"
  | "user_upgraded";

interface AnalyticsEventData {
  userId?: string;
  duoId?: string;
  sessionId?: string;
  roundId?: string;
  matched?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Enregistre un événement analytique
 * Stocké en base pour analyses ultérieures (§38)
 */
export async function trackEvent(
  eventName: AnalyticsEventName,
  data: AnalyticsEventData = {}
): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: {
        eventName,
        userId: data.userId,
        duoId: data.duoId,
        sessionId: data.sessionId,
        metadata: (data.metadata ?? {}) as any,
      },
    });
  } catch (error) {
    // Ne pas faire échouer l'action principale si l'analytics échoue
    console.warn("Analytics tracking failed:", error);
  }
}

/**
 * Récupère les statistiques d'activation (inscriptions, connexions)
 */
export async function getActivationStats(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [registrations, logins, sessionsCreated, sessionsJoined] = await Promise.all([
    db.analyticsEvent.count({
      where: { eventName: "user_registered", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "user_logged_in", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "session_created", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "session_joined", createdAt: { gte: since } },
    }),
  ]);

  return { registrations, logins, sessionsCreated, sessionsJoined };
}

/**
 * Récupère les statistiques d'engagement (actions de jeu)
 */
export async function getEngagementStats(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [questionsAnswered, roundsCompleted, sessionsCompleted] = await Promise.all([
    db.analyticsEvent.count({
      where: { eventName: "answer_submitted", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "round_revealed", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "session_completed", createdAt: { gte: since } },
    }),
  ]);

  return { questionsAnswered, roundsCompleted, sessionsCompleted };
}

/**
 * Récupère les statistiques d'interaction (révélations, réactions, conversations)
 */
export async function getInteractionStats(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [reveals, reactions, conversations] = await Promise.all([
    db.analyticsEvent.count({
      where: { eventName: "round_revealed", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "reaction_added", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "discussion_started", createdAt: { gte: since } },
    }),
  ]);

  return { reveals, reactions, conversations };
}

/**
 * Récupère les statistiques de rétention (J+1, J+7, J+30)
 */
export async function getRetentionStats() {
  const now = new Date();
  const day1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [d1, d7, d30] = await Promise.all([
    db.analyticsEvent.count({
      where: {
        eventName: "session_completed",
        createdAt: { gte: day1, lte: now },
      },
    }),
    db.analyticsEvent.count({
      where: {
        eventName: "session_completed",
        createdAt: { gte: day7, lte: now },
      },
    }),
    db.analyticsEvent.count({
      where: {
        eventName: "session_completed",
        createdAt: { gte: day30, lte: now },
      },
    }),
  ]);

  return { d1, d7, d30 };
}

/**
 * Récupère les statistiques virales (invitations envoyées/acceptées)
 */
export async function getViralStats(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [invitationsSent, invitationsAccepted] = await Promise.all([
    db.analyticsEvent.count({
      where: { eventName: "session_created", createdAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { eventName: "session_joined", createdAt: { gte: since } },
    }),
  ]);

  const conversionRate =
    invitationsSent > 0 ? (invitationsAccepted / invitationsSent) * 100 : 0;

  return { invitationsSent, invitationsAccepted, conversionRate };
}