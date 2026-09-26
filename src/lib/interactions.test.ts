import { describe, expect, it } from "vitest";
import {
  DISCUSSION_TYPES,
  MOTIVATIONS,
  REACTION_EMOJIS,
  ROUNDS_PER_LEVEL,
  SESSION_LENGTH,
  levelForRound,
} from "./interactions";
import { MAX_LEVEL } from "./session-state";

describe("levelForRound", () => {
  it("avance de 2 cartes par palier", () => {
    expect(levelForRound(0)).toBe(1);
    expect(levelForRound(1)).toBe(1);
    expect(levelForRound(2)).toBe(2);
    expect(levelForRound(3)).toBe(2);
    expect(levelForRound(4)).toBe(3);
    expect(levelForRound(5)).toBe(3);
  });

  it("ne dépasse jamais le dernier niveau", () => {
    expect(levelForRound(99)).toBe(MAX_LEVEL);
  });
});

describe("constantes de la boucle cœur", () => {
  it("propose 6 réactions rapides", () => {
    expect(REACTION_EMOJIS).toHaveLength(6);
    expect(REACTION_EMOJIS).toContain("❤️");
  });

  it("définit les 4 types de discussion", () => {
    expect(Object.values(DISCUSSION_TYPES)).toEqual([
      "pourquoi",
      "defendre",
      "compromis",
      "motivation",
    ]);
  });

  it("propose des motivations génériques", () => {
    expect(MOTIVATIONS).toContain("Culture");
    expect(MOTIVATIONS.length).toBeGreaterThan(3);
  });

  it("cadre la session à 5–7 cartes", () => {
    expect(SESSION_LENGTH).toBeGreaterThanOrEqual(5);
    expect(SESSION_LENGTH).toBeLessThanOrEqual(7);
    expect(ROUNDS_PER_LEVEL * MAX_LEVEL).toBe(SESSION_LENGTH);
  });
});
