export type QuestionCandidate = { id: string };

/**
 * Choisit une question en évitant celles déjà tirées dans la partie.
 * Si tout le niveau a été épuisé, on repioche dans l'ensemble du niveau
 * (permet de rejouer). Renvoie `null` si aucune question n'est disponible.
 */
export function pickUnusedQuestion<T extends QuestionCandidate>(
  candidates: T[],
  usedIds: string[],
): T | null {
  const used = new Set(usedIds);
  const unused = candidates.filter((candidate) => !used.has(candidate.id));
  const pool = unused.length > 0 ? unused : candidates;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
