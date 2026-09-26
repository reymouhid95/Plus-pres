import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROUND_DURATION,
  expiryDate,
  isExpired,
  remainingMs,
  resolveRoundOutcome,
  roundDuration,
} from "./timer";

describe("roundDuration", () => {
  it("impose 60 s au niveau 1, 45 s au niveau 2 et 30 s au niveau 3", () => {
    expect(roundDuration(1)).toBe(60_000);
    expect(roundDuration(2)).toBe(45_000);
    expect(roundDuration(3)).toBe(30_000);
  });

  it("retombe sur la durée par défaut pour un niveau inconnu", () => {
    expect(roundDuration(0)).toBe(DEFAULT_ROUND_DURATION);
    expect(roundDuration(99)).toBe(DEFAULT_ROUND_DURATION);
    expect(DEFAULT_ROUND_DURATION).toBe(60_000);
  });
});

describe("expiryDate", () => {
  it("calcule la deadline à partir d'une date de référence", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    expect(expiryDate(2, from).toISOString()).toBe("2026-01-01T00:00:45.000Z");
  });
});

describe("remainingMs", () => {
  it("renvoie le temps restant, jamais négatif", () => {
    const expiresAt = new Date(1_000_000);
    expect(remainingMs(expiresAt, 990_000)).toBe(10_000);
    expect(remainingMs(expiresAt, 1_000_000)).toBe(0);
    expect(remainingMs(expiresAt, 2_000_000)).toBe(0);
  });

  it("renvoie null quand la manche n'a pas de minuteur", () => {
    expect(remainingMs(null, 1)).toBeNull();
    expect(remainingMs(undefined, 1)).toBeNull();
  });
});

describe("isExpired", () => {
  it("considère qu'une deadline passée ou égale est expirée", () => {
    const expiresAt = new Date(1_000_000);
    expect(isExpired(expiresAt, 999_999)).toBe(false);
    expect(isExpired(expiresAt, 1_000_000)).toBe(true);
    expect(isExpired(expiresAt, 1_000_001)).toBe(true);
  });

  it("ne expire jamais une manche sans minuteur", () => {
    expect(isExpired(null, Date.now())).toBe(false);
  });
});

describe("resolveRoundOutcome", () => {
  it("aligne quand les deux choix sont identiques", () => {
    expect(resolveRoundOutcome(["Café", "Café"], false)).toBe("matched");
    expect(resolveRoundOutcome(["Café", "Café"], true)).toBe("matched");
  });

  it("détecte le décalage quand les choix diffèrent", () => {
    expect(resolveRoundOutcome(["Café", "Thé"], false)).toBe("mismatched");
    expect(resolveRoundOutcome(["Café", "Thé"], true)).toBe("mismatched");
  });

  it("laisse la manche en cours tant qu'elle n'est pas complète ni expirée", () => {
    expect(resolveRoundOutcome([], false)).toBeNull();
    expect(resolveRoundOutcome(["Café"], false)).toBeNull();
  });

  it("compte une réponse manquante comme un décalage à l'expiration", () => {
    expect(resolveRoundOutcome(["Café"], true)).toBe("mismatched");
  });

  it("abandonne une manche expirée sans aucune réponse", () => {
    expect(resolveRoundOutcome([], true)).toBe("abandoned");
  });
});
