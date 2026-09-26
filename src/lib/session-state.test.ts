import { describe, expect, it } from "vitest";
import { advanceSession, canAnswer, canDraw, clientSessionStatus, MAX_LEVEL } from "./session-state";

describe("canDraw", () => {
  const base = {
    duoStatus: "ready",
    sessionStatus: "playing",
    turnUserId: "u1",
    userId: "u1",
    hasPendingRound: false,
  };

  it("autorise le tirage quand tout est réuni", () => {
    expect(canDraw(base)).toEqual({ ok: true });
  });

  it("refuse tant que le partenaire n'a pas rejoint", () => {
    expect(canDraw({ ...base, duoStatus: "pending" })).toEqual({
      ok: false,
      error: "La partie n'est pas encore active (en attente du partenaire).",
      status: 400,
    });
  });

  it("refuse quand la partie est terminée", () => {
    expect(canDraw({ ...base, sessionStatus: "completed" }).ok).toBe(false);
  });

  it("refuse quand ce n'est pas son tour", () => {
    expect(canDraw({ ...base, userId: "u2" })).toEqual({
      ok: false,
      error: "Ce n'est pas votre tour de tirer une carte.",
      status: 403,
    });
  });

  it("refuse quand une carte est déjà en attente", () => {
    expect(canDraw({ ...base, hasPendingRound: true }).ok).toBe(false);
  });
});

describe("canAnswer", () => {
  it("autorise une première réponse sur une manche en attente", () => {
    expect(canAnswer({ roundStatus: "pending", alreadyAnswered: false })).toEqual({ ok: true });
  });

  it("refuse sur une manche déjà révélée", () => {
    expect(canAnswer({ roundStatus: "revealed", alreadyAnswered: false })).toEqual({
      ok: false,
      error: "Cette manche est déjà révélée.",
      status: 400,
    });
  });

  it("refuse un doublon de réponse", () => {
    expect(canAnswer({ roundStatus: "pending", alreadyAnswered: true }).ok).toBe(false);
  });
});

describe("advanceSession", () => {
  it("monte d'un niveau tant que le max n'est pas atteint", () => {
    expect(advanceSession(1)).toEqual({ nextLevel: 2, status: "playing" });
    expect(advanceSession(2)).toEqual({ nextLevel: 3, status: "playing" });
  });

  it("termine la partie au dernier niveau", () => {
    expect(advanceSession(MAX_LEVEL)).toEqual({ nextLevel: MAX_LEVEL, status: "completed" });
  });
});

describe("clientSessionStatus", () => {
  it("dérive waiting / active / completed pour le client existant", () => {
    expect(clientSessionStatus("pending", "playing")).toBe("waiting");
    expect(clientSessionStatus("ready", "playing")).toBe("active");
    expect(clientSessionStatus("ready", "completed")).toBe("completed");
  });
});
