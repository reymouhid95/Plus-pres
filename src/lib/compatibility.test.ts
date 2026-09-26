import { describe, expect, it } from "vitest";
import { EMPTY_SCORE, levelWeight, scoreRounds } from "./compatibility";

describe("levelWeight", () => {
  it("pondère davantage les paliers profonds", () => {
    expect(levelWeight(1)).toBe(1);
    expect(levelWeight(2)).toBe(1.3);
    expect(levelWeight(3)).toBe(1.6);
  });

  it("retombe sur 1 pour un palier inconnu", () => {
    expect(levelWeight(99)).toBe(1);
    expect(levelWeight(0)).toBe(1);
  });
});

describe("scoreRounds", () => {
  it("renvoie un score vide quand il n'y a aucune manche révélée", () => {
    expect(scoreRounds([])).toEqual(EMPTY_SCORE);
  });

  it("monte à 100 % quand la seule manche est alignée", () => {
    const score = scoreRounds([{ level: 1, matched: true }]);
    expect(score.percentage).toBe(100);
    expect(score.totalRounds).toBe(1);
    expect(score.matchedRounds).toBe(1);
    expect(score.byLevel).toEqual({ 1: 100 });
  });

  it("moyenne les manches d'un même palier", () => {
    const score = scoreRounds([
      { level: 1, matched: true },
      { level: 1, matched: false },
    ]);
    expect(score.percentage).toBe(50);
    expect(score.matchedRounds).toBe(1);
    expect(score.byLevel).toEqual({ 1: 50 });
  });

  it("pondère le palier 3 plus fort que le palier 1", () => {
    // (1×1 + 1×0) / (1 + 1.6) = 38.46 %
    const score = scoreRounds([
      { level: 1, matched: true },
      { level: 3, matched: false },
    ]);
    expect(score.percentage).toBe(38);
    expect(score.byLevel).toEqual({ 1: 100, 3: 0 });
  });

  it("compte une manche sans verdict comme non alignée", () => {
    const score = scoreRounds([{ level: 2, matched: null }]);
    expect(score.totalRounds).toBe(1);
    expect(score.matchedRounds).toBe(0);
    expect(score.percentage).toBe(0);
    expect(score.byLevel).toEqual({ 2: 0 });
  });

  it("retourne un objet partagé (non mutable) pour le score vide", () => {
    expect(scoreRounds([])).not.toBe(scoreRounds([]));
    expect(scoreRounds([])).toEqual(EMPTY_SCORE);
  });
});
