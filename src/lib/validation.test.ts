import { describe, expect, it } from "vitest";
import {
  answerSchema,
  joinSchema,
  normalizeCode,
  profileSchema,
  registerSchema,
} from "./validation";

describe("registerSchema", () => {
  const valid = { email: "camille@example.fr", password: "secret123", displayName: "Camille" };

  it("accepte un inscription valide", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un email mal formé", () => {
    expect(registerSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });

  it("refuse un mot de passe trop court", () => {
    expect(registerSchema.safeParse({ ...valid, password: "12345" }).success).toBe(false);
  });

  it("refuse un pseudo vide ou trop long", () => {
    expect(registerSchema.safeParse({ ...valid, displayName: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, displayName: "x".repeat(41) }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepte un profil partiel", () => {
    expect(profileSchema.safeParse({ displayName: "Nina" }).success).toBe(true);
    expect(profileSchema.safeParse({}).success).toBe(true);
  });

  it("borne la bio à 280 caractères", () => {
    expect(profileSchema.safeParse({ bio: "x".repeat(280) }).success).toBe(true);
    expect(profileSchema.safeParse({ bio: "x".repeat(281) }).success).toBe(false);
  });
});

describe("answerSchema", () => {
  it("exige une manche et un choix non vide", () => {
    expect(answerSchema.safeParse({ roundId: "r1", choice: "Café" }).success).toBe(true);
    expect(answerSchema.safeParse({ roundId: "", choice: "Café" }).success).toBe(false);
    expect(answerSchema.safeParse({ roundId: "r1", choice: "" }).success).toBe(false);
  });
});

describe("joinSchema", () => {
  it("impose un code de 4 à 10 caractères", () => {
    expect(joinSchema.safeParse({ code: "ABCD" }).success).toBe(true);
    expect(joinSchema.safeParse({ code: "ABC" }).success).toBe(false);
    expect(joinSchema.safeParse({ code: "A".repeat(11) }).success).toBe(false);
  });
});

describe("normalizeCode", () => {
  it("met le code en majuscules et retire les espaces", () => {
    expect(normalizeCode("  aB12 ")).toBe("AB12");
    expect(normalizeCode("wSDWqK")).toBe("WSDWQK");
  });
});
