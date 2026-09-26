import { describe, expect, it } from "vitest";
import { canAddMember, MAX_MEMBERS, otherMemberId } from "./duo";

describe("canAddMember", () => {
  it("accepte le premier et le deuxième membre", () => {
    expect(canAddMember([], "u1")).toEqual({ ok: true });
    expect(canAddMember(["u1"], "u2")).toEqual({ ok: true });
  });

  it("refuse un joueur déjà membre", () => {
    expect(canAddMember(["u1"], "u1")).toEqual({
      ok: false,
      error: "Vous êtes déjà membre de ce duo.",
    });
  });

  it("refuse un troisième joueur", () => {
    expect(canAddMember(["u1", "u2"], "u3")).toEqual({
      ok: false,
      error: "Ce duo est déjà complet.",
    });
    expect(MAX_MEMBERS).toBe(2);
  });
});

describe("otherMemberId", () => {
  it("renvoie l'autre membre pour la bascule de tour", () => {
    expect(otherMemberId(["u1", "u2"], "u1")).toBe("u2");
    expect(otherMemberId(["u1", "u2"], "u2")).toBe("u1");
  });

  it("renvoie null quand le joueur est seul", () => {
    expect(otherMemberId(["u1"], "u1")).toBeNull();
  });
});
