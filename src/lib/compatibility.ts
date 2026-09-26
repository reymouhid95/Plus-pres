import { db } from "@/lib/db";

/** Poids appliqués à chaque palier : plus la question est profonde, plus elle compte. */
export const LEVEL_WEIGHTS: Record<number, number> = { 1: 1, 2: 1.3, 3: 1.6 };

export function levelWeight(level: number): number {
  return LEVEL_WEIGHTS[level] ?? 1;
}

export type RoundScore = {
  level: number;
  matched: boolean | null;
};

export type Score = {
  percentage: number;
  totalRounds: number;
  matchedRounds: number;
  byLevel: Record<number, number>;
};

export const EMPTY_SCORE: Score = {
  percentage: 0,
  totalRounds: 0,
  matchedRounds: 0,
  byLevel: {},
};

/**
 * Calcule le score de compatibilité à partir de manches déjà révélées :
 * pourcentage pondéré des manches où les deux joueurs ont choisi la même option.
 */
export function scoreRounds(rounds: RoundScore[]): Score {
  if (rounds.length === 0) return { ...EMPTY_SCORE, byLevel: {} };

  let weightedTotal = 0;
  let weightedMatched = 0;
  const byLevelTotals: Record<number, { total: number; matched: number }> = {};

  for (const round of rounds) {
    const weight = levelWeight(round.level);
    weightedTotal += weight;
    if (round.matched) weightedMatched += weight;

    if (!byLevelTotals[round.level]) byLevelTotals[round.level] = { total: 0, matched: 0 };
    byLevelTotals[round.level].total += 1;
    if (round.matched) byLevelTotals[round.level].matched += 1;
  }

  const byLevel: Record<number, number> = {};
  for (const [level, value] of Object.entries(byLevelTotals)) {
    byLevel[Number(level)] = Math.round((value.matched / value.total) * 100);
  }

  return {
    percentage: Math.round((weightedMatched / weightedTotal) * 100),
    totalRounds: rounds.length,
    matchedRounds: rounds.filter((round) => round.matched).length,
    byLevel,
  };
}

/**
 * Score d'une session : récupère les manches révélées puis les pondère.
 */
export async function computeCompatibility(sessionId: string): Promise<Score> {
  const rounds = await db.round.findMany({
    where: { sessionId, status: "revealed" },
    select: { level: true, matched: true },
  });
  return scoreRounds(rounds);
}
