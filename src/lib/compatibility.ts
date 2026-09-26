import { db } from "@/lib/db";

/**
 * Calcule le score de compatibilité d'une session : pourcentage de manches
 * révélées où les deux joueurs ont choisi la même option, pondéré
 * légèrement plus fort pour les niveaux plus profonds.
 */
export async function computeCompatibility(sessionId: string) {
  const rounds = await db.round.findMany({
    where: { sessionId, status: "revealed" },
    select: { level: true, matched: true },
  });

  if (rounds.length === 0) {
    return { percentage: 0, totalRounds: 0, matchedRounds: 0, byLevel: {} as Record<number, number> };
  }

  const weight = (level: number) => (level === 1 ? 1 : level === 2 ? 1.3 : 1.6);

  let weightedTotal = 0;
  let weightedMatched = 0;
  const byLevelTotals: Record<number, { total: number; matched: number }> = {};

  for (const r of rounds) {
    const w = weight(r.level);
    weightedTotal += w;
    if (r.matched) weightedMatched += w;

    if (!byLevelTotals[r.level]) byLevelTotals[r.level] = { total: 0, matched: 0 };
    byLevelTotals[r.level].total += 1;
    if (r.matched) byLevelTotals[r.level].matched += 1;
  }

  const byLevel: Record<number, number> = {};
  for (const [lvl, v] of Object.entries(byLevelTotals)) {
    byLevel[Number(lvl)] = Math.round((v.matched / v.total) * 100);
  }

  return {
    percentage: Math.round((weightedMatched / weightedTotal) * 100),
    totalRounds: rounds.length,
    matchedRounds: rounds.filter((r) => r.matched).length,
    byLevel,
  };
}
