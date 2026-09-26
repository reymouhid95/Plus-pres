/**
 * Machine d'état — cahier §33.
 *
 * WAITING / READY vivent sur le Duo (`pending` / `ready`).
 * PLAYING / COMPLETED vivent sur la GameSession.
 * WAITING_FOR_ANSWERS / REVEALING / REACTION / DISCUSSION vivent sur le Round
 * (`reaction` et `discussion` sont réservés aux Phases C : §19, §20).
 * NEXT_ROUND est la transition `advanceSession`.
 *
 * Le serveur est responsable des transitions : chaque route interroge ces
 * gardes au lieu de vérifier les états à la main.
 */
export const SESSION_STATUS = { PLAYING: "playing", COMPLETED: "completed" } as const;

export const ROUND_STATUS = {
  PENDING: "pending",
  REVEALED: "revealed",
  REACTION: "reaction",
  DISCUSSION: "discussion",
} as const;

export const MAX_LEVEL = 3;

export type Guard = { ok: true } | { ok: false; error: string; status: 400 | 403 };

const deny = (error: string, status: 400 | 403 = 400): Guard => ({ ok: false, error, status });

/** Tirer une carte : duo prêt, partie en cours, à son tour, aucune carte en attente. */
export function canDraw(input: {
  duoStatus: string;
  sessionStatus: string;
  turnUserId: string | null;
  userId: string;
  hasPendingRound: boolean;
}): Guard {
  if (input.duoStatus !== "ready") {
    return deny("La partie n'est pas encore active (en attente du partenaire).");
  }
  if (input.sessionStatus !== SESSION_STATUS.PLAYING) {
    return deny("Cette partie est terminée.");
  }
  if (input.turnUserId !== input.userId) {
    return deny("Ce n'est pas votre tour de tirer une carte.", 403);
  }
  if (input.hasPendingRound) {
    return deny("Une carte est déjà en attente de réponses.");
  }
  return { ok: true };
}

/**
 * Répondre : manche non révélée, pas de doublon.
 * L'expiration reste gérée par la route (effet de bord + payload `expired`).
 */
export function canAnswer(input: { roundStatus: string; alreadyAnswered: boolean }): Guard {
  if (input.roundStatus !== ROUND_STATUS.PENDING) {
    return deny("Cette manche est déjà révélée.");
  }
  if (input.alreadyAnswered) {
    return deny("Vous avez déjà répondu à cette manche.");
  }
  return { ok: true };
}

/** Passage au niveau suivant ou fin de partie (NEXT_ROUND → COMPLETED). */
export function advanceSession(currentLevel: number): {
  nextLevel: number;
  status: "playing" | "completed";
} {
  if (currentLevel >= MAX_LEVEL) {
    return { nextLevel: MAX_LEVEL, status: SESSION_STATUS.COMPLETED };
  }
  return { nextLevel: currentLevel + 1, status: SESSION_STATUS.PLAYING };
}

/**
 * Statut exposé au client : inchangé par la Phase A pour ne pas toucher
 * au GameClient (`waiting` = le partenaire n'a pas encore rejoint).
 */
export function clientSessionStatus(
  duoStatus: string,
  sessionStatus: string,
): "waiting" | "active" | "completed" {
  if (duoStatus !== "ready") return "waiting";
  if (sessionStatus === SESSION_STATUS.COMPLETED) return "completed";
  return "active";
}
