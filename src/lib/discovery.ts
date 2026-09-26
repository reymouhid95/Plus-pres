import { db } from "./db";
import { scoreRounds } from "./compatibility";

export type DailyDiscovery = {
  id: string;
  sessionId: string;
  content: string;
  createdAt: Date;
};

/**
 * Génère la « découverte du jour » à la fin d'une session (§24).
 * Synthèse factuelle basée sur les résultats de la partie.
 */
export async function generateDailyDiscovery(sessionId: string): Promise<DailyDiscovery> {
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      duo: { select: { id: true } },
      rounds: {
        where: { status: "revealed" },
        include: {
          question: { select: { text: true, type: true, category: true } },
          answers: { select: { userId: true, choice: true } },
        },
      },
    },
  });

  if (!session) throw new Error("Session introuvable");

  const rounds = session.rounds;
  const score = scoreRounds(rounds);

  // Construire la synthèse
  const total = score.totalRounds;
  const matched = score.matchedRounds;
  const mismatched = total - matched;

  // Trouver la question la plus alignée et la plus divergente
  const byCategory: Record<string, { total: number; matched: number }> = {};
  for (const round of rounds) {
    const cat = round.question.category ?? "Autre";
    if (!byCategory[cat]) byCategory[cat] = { total: 0, matched: 0 };
    byCategory[cat].total++;
    if (round.matched) byCategory[cat].matched++;
  }

  let bestCat = "";
  let bestRate = -1;
  let worstCat = "";
  let worstRate = 2;

  for (const [cat, stats] of Object.entries(byCategory)) {
    const rate = stats.matched / stats.total;
    if (rate > bestRate) { bestRate = rate; bestCat = cat; }
    if (rate < worstRate) { worstRate = rate; worstCat = cat; }
  }

  // Construire le texte
  const parts: string[] = [];

  parts.push(`Vous avez joué ${total} carte${total > 1 ? "s" : ""} ensemble.`);

  if (matched > 0) {
    parts.push(`${matched} réponse${matched > 1 ? "s" : ""} alignée${matched > 1 ? "s" : ""} : vous pensiez pareil sur ${matched > 1 ? "ces points" : "ce point"}.`);
  }
  if (mismatched > 0) {
    parts.push(`${mismatched} différence${mismatched > 1 ? "s" : ""} révélée${mismatched > 1 ? "s" : ""} : l'occasion d'en parler.`);
  }

  if (bestCat && bestRate >= 0.8) {
    parts.push(`Point fort : ${bestCat} (${Math.round(bestRate * 100)}% d'alignement).`);
  }
  if (worstCat && worstRate < 0.5) {
    parts.push(`À explorer : ${worstCat} (${Math.round(worstRate * 100)}% d'alignement).`);
  }

  // Ajouter une anecdote factuelle
  const sampleRound = rounds.find((r) => r.matched === false);
  if (sampleRound) {
    const answers = sampleRound.answers;
    if (answers.length === 2) {
      parts.push(`Par exemple, sur "${sampleRound.question.text}", vous avez choisi différemment.`);
    }
  }

  const content = parts.join(" ");

  return db.dailyDiscovery.upsert({
    where: { sessionId },
    create: { sessionId, content },
    update: { content },
  });
}

/** Récupère la découverte du jour pour une session. */
export async function getDailyDiscovery(sessionId: string): Promise<DailyDiscovery | null> {
  return db.dailyDiscovery.findUnique({ where: { sessionId } });
}

/** Récupère les dernières découvertes d'un duo. */
export async function listDiscoveriesForDuo(duoId: string, limit = 10) {
  const sessions = await db.gameSession.findMany({
    where: { duoId, status: "completed" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { discovery: true },
  });

  return sessions
    .filter((s) => s.discovery)
    .map((s) => ({ ...s.discovery!, sessionDate: s.createdAt }));
}