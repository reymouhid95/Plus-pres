import { scoreRounds, type RoundScore } from "./compatibility";
import { levelMeta } from "./levels";

/**
 * Statistiques d'historique, calculées à partir de manches déjà révélées.
 *
 * Tout est pur : les fonctions reçoivent des enregistrements simples et ne
 * dépendent ni de Prisma ni de la requête. Le taux global pondéré reste
 * délégué à `scoreRounds` pour rester strictement cohérent avec l'écran de fin.
 */
export type RoundStat = RoundScore & {
  questionId: string;
  questionText: string;
  createdAt: Date | string;
};

export type LevelStat = {
  level: number;
  label: string;
  color: string;
  total: number;
  matched: number;
  percentage: number;
};

export type TimelinePoint = {
  date: string;
  total: number;
  matched: number;
  percentage: number;
};

export type MismatchStat = {
  questionId: string;
  questionText: string;
  total: number;
  missed: number;
};

export { scoreRounds };

/** Jour UTC d'une date, au format `AAAA-MM-JJ`. */
export function toUtcDay(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

/** Répartition par niveau, avec taux non pondéré (alignées / total). */
export function byLevelCounts(rounds: RoundStat[]): LevelStat[] {
  const totals = new Map<number, { total: number; matched: number }>();

  for (const round of rounds) {
    const entry = totals.get(round.level) ?? { total: 0, matched: 0 };
    entry.total += 1;
    if (round.matched) entry.matched += 1;
    totals.set(round.level, entry);
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a - b)
    .map(([level, entry]) => {
      const meta = levelMeta(level);
      return {
        level,
        label: meta.label,
        color: meta.color,
        total: entry.total,
        matched: entry.matched,
        percentage: entry.total === 0 ? 0 : Math.round((entry.matched / entry.total) * 100),
      };
    });
}

/**
 * Série journalière sur `days` jours, terminée aujourd'hui.
 * Les jours sans manche sont comblés à zéro pour éviter les trous de courbe.
 */
export function timeline(rounds: RoundStat[], days: number, now: Date = new Date()): TimelinePoint[] {
  const buckets = new Map<string, { total: number; matched: number }>();

  for (const round of rounds) {
    const key = toUtcDay(round.createdAt);
    const entry = buckets.get(key) ?? { total: 0, matched: 0 };
    entry.total += 1;
    if (round.matched) entry.matched += 1;
    buckets.set(key, entry);
  }

  const points: TimelinePoint[] = [];
  const dayMs = 86_400_000;

  for (let offset = days - 1; offset >= 0; offset--) {
    const key = new Date(now.getTime() - offset * dayMs).toISOString().slice(0, 10);
    const entry = buckets.get(key) ?? { total: 0, matched: 0 };
    points.push({
      date: key,
      total: entry.total,
      matched: entry.matched,
      percentage: entry.total === 0 ? 0 : Math.round((entry.matched / entry.total) * 100),
    });
  }

  return points;
}

/** Les questions qui vous désalignent le plus, les plus fréquentes d'abord. */
export function topMismatches(rounds: RoundStat[], limit = 5): MismatchStat[] {
  const byQuestion = new Map<string, MismatchStat>();

  for (const round of rounds) {
    const entry = byQuestion.get(round.questionId) ?? {
      questionId: round.questionId,
      questionText: round.questionText,
      total: 0,
      missed: 0,
    };
    entry.total += 1;
    if (!round.matched) entry.missed += 1;
    byQuestion.set(round.questionId, entry);
  }

  return [...byQuestion.values()]
    .filter((entry) => entry.missed > 0)
    .sort(
      (a, b) =>
        b.missed - a.missed ||
        b.total - a.total ||
        a.questionText.localeCompare(b.questionText, "fr"),
    )
    .slice(0, limit);
}
