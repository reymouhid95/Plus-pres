import { describe, expect, it } from "vitest";
import { pickUnusedQuestion } from "./questions";

const LEVEL = [
  { id: "q1", text: "Question 1" },
  { id: "q2", text: "Question 2" },
  { id: "q3", text: "Question 3" },
];

describe("pickUnusedQuestion", () => {
  it("renvoie null quand aucune question n'est disponible", () => {
    expect(pickUnusedQuestion([], [])).toBeNull();
  });

  it("renvoie toujours une question du niveau", () => {
    const picked = pickUnusedQuestion(LEVEL, []);
    expect(picked).not.toBeNull();
    expect(LEVEL).toContain(picked);
  });

  it("évite les questions déjà tirées", () => {
    for (let i = 0; i < 30; i++) {
      const picked = pickUnusedQuestion(LEVEL, ["q1", "q2"]);
      expect(picked?.id).toBe("q3");
    }
  });

  it("repioche dans tout le niveau une fois épuisé", () => {
    for (let i = 0; i < 30; i++) {
      const picked = pickUnusedQuestion(LEVEL, ["q1", "q2", "q3"]);
      expect(picked).not.toBeNull();
      expect(["q1", "q2", "q3"]).toContain(picked?.id);
    }
  });

  it("ne se bloque pas sur un id inconnu dans les tirages passés", () => {
    const picked = pickUnusedQuestion(LEVEL, ["q99"]);
    expect(picked).not.toBeNull();
  });

  it("explore plusieurs questions quand aucune n'est interdite", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const picked = pickUnusedQuestion(LEVEL, []);
      seen.add(picked!.id);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
