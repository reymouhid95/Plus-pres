import { describe, expect, it } from "vitest";
import {
  canAnswer,
  canDraw,
  canInteract,
  canStart,
  clientSessionStatus,
} from "./session-state";

describe("canDraw", () => {
  const base = {
    duoStatus: "ready",
    sessionStatus: "playing",
    turnUserId: "u1",
    userId: "u1",
    hasPendingRound: false,
    played: 0,
    maxRounds: 6,
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

  it("refuse quand la partie est encore au lobby", () => {
    expect(canDraw({ ...base, sessionStatus: "lobby" })).toEqual({
      ok: false,
      error: "La partie n'a pas encore commencé — lancez-la depuis le lobby.",
      status: 400,
    });
  });

  it("refuse quand la partie est terminée", () => {
    expect(canDraw({ ...base, sessionStatus: "completed" }).ok).toBe(false);
  });

  it("refuse quand le quota de cartes est atteint", () => {
    expect(canDraw({ ...base, played: 6 })).toEqual({
      ok: false,
      error: "Session terminée — place au bilan.",
      status: 400,
    });
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

describe("canStart", () => {
  it("autorise le démarrage quand le duo est prêt et la session au lobby", () => {
    expect(canStart({ duoStatus: "ready", sessionStatus: "lobby" })).toEqual({ ok: true });
  });

  it("refuse tant que le partenaire n'a pas rejoint", () => {
    expect(canStart({ duoStatus: "pending", sessionStatus: "lobby" })).toEqual({
      ok: false,
      error: "En attente du partenaire pour commencer.",
      status: 400,
    });
  });

  it("refuse quand la partie est déjà lancée", () => {
    expect(canStart({ duoStatus: "ready", sessionStatus: "playing" }).ok).toBe(false);
  });
});

describe("canInteract", () => {
  it("autorise réactions et conversations après la révélation", () => {
    expect(canInteract({ roundStatus: "revealed" })).toEqual({ ok: true });
  });

  it("refuse avant la révélation", () => {
    expect(canInteract({ roundStatus: "pending" })).toEqual({
      ok: false,
      error: "Cette manche n'est pas encore révélée.",
      status: 400,
    });
  });
});

describe("clientSessionStatus", () => {
  it("dérive waiting / lobby / active / completed pour le client", () => {
    expect(clientSessionStatus("pending", "lobby")).toBe("waiting");
    expect(clientSessionStatus("ready", "lobby")).toBe("lobby");
    expect(clientSessionStatus("ready", "playing")).toBe("active");
    expect(clientSessionStatus("ready", "completed")).toBe("completed");
  });
});
