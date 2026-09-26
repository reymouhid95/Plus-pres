import { describe, expect, it } from "vitest";
import { byLevelCounts, timeline, toUtcDay, topMismatches, type RoundStat } from "./stats";

function round(overrides: Partial<RoundStat> & { questionId: string }): RoundStat {
  return {
    level: 1,
    matched: true,
    questionText: "Question ?",
    createdAt: "2026-01-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("toUtcDay", () => {
  it("formate une date au jour UTC", () => {
    expect(toUtcDay(new Date("2026-01-01T23:59:59.999Z"))).toBe("2026-01-01");
    expect(toUtcDay("2026-03-08T00:00:00.000Z")).toBe("2026-03-08");
  });
});

describe("byLevelCounts", () => {
  it("répartit les manches par niveau avec le taux brut", () => {
    const stats = byLevelCounts([
      round({ questionId: "a", level: 1, matched: true }),
      round({ questionId: "b", level: 1, matched: false }),
      round({ questionId: "c", level: 3, matched: true }),
    ]);

    expect(stats).toHaveLength(2);
    expect(stats[0]).toMatchObject({ level: 1, total: 2, matched: 1, percentage: 50 });
    expect(stats[1]).toMatchObject({ level: 3, total: 1, matched: 1, percentage: 100 });
    expect(stats[0].label).toBe("Découverte");
    expect(stats[1].label).toBe("Connexion");
  });

  it("renvoie une liste vide sans manche", () => {
    expect(byLevelCounts([])).toEqual([]);
  });
});

describe("timeline", () => {
  const now = new Date("2026-01-10T12:00:00.000Z");

  it("comble les jours sans manche", () => {
    const points = timeline(
      [round({ questionId: "a", createdAt: "2026-01-10T09:00:00.000Z" })],
      4,
      now,
    );

    expect(points.map((point) => point.date)).toEqual([
      "2026-01-07",
      "2026-01-08",
      "2026-01-09",
      "2026-01-10",
    ]);
    expect(points.slice(0, 3).every((point) => point.total === 0 && point.percentage === 0)).toBe(
      true,
    );
    expect(points[3]).toMatchObject({ total: 1, matched: 1, percentage: 100 });
  });

  it("agrège plusieurs manches le même jour", () => {
    const points = timeline(
      [
        round({ questionId: "a", createdAt: "2026-01-10T01:00:00.000Z" }),
        round({ questionId: "b", matched: false, createdAt: "2026-01-10T23:00:00.000Z" }),
      ],
      1,
      now,
    );

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({ date: "2026-01-10", total: 2, matched: 1, percentage: 50 });
  });

  it("ignore les manches plus anciennes que la fenêtre", () => {
    const points = timeline(
      [round({ questionId: "a", createdAt: "2025-12-01T12:00:00.000Z" })],
      3,
      now,
    );

    expect(points.every((point) => point.total === 0)).toBe(true);
  });
});

describe("topMismatches", () => {
  it("trie par nombre de désalignements puis par fréquence", () => {
    const rounds = [
      round({ questionId: "a", questionText: "A ?", matched: false }),
      round({ questionId: "a", questionText: "A ?", matched: false }),
      round({ questionId: "a", questionText: "A ?", matched: true }),
      round({ questionId: "b", questionText: "B ?", matched: false }),
      round({ questionId: "c", questionText: "C ?", matched: true }),
    ];

    const top = topMismatches(rounds, 5);

    expect(top).toHaveLength(2);
    expect(top[0]).toMatchObject({ questionId: "a", total: 3, missed: 2 });
    expect(top[1]).toMatchObject({ questionId: "b", total: 1, missed: 1 });
  });

  it("exclut les questions toujours alignées et respecte la limite", () => {
    const rounds = [
      round({ questionId: "a", questionText: "A ?", matched: false }),
      round({ questionId: "b", questionText: "B ?", matched: false }),
      round({ questionId: "c", questionText: "C ?", matched: true }),
    ];

    expect(topMismatches(rounds, 1)).toHaveLength(1);
    expect(topMismatches([round({ questionId: "c", matched: true })], 5)).toEqual([]);
  });
});
