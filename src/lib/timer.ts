/**
 * Logique pure du minuteur de manche.
 *
 * Rien ici ne touche à la base ni à la requête : tout est testable unitairement.
 * L'horodatage est toujours fourni par l'appelant (`serverNow`) pour que le
 * serveur et le client partagent la même référence de temps.
 */

/** Durée d'une manche en millisecondes, selon le niveau de la question. */
export const ROUND_DURATIONS: Record<number, number> = {
  1: 60_000,
  2: 45_000,
  3: 30_000,
};

export const DEFAULT_ROUND_DURATION = ROUND_DURATIONS[1];

export function roundDuration(level: number): number {
  return ROUND_DURATIONS[level] ?? DEFAULT_ROUND_DURATION;
}

export function expiryDate(level: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + roundDuration(level));
}

/** Temps restant en ms, borné à 0. `null` si la manche n'a pas de minuteur. */
export function remainingMs(expiresAt: Date | null | undefined, now: number): number | null {
  if (!expiresAt) return null;
  return Math.max(0, expiresAt.getTime() - now);
}

export function isExpired(expiresAt: Date | null | undefined, now: number): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() <= now;
}

export type RoundOutcome = "matched" | "mismatched" | "abandoned";

/**
 * Décide du sort d'une manche.
 *
 * - 2 réponses    → alignées ou non, quelle que soit l'expiration
 * - expiré + 1    → décalé (le partenaire n'a pas répondu à temps)
 * - expiré + 0    → manche abandonnée, à supprimer
 * - non expiré et moins de 2 réponses → `null`, la manche reste en cours
 */
export function resolveRoundOutcome(choices: string[], expired: boolean): RoundOutcome | null {
  if (choices.length >= 2) {
    return choices[0] === choices[1] ? "matched" : "mismatched";
  }
  if (!expired) return null;
  return choices.length === 1 ? "mismatched" : "abandoned";
}
